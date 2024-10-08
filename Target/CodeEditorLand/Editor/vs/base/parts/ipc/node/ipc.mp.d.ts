import { MessageEvent } from '../../sandbox/node/electronTypes.js';
import { IPCServer } from '../common/ipc.js';
export interface IClientConnectionFilter {
    /**
     * Allows to filter incoming messages to the
     * server to handle them differently.
     *
     * @param e the message event to handle
     * @returns `true` if the event was handled
     * and should not be processed by the server.
     */
    handledClientConnection(e: MessageEvent): boolean;
}
/**
 * An implementation of a `IPCServer` on top of MessagePort style IPC communication.
 * The clients register themselves via Electron Utility Process IPC transfer.
 */
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
