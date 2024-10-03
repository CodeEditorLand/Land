import { VSBuffer } from '../../../common/buffer.js';
import { Event } from '../../../common/event.js';
import { Disposable, IDisposable } from '../../../common/lifecycle.js';
import { IIPCLogger, IMessagePassingProtocol, IPCClient } from './ipc.js';
export declare const enum SocketDiagnosticsEventType {
    Created = "created",
    Read = "read",
    Write = "write",
    Open = "open",
    Error = "error",
    Close = "close",
    BrowserWebSocketBlobReceived = "browserWebSocketBlobReceived",
    NodeEndReceived = "nodeEndReceived",
    NodeEndSent = "nodeEndSent",
    NodeDrainBegin = "nodeDrainBegin",
    NodeDrainEnd = "nodeDrainEnd",
    zlibInflateError = "zlibInflateError",
    zlibInflateData = "zlibInflateData",
    zlibInflateInitialWrite = "zlibInflateInitialWrite",
    zlibInflateInitialFlushFired = "zlibInflateInitialFlushFired",
    zlibInflateWrite = "zlibInflateWrite",
    zlibInflateFlushFired = "zlibInflateFlushFired",
    zlibDeflateError = "zlibDeflateError",
    zlibDeflateData = "zlibDeflateData",
    zlibDeflateWrite = "zlibDeflateWrite",
    zlibDeflateFlushFired = "zlibDeflateFlushFired",
    WebSocketNodeSocketWrite = "webSocketNodeSocketWrite",
    WebSocketNodeSocketPeekedHeader = "webSocketNodeSocketPeekedHeader",
    WebSocketNodeSocketReadHeader = "webSocketNodeSocketReadHeader",
    WebSocketNodeSocketReadData = "webSocketNodeSocketReadData",
    WebSocketNodeSocketUnmaskedData = "webSocketNodeSocketUnmaskedData",
    WebSocketNodeSocketDrainBegin = "webSocketNodeSocketDrainBegin",
    WebSocketNodeSocketDrainEnd = "webSocketNodeSocketDrainEnd",
    ProtocolHeaderRead = "protocolHeaderRead",
    ProtocolMessageRead = "protocolMessageRead",
    ProtocolHeaderWrite = "protocolHeaderWrite",
    ProtocolMessageWrite = "protocolMessageWrite",
    ProtocolWrite = "protocolWrite"
}
export declare namespace SocketDiagnostics {
    const enableDiagnostics = false;
    interface IRecord {
        timestamp: number;
        id: string;
        label: string;
        type: SocketDiagnosticsEventType;
        buff?: VSBuffer;
        data?: any;
    }
    const records: IRecord[];
    function traceSocketEvent(nativeObject: any, socketDebugLabel: string, type: SocketDiagnosticsEventType, data?: VSBuffer | Uint8Array | ArrayBuffer | ArrayBufferView | any): void;
}
export declare const enum SocketCloseEventType {
    NodeSocketCloseEvent = 0,
    WebSocketCloseEvent = 1
}
export interface NodeSocketCloseEvent {
    readonly type: SocketCloseEventType.NodeSocketCloseEvent;
    readonly hadError: boolean;
    readonly error: Error | undefined;
}
export interface WebSocketCloseEvent {
    readonly type: SocketCloseEventType.WebSocketCloseEvent;
    readonly code: number;
    readonly reason: string;
    readonly wasClean: boolean;
    readonly event: any | undefined;
}
export type SocketCloseEvent = NodeSocketCloseEvent | WebSocketCloseEvent | undefined;
export interface SocketTimeoutEvent {
    readonly unacknowledgedMsgCount: number;
    readonly timeSinceOldestUnacknowledgedMsg: number;
    readonly timeSinceLastReceivedSomeData: number;
}
export interface ISocket extends IDisposable {
    onData(listener: (e: VSBuffer) => void): IDisposable;
    onClose(listener: (e: SocketCloseEvent) => void): IDisposable;
    onEnd(listener: () => void): IDisposable;
    write(buffer: VSBuffer): void;
    end(): void;
    drain(): Promise<void>;
    traceSocketEvent(type: SocketDiagnosticsEventType, data?: VSBuffer | Uint8Array | ArrayBuffer | ArrayBufferView | any): void;
}
export declare class ChunkStream {
    private _chunks;
    private _totalLength;
    get byteLength(): number;
    constructor();
    acceptChunk(buff: VSBuffer): void;
    read(byteCount: number): VSBuffer;
    peek(byteCount: number): VSBuffer;
    private _read;
}
export declare const enum ProtocolConstants {
    HeaderLength = 13,
    AcknowledgeTime = 2000,
    TimeoutTime = 20000,
    ReconnectionGraceTime = 10800000,
    ReconnectionShortGraceTime = 300000,
    KeepAliveSendTime = 5000
}
export declare class Protocol extends Disposable implements IMessagePassingProtocol {
    private _socket;
    private _socketWriter;
    private _socketReader;
    private readonly _onMessage;
    readonly onMessage: Event<VSBuffer>;
    private readonly _onDidDispose;
    readonly onDidDispose: Event<void>;
    constructor(socket: ISocket);
    drain(): Promise<void>;
    getSocket(): ISocket;
    sendDisconnect(): void;
    send(buffer: VSBuffer): void;
}
export declare class Client<TContext = string> extends IPCClient<TContext> {
    private protocol;
    static fromSocket<TContext = string>(socket: ISocket, id: TContext): Client<TContext>;
    get onDidDispose(): Event<void>;
    constructor(protocol: Protocol | PersistentProtocol, id: TContext, ipcLogger?: IIPCLogger | null);
    dispose(): void;
}
export declare class BufferedEmitter<T> {
    private _emitter;
    readonly event: Event<T>;
    private _hasListeners;
    private _isDeliveringMessages;
    private _bufferedMessages;
    constructor();
    private _deliverMessages;
    fire(event: T): void;
    flushBuffer(): void;
}
export interface ILoadEstimator {
    hasHighLoad(): boolean;
}
export interface PersistentProtocolOptions {
    socket: ISocket;
    initialChunk?: VSBuffer | null;
    loadEstimator?: ILoadEstimator;
    sendKeepAlive?: boolean;
}
export declare class PersistentProtocol implements IMessagePassingProtocol {
    private _isReconnecting;
    private _didSendDisconnect?;
    private _outgoingUnackMsg;
    private _outgoingMsgId;
    private _outgoingAckId;
    private _outgoingAckTimeout;
    private _incomingMsgId;
    private _incomingAckId;
    private _incomingMsgLastTime;
    private _incomingAckTimeout;
    private _keepAliveInterval;
    private _lastReplayRequestTime;
    private _lastSocketTimeoutTime;
    private _socket;
    private _socketWriter;
    private _socketReader;
    private _socketDisposables;
    private readonly _loadEstimator;
    private readonly _shouldSendKeepAlive;
    private readonly _onControlMessage;
    readonly onControlMessage: Event<VSBuffer>;
    private readonly _onMessage;
    readonly onMessage: Event<VSBuffer>;
    private readonly _onDidDispose;
    readonly onDidDispose: Event<void>;
    private readonly _onSocketClose;
    readonly onSocketClose: Event<SocketCloseEvent>;
    private readonly _onSocketTimeout;
    readonly onSocketTimeout: Event<SocketTimeoutEvent>;
    get unacknowledgedCount(): number;
    constructor(opts: PersistentProtocolOptions);
    dispose(): void;
    drain(): Promise<void>;
    sendDisconnect(): void;
    sendPause(): void;
    sendResume(): void;
    pauseSocketWriting(): void;
    getSocket(): ISocket;
    getMillisSinceLastIncomingData(): number;
    beginAcceptReconnection(socket: ISocket, initialDataChunk: VSBuffer | null): void;
    endAcceptReconnection(): void;
    acceptDisconnect(): void;
    private _receiveMessage;
    readEntireBuffer(): VSBuffer;
    flush(): void;
    send(buffer: VSBuffer): void;
    sendControl(buffer: VSBuffer): void;
    private _sendAckCheck;
    private _recvAckCheck;
    private _sendAck;
    private _sendKeepAlive;
}
