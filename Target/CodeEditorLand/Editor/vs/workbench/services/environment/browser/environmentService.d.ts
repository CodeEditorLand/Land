import { URI } from '../../../../base/common/uri.js';
import { ExtensionKind, IExtensionHostDebugParams } from '../../../../platform/environment/common/environment.js';
import { IPath } from '../../../../platform/window/common/window.js';
import { IWorkbenchEnvironmentService } from '../common/environmentService.js';
import { IWorkbenchConstructionOptions } from '../../../browser/web.api.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ITextEditorOptions } from '../../../../platform/editor/common/editor.js';
export declare const IBrowserWorkbenchEnvironmentService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IBrowserWorkbenchEnvironmentService>;
/**
 * A subclass of the `IWorkbenchEnvironmentService` to be used only environments
 * where the web API is available (browsers, Electron).
 */
export interface IBrowserWorkbenchEnvironmentService extends IWorkbenchEnvironmentService {
    /**
     * Options used to configure the workbench.
     */
    readonly options?: IWorkbenchConstructionOptions;
    /**
     * Gets whether a resolver extension is expected for the environment.
     */
    readonly expectsResolverExtension: boolean;
}
export declare class BrowserWorkbenchEnvironmentService implements IBrowserWorkbenchEnvironmentService {
    private readonly workspaceId;
    readonly logsHome: URI;
    readonly options: IWorkbenchConstructionOptions;
    private readonly productService;
    readonly _serviceBrand: undefined;
    get remoteAuthority(): string | undefined;
    get expectsResolverExtension(): boolean;
    get isBuilt(): boolean;
    get logLevel(): string | undefined;
    get extensionLogLevel(): [string, string][] | undefined;
    get profDurationMarkers(): string[] | undefined;
    get windowLogsPath(): URI;
    get logFile(): URI;
    get userRoamingDataHome(): URI;
    get argvResource(): URI;
    get cacheHome(): URI;
    get workspaceStorageHome(): URI;
    get localHistoryHome(): URI;
    get stateResource(): URI;
    /**
     * In Web every workspace can potentially have scoped user-data
     * and/or extensions and if Sync state is shared then it can make
     * Sync error prone - say removing extensions from another workspace.
     * Hence scope Sync state per workspace. Sync scoped to a workspace
     * is capable of handling opening same workspace in multiple windows.
     */
    get userDataSyncHome(): URI;
    get sync(): 'on' | 'off' | undefined;
    get keyboardLayoutResource(): URI;
    get untitledWorkspacesHome(): URI;
    get serviceMachineIdResource(): URI;
    get extHostLogsPath(): URI;
    get extHostTelemetryLogFile(): URI;
    private extensionHostDebugEnvironment;
    get debugExtensionHost(): IExtensionHostDebugParams;
    get isExtensionDevelopment(): boolean;
    get extensionDevelopmentLocationURI(): URI[] | undefined;
    get extensionDevelopmentLocationKind(): ExtensionKind[] | undefined;
    get extensionTestsLocationURI(): URI | undefined;
    get extensionEnabledProposedApi(): string[] | undefined;
    get debugRenderer(): boolean;
    get enableSmokeTestDriver(): boolean | undefined;
    get disableExtensions(): boolean;
    get enableExtensions(): readonly string[] | undefined;
    get webviewExternalEndpoint(): string;
    get extensionTelemetryLogResource(): URI;
    get disableTelemetry(): boolean;
    get verbose(): boolean;
    get logExtensionHostCommunication(): boolean;
    get skipReleaseNotes(): boolean;
    get skipWelcome(): boolean;
    get disableWorkspaceTrust(): boolean;
    get profile(): string | undefined;
    editSessionId: string | undefined;
    private payload;
    constructor(workspaceId: string, logsHome: URI, options: IWorkbenchConstructionOptions, productService: IProductService);
    private resolveExtensionHostDebugEnvironment;
    get filesToOpenOrCreate(): IPath<ITextEditorOptions>[] | undefined;
    get filesToDiff(): IPath[] | undefined;
    get filesToMerge(): IPath[] | undefined;
}
