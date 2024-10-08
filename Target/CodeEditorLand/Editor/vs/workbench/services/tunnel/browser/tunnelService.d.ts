import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IAddressProvider } from '../../../../platform/remote/common/remoteAgentConnection.js';
import { AbstractTunnelService, ITunnelProvider, RemoteTunnel } from '../../../../platform/tunnel/common/tunnel.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
export declare class TunnelService extends AbstractTunnelService {
    private environmentService;
    constructor(logService: ILogService, environmentService: IWorkbenchEnvironmentService, configurationService: IConfigurationService);
    isPortPrivileged(_port: number): boolean;
    protected retainOrCreateTunnel(tunnelProvider: IAddressProvider | ITunnelProvider, remoteHost: string, remotePort: number, _localHost: string, localPort: number | undefined, elevateIfNeeded: boolean, privacy?: string, protocol?: string): Promise<RemoteTunnel | string | undefined> | undefined;
    canTunnel(uri: URI): boolean;
}
