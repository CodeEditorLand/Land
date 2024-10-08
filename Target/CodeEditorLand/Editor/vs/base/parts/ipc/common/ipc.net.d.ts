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
    /**
     * The type of the event
     */
    readonly type: SocketCloseEventType.NodeSocketCloseEvent;
    /**
     * `true` if the socket had a transmission error.
     */
    readonly hadError: boolean;
    /**
     * Underlying error.
     */
    readonly error: Error | undefined;
}
export interface WebSocketCloseEvent {
    /**
     * The type of the event
     */
    readonly type: SocketCloseEventType.WebSocketCloseEvent;
    /**
     * Returns the WebSocket connection close code provided by the server.
     */
    readonly code: number;
    /**
     * Returns the WebSocket connection close reason provided by the server.
     */
    readonly reason: string;
    /**
     * Returns true if the connection closed cleanly; false otherwise.
     */
    readonly wasClean: boolean;
    /**
     * Underlying event.
     */
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
    /**
     * Send an Acknowledge message at most 2 seconds later...
     */
    AcknowledgeTime = 2000,// 2 seconds
    /**
     * If there is a sent message that has been unacknowledged for 20 seconds,
     * and we didn't see any incoming server data in the past 20 seconds,
     * then consider the connection has timed out.
     */
    TimeoutTime = 20000,// 20 seconds
    /**
     * If there is no reconnection within this time-frame, consider the connection permanently closed...
     */
    ReconnectionGraceTime = 10800000,// 3hrs
    /**
     * Maximal grace time between the first and the last reconnection...
     */
    ReconnectionShortGraceTime = 300000,// 5min
    /**
     * Send a message every 5 seconds to avoid that the connection is closed by the OS.
     */
    KeepAliveSendTime = 5000
}
/**
 * A message has the following format:
 * ```
 *     /-------------------------------|------\
 *     |             HEADER            |      |
 *     |-------------------------------| DATA |
 *     | TYPE | ID | ACK | DATA_LENGTH |      |
 *     \-------------------------------|------/
 * ```
 * The header is 9 bytes and consists of:
 *  - TYPE is 1 byte (ProtocolMessageType) - the message type
 *  - ID is 4 bytes (u32be) - the message id (can be 0 to indicate to be ignored)
 *  - ACK is 4 bytes (u32be) - the acknowledged message id (can be 0 to indicate to be ignored)
 *  - DATA_LENGTH is 4 bytes (u32be) - the length in bytes of DATA
 *
 * Only Regular messages are counted, other messages are not counted, nor acknowledged.
 */
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
/**
 * Will ensure no messages are lost if there are no event listeners.
 */
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
    /**
     * The socket to use.
     */
    socket: ISocket;
    /**
     * The initial chunk of data that has already been received from the socket.
     */
    initialChunk?: VSBuffer | null;
    /**
     * The CPU load estimator to use.
     */
    loadEstimator?: ILoadEstimator;
    /**
     * Whether to send keep alive messages. Defaults to true.
     */
    sendKeepAlive?: boolean;
}
/**
 * Same as Protocol, but will actually track messages and acks.
 * Moreover, it will ensure no messages are lost if there are no event listeners.
 */
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
    /**
     * Send a message which will not be part of the regular acknowledge flow.
     * Use this for early control messages which are repeated in case of reconnection.
     */
    sendControl(buffer: VSBuffer): void;
    private _sendAckCheck;
    private _recvAckCheck;
    private _sendAck;
    private _sendKeepAlive;
}
