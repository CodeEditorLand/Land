import { IPath } from '../../../../base/common/path.js';
import { OperatingSystem } from '../../../../base/common/platform.js';
import { URI } from '../../../../base/common/uri.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
export declare const IPathService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IPathService>;
/**
 * Provides access to path related properties that will match the
 * environment. If the environment is connected to a remote, the
 * path properties will match that of the remotes operating system.
 */
export interface IPathService {
    readonly _serviceBrand: undefined;
    /**
     * The correct path library to use for the target environment. If
     * the environment is connected to a remote, this will be the
     * path library of the remote file system. Otherwise it will be
     * the local file system's path library depending on the OS.
     */
    readonly path: Promise<IPath>;
    /**
     * Determines the best default URI scheme for the current workspace.
     * It uses information about whether we're running remote, in browser,
     * or native combined with information about the current workspace to
     * find the best default scheme.
     */
    readonly defaultUriScheme: string;
    /**
     * Converts the given path to a file URI to use for the target
     * environment. If the environment is connected to a remote, it
     * will use the path separators according to the remote file
     * system. Otherwise it will use the local file system's path
     * separators.
     */
    fileURI(path: string): Promise<URI>;
    /**
     * Resolves the user-home directory for the target environment.
     * If the envrionment is connected to a remote, this will be the
     * remote's user home directory, otherwise the local one unless
     * `preferLocal` is set to `true`.
     */
    userHome(options: {
        preferLocal: true;
    }): URI;
    userHome(options?: {
        preferLocal: boolean;
    }): Promise<URI>;
    /**
     * Figures out if the provided resource has a valid file name
     * for the operating system the file is saved to.
     *
     * Note: this currently only supports `file` and `vscode-file`
     * protocols where we know the limits of the file systems behind
     * these OS. Other remotes are not supported and this method
     * will always return `true` for them.
     */
    hasValidBasename(resource: URI, basename?: string): Promise<boolean>;
    hasValidBasename(resource: URI, os: OperatingSystem, basename?: string): boolean;
    /**
     * @deprecated use `userHome` instead.
     */
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
