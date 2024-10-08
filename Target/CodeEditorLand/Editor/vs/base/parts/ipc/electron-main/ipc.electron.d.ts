import { IPCServer } from '../common/ipc.js';
/**
 * An implementation of `IPCServer` on top of Electron `ipcMain` API.
 */
export declare class Server extends IPCServer {
    private static readonly Clients;
    private static getOnDidClientConnect;
    constructor();
}
