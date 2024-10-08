import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IFileChange } from '../../../../platform/files/common/files.js';
import { AbstractUniversalWatcherClient, ILogMessage, IRecursiveWatcher } from '../../../../platform/files/common/watcher.js';
import { IUtilityProcessWorkerWorkbenchService } from '../../utilityProcess/electron-sandbox/utilityProcessWorkerWorkbenchService.js';
export declare class UniversalWatcherClient extends AbstractUniversalWatcherClient {
    private readonly utilityProcessWorkerWorkbenchService;
    constructor(onFileChanges: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean, utilityProcessWorkerWorkbenchService: IUtilityProcessWorkerWorkbenchService);
    protected createWatcher(disposables: DisposableStore): IRecursiveWatcher;
}
