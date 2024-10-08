import { RunOnceWorker } from '../../../../../base/common/async.js';
import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { Event } from '../../../../../base/common/event.js';
import { BaseWatcher } from '../baseWatcher.js';
import { IFileChange } from '../../../common/files.js';
import { IRecursiveWatchRequest, IRecursiveWatcherWithSubscribe, IWatcherErrorEvent } from '../../../common/watcher.js';
import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
export declare class ParcelWatcherInstance extends Disposable {
    /**
     * Signals when the watcher is ready to watch.
     */
    readonly ready: Promise<unknown>;
    readonly request: IRecursiveWatchRequest;
    /**
     * How often this watcher has been restarted in case of an unexpected
     * shutdown.
     */
    readonly restarts: number;
    /**
     * The cancellation token associated with the lifecycle of the watcher.
     */
    readonly token: CancellationToken;
    /**
     * An event aggregator to coalesce events and reduce duplicates.
     */
    readonly worker: RunOnceWorker<IFileChange>;
    private readonly stopFn;
    private readonly _onDidStop;
    readonly onDidStop: Event<{
        joinRestart?: Promise<void>;
    }>;
    private readonly _onDidFail;
    readonly onDidFail: Event<void>;
    private didFail;
    get failed(): boolean;
    private didStop;
    get stopped(): boolean;
    private readonly includes;
    private readonly excludes;
    private readonly subscriptions;
    constructor(
    /**
     * Signals when the watcher is ready to watch.
     */
    ready: Promise<unknown>, request: IRecursiveWatchRequest, 
    /**
     * How often this watcher has been restarted in case of an unexpected
     * shutdown.
     */
    restarts: number, 
    /**
     * The cancellation token associated with the lifecycle of the watcher.
     */
    token: CancellationToken, 
    /**
     * An event aggregator to coalesce events and reduce duplicates.
     */
    worker: RunOnceWorker<IFileChange>, stopFn: () => Promise<void>);
    subscribe(path: string, callback: (change: IFileChange) => void): IDisposable;
    get subscriptionsCount(): number;
    notifyFileChange(path: string, change: IFileChange): void;
    notifyWatchFailed(): void;
    include(path: string): boolean;
    exclude(path: string): boolean;
    stop(joinRestart: Promise<void> | undefined): Promise<void>;
}
export declare class ParcelWatcher extends BaseWatcher implements IRecursiveWatcherWithSubscribe {
    private static readonly MAP_PARCEL_WATCHER_ACTION_TO_FILE_CHANGE;
    private static readonly PREDEFINED_EXCLUDES;
    private static readonly PARCEL_WATCHER_BACKEND;
    private readonly _onDidError;
    readonly onDidError: Event<IWatcherErrorEvent>;
    readonly watchers: Set<ParcelWatcherInstance>;
    private static readonly FILE_CHANGES_HANDLER_DELAY;
    private readonly throttledFileChangesEmitter;
    private enospcErrorLogged;
    constructor();
    private registerListeners;
    protected doWatch(requests: IRecursiveWatchRequest[]): Promise<void>;
    private findWatcher;
    private startPolling;
    private startWatching;
    private addPredefinedExcludes;
    private onParcelEvents;
    private handleIncludes;
    private handleParcelEvents;
    private emitEvents;
    private normalizePath;
    private normalizeEvents;
    private filterEvents;
    private onWatchedPathDeleted;
    private onUnexpectedError;
    stop(): Promise<void>;
    protected restartWatching(watcher: ParcelWatcherInstance, delay?: number): void;
    private stopWatching;
    protected removeDuplicateRequests(requests: IRecursiveWatchRequest[], validatePaths?: boolean): IRecursiveWatchRequest[];
    private isPathValid;
    subscribe(path: string, callback: (error: true | null, change?: IFileChange) => void): IDisposable | undefined;
    protected trace(message: string, watcher?: ParcelWatcherInstance): void;
    protected warn(message: string, watcher?: ParcelWatcherInstance): void;
    private error;
    private toMessage;
    protected get recursiveWatcher(): this;
}
