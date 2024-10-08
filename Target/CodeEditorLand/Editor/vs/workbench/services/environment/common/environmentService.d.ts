import { IPath } from '../../../../platform/window/common/window.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { URI } from '../../../../base/common/uri.js';
export declare const IWorkbenchEnvironmentService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkbenchEnvironmentService>;
/**
 * A workbench specific environment service that is only present in workbench
 * layer.
 */
export interface IWorkbenchEnvironmentService extends IEnvironmentService {
    readonly logFile: URI;
    readonly windowLogsPath: URI;
    readonly extHostLogsPath: URI;
    readonly extHostTelemetryLogFile: URI;
    readonly extensionEnabledProposedApi?: string[];
    readonly remoteAuthority?: string;
    readonly skipReleaseNotes: boolean;
    readonly skipWelcome: boolean;
    readonly disableWorkspaceTrust: boolean;
    readonly webviewExternalEndpoint: string;
    readonly debugRenderer: boolean;
    readonly logExtensionHostCommunication?: boolean;
    readonly enableSmokeTestDriver?: boolean;
    readonly profDurationMarkers?: string[];
    readonly filesToOpenOrCreate?: IPath[] | undefined;
    readonly filesToDiff?: IPath[] | undefined;
    readonly filesToMerge?: IPath[] | undefined;
}
