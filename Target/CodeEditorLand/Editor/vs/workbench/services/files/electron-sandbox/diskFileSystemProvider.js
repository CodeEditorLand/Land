import { localize } from '../../../../nls.js';
import { isLinux } from '../../../../base/common/platform.js';
import { AbstractDiskFileSystemProvider } from '../../../../platform/files/common/diskFileSystemProvider.js';
import { DiskFileSystemProviderClient, LOCAL_FILE_SYSTEM_CHANNEL_NAME } from '../../../../platform/files/common/diskFileSystemProviderClient.js';
import { UniversalWatcherClient } from './watcherClient.js';
import { LogService } from '../../../../platform/log/common/logService.js';
export class DiskFileSystemProvider extends AbstractDiskFileSystemProvider {
    constructor(mainProcessService, utilityProcessWorkerWorkbenchService, logService, loggerService) {
        super(logService, { watcher: { forceUniversal: true } });
        this.mainProcessService = mainProcessService;
        this.utilityProcessWorkerWorkbenchService = utilityProcessWorkerWorkbenchService;
        this.loggerService = loggerService;
        this.provider = this._register(new DiskFileSystemProviderClient(this.mainProcessService.getChannel(LOCAL_FILE_SYSTEM_CHANNEL_NAME), { pathCaseSensitive: isLinux, trash: true }));
        this._watcherLogService = undefined;
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.provider.onDidChangeFile(changes => this._onDidChangeFile.fire(changes)));
        this._register(this.provider.onDidWatchError(error => this._onDidWatchError.fire(error)));
    }
    get onDidChangeCapabilities() { return this.provider.onDidChangeCapabilities; }
    get capabilities() { return this.provider.capabilities; }
    stat(resource) {
        return this.provider.stat(resource);
    }
    readdir(resource) {
        return this.provider.readdir(resource);
    }
    readFile(resource, opts) {
        return this.provider.readFile(resource, opts);
    }
    readFileStream(resource, opts, token) {
        return this.provider.readFileStream(resource, opts, token);
    }
    writeFile(resource, content, opts) {
        return this.provider.writeFile(resource, content, opts);
    }
    open(resource, opts) {
        return this.provider.open(resource, opts);
    }
    close(fd) {
        return this.provider.close(fd);
    }
    read(fd, pos, data, offset, length) {
        return this.provider.read(fd, pos, data, offset, length);
    }
    write(fd, pos, data, offset, length) {
        return this.provider.write(fd, pos, data, offset, length);
    }
    mkdir(resource) {
        return this.provider.mkdir(resource);
    }
    delete(resource, opts) {
        return this.provider.delete(resource, opts);
    }
    rename(from, to, opts) {
        return this.provider.rename(from, to, opts);
    }
    copy(from, to, opts) {
        return this.provider.copy(from, to, opts);
    }
    cloneFile(from, to) {
        return this.provider.cloneFile(from, to);
    }
    createUniversalWatcher(onChange, onLogMessage, verboseLogging) {
        return new UniversalWatcherClient(changes => onChange(changes), msg => onLogMessage(msg), verboseLogging, this.utilityProcessWorkerWorkbenchService);
    }
    createNonRecursiveWatcher() {
        throw new Error('Method not implemented in sandbox.');
    }
    get watcherLogService() {
        if (!this._watcherLogService) {
            this._watcherLogService = new LogService(this.loggerService.createLogger('fileWatcher', { name: localize('fileWatcher', "File Watcher") }));
        }
        return this._watcherLogService;
    }
    logWatcherMessage(msg) {
        this.watcherLogService[msg.type](msg.message);
        if (msg.type !== 'trace' && msg.type !== 'debug') {
            super.logWatcherMessage(msg);
        }
    }
}
