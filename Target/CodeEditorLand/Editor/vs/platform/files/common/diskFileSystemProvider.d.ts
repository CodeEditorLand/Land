import { Emitter } from '../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IFileChange, IFileSystemProvider, IWatchOptions } from './files.js';
import { AbstractNonRecursiveWatcherClient, AbstractUniversalWatcherClient, ILogMessage, IRecursiveWatcherOptions } from './watcher.js';
import { ILogService } from '../../log/common/log.js';
export interface IDiskFileSystemProviderOptions {
    watcher?: {
        recursive?: IRecursiveWatcherOptions;
        forceUniversal?: boolean;
    };
}
export declare abstract class AbstractDiskFileSystemProvider extends Disposable implements Pick<IFileSystemProvider, 'watch'>, Pick<IFileSystemProvider, 'onDidChangeFile'>, Pick<IFileSystemProvider, 'onDidWatchError'> {
    protected readonly logService: ILogService;
    private readonly options?;
    constructor(logService: ILogService, options?: IDiskFileSystemProviderOptions | undefined);
    protected readonly _onDidChangeFile: Emitter<readonly IFileChange[]>;
    readonly onDidChangeFile: import("../../../workbench/workbench.web.main.internal.js").Event<readonly IFileChange[]>;
    protected readonly _onDidWatchError: Emitter<string>;
    readonly onDidWatchError: import("../../../workbench/workbench.web.main.internal.js").Event<string>;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    private universalWatcher;
    private readonly universalWatchRequests;
    private readonly universalWatchRequestDelayer;
    private watchUniversal;
    private toWatchRequest;
    private refreshUniversalWatchers;
    private doRefreshUniversalWatchers;
    protected abstract createUniversalWatcher(onChange: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean): AbstractUniversalWatcherClient;
    private nonRecursiveWatcher;
    private readonly nonRecursiveWatchRequests;
    private readonly nonRecursiveWatchRequestDelayer;
    private watchNonRecursive;
    private refreshNonRecursiveWatchers;
    private doRefreshNonRecursiveWatchers;
    protected abstract createNonRecursiveWatcher(onChange: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean): AbstractNonRecursiveWatcherClient;
    private onWatcherLogMessage;
    protected logWatcherMessage(msg: ILogMessage): void;
    protected toFilePath(resource: URI): string;
    private toWatchPath;
}
