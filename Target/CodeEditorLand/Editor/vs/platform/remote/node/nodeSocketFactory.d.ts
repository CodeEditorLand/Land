import { ISocket } from '../../../base/parts/ipc/common/ipc.net.js';
import { WebSocketRemoteConnection } from '../common/remoteAuthorityResolver.js';
export declare const nodeSocketFactory: {
    supports(connectTo: WebSocketRemoteConnection): boolean;
    connect({ host, port }: WebSocketRemoteConnection, path: string, query: string, debugLabel: string): Promise<ISocket>;
};
