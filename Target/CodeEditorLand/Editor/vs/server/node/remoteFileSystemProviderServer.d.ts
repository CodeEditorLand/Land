import { Emitter } from '../../base/common/event.js';
import { URI, UriComponents } from '../../base/common/uri.js';
import { IURITransformer } from '../../base/common/uriIpc.js';
import { IFileChange } from '../../platform/files/common/files.js';
import { ILogService } from '../../platform/log/common/log.js';
import { RemoteAgentConnectionContext } from '../../platform/remote/common/remoteAgentEnvironment.js';
import { IServerEnvironmentService } from './serverEnvironmentService.js';
import { AbstractDiskFileSystemProviderChannel, ISessionFileWatcher } from '../../platform/files/node/diskFileSystemProviderServer.js';
import { IConfigurationService } from '../../platform/configuration/common/configuration.js';
export declare class RemoteAgentFileSystemProviderChannel extends AbstractDiskFileSystemProviderChannel<RemoteAgentConnectionContext> {
    private readonly environmentService;
    private readonly configurationService;
    private readonly uriTransformerCache;
    constructor(logService: ILogService, environmentService: IServerEnvironmentService, configurationService: IConfigurationService);
    protected getUriTransformer(ctx: RemoteAgentConnectionContext): IURITransformer;
    protected transformIncoming(uriTransformer: IURITransformer, _resource: UriComponents, supportVSCodeResource?: boolean): URI;
    protected createSessionFileWatcher(uriTransformer: IURITransformer, emitter: Emitter<IFileChange[] | string>): ISessionFileWatcher;
}
