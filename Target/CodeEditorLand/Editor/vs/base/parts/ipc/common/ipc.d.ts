import { VSBuffer } from '../../../common/buffer.js';
import { CancellationToken } from '../../../common/cancellation.js';
import { Event } from '../../../common/event.js';
import { DisposableStore, IDisposable } from '../../../common/lifecycle.js';
export interface IChannel {
    call<T>(command: string, arg?: any, cancellationToken?: CancellationToken): Promise<T>;
    listen<T>(event: string, arg?: any): Event<T>;
}
export interface IServerChannel<TContext = string> {
    call<T>(ctx: TContext, command: string, arg?: any, cancellationToken?: CancellationToken): Promise<T>;
    listen<T>(ctx: TContext, event: string, arg?: any): Event<T>;
}
export interface IMessagePassingProtocol {
    send(buffer: VSBuffer): void;
    onMessage: Event<VSBuffer>;
    drain?(): Promise<void>;
}
export interface IChannelServer<TContext = string> {
    registerChannel(channelName: string, channel: IServerChannel<TContext>): void;
}
export interface IChannelClient {
    getChannel<T extends IChannel>(channelName: string): T;
}
export interface Client<TContext> {
    readonly ctx: TContext;
}
export interface IConnectionHub<TContext> {
    readonly connections: Connection<TContext>[];
    readonly onDidAddConnection: Event<Connection<TContext>>;
    readonly onDidRemoveConnection: Event<Connection<TContext>>;
}
export interface IClientRouter<TContext = string> {
    routeCall(hub: IConnectionHub<TContext>, command: string, arg?: any, cancellationToken?: CancellationToken): Promise<Client<TContext>>;
    routeEvent(hub: IConnectionHub<TContext>, event: string, arg?: any): Promise<Client<TContext>>;
}
export interface IRoutingChannelClient<TContext = string> {
    getChannel<T extends IChannel>(channelName: string, router?: IClientRouter<TContext>): T;
}
interface IReader {
    read(bytes: number): VSBuffer;
}
interface IWriter {
    write(buffer: VSBuffer): void;
}
export declare class BufferReader implements IReader {
    private buffer;
    private pos;
    constructor(buffer: VSBuffer);
    read(bytes: number): VSBuffer;
}
export declare class BufferWriter implements IWriter {
    private buffers;
    get buffer(): VSBuffer;
    write(buffer: VSBuffer): void;
}
export declare function serialize(writer: IWriter, data: any): void;
export declare function deserialize(reader: IReader): any;
export declare class ChannelServer<TContext = string> implements IChannelServer<TContext>, IDisposable {
    private protocol;
    private ctx;
    private logger;
    private timeoutDelay;
    private channels;
    private activeRequests;
    private protocolListener;
    private pendingRequests;
    constructor(protocol: IMessagePassingProtocol, ctx: TContext, logger?: IIPCLogger | null, timeoutDelay?: number);
    registerChannel(channelName: string, channel: IServerChannel<TContext>): void;
    private sendResponse;
    private send;
    private sendBuffer;
    private onRawMessage;
    private onPromise;
    private onEventListen;
    private disposeActiveRequest;
    private collectPendingRequest;
    private flushPendingRequests;
    dispose(): void;
}
export declare const enum RequestInitiator {
    LocalSide = 0,
    OtherSide = 1
}
export interface IIPCLogger {
    logIncoming(msgLength: number, requestId: number, initiator: RequestInitiator, str: string, data?: any): void;
    logOutgoing(msgLength: number, requestId: number, initiator: RequestInitiator, str: string, data?: any): void;
}
export declare class ChannelClient implements IChannelClient, IDisposable {
    private protocol;
    private isDisposed;
    private state;
    private activeRequests;
    private handlers;
    private lastRequestId;
    private protocolListener;
    private logger;
    private readonly _onDidInitialize;
    readonly onDidInitialize: Event<void>;
    constructor(protocol: IMessagePassingProtocol, logger?: IIPCLogger | null);
    getChannel<T extends IChannel>(channelName: string): T;
    private requestPromise;
    private requestEvent;
    private sendRequest;
    private send;
    private sendBuffer;
    private onBuffer;
    private onResponse;
    get onDidInitializePromise(): Promise<void>;
    private whenInitialized;
    dispose(): void;
}
export interface ClientConnectionEvent {
    protocol: IMessagePassingProtocol;
    onDidClientDisconnect: Event<void>;
}
interface Connection<TContext> extends Client<TContext> {
    readonly channelServer: ChannelServer<TContext>;
    readonly channelClient: ChannelClient;
}
export declare class IPCServer<TContext = string> implements IChannelServer<TContext>, IRoutingChannelClient<TContext>, IConnectionHub<TContext>, IDisposable {
    private channels;
    private _connections;
    private readonly _onDidAddConnection;
    readonly onDidAddConnection: Event<Connection<TContext>>;
    private readonly _onDidRemoveConnection;
    readonly onDidRemoveConnection: Event<Connection<TContext>>;
    private readonly disposables;
    get connections(): Connection<TContext>[];
    constructor(onDidClientConnect: Event<ClientConnectionEvent>, ipcLogger?: IIPCLogger | null, timeoutDelay?: number);
    getChannel<T extends IChannel>(channelName: string, router: IClientRouter<TContext>): T;
    getChannel<T extends IChannel>(channelName: string, clientFilter: (client: Client<TContext>) => boolean): T;
    private getMulticastEvent;
    registerChannel(channelName: string, channel: IServerChannel<TContext>): void;
    dispose(): void;
}
export declare class IPCClient<TContext = string> implements IChannelClient, IChannelServer<TContext>, IDisposable {
    private channelClient;
    private channelServer;
    constructor(protocol: IMessagePassingProtocol, ctx: TContext, ipcLogger?: IIPCLogger | null);
    getChannel<T extends IChannel>(channelName: string): T;
    registerChannel(channelName: string, channel: IServerChannel<TContext>): void;
    dispose(): void;
}
export declare function getDelayedChannel<T extends IChannel>(promise: Promise<T>): T;
export declare function getNextTickChannel<T extends IChannel>(channel: T): T;
export declare class StaticRouter<TContext = string> implements IClientRouter<TContext> {
    private fn;
    constructor(fn: (ctx: TContext) => boolean | Promise<boolean>);
    routeCall(hub: IConnectionHub<TContext>): Promise<Client<TContext>>;
    routeEvent(hub: IConnectionHub<TContext>): Promise<Client<TContext>>;
    private route;
}
export declare namespace ProxyChannel {
    interface IProxyOptions {
        disableMarshalling?: boolean;
    }
    interface ICreateServiceChannelOptions extends IProxyOptions {
    }
    function fromService<TContext>(service: unknown, disposables: DisposableStore, options?: ICreateServiceChannelOptions): IServerChannel<TContext>;
    interface ICreateProxyServiceOptions extends IProxyOptions {
        context?: unknown;
        properties?: Map<string, unknown>;
    }
    function toService<T extends object>(channel: IChannel, options?: ICreateProxyServiceOptions): T;
}
export declare class IPCLogger implements IIPCLogger {
    private readonly _outgoingPrefix;
    private readonly _incomingPrefix;
    private _totalIncoming;
    private _totalOutgoing;
    constructor(_outgoingPrefix: string, _incomingPrefix: string);
    logOutgoing(msgLength: number, requestId: number, initiator: RequestInitiator, str: string, data?: any): void;
    logIncoming(msgLength: number, requestId: number, initiator: RequestInitiator, str: string, data?: any): void;
}
export {};
