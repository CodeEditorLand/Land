import { VSBuffer } from '../../../common/buffer.js';
import { Event } from '../../../common/event.js';
import { IDisposable } from '../../../common/lifecycle.js';
import { IMessagePassingProtocol, IPCClient } from './ipc.js';
/**
 * Declare minimal `MessageEvent` and `MessagePort` interfaces here
 * so that this utility can be used both from `browser` and
 * `electron-main` namespace where message ports are available.
 */
export interface MessageEvent {
    /**
     * For our use we only consider `Uint8Array` a valid data transfer
     * via message ports because our protocol implementation is buffer based.
     */
    data: Uint8Array;
}
export interface MessagePort {
    addEventListener(type: 'message', listener: (this: MessagePort, e: MessageEvent) => unknown): void;
    removeEventListener(type: 'message', listener: (this: MessagePort, e: MessageEvent) => unknown): void;
    postMessage(message: Uint8Array): void;
    start(): void;
    close(): void;
}
/**
 * The MessagePort `Protocol` leverages MessagePort style IPC communication
 * for the implementation of the `IMessagePassingProtocol`. That style of API
 * is a simple `onmessage` / `postMessage` pattern.
 */
export declare class Protocol implements IMessagePassingProtocol {
    private port;
    readonly onMessage: Event<VSBuffer>;
    constructor(port: MessagePort);
    send(message: VSBuffer): void;
    disconnect(): void;
}
/**
 * An implementation of a `IPCClient` on top of MessagePort style IPC communication.
 */
export declare class Client extends IPCClient implements IDisposable {
    private protocol;
    constructor(port: MessagePort, clientId: string);
    dispose(): void;
}
