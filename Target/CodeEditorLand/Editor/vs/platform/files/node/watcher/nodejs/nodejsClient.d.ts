import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { IFileChange } from '../../../common/files.js';
import { ILogMessage, AbstractNonRecursiveWatcherClient, INonRecursiveWatcher } from '../../../common/watcher.js';
export declare class NodeJSWatcherClient extends AbstractNonRecursiveWatcherClient {
    constructor(onFileChanges: (changes: IFileChange[]) => void, onLogMessage: (msg: ILogMessage) => void, verboseLogging: boolean);
    protected createWatcher(disposables: DisposableStore): INonRecursiveWatcher;
}
