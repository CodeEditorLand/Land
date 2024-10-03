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
import * as nls from '../../../../nls.js';
import { ITunnelService, TunnelProtocol, TunnelPrivacyId } from '../../../../platform/tunnel/common/tunnel.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { URI } from '../../../../base/common/uri.js';
import { IRemoteExplorerService } from '../../../services/remote/common/remoteExplorerService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { forwardedPortsFeaturesEnabled } from '../../../services/remote/common/tunnelModel.js';
let TunnelFactoryContribution = class TunnelFactoryContribution extends Disposable {
    static { this.ID = 'workbench.contrib.tunnelFactory'; }
    constructor(tunnelService, environmentService, openerService, remoteExplorerService, logService, contextKeyService) {
        super();
        this.openerService = openerService;
        const tunnelFactory = environmentService.options?.tunnelProvider?.tunnelFactory;
        if (tunnelFactory) {
            contextKeyService.createKey(forwardedPortsFeaturesEnabled.key, true);
            let privacyOptions = environmentService.options?.tunnelProvider?.features?.privacyOptions ?? [];
            if (environmentService.options?.tunnelProvider?.features?.public
                && (privacyOptions.length === 0)) {
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
            this._register(tunnelService.setTunnelProvider({
                forwardPort: async (tunnelOptions, tunnelCreationOptions) => {
                    let tunnelPromise;
                    try {
                        tunnelPromise = tunnelFactory(tunnelOptions, tunnelCreationOptions);
                    }
                    catch (e) {
                        logService.trace('tunnelFactory: tunnel provider error');
                    }
                    if (!tunnelPromise) {
                        return undefined;
                    }
                    let tunnel;
                    try {
                        tunnel = await tunnelPromise;
                    }
                    catch (e) {
                        logService.trace('tunnelFactory: tunnel provider promise error');
                        if (e instanceof Error) {
                            return e.message;
                        }
                        return undefined;
                    }
                    const localAddress = tunnel.localAddress.startsWith('http') ? tunnel.localAddress : `http://${tunnel.localAddress}`;
                    const remoteTunnel = {
                        tunnelRemotePort: tunnel.remoteAddress.port,
                        tunnelRemoteHost: tunnel.remoteAddress.host,
                        localAddress: await this.resolveExternalUri(localAddress),
                        privacy: tunnel.privacy ?? (tunnel.public ? TunnelPrivacyId.Public : TunnelPrivacyId.Private),
                        protocol: tunnel.protocol ?? TunnelProtocol.Http,
                        dispose: async () => { await tunnel.dispose(); }
                    };
                    return remoteTunnel;
                }
            }));
            const tunnelInformation = environmentService.options?.tunnelProvider?.features ?
                {
                    features: {
                        elevation: !!environmentService.options?.tunnelProvider?.features?.elevation,
                        public: !!environmentService.options?.tunnelProvider?.features?.public,
                        privacyOptions,
                        protocol: environmentService.options?.tunnelProvider?.features?.protocol === undefined ? true : !!environmentService.options?.tunnelProvider?.features?.protocol
                    }
                } : undefined;
            remoteExplorerService.setTunnelInformation(tunnelInformation);
        }
    }
    async resolveExternalUri(uri) {
        try {
            return (await this.openerService.resolveExternalUri(URI.parse(uri))).resolved.toString();
        }
        catch {
            return uri;
        }
    }
};
TunnelFactoryContribution = __decorate([
    __param(0, ITunnelService),
    __param(1, IBrowserWorkbenchEnvironmentService),
    __param(2, IOpenerService),
    __param(3, IRemoteExplorerService),
    __param(4, ILogService),
    __param(5, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], TunnelFactoryContribution);
export { TunnelFactoryContribution };
