import { Emitter } from '../../../base/common/event.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
import { IFileDeleteOptions, IFileChange } from '../common/files.js';
import { DiskFileSystemProvider } from '../node/diskFileSystemProvider.js';
import { ILogService } from '../../log/common/log.js';
import { AbstractDiskFileSystemProviderChannel, ISessionFileWatcher } from '../node/diskFileSystemProviderServer.js';
import { IURITransformer } from '../../../base/common/uriIpc.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
export declare class DiskFileSystemProviderChannel extends AbstractDiskFileSystemProviderChannel<unknown> {
    private readonly environmentService;
    constructor(provider: DiskFileSystemProvider, logService: ILogService, environmentService: IEnvironmentService);
    protected getUriTransformer(ctx: unknown): IURITransformer;
    protected transformIncoming(uriTransformer: IURITransformer, _resource: UriComponents): URI;
    protected delete(uriTransformer: IURITransformer, _resource: UriComponents, opts: IFileDeleteOptions): Promise<void>;
    protected createSessionFileWatcher(uriTransformer: IURITransformer, emitter: Emitter<IFileChange[] | string>): ISessionFileWatcher;
}
