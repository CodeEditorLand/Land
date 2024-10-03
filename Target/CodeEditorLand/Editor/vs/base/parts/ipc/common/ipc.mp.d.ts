import { VSBuffer } from '../../../common/buffer.js';
import { Event } from '../../../common/event.js';
import { IDisposable } from '../../../common/lifecycle.js';
import { IMessagePassingProtocol, IPCClient } from './ipc.js';
export interface MessageEvent {
    data: Uint8Array;
}
export interface MessagePort {
    addEventListener(type: 'message', listener: (this: MessagePort, e: MessageEvent) => unknown): void;
    removeEventListener(type: 'message', listener: (this: MessagePort, e: MessageEvent) => unknown): void;
    postMessage(message: Uint8Array): void;
    start(): void;
    close(): void;
}
export declare class Protocol implements IMessagePassingProtocol {
    private port;
    readonly onMessage: Event<VSBuffer>;
    constructor(port: MessagePort);
    send(message: VSBuffer): void;
    disconnect(): void;
}
export declare class Client extends IPCClient implements IDisposable {
    private protocol;
    constructor(port: MessagePort, clientId: string);
    dispose(): void;
}
