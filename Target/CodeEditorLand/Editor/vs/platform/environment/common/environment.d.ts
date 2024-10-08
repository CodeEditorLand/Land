import { URI } from '../../../base/common/uri.js';
import { NativeParsedArgs } from './argv.js';
export declare const IEnvironmentService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IEnvironmentService>;
export declare const INativeEnvironmentService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<INativeEnvironmentService>;
export interface IDebugParams {
    port: number | null;
    break: boolean;
}
export interface IExtensionHostDebugParams extends IDebugParams {
    debugId?: string;
    env?: Record<string, string>;
}
/**
 * Type of extension.
 *
 * **NOTE**: This is defined in `platform/environment` because it can appear as a CLI argument.
 */
export type ExtensionKind = 'ui' | 'workspace' | 'web';
/**
 * A basic environment service that can be used in various processes,
 * such as main, renderer and shared process. Use subclasses of this
 * service for specific environment.
 */
export interface IEnvironmentService {
    readonly _serviceBrand: undefined;
    stateResource: URI;
    userRoamingDataHome: URI;
    keyboardLayoutResource: URI;
    argvResource: URI;
    untitledWorkspacesHome: URI;
    workspaceStorageHome: URI;
    localHistoryHome: URI;
    cacheHome: URI;
    userDataSyncHome: URI;
    sync: 'on' | 'off' | undefined;
    continueOn?: string;
    editSessionId?: string;
    debugExtensionHost: IExtensionHostDebugParams;
    isExtensionDevelopment: boolean;
    disableExtensions: boolean | string[];
    enableExtensions?: readonly string[];
    extensionDevelopmentLocationURI?: URI[];
    extensionDevelopmentKind?: ExtensionKind[];
    extensionTestsLocationURI?: URI;
    logsHome: URI;
    logLevel?: string;
    extensionLogLevel?: [string, string][];
    verbose: boolean;
    isBuilt: boolean;
    disableTelemetry: boolean;
    serviceMachineIdResource: URI;
    policyFile?: URI;
}
/**
 * A subclass of the `IEnvironmentService` to be used only in native
 * environments (Windows, Linux, macOS) but not e.g. web.
 */
export interface INativeEnvironmentService extends IEnvironmentService {
    args: NativeParsedArgs;
    /**
     * Root path of the JavaScript sources.
     *
     * Note: This is NOT the installation root
     * directory itself but contained in it at
     * a level that is platform dependent.
     */
    appRoot: string;
    userHome: URI;
    appSettingsHome: URI;
    tmpDir: URI;
    userDataPath: string;
    machineSettingsResource: URI;
    extensionsPath: string;
    extensionsDownloadLocation: URI;
    builtinExtensionsPath: string;
    useInMemorySecretStorage?: boolean;
    crossOriginIsolated?: boolean;
}
