import { VSBuffer } from '../../../common/buffer.js';
import { Event } from '../../../common/event.js';
import { IMessagePassingProtocol } from './ipc.js';
export interface Sender {
    send(channel: string, msg: unknown): void;
}
export declare class Protocol implements IMessagePassingProtocol {
    private sender;
    readonly onMessage: Event<VSBuffer>;
    constructor(sender: Sender, onMessage: Event<VSBuffer>);
    send(message: VSBuffer): void;
    disconnect(): void;
}
