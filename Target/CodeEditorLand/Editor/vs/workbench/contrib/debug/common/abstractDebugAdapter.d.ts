import { Emitter, Event } from '../../../../base/common/event.js';
import { IDebugAdapter } from './debug.js';
/**
 * Abstract implementation of the low level API for a debug adapter.
 * Missing is how this API communicates with the debug adapter.
 */
export declare abstract class AbstractDebugAdapter implements IDebugAdapter {
    private sequence;
    private pendingRequests;
    private requestCallback;
    private eventCallback;
    private messageCallback;
    private queue;
    protected readonly _onError: Emitter<Error>;
    protected readonly _onExit: Emitter<number | null>;
    constructor();
    abstract startSession(): Promise<void>;
    abstract stopSession(): Promise<void>;
    abstract sendMessage(message: DebugProtocol.ProtocolMessage): void;
    get onError(): Event<Error>;
    get onExit(): Event<number | null>;
    onMessage(callback: (message: DebugProtocol.ProtocolMessage) => void): void;
    onEvent(callback: (event: DebugProtocol.Event) => void): void;
    onRequest(callback: (request: DebugProtocol.Request) => void): void;
    sendResponse(response: DebugProtocol.Response): void;
    sendRequest(command: string, args: any, clb: (result: DebugProtocol.Response) => void, timeout?: number): number;
    acceptMessage(message: DebugProtocol.ProtocolMessage): void;
    /**
     * Returns whether we should insert a timeout between processing messageA
     * and messageB. Artificially queueing protocol messages guarantees that any
     * microtasks for previous message finish before next message is processed.
     * This is essential ordering when using promises anywhere along the call path.
     *
     * For example, take the following, where `chooseAndSendGreeting` returns
     * a person name and then emits a greeting event:
     *
     * ```
     * let person: string;
     * adapter.onGreeting(() => console.log('hello', person));
     * person = await adapter.chooseAndSendGreeting();
     * ```
     *
     * Because the event is dispatched synchronously, it may fire before person
     * is assigned if they're processed in the same task. Inserting a task
     * boundary avoids this issue.
     */
    protected needsTaskBoundaryBetween(messageA: DebugProtocol.ProtocolMessage, messageB: DebugProtocol.ProtocolMessage): boolean;
    /**
     * Reads and dispatches items from the queue until it is empty.
     */
    private processQueue;
    private internalSend;
    protected cancelPendingRequests(): Promise<void>;
    getPendingRequestIds(): number[];
    dispose(): void;
}
