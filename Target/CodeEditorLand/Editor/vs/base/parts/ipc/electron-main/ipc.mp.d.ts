import { BrowserWindow, MessagePortMain } from 'electron';
import { IDisposable } from '../../../common/lifecycle.js';
import { Client as MessagePortClient } from '../common/ipc.mp.js';
/**
 * An implementation of a `IPCClient` on top of Electron `MessagePortMain`.
 */
export declare class Client extends MessagePortClient implements IDisposable {
    /**
     * @param clientId a way to uniquely identify this client among
     * other clients. this is important for routing because every
     * client can also be a server
     */
    constructor(port: MessagePortMain, clientId: string);
}
/**
 * This method opens a message channel connection
 * in the target window. The target window needs
 * to use the `Server` from `electron-sandbox/ipc.mp`.
 */
export declare function connect(window: BrowserWindow): Promise<MessagePortMain>;
