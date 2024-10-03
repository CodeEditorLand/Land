import * as http from 'http';
import * as net from 'net';
import { ServerParsedArgs } from './serverEnvironmentService.js';
export interface IServerAPI {
    handleRequest(req: http.IncomingMessage, res: http.ServerResponse): Promise<void>;
    handleUpgrade(req: http.IncomingMessage, socket: net.Socket): void;
    handleServerError(err: Error): void;
    dispose(): void;
}
export declare function createServer(address: string | net.AddressInfo | null, args: ServerParsedArgs, REMOTE_DATA_FOLDER: string): Promise<IServerAPI>;
