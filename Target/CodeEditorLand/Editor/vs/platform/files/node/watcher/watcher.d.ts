import { Disposable } from '../../../../base/common/lifecycle.js';
import { ILogMessage, IUniversalWatcher, IUniversalWatchRequest } from '../../common/watcher.js';
import { Event } from '../../../../base/common/event.js';
export declare class UniversalWatcher extends Disposable implements IUniversalWatcher {
    private readonly recursiveWatcher;
    private readonly nonRecursiveWatcher;
    readonly onDidChangeFile: Event<import("../../common/files.js").IFileChange[]>;
    readonly onDidError: Event<any>;
    private readonly _onDidLogMessage;
    readonly onDidLogMessage: Event<ILogMessage>;
    private requests;
    private failedRecursiveRequests;
    constructor();
    watch(requests: IUniversalWatchRequest[]): Promise<void>;
    setVerboseLogging(enabled: boolean): Promise<void>;
    stop(): Promise<void>;
}
