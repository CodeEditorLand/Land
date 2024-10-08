import { ILogService } from '../../log/common/log.js';
import { ISharedProcessTunnel, ISharedProcessTunnelService } from '../../remote/common/sharedProcessTunnelService.js';
import { ISharedTunnelsService } from '../common/tunnel.js';
import { IAddress } from '../../remote/common/remoteAgentConnection.js';
import { Disposable } from '../../../base/common/lifecycle.js';
export declare class SharedProcessTunnelService extends Disposable implements ISharedProcessTunnelService {
    private readonly _tunnelService;
    private readonly _logService;
    _serviceBrand: undefined;
    private static _lastId;
    private readonly _tunnels;
    private readonly _disposedTunnels;
    constructor(_tunnelService: ISharedTunnelsService, _logService: ILogService);
    dispose(): void;
    createTunnel(): Promise<{
        id: string;
    }>;
    startTunnel(authority: string, id: string, tunnelRemoteHost: string, tunnelRemotePort: number, tunnelLocalHost: string, tunnelLocalPort: number | undefined, elevateIfNeeded: boolean | undefined): Promise<ISharedProcessTunnel>;
    setAddress(id: string, address: IAddress): Promise<void>;
    destroyTunnel(id: string): Promise<void>;
}
