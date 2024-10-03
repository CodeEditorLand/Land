import { Event } from '../../../base/common/event.js';
import { IRelativePattern, ParsedPattern } from '../../../base/common/glob.js';
import { Disposable, DisposableStore, IDisposable } from '../../../base/common/lifecycle.js';
import { FileChangeFilter, IFileChange } from './files.js';
interface IWatchRequest {
    readonly path: string;
    readonly recursive: boolean;
    readonly excludes: string[];
    readonly includes?: Array<string | IRelativePattern>;
    readonly correlationId?: number;
    readonly filter?: FileChangeFilter;
}
export interface IWatchRequestWithCorrelation extends IWatchRequest {
    readonly correlationId: number;
}
export declare function isWatchRequestWithCorrelation(request: IWatchRequest): request is IWatchRequestWithCorrelation;
export interface INonRecursiveWatchRequest extends IWatchRequest {
    readonly recursive: false;
}
export interface IRecursiveWatchRequest extends IWatchRequest {
    readonly recursive: true;
    pollingInterval?: number;
}
export declare function isRecursiveWatchRequest(request: IWatchRequest): request is IRecursiveWatchRequest;
export type IUniversalWatchRequest = IRecursiveWatchRequest | INonRecursiveWatchRequest;
export interface IWatcherErrorEvent {
    readonly error: string;
    readonly request?: IUniversalWatchRequest;
}
export interface IWatcher {
    readonly onDidChangeFile: Event<IFileChange[]>;
    readonly onDidLogMessage: Event<ILogMessage>;
    readonly onDidError: Event<IWatcherErrorEvent>;
    watch(requests: IWatchRequest[]): Promise<void>;
    setVerboseLogging(enabled: boolean): Promise<void>;
    stop(): Promise<void>;
}
export interface IRecursiveWatcher extends IWatcher {
    watch(requests: IRecursiveWatchRequest[]): Promise<void>;
}
export interface IRecursiveWatcherWithSubscribe extends IRecursiveWatcher {
    subscribe(path: string, callback: (error: true | null, change?: IFileChange) => void): IDisposable | undefined;
}
export interface IRecursiveWatcherOptions {
    readonly usePolling: boolean | string[];
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
