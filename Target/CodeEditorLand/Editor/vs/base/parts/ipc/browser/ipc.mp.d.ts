import { IDisposable } from '../../../common/lifecycle.js';
import { Client as MessagePortClient } from '../common/ipc.mp.js';
export declare class Client extends MessagePortClient implements IDisposable {
    constructor(port: MessagePort, clientId: string);
}
