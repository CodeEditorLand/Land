import { BrowserWindow, MessagePortMain } from 'electron';
import { IDisposable } from '../../../common/lifecycle.js';
import { Client as MessagePortClient } from '../common/ipc.mp.js';
export declare class Client extends MessagePortClient implements IDisposable {
    constructor(port: MessagePortMain, clientId: string);
}
export declare function connect(window: BrowserWindow): Promise<MessagePortMain>;
