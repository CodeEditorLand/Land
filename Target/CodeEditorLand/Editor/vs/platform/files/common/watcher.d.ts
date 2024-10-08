import { Event } from '../../../base/common/event.js';
import { IRelativePattern, ParsedPattern } from '../../../base/common/glob.js';
import { Disposable, DisposableStore, IDisposable } from '../../../base/common/lifecycle.js';
import { FileChangeFilter, IFileChange } from './files.js';
interface IWatchRequest {
    /**
     * The path to watch.
     */
    readonly path: string;
    /**
     * Whether to watch recursively or not.
     */
    readonly recursive: boolean;
    /**
     * A set of glob patterns or paths to exclude from watching.
     */
    readonly excludes: string[];
    /**
     * An optional set of glob patterns or paths to include for
     * watching. If not provided, all paths are considered for
     * events.
     */
    readonly includes?: Array<string | IRelativePattern>;
    /**
     * If provided, file change events from the watcher that
     * are a result of this watch request will carry the same
     * id.
     */
    readonly correlationId?: number;
    /**
     * If provided, allows to filter the events that the watcher should consider
     * for emitting. If not provided, all events are emitted.
     *
     * For example, to emit added and updated events, set to:
     * `FileChangeFilter.ADDED | FileChangeFilter.UPDATED`.
     */
    readonly filter?: FileChangeFilter;
}
export interface IWatchRequestWithCorrelation extends IWatchRequest {
    readonly correlationId: number;
}
export declare function isWatchRequestWithCorrelation(request: IWatchRequest): request is IWatchRequestWithCorrelation;
export interface INonRecursiveWatchRequest extends IWatchRequest {
    /**
     * The watcher will be non-recursive.
     */
    readonly recursive: false;
}
export interface IRecursiveWatchRequest extends IWatchRequest {
    /**
     * The watcher will be recursive.
     */
    readonly recursive: true;
    /**
     * @deprecated this only exists for WSL1 support and should never
     * be used in any other case.
     */
    pollingInterval?: number;
}
export declare function isRecursiveWatchRequest(request: IWatchRequest): request is IRecursiveWatchRequest;
export type IUniversalWatchRequest = IRecursiveWatchRequest | INonRecursiveWatchRequest;
export interface IWatcherErrorEvent {
    readonly error: string;
    readonly request?: IUniversalWatchRequest;
}
export interface IWatcher {
    /**
     * A normalized file change event from the raw events
     * the watcher emits.
     */
    readonly onDidChangeFile: Event<IFileChange[]>;
    /**
     * An event to indicate a message that should get logged.
     */
    readonly onDidLogMessage: Event<ILogMessage>;
    /**
     * An event to indicate an error occurred from the watcher
     * that is unrecoverable. Listeners should restart the
     * watcher if possible.
     */
    readonly onDidError: Event<IWatcherErrorEvent>;
    /**
     * Configures the watcher to watch according to the
     * requests. Any existing watched path that is not
     * in the array, will be removed from watching and
     * any new path will be added to watching.
     */
    watch(requests: IWatchRequest[]): Promise<void>;
    /**
     * Enable verbose logging in the watcher.
     */
    setVerboseLogging(enabled: boolean): Promise<void>;
    /**
     * Stop all watchers.
     */
    stop(): Promise<void>;
}
export interface IRecursiveWatcher extends IWatcher {
    watch(requests: IRecursiveWatchRequest[]): Promise<void>;
}
export interface IRecursiveWatcherWithSubscribe extends IRecursiveWatcher {
    /**
     * Subscribe to file events for the given path. The callback is called
     * whenever a file event occurs for the path. If the watcher failed,
     * the error parameter is set to `true`.
     *
     * @returns an `IDisposable` to stop listening to events or `undefined`
     * if no events can be watched for the path given the current set of
     * recursive watch requests.
     */
    subscribe(path: string, callback: (error: true | null, change?: IFileChange) => void): IDisposable | undefined;
}
export interface IRecursiveWatcherOptions {
    /**
     * If `true`, will enable polling for all watchers, otherwise
     * will enable it for paths included in the string array.
     *
     * @deprecated this only exists for WSL1 support and should never
     * be used in any other case.
     */
    readonly usePolling: boolean | string[];
    /**
     * If polling is enabled (via `usePolling`), defines the duration
     * in which the watcher will poll for changes.
     *
     * @deprecated this only exists for WSL1 support and should never
     * be used in any other case.
     */
    readonly pollingInterval?: number;
}
export interface INonRecursiveWatcher extends IWatcher {
    watch(requests: INonRecursiveWatchRequest[]): Promise<void>;
}
export interface IUniversalWatcher extends IWatcher {
    watch(requests: IUniversalWatchRequest[]): Promise<void>;
}
export declare abstract class AbstractWatcherClient extends Disposable {
    private readonly onFileChanges;
    private readonly onLogMessage;
    private verboseLogging;
    private options;
    private static readonly MAX_RESTARTS;
    private watcher;
    private readonly watcherDisposables;
    private requests;
    private restartCounter;
    constructor(onFileChanges: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean, options: {
        readonly type: string;
        readonly restartOnError: boolean;
    });
    protected abstract createWatcher(disposables: DisposableStore): IWatcher;
    protected init(): void;
    protected onError(error: string, failedRequest?: IUniversalWatchRequest): void;
    private canRestart;
    private restart;
    watch(requests: IUniversalWatchRequest[]): Promise<void>;
    setVerboseLogging(verboseLogging: boolean): Promise<void>;
    private error;
    protected trace(message: string): void;
    dispose(): void;
}
export declare abstract class AbstractNonRecursiveWatcherClient extends AbstractWatcherClient {
    constructor(onFileChanges: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean);
    protected abstract createWatcher(disposables: DisposableStore): INonRecursiveWatcher;
}
export declare abstract class AbstractUniversalWatcherClient extends AbstractWatcherClient {
    constructor(onFileChanges: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean);
    protected abstract createWatcher(disposables: DisposableStore): IUniversalWatcher;
}
export interface ILogMessage {
    readonly type: 'trace' | 'warn' | 'error' | 'info' | 'debug';
    readonly message: string;
}
export declare function reviveFileChanges(changes: IFileChange[]): IFileChange[];
export declare function coalesceEvents(changes: IFileChange[]): IFileChange[];
export declare function normalizeWatcherPattern(path: string, pattern: string | IRelativePattern): string | IRelativePattern;
export declare function parseWatcherPatterns(path: string, patterns: Array<string | IRelativePattern>): ParsedPattern[];
export declare function isFiltered(event: IFileChange, filter: FileChangeFilter | undefined): boolean;
export declare function requestFilterToString(filter: FileChangeFilter | undefined): string;
export {};
