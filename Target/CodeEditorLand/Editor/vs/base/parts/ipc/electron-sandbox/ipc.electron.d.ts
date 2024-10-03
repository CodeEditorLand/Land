import { IDisposable } from '../../../common/lifecycle.js';
import { IPCClient } from '../common/ipc.js';
export declare class Client extends IPCClient implements IDisposable {
    private protocol;
    private static createProtocol;
    constructor(id: string);
    dispose(): void;
}
