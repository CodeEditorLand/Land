import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { URI } from '../../../../base/common/uri.js';
import { AbstractTunnelService, RemoteTunnel, ITunnelProvider } from '../../../../platform/tunnel/common/tunnel.js';
import { IAddressProvider } from '../../../../platform/remote/common/remoteAgentConnection.js';
import { ISharedProcessTunnelService } from '../../../../platform/remote/common/sharedProcessTunnelService.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
export declare class TunnelService extends AbstractTunnelService {
    private readonly _environmentService;
    private readonly _sharedProcessTunnelService;
    private readonly _instantiationService;
    private readonly _nativeWorkbenchEnvironmentService;
    private readonly _activeSharedProcessTunnels;
    constructor(logService: ILogService, _environmentService: IWorkbenchEnvironmentService, _sharedProcessTunnelService: ISharedProcessTunnelService, _instantiationService: IInstantiationService, lifecycleService: ILifecycleService, _nativeWorkbenchEnvironmentService: INativeWorkbenchEnvironmentService, configurationService: IConfigurationService);
    isPortPrivileged(port: number): boolean;
    protected retainOrCreateTunnel(addressOrTunnelProvider: IAddressProvider | ITunnelProvider, remoteHost: string, remotePort: number, localHost: string, localPort: number | undefined, elevateIfNeeded: boolean, privacy?: string, protocol?: string): Promise<RemoteTunnel | string | undefined> | undefined;
    private _createSharedProcessTunnel;
    canTunnel(uri: URI): boolean;
}
