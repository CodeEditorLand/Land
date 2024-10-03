import { PerformanceMark } from '../../../../base/common/performance.js';
import { IBrowserWorkbenchEnvironmentService } from '../browser/environmentService.js';
import { IColorScheme, INativeWindowConfiguration, IOSConfiguration, IPath, IPathsToWaitFor } from '../../../../platform/window/common/window.js';
import { INativeEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { AbstractNativeEnvironmentService } from '../../../../platform/environment/common/environmentService.js';
import { URI } from '../../../../base/common/uri.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
export declare const INativeWorkbenchEnvironmentService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<INativeWorkbenchEnvironmentService>;
export interface INativeWorkbenchEnvironmentService extends IBrowserWorkbenchEnvironmentService, INativeEnvironmentService {
    readonly window: {
        id: number;
        colorScheme: IColorScheme;
        maximized?: boolean;
        accessibilitySupport?: boolean;
        isInitialStartup?: boolean;
        isCodeCaching?: boolean;
        perfMarks: PerformanceMark[];
    };
    readonly mainPid: number;
    readonly os: IOSConfiguration;
    readonly machineId: string;
    readonly sqmId: string;
    readonly devDeviceId: string;
    readonly execPath: string;
    readonly backupPath?: string;
    readonly crashReporterDirectory?: string;
    readonly crashReporterId?: string;
    readonly filesToWait?: IPathsToWaitFor;
}
export declare class NativeWorkbenchEnvironmentService extends AbstractNativeEnvironmentService implements INativeWorkbenchEnvironmentService {
    private readonly configuration;
    get mainPid(): number;
    get machineId(): string;
    get sqmId(): string;
    get devDeviceId(): string;
    get remoteAuthority(): string | undefined;
    get expectsResolverExtension(): boolean;
    get execPath(): string;
    get backupPath(): string | undefined;
    get window(): {
        id: number;
        colorScheme: IColorScheme;
        maximized: boolean | undefined;
        accessibilitySupport: boolean | undefined;
        perfMarks: PerformanceMark[];
        isInitialStartup: boolean | undefined;
        isCodeCaching: boolean;
    };
    get windowLogsPath(): URI;
    get logFile(): URI;
    get extHostLogsPath(): URI;
    get extHostTelemetryLogFile(): URI;
    get webviewExternalEndpoint(): string;
    get skipReleaseNotes(): boolean;
    get skipWelcome(): boolean;
    get logExtensionHostCommunication(): boolean;
    get enableSmokeTestDriver(): boolean;
    get extensionEnabledProposedApi(): string[] | undefined;
    get os(): IOSConfiguration;
    get filesToOpenOrCreate(): IPath[] | undefined;
    get filesToDiff(): IPath[] | undefined;
    get filesToMerge(): IPath[] | undefined;
    get filesToWait(): IPathsToWaitFor | undefined;
    constructor(configuration: INativeWindowConfiguration, productService: IProductService);
}
