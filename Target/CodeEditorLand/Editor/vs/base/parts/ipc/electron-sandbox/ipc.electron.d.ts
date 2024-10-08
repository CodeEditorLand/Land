import { IDisposable } from '../../../common/lifecycle.js';
import { IPCClient } from '../common/ipc.js';
/**
 * An implementation of `IPCClient` on top of Electron `ipcRenderer` IPC communication
 * provided from sandbox globals (via preload script).
 */
export declare class Client extends IPCClient implements IDisposable {
    private protocol;
    private static createProtocol;
    constructor(id: string);
    dispose(): void;
}
