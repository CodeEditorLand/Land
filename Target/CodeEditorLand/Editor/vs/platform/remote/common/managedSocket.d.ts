import { VSBuffer } from '../../../base/common/buffer.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ISocket, SocketCloseEvent, SocketDiagnosticsEventType } from '../../../base/parts/ipc/common/ipc.net.js';
export declare const makeRawSocketHeaders: (path: string, query: string, deubgLabel: string) => string;
export declare const socketRawEndHeaderSequence: VSBuffer;
export interface RemoteSocketHalf {
    onData: Emitter<VSBuffer>;
    onClose: Emitter<SocketCloseEvent>;
    onEnd: Emitter<void>;
}
/** Should be called immediately after making a ManagedSocket to make it ready for data flow. */
export declare function connectManagedSocket<T extends ManagedSocket>(socket: T, path: string, query: string, debugLabel: string, half: RemoteSocketHalf): Promise<T>;
export declare abstract class ManagedSocket extends Disposable implements ISocket {
    private readonly debugLabel;
    private readonly pausableDataEmitter;
    onData: Event<VSBuffer>;
    onClose: Event<SocketCloseEvent>;
    onEnd: Event<void>;
    private readonly didDisposeEmitter;
    onDidDispose: Event<void>;
    private ended;
    protected constructor(debugLabel: string, half: RemoteSocketHalf);
    /** Pauses data events until a new listener comes in onData() */
    pauseData(): void;
    /** Flushes data to the socket. */
    drain(): Promise<void>;
    /** Ends the remote socket. */
    end(): void;
    abstract write(buffer: VSBuffer): void;
    protected abstract closeRemote(): void;
    traceSocketEvent(type: SocketDiagnosticsEventType, data?: any): void;
    dispose(): void;
}
