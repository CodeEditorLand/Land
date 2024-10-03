import { Disposable, IDisposable } from '../lifecycle.js';
import { URI } from '../uri.js';
export interface IWorker extends IDisposable {
    getId(): number;
    postMessage(message: Message, transfer: ArrayBuffer[]): void;
}
export interface IWorkerCallback {
    (message: Message): void;
}
export interface IWorkerFactory {
    create(modules: IWorkerDescriptor, callback: IWorkerCallback, onErrorCallback: (err: any) => void): IWorker;
}
export interface IWorkerDescriptor {
    readonly moduleId: string;
    readonly esmModuleLocation: URI | undefined;
    readonly label: string | undefined;
}
export declare function logOnceWebWorkerWarning(err: any): void;
declare const enum MessageType {
    Request = 0,
    Reply = 1,
    SubscribeEvent = 2,
    Event = 3,
    UnsubscribeEvent = 4
}
declare class RequestMessage {
    readonly vsWorker: number;
    readonly req: string;
    readonly channel: string;
    readonly method: string;
    readonly args: any[];
    readonly type = MessageType.Request;
    constructor(vsWorker: number, req: string, channel: string, method: string, args: any[]);
}
declare class ReplyMessage {
    readonly vsWorker: number;
    readonly seq: string;
    readonly res: any;
    readonly err: any;
    readonly type = MessageType.Reply;
    constructor(vsWorker: number, seq: string, res: any, err: any);
}
declare class SubscribeEventMessage {
    readonly vsWorker: number;
    readonly req: string;
    readonly channel: string;
    readonly eventName: string;
    readonly arg: any;
    readonly type = MessageType.SubscribeEvent;
    constructor(vsWorker: number, req: string, channel: string, eventName: string, arg: any);
}
declare class EventMessage {
    readonly vsWorker: number;
    readonly req: string;
    readonly event: any;
    readonly type = MessageType.Event;
    constructor(vsWorker: number, req: string, event: any);
}
declare class UnsubscribeEventMessage {
    readonly vsWorker: number;
    readonly req: string;
    readonly type = MessageType.UnsubscribeEvent;
    constructor(vsWorker: number, req: string);
}
type Message = RequestMessage | ReplyMessage | SubscribeEventMessage | EventMessage | UnsubscribeEventMessage;
type ProxiedMethodName = (`$${string}` | `on${string}`);
export type Proxied<T> = {
    [K in keyof T]: T[K] extends (...args: infer A) => infer R ? (K extends ProxiedMethodName ? (...args: A) => Promise<Awaited<R>> : never) : never;
};
export interface IWorkerClient<W> {
    proxy: Proxied<W>;
    dispose(): void;
    setChannel<T extends object>(channel: string, handler: T): void;
    getChannel<T extends object>(channel: string): Proxied<T>;
}
export interface IWorkerServer {
    setChannel<T extends object>(channel: string, handler: T): void;
    getChannel<T extends object>(channel: string): Proxied<T>;
}
export declare class SimpleWorkerClient<W extends object> extends Disposable implements IWorkerClient<W> {
    private readonly _worker;
    private readonly _onModuleLoaded;
    private readonly _protocol;
    readonly proxy: Proxied<W>;
    private readonly _localChannels;
    private readonly _remoteChannels;
    constructor(workerFactory: IWorkerFactory, workerDescriptor: IWorkerDescriptor);
    private _handleMessage;
    private _handleEvent;
    setChannel<T extends object>(channel: string, handler: T): void;
    getChannel<T extends object>(channel: string): Proxied<T>;
    private _onError;
}
export interface IRequestHandler {
    _requestHandlerBrand: any;
    [prop: string]: any;
}
export interface IRequestHandlerFactory {
    (workerServer: IWorkerServer): IRequestHandler;
}
export declare class SimpleWorkerServer implements IWorkerServer {
    private _requestHandlerFactory;
    private _requestHandler;
    private _protocol;
    private readonly _localChannels;
    private readonly _remoteChannels;
    constructor(postMessage: (msg: Message, transfer?: ArrayBuffer[]) => void, requestHandlerFactory: IRequestHandlerFactory | null);
    onmessage(msg: any): void;
    private _handleMessage;
    private _handleEvent;
    setChannel<T extends object>(channel: string, handler: T): void;
    getChannel<T extends object>(channel: string): Proxied<T>;
    private initialize;
}
export declare function create(postMessage: (msg: Message, transfer?: ArrayBuffer[]) => void): SimpleWorkerServer;
export {};
