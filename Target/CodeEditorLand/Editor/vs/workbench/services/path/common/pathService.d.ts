import { IPath } from '../../../../base/common/path.js';
import { OperatingSystem } from '../../../../base/common/platform.js';
import { URI } from '../../../../base/common/uri.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
export declare const IPathService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IPathService>;
export interface IPathService {
    readonly _serviceBrand: undefined;
    readonly path: Promise<IPath>;
    readonly defaultUriScheme: string;
    fileURI(path: string): Promise<URI>;
    userHome(options: {
        preferLocal: true;
    }): URI;
    userHome(options?: {
        preferLocal: boolean;
    }): Promise<URI>;
    hasValidBasename(resource: URI, basename?: string): Promise<boolean>;
    hasValidBasename(resource: URI, os: OperatingSystem, basename?: string): boolean;
    readonly resolvedUserHome: URI | undefined;
}
export declare abstract class AbstractPathService implements IPathService {
    private localUserHome;
    private readonly remoteAgentService;
    private readonly environmentService;
    private contextService;
    readonly _serviceBrand: undefined;
    private resolveOS;
    private resolveUserHome;
    private maybeUnresolvedUserHome;
    constructor(localUserHome: URI, remoteAgentService: IRemoteAgentService, environmentService: IWorkbenchEnvironmentService, contextService: IWorkspaceContextService);
    hasValidBasename(resource: URI, basename?: string): Promise<boolean>;
    hasValidBasename(resource: URI, os: OperatingSystem, basename?: string): boolean;
    private doHasValidBasename;
    get defaultUriScheme(): string;
    static findDefaultUriScheme(environmentService: IWorkbenchEnvironmentService, contextService: IWorkspaceContextService): string;
    userHome(options?: {
        preferLocal: boolean;
    }): Promise<URI>;
    userHome(options: {
        preferLocal: true;
    }): URI;
    get resolvedUserHome(): URI | undefined;
    get path(): Promise<IPath>;
    fileURI(_path: string): Promise<URI>;
}
