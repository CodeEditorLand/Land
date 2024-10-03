import { FileAccess } from '../../../../base/common/network.js';
import { getNextTickChannel, ProxyChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { Client } from '../../../../base/parts/ipc/node/ipc.cp.js';
import { AbstractUniversalWatcherClient } from '../../common/watcher.js';
export class UniversalWatcherClient extends AbstractUniversalWatcherClient {
    constructor(onFileChanges, onLogMessage, verboseLogging) {
        super(onFileChanges, onLogMessage, verboseLogging);
        this.init();
    }
    createWatcher(disposables) {
        const client = disposables.add(new Client(FileAccess.asFileUri('bootstrap-fork').fsPath, {
            serverName: 'File Watcher',
            args: ['--type=fileWatcher'],
            env: {
                VSCODE_ESM_ENTRYPOINT: 'vs/platform/files/node/watcher/watcherMain',
                VSCODE_PIPE_LOGGING: 'true',
                VSCODE_VERBOSE_LOGGING: 'true'
            }
        }));
        disposables.add(client.onDidProcessExit(({ code, signal }) => this.onError(`terminated by itself with code ${code}, signal: ${signal} (ETERM)`)));
        return ProxyChannel.toService(getNextTickChannel(client.getChannel('watcher')));
    }
}
