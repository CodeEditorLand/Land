import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IFileChange } from '../../common/files.js';
import { AbstractUniversalWatcherClient, ILogMessage, IUniversalWatcher } from '../../common/watcher.js';
export declare class UniversalWatcherClient extends AbstractUniversalWatcherClient {
    constructor(onFileChanges: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean);
    protected createWatcher(disposables: DisposableStore): IUniversalWatcher;
}
