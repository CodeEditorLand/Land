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
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ITunnelService, AbstractTunnelService, TunnelPrivacyId, isPortPrivileged, isTunnelProvider } from '../../../../platform/tunnel/common/tunnel.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ISharedProcessTunnelService } from '../../../../platform/remote/common/sharedProcessTunnelService.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IRemoteAuthorityResolverService } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { OS } from '../../../../base/common/platform.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
let SharedProcessTunnel = class SharedProcessTunnel extends Disposable {
    constructor(_id, _addressProvider, tunnelRemoteHost, tunnelRemotePort, tunnelLocalPort, localAddress, _onBeforeDispose, _sharedProcessTunnelService, _remoteAuthorityResolverService) {
        super();
        this._id = _id;
        this._addressProvider = _addressProvider;
        this.tunnelRemoteHost = tunnelRemoteHost;
        this.tunnelRemotePort = tunnelRemotePort;
        this.tunnelLocalPort = tunnelLocalPort;
        this.localAddress = localAddress;
        this._onBeforeDispose = _onBeforeDispose;
        this._sharedProcessTunnelService = _sharedProcessTunnelService;
        this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
        this.privacy = TunnelPrivacyId.Private;
        this.protocol = undefined;
        this._updateAddress();
        this._register(this._remoteAuthorityResolverService.onDidChangeConnectionData(() => this._updateAddress()));
    }
    _updateAddress() {
        this._addressProvider.getAddress().then((address) => {
            this._sharedProcessTunnelService.setAddress(this._id, address);
        });
    }
    async dispose() {
        this._onBeforeDispose();
        super.dispose();
        await this._sharedProcessTunnelService.destroyTunnel(this._id);
    }
};
SharedProcessTunnel = __decorate([
    __param(7, ISharedProcessTunnelService),
    __param(8, IRemoteAuthorityResolverService),
    __metadata("design:paramtypes", [String, Object, String, Number, Object, String, Function, Object, Object])
], SharedProcessTunnel);
let TunnelService = class TunnelService extends AbstractTunnelService {
    constructor(logService, _environmentService, _sharedProcessTunnelService, _instantiationService, lifecycleService, _nativeWorkbenchEnvironmentService, configurationService) {
        super(logService, configurationService);
        this._environmentService = _environmentService;
        this._sharedProcessTunnelService = _sharedProcessTunnelService;
        this._instantiationService = _instantiationService;
        this._nativeWorkbenchEnvironmentService = _nativeWorkbenchEnvironmentService;
        this._activeSharedProcessTunnels = new Set();
        this._register(lifecycleService.onDidShutdown(() => {
            this._activeSharedProcessTunnels.forEach((id) => {
                this._sharedProcessTunnelService.destroyTunnel(id);
            });
        }));
    }
    isPortPrivileged(port) {
        return isPortPrivileged(port, this.defaultTunnelHost, OS, this._nativeWorkbenchEnvironmentService.os.release);
    }
    retainOrCreateTunnel(addressOrTunnelProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol) {
        const existing = this.getTunnelFromMap(remoteHost, remotePort);
        if (existing) {
            ++existing.refcount;
            return existing.value;
        }
        if (isTunnelProvider(addressOrTunnelProvider)) {
            return this.createWithProvider(addressOrTunnelProvider, remoteHost, remotePort, localPort, elevateIfNeeded, privacy, protocol);
        }
        else {
            this.logService.trace(`ForwardedPorts: (TunnelService) Creating tunnel without provider ${remoteHost}:${remotePort} on local port ${localPort}.`);
            const tunnel = this._createSharedProcessTunnel(addressOrTunnelProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded);
            this.logService.trace('ForwardedPorts: (TunnelService) Tunnel created without provider.');
            this.addTunnelToMap(remoteHost, remotePort, tunnel);
            return tunnel;
        }
    }
    async _createSharedProcessTunnel(addressProvider, tunnelRemoteHost, tunnelRemotePort, tunnelLocalHost, tunnelLocalPort, elevateIfNeeded) {
        const { id } = await this._sharedProcessTunnelService.createTunnel();
        this._activeSharedProcessTunnels.add(id);
        const authority = this._environmentService.remoteAuthority;
        const result = await this._sharedProcessTunnelService.startTunnel(authority, id, tunnelRemoteHost, tunnelRemotePort, tunnelLocalHost, tunnelLocalPort, elevateIfNeeded);
        const tunnel = this._instantiationService.createInstance(SharedProcessTunnel, id, addressProvider, tunnelRemoteHost, tunnelRemotePort, result.tunnelLocalPort, result.localAddress, () => {
            this._activeSharedProcessTunnels.delete(id);
        });
        return tunnel;
    }
    canTunnel(uri) {
        return super.canTunnel(uri) && !!this._environmentService.remoteAuthority;
    }
};
TunnelService = __decorate([
    __param(0, ILogService),
    __param(1, IWorkbenchEnvironmentService),
    __param(2, ISharedProcessTunnelService),
    __param(3, IInstantiationService),
    __param(4, ILifecycleService),
    __param(5, INativeWorkbenchEnvironmentService),
    __param(6, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], TunnelService);
export { TunnelService };
registerSingleton(ITunnelService, TunnelService, 1);
