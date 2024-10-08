import { Emitter, Event } from '../../../base/common/event.js';
import { IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { DiskFileSystemProvider } from './diskFileSystemProvider.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { ILogService } from '../../log/common/log.js';
import { IURITransformer } from '../../../base/common/uriIpc.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
import { IFileDeleteOptions, IFileChange, IWatchOptions } from '../common/files.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IRecursiveWatcherOptions } from '../common/watcher.js';
export interface ISessionFileWatcher extends IDisposable {
    watch(req: number, resource: URI, opts: IWatchOptions): IDisposable;
}
/**
 * A server implementation for a IPC based file system provider client.
 */
export declare abstract class AbstractDiskFileSystemProviderChannel<T> extends Disposable implements IServerChannel<T> {
    protected readonly provider: DiskFileSystemProvider;
    protected readonly logService: ILogService;
    constructor(provider: DiskFileSystemProvider, logService: ILogService);
    call(ctx: T, command: string, arg?: any): Promise<any>;
    listen(ctx: T, event: string, arg: any): Event<any>;
    protected abstract getUriTransformer(ctx: T): IURITransformer;
    protected abstract transformIncoming(uriTransformer: IURITransformer, _resource: UriComponents, supportVSCodeResource?: boolean): URI;
    private stat;
    private readdir;
    private readFile;
    private onReadFileStream;
    private writeFile;
    private open;
    private close;
    private read;
    private write;
    private mkdir;
    protected delete(uriTransformer: IURITransformer, _resource: UriComponents, opts: IFileDeleteOptions): Promise<void>;
    private rename;
    private copy;
    private cloneFile;
    private readonly sessionToWatcher;
    private readonly watchRequests;
    private onFileChange;
    private watch;
    private unwatch;
    protected abstract createSessionFileWatcher(uriTransformer: IURITransformer, emitter: Emitter<IFileChange[] | string>): ISessionFileWatcher;
    dispose(): void;
}
export declare abstract class AbstractSessionFileWatcher extends Disposable implements ISessionFileWatcher {
    private readonly uriTransformer;
    private readonly logService;
    private readonly environmentService;
    private readonly watcherRequests;
    private readonly fileWatcher;
    constructor(uriTransformer: IURITransformer, sessionEmitter: Emitter<IFileChange[] | string>, logService: ILogService, environmentService: IEnvironmentService);
    private registerListeners;
    protected getRecursiveWatcherOptions(environmentService: IEnvironmentService): IRecursiveWatcherOptions | undefined;
    protected getExtraExcludes(environmentService: IEnvironmentService): string[] | undefined;
    watch(req: number, resource: URI, opts: IWatchOptions): IDisposable;
    dispose(): void;
}
