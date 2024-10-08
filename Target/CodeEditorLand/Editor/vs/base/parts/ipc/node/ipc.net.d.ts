import { Server as NetServer, Socket } from 'net';
import { VSBuffer } from '../../../common/buffer.js';
import { Disposable, IDisposable } from '../../../common/lifecycle.js';
import { IPCServer } from '../common/ipc.js';
import { Client, ISocket, SocketCloseEvent, SocketDiagnosticsEventType } from '../common/ipc.net.js';
export declare class NodeSocket implements ISocket {
    readonly debugLabel: string;
    readonly socket: Socket;
    private readonly _errorListener;
    private readonly _closeListener;
    private readonly _endListener;
    private _canWrite;
    traceSocketEvent(type: SocketDiagnosticsEventType, data?: VSBuffer | Uint8Array | ArrayBuffer | ArrayBufferView | any): void;
    constructor(socket: Socket, debugLabel?: string);
    dispose(): void;
    onData(_listener: (e: VSBuffer) => void): IDisposable;
    onClose(listener: (e: SocketCloseEvent) => void): IDisposable;
    onEnd(listener: () => void): IDisposable;
    write(buffer: VSBuffer): void;
    end(): void;
    drain(): Promise<void>;
}
interface ISocketTracer {
    traceSocketEvent(type: SocketDiagnosticsEventType, data?: VSBuffer | Uint8Array | ArrayBuffer | ArrayBufferView | any): void;
}
/**
 * See https://tools.ietf.org/html/rfc6455#section-5.2
 */
export declare class WebSocketNodeSocket extends Disposable implements ISocket, ISocketTracer {
    readonly socket: NodeSocket;
    private readonly _flowManager;
    private readonly _incomingData;
    private readonly _onData;
    private readonly _onClose;
    private _isEnded;
    private readonly _state;
    get permessageDeflate(): boolean;
    get recordedInflateBytes(): VSBuffer;
    traceSocketEvent(type: SocketDiagnosticsEventType, data?: VSBuffer | Uint8Array | ArrayBuffer | ArrayBufferView | any): void;
    /**
     * Create a socket which can communicate using WebSocket frames.
     *
     * **NOTE**: When using the permessage-deflate WebSocket extension, if parts of inflating was done
     *  in a different zlib instance, we need to pass all those bytes into zlib, otherwise the inflate
     *  might hit an inflated portion referencing a distance too far back.
     *
     * @param socket The underlying socket
     * @param permessageDeflate Use the permessage-deflate WebSocket extension
     * @param inflateBytes "Seed" zlib inflate with these bytes.
     * @param recordInflateBytes Record all bytes sent to inflate
     */
    constructor(socket: NodeSocket, permessageDeflate: boolean, inflateBytes: VSBuffer | null, recordInflateBytes: boolean);
    dispose(): void;
    onData(listener: (e: VSBuffer) => void): IDisposable;
    onClose(listener: (e: SocketCloseEvent) => void): IDisposable;
    onEnd(listener: () => void): IDisposable;
    write(buffer: VSBuffer): void;
    private _write;
    end(): void;
    private _acceptChunk;
    drain(): Promise<void>;
}
export declare const XDG_RUNTIME_DIR: string | undefined;
export declare function createRandomIPCHandle(): string;
export declare function createStaticIPCHandle(directoryPath: string, type: string, version: string): string;
export declare class Server extends IPCServer {
    private static toClientConnectionEvent;
    private server;
    constructor(server: NetServer);
    dispose(): void;
}
export declare function serve(port: number): Promise<Server>;
export declare function serve(namedPipe: string): Promise<Server>;
export declare function connect(options: {
    host: string;
    port: number;
}, clientId: string): Promise<Client>;
export declare function connect(port: number, clientId: string): Promise<Client>;
export declare function connect(namedPipe: string, clientId: string): Promise<Client>;
export {};
