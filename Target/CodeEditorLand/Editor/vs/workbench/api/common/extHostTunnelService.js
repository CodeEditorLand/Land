var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { CancellationToken } from '../../../base/common/cancellation.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable, toDisposable } from '../../../base/common/lifecycle.js';
import * as nls from '../../../nls.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { DisposableTunnel, TunnelPrivacyId } from '../../../platform/tunnel/common/tunnel.js';
import { MainContext } from './extHost.protocol.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import * as types from './extHostTypes.js';
class ExtensionTunnel extends DisposableTunnel {
}
export var TunnelDtoConverter;
(function (TunnelDtoConverter) {
    function fromApiTunnel(tunnel) {
        return {
            remoteAddress: tunnel.remoteAddress,
            localAddress: tunnel.localAddress,
            public: !!tunnel.public,
            privacy: tunnel.privacy ?? (tunnel.public ? TunnelPrivacyId.Public : TunnelPrivacyId.Private),
            protocol: tunnel.protocol
        };
    }
    TunnelDtoConverter.fromApiTunnel = fromApiTunnel;
    function fromServiceTunnel(tunnel) {
        return {
            remoteAddress: {
                host: tunnel.tunnelRemoteHost,
                port: tunnel.tunnelRemotePort
            },
            localAddress: tunnel.localAddress,
            public: tunnel.privacy !== TunnelPrivacyId.ConstantPrivate && tunnel.privacy !== TunnelPrivacyId.ConstantPrivate,
            privacy: tunnel.privacy,
            protocol: tunnel.protocol
        };
    }
    TunnelDtoConverter.fromServiceTunnel = fromServiceTunnel;
})(TunnelDtoConverter || (TunnelDtoConverter = {}));
export const IExtHostTunnelService = createDecorator('IExtHostTunnelService');
let ExtHostTunnelService = class ExtHostTunnelService extends Disposable {
    constructor(extHostRpc, initData, logService) {
        super();
        this.logService = logService;
        this._showCandidatePort = () => { return Promise.resolve(true); };
        this._extensionTunnels = new Map();
        this._onDidChangeTunnels = new Emitter();
        this.onDidChangeTunnels = this._onDidChangeTunnels.event;
        this._providerHandleCounter = 0;
        this._portAttributesProviders = new Map();
        this._proxy = extHostRpc.getProxy(MainContext.MainThreadTunnelService);
    }
    async openTunnel(extension, forward) {
        this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) ${extension.identifier.value} called openTunnel API for ${forward.remoteAddress.host}:${forward.remoteAddress.port}.`);
        const tunnel = await this._proxy.$openTunnel(forward, extension.displayName);
        if (tunnel) {
            const disposableTunnel = new ExtensionTunnel(tunnel.remoteAddress, tunnel.localAddress, () => {
                return this._proxy.$closeTunnel(tunnel.remoteAddress);
            });
            this._register(disposableTunnel);
            return disposableTunnel;
        }
        return undefined;
    }
    async getTunnels() {
        return this._proxy.$getTunnels();
    }
    nextPortAttributesProviderHandle() {
        return this._providerHandleCounter++;
    }
    registerPortsAttributesProvider(portSelector, provider) {
        if (portSelector.portRange === undefined && portSelector.commandPattern === undefined) {
            this.logService.error('PortAttributesProvider must specify either a portRange or a commandPattern');
        }
        const providerHandle = this.nextPortAttributesProviderHandle();
        this._portAttributesProviders.set(providerHandle, { selector: portSelector, provider });
        this._proxy.$registerPortsAttributesProvider(portSelector, providerHandle);
        return new types.Disposable(() => {
            this._portAttributesProviders.delete(providerHandle);
            this._proxy.$unregisterPortsAttributesProvider(providerHandle);
        });
    }
    async $providePortAttributes(handles, ports, pid, commandLine, cancellationToken) {
        const providedAttributes = [];
        for (const handle of handles) {
            const provider = this._portAttributesProviders.get(handle);
            if (!provider) {
                return [];
            }
            providedAttributes.push(...(await Promise.all(ports.map(async (port) => {
                let providedAttributes;
                try {
                    providedAttributes = await provider.provider.providePortAttributes({ port, pid, commandLine }, cancellationToken);
                }
                catch (e) {
                    providedAttributes = await provider.provider.providePortAttributes(port, pid, commandLine, cancellationToken);
                }
                return { providedAttributes, port };
            }))));
        }
        const allAttributes = providedAttributes.filter(attribute => !!attribute.providedAttributes);
        return (allAttributes.length > 0) ? allAttributes.map(attributes => {
            return {
                autoForwardAction: attributes.providedAttributes.autoForwardAction,
                port: attributes.port
            };
        }) : [];
    }
    async $registerCandidateFinder(_enable) { }
    registerTunnelProvider(provider, information) {
        if (this._forwardPortProvider) {
            throw new Error('A tunnel provider has already been registered. Only the first tunnel provider to be registered will be used.');
        }
        this._forwardPortProvider = async (tunnelOptions, tunnelCreationOptions) => {
            const result = await provider.provideTunnel(tunnelOptions, tunnelCreationOptions, CancellationToken.None);
            return result ?? undefined;
        };
        const tunnelFeatures = information.tunnelFeatures ? {
            elevation: !!information.tunnelFeatures?.elevation,
            privacyOptions: information.tunnelFeatures?.privacyOptions,
            protocol: information.tunnelFeatures.protocol === undefined ? true : information.tunnelFeatures.protocol,
        } : undefined;
        this._proxy.$setTunnelProvider(tunnelFeatures, true);
        return Promise.resolve(toDisposable(() => {
            this._forwardPortProvider = undefined;
            this._proxy.$setTunnelProvider(undefined, false);
        }));
    }
    async setTunnelFactory(provider, managedRemoteAuthority) {
        if (provider) {
            if (provider.candidatePortSource !== undefined) {
                this._proxy.$setCandidatePortSource(provider.candidatePortSource);
            }
            if (provider.showCandidatePort) {
                this._showCandidatePort = provider.showCandidatePort;
                this._proxy.$setCandidateFilter();
            }
            const tunnelFactory = provider.tunnelFactory ?? (managedRemoteAuthority ? this.makeManagedTunnelFactory(managedRemoteAuthority) : undefined);
            if (tunnelFactory) {
                this._forwardPortProvider = tunnelFactory;
                let privacyOptions = provider.tunnelFeatures?.privacyOptions ?? [];
                if (provider.tunnelFeatures?.public && (privacyOptions.length === 0)) {
                    privacyOptions = [
                        {
                            id: 'private',
                            label: nls.localize('tunnelPrivacy.private', "Private"),
                            themeIcon: 'lock'
                        },
                        {
                            id: 'public',
                            label: nls.localize('tunnelPrivacy.public', "Public"),
                            themeIcon: 'eye'
                        }
                    ];
                }
                const tunnelFeatures = provider.tunnelFeatures ? {
                    elevation: !!provider.tunnelFeatures?.elevation,
                    public: !!provider.tunnelFeatures?.public,
                    privacyOptions,
                    protocol: true
                } : undefined;
                this._proxy.$setTunnelProvider(tunnelFeatures, !!provider.tunnelFactory);
            }
        }
        else {
            this._forwardPortProvider = undefined;
        }
        return toDisposable(() => {
            this._forwardPortProvider = undefined;
        });
    }
    makeManagedTunnelFactory(_authority) {
        return undefined;
    }
    async $closeTunnel(remote, silent) {
        if (this._extensionTunnels.has(remote.host)) {
            const hostMap = this._extensionTunnels.get(remote.host);
            if (hostMap.has(remote.port)) {
                if (silent) {
                    hostMap.get(remote.port).disposeListener.dispose();
                }
                await hostMap.get(remote.port).tunnel.dispose();
                hostMap.delete(remote.port);
            }
        }
    }
    async $onDidTunnelsChange() {
        this._onDidChangeTunnels.fire();
    }
    async $forwardPort(tunnelOptions, tunnelCreationOptions) {
        if (this._forwardPortProvider) {
            try {
                this.logService.trace('ForwardedPorts: (ExtHostTunnelService) Getting tunnel from provider.');
                const providedPort = this._forwardPortProvider(tunnelOptions, tunnelCreationOptions);
                this.logService.trace('ForwardedPorts: (ExtHostTunnelService) Got tunnel promise from provider.');
                if (providedPort !== undefined) {
                    const tunnel = await providedPort;
                    this.logService.trace('ForwardedPorts: (ExtHostTunnelService) Successfully awaited tunnel from provider.');
                    if (tunnel === undefined) {
                        this.logService.error('ForwardedPorts: (ExtHostTunnelService) Resolved tunnel is undefined');
                        return undefined;
                    }
                    if (!this._extensionTunnels.has(tunnelOptions.remoteAddress.host)) {
                        this._extensionTunnels.set(tunnelOptions.remoteAddress.host, new Map());
                    }
                    const disposeListener = this._register(tunnel.onDidDispose(() => {
                        this.logService.trace('ForwardedPorts: (ExtHostTunnelService) Extension fired tunnel\'s onDidDispose.');
                        return this._proxy.$closeTunnel(tunnel.remoteAddress);
                    }));
                    this._extensionTunnels.get(tunnelOptions.remoteAddress.host).set(tunnelOptions.remoteAddress.port, { tunnel, disposeListener });
                    return TunnelDtoConverter.fromApiTunnel(tunnel);
                }
                else {
                    this.logService.trace('ForwardedPorts: (ExtHostTunnelService) Tunnel is undefined');
                }
            }
            catch (e) {
                this.logService.trace('ForwardedPorts: (ExtHostTunnelService) tunnel provider error');
                if (e instanceof Error) {
                    return e.message;
                }
            }
        }
        return undefined;
    }
    async $applyCandidateFilter(candidates) {
        const filter = await Promise.all(candidates.map(candidate => this._showCandidatePort(candidate.host, candidate.port, candidate.detail ?? '')));
        const result = candidates.filter((candidate, index) => filter[index]);
        this.logService.trace(`ForwardedPorts: (ExtHostTunnelService) filtered from ${candidates.map(port => port.port).join(', ')} to ${result.map(port => port.port).join(', ')}`);
        return result;
    }
};
ExtHostTunnelService = __decorate([
    __param(0, IExtHostRpcService),
    __param(1, IExtHostInitDataService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ExtHostTunnelService);
export { ExtHostTunnelService };
