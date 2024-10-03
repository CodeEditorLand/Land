import { AbstractNonRecursiveWatcherClient } from '../../../common/watcher.js';
import { NodeJSWatcher } from './nodejsWatcher.js';
export class NodeJSWatcherClient extends AbstractNonRecursiveWatcherClient {
    constructor(onFileChanges, onLogMessage, verboseLogging) {
        super(onFileChanges, onLogMessage, verboseLogging);
        this.init();
    }
    createWatcher(disposables) {
        return disposables.add(new NodeJSWatcher(undefined));
    }
}
