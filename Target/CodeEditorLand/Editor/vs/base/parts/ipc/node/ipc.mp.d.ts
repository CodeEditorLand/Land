import { MessageEvent } from '../../sandbox/node/electronTypes.js';
import { IPCServer } from '../common/ipc.js';
export interface IClientConnectionFilter {
    handledClientConnection(e: MessageEvent): boolean;
}
export declare class Server extends IPCServer {
    private static getOnDidClientConnect;
    constructor(filter?: IClientConnectionFilter);
}
interface INodeMessagePortFragment {
    on(event: 'message', listener: (messageEvent: MessageEvent) => void): this;
    removeListener(event: 'message', listener: (messageEvent: MessageEvent) => void): this;
}
export declare function once(port: INodeMessagePortFragment, message: unknown, callback: () => void): void;
export {};
