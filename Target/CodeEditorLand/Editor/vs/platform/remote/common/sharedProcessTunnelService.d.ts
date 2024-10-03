import { IAddress } from './remoteAgentConnection.js';
export declare const ISharedProcessTunnelService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ISharedProcessTunnelService>;
export declare const ipcSharedProcessTunnelChannelName = "sharedProcessTunnel";
export interface ISharedProcessTunnel {
    tunnelLocalPort: number | undefined;
    localAddress: string;
}
export interface ISharedProcessTunnelService {
    readonly _serviceBrand: undefined;
    createTunnel(): Promise<{
        id: string;
    }>;
    startTunnel(authority: string, id: string, tunnelRemoteHost: string, tunnelRemotePort: number, tunnelLocalHost: string, tunnelLocalPort: number | undefined, elevateIfNeeded: boolean | undefined): Promise<ISharedProcessTunnel>;
    setAddress(id: string, address: IAddress): Promise<void>;
    destroyTunnel(id: string): Promise<void>;
}
