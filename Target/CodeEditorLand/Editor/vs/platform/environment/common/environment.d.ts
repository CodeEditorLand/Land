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
export type ExtensionKind = 'ui' | 'workspace' | 'web';
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
export interface INativeEnvironmentService extends IEnvironmentService {
    args: NativeParsedArgs;
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
