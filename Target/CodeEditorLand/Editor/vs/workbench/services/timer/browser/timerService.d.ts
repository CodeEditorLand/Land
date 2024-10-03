import * as perf from '../../../../base/common/performance.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { IUpdateService } from '../../../../platform/update/common/update.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkbenchLayoutService } from '../../layout/browser/layoutService.js';
import { IPaneCompositePartService } from '../../panecomposite/browser/panecomposite.js';
export interface IMemoryInfo {
    readonly workingSetSize: number;
    readonly privateBytes: number;
    readonly sharedBytes: number;
}
export interface IStartupMetrics {
    readonly version: 2;
    readonly initialStartup: boolean;
    readonly emptyWorkbench: boolean;
    readonly isLatestVersion: boolean;
    readonly didUseCachedData: boolean;
    readonly windowKind: number;
    readonly windowCount: number;
    readonly viewletId?: string;
    readonly panelId?: string;
    readonly editorIds: string[];
    readonly ellapsed: number;
    readonly timers: {
        readonly ellapsedAppReady?: number;
        readonly ellapsedNlsGeneration?: number;
        readonly ellapsedLoadMainBundle?: number;
        readonly ellapsedCrashReporter?: number;
        readonly ellapsedMainServer?: number;
        readonly ellapsedWindowCreate?: number;
        readonly ellapsedBrowserWindowCreate?: number;
        readonly ellapsedWindowRestoreState?: number;
        readonly ellapsedWindowMaximize?: number;
        readonly ellapsedWindowLoad?: number;
        readonly ellapsedWindowLoadToRequire: number;
        readonly ellapsedWaitForWindowConfig: number;
        readonly ellapsedStorageInit: number;
        readonly ellapsedWorkspaceServiceInit: number;
        readonly ellapsedSharedProcesConnected: number;
        readonly ellapsedRequiredUserDataInit: number;
        readonly ellapsedOtherUserDataInit: number;
        readonly ellapsedRequire: number;
        readonly ellapsedExtensions: number;
        readonly ellapsedExtensionsReady: number;
        readonly ellapsedViewletRestore: number;
        readonly ellapsedPanelRestore: number;
        readonly ellapsedEditorRestore: number;
        readonly ellapsedWorkbenchContributions: number;
        readonly ellapsedWorkbench: number;
        readonly ellapsedRenderer: number;
    };
    readonly hasAccessibilitySupport: boolean;
    readonly isVMLikelyhood?: number;
    readonly platform?: string;
    readonly release?: string;
    readonly arch?: string;
    readonly totalmem?: number;
    readonly freemem?: number;
    readonly meminfo?: IMemoryInfo;
    readonly cpus?: {
        count: number;
        speed: number;
        model: string;
    };
    readonly loadavg?: number[];
    readonly isARM64Emulated?: boolean;
}
export interface ITimerService {
    readonly _serviceBrand: undefined;
    whenReady(): Promise<boolean>;
    perfBaseline: Promise<number>;
    readonly startupMetrics: IStartupMetrics;
    setPerformanceMarks(source: string, marks: perf.PerformanceMark[]): void;
    getPerformanceMarks(): [source: string, marks: readonly perf.PerformanceMark[]][];
    getDuration(from: string, to: string): number;
    getStartTime(mark: string): number;
}
export declare const ITimerService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<ITimerService>;
export type Writeable<T> = {
    -readonly [P in keyof T]: Writeable<T[P]>;
};
export declare abstract class AbstractTimerService implements ITimerService {
    private readonly _lifecycleService;
    private readonly _contextService;
    private readonly _extensionService;
    private readonly _updateService;
    private readonly _paneCompositeService;
    private readonly _editorService;
    private readonly _accessibilityService;
    private readonly _telemetryService;
    readonly _serviceBrand: undefined;
    private readonly _barrier;
    private readonly _marks;
    private readonly _rndValueShouldSendTelemetry;
    private _startupMetrics?;
    readonly perfBaseline: Promise<number>;
    constructor(_lifecycleService: ILifecycleService, _contextService: IWorkspaceContextService, _extensionService: IExtensionService, _updateService: IUpdateService, _paneCompositeService: IPaneCompositePartService, _editorService: IEditorService, _accessibilityService: IAccessibilityService, _telemetryService: ITelemetryService, layoutService: IWorkbenchLayoutService);
    whenReady(): Promise<boolean>;
    get startupMetrics(): IStartupMetrics;
    setPerformanceMarks(source: string, marks: perf.PerformanceMark[]): void;
    getPerformanceMarks(): [source: string, marks: readonly perf.PerformanceMark[]][];
    getDuration(from: string, to: string): number;
    getStartTime(mark: string): number;
    private _reportStartupTimes;
    protected _shouldReportPerfMarks(): boolean;
    private _reportPerformanceMarks;
    private _computeStartupMetrics;
    protected abstract _isInitialStartup(): boolean;
    protected abstract _didUseCachedData(): boolean;
    protected abstract _getWindowCount(): Promise<number>;
    protected abstract _extendStartupInfo(info: Writeable<IStartupMetrics>): Promise<void>;
}
export declare class TimerService extends AbstractTimerService {
    protected _isInitialStartup(): boolean;
    protected _didUseCachedData(): boolean;
    protected _getWindowCount(): Promise<number>;
    protected _extendStartupInfo(info: Writeable<IStartupMetrics>): Promise<void>;
}
