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
    /**
     * The version of these metrics.
     */
    readonly version: 2;
    /**
     * If this started the main process and renderer or just a renderer (new or reloaded).
     */
    readonly initialStartup: boolean;
    /**
     * No folder, no file, no workspace has been opened
     */
    readonly emptyWorkbench: boolean;
    /**
     * This is the latest (stable/insider) version. Iff not we should ignore this
     * measurement.
     */
    readonly isLatestVersion: boolean;
    /**
     * Whether we asked for and V8 accepted cached data.
     */
    readonly didUseCachedData: boolean;
    /**
     * How/why the window was created. See https://github.com/microsoft/vscode/blob/d1f57d871722f4d6ba63e4ef6f06287121ceb045/src/vs/platform/lifecycle/common/lifecycle.ts#L50
     */
    readonly windowKind: number;
    /**
     * The total number of windows that have been restored/created
     */
    readonly windowCount: number;
    /**
     * The active viewlet id or `undedined`
     */
    readonly viewletId?: string;
    /**
     * The active panel id or `undefined`
     */
    readonly panelId?: string;
    /**
     * The editor input types or `[]`
     */
    readonly editorIds: string[];
    /**
     * The time it took to create the workbench.
     *
     * * Happens in the main-process *and* the renderer-process
     * * Measured with the *start* and `didStartWorkbench`-performance mark. The *start* is either the start of the
     * main process or the start of the renderer.
     * * This should be looked at carefully because times vary depending on
     *  * This being the first window, the only window, or a reloaded window
     *  * Cached data being present and used or not
     *  * The numbers and types of editors being restored
     *  * The numbers of windows being restored (when starting 'fresh')
     *  * The viewlet being restored (esp. when it's a contributed viewlet)
     */
    readonly ellapsed: number;
    /**
     * Individual timers...
     */
    readonly timers: {
        /**
         * The time it took to receieve the [`ready`](https://electronjs.org/docs/api/app#event-ready)-event. Measured from the first line
         * of JavaScript code till receiving that event.
         *
         * * Happens in the main-process
         * * Measured with the `main:started` and `main:appReady` performance marks.
         * * This can be compared between insider and stable builds.
         * * This should be looked at per OS version and per electron version.
         * * This is often affected by AV software (and can change with AV software updates outside of our release-cycle).
         * * It is not our code running here and we can only observe what's happening.
         */
        readonly ellapsedAppReady?: number;
        /**
         * The time it took to generate NLS data.
         *
         * * Happens in the main-process
         * * Measured with the `nlsGeneration:start` and `nlsGeneration:end` performance marks.
         * * This only happens when a non-english locale is being used.
         * * It is our code running here and we should monitor this carefully for regressions.
         */
        readonly ellapsedNlsGeneration?: number;
        /**
         * The time it took to load the main bundle.
         *
         * * Happens in the main-process
         * * Measured with the `willLoadMainBundle` and `didLoadMainBundle` performance marks.
         */
        readonly ellapsedLoadMainBundle?: number;
        /**
         * The time it took to start the crash reporter.
         *
         * * Happens in the main-process
         * * Measured with the `willStartCrashReporter` and `didStartCrashReporter` performance marks.
         */
        readonly ellapsedCrashReporter?: number;
        /**
         * The time it took to create the main instance server.
         *
         * * Happens in the main-process
         * * Measured with the `willStartMainServer` and `didStartMainServer` performance marks.
         */
        readonly ellapsedMainServer?: number;
        /**
         * The time it took to create the window.
         *
         * * Happens in the main-process
         * * Measured with the `willCreateCodeWindow` and `didCreateCodeWindow` performance marks.
         */
        readonly ellapsedWindowCreate?: number;
        /**
         * The time it took to create the electron browser window.
         *
         * * Happens in the main-process
         * * Measured with the `willCreateCodeBrowserWindow` and `didCreateCodeBrowserWindow` performance marks.
         */
        readonly ellapsedBrowserWindowCreate?: number;
        /**
         * The time it took to restore and validate window state.
         *
         * * Happens in the main-process
         * * Measured with the `willRestoreCodeWindowState` and `didRestoreCodeWindowState` performance marks.
         */
        readonly ellapsedWindowRestoreState?: number;
        /**
         * The time it took to maximize/show the window.
         *
         * * Happens in the main-process
         * * Measured with the `willMaximizeCodeWindow` and `didMaximizeCodeWindow` performance marks.
         */
        readonly ellapsedWindowMaximize?: number;
        /**
         * The time it took to tell electron to open/restore a renderer (browser window).
         *
         * * Happens in the main-process
         * * Measured with the `main:appReady` and `code/willOpenNewWindow` performance marks.
         * * This can be compared between insider and stable builds.
         * * It is our code running here and we should monitor this carefully for regressions.
         */
        readonly ellapsedWindowLoad?: number;
        /**
         * The time it took to create a new renderer (browser window) and to initialize that to the point
         * of load the main-bundle (`workbench.desktop.main.js`).
         *
         * * Happens in the main-process *and* the renderer-process
         * * Measured with the `code/willOpenNewWindow` and `willLoadWorkbenchMain` performance marks.
         * * This can be compared between insider and stable builds.
         * * It is mostly not our code running here and we can only observe what's happening.
         *
         */
        readonly ellapsedWindowLoadToRequire: number;
        /**
         * The time it took to wait for resolving the window configuration. This time the workbench
         * will not continue to load and be blocked entirely.
         *
         * * Happens in the renderer-process
         * * Measured with the `willWaitForWindowConfig` and `didWaitForWindowConfig` performance marks.
         */
        readonly ellapsedWaitForWindowConfig: number;
        /**
         * The time it took to init the storage database connection from the workbench.
         *
         * * Happens in the renderer-process
         * * Measured with the `code/willInitStorage` and `code/didInitStorage` performance marks.
         */
        readonly ellapsedStorageInit: number;
        /**
         * The time it took to initialize the workspace and configuration service.
         *
         * * Happens in the renderer-process
         * * Measured with the `willInitWorkspaceService` and `didInitWorkspaceService` performance marks.
         */
        readonly ellapsedWorkspaceServiceInit: number;
        /**
         * The time it took to connect to the shared process.
         *
         * * Happens in the renderer-process
         * * Measured with the `willConnectSharedProcess` and `didConnectSharedProcess` performance marks.
         */
        readonly ellapsedSharedProcesConnected: number;
        /**
         * The time it took to initialize required user data (settings & global state) using settings sync service.
         *
         * * Happens in the renderer-process (only in Web)
         * * Measured with the `willInitRequiredUserData` and `didInitRequiredUserData` performance marks.
         */
        readonly ellapsedRequiredUserDataInit: number;
        /**
         * The time it took to initialize other user data (keybindings, snippets & extensions) using settings sync service.
         *
         * * Happens in the renderer-process (only in Web)
         * * Measured with the `willInitOtherUserData` and `didInitOtherUserData` performance marks.
         */
        readonly ellapsedOtherUserDataInit: number;
        /**
         * The time it took to load the main-bundle of the workbench, e.g. `workbench.desktop.main.js`.
         *
         * * Happens in the renderer-process
         * * Measured with the `willLoadWorkbenchMain` and `didLoadWorkbenchMain` performance marks.
         * * This varies *a lot* when V8 cached data could be used or not
         * * This should be looked at with and without V8 cached data usage and per electron/v8 version
         * * This is affected by the size of our code bundle (which  grows about 3-5% per release)
         */
        readonly ellapsedRequire: number;
        /**
         * The time it took to read extensions' package.json-files *and* interpret them (invoking
         * the contribution points).
         *
         * * Happens in the renderer-process
         * * Measured with the `willLoadExtensions` and `didLoadExtensions` performance marks.
         * * Reading of package.json-files is avoided by caching them all in a single file (after the read,
         * until another extension is installed)
         * * Happens in parallel to other things, depends on async timing
         */
        readonly ellapsedExtensions: number;
        readonly ellapsedExtensionsReady: number;
        /**
         * The time it took to restore the viewlet.
         *
         * * Happens in the renderer-process
         * * Measured with the `willRestoreViewlet` and `didRestoreViewlet` performance marks.
         * * This should be looked at per viewlet-type/id.
         * * Happens in parallel to other things, depends on async timing
         */
        readonly ellapsedViewletRestore: number;
        /**
         * The time it took to restore the panel.
         *
         * * Happens in the renderer-process
         * * Measured with the `willRestorePanel` and `didRestorePanel` performance marks.
         * * This should be looked at per panel-type/id.
         * * Happens in parallel to other things, depends on async timing
         */
        readonly ellapsedPanelRestore: number;
        /**
         * The time it took to restore and fully resolve visible editors - that is text editor
         * and complex editor likes the settings UI or webviews (markdown preview).
         *
         * * Happens in the renderer-process
         * * Measured with the `willRestoreEditors` and `didRestoreEditors` performance marks.
         * * This should be looked at per editor and per editor type.
         * * Happens in parallel to other things, depends on async timing
         */
        readonly ellapsedEditorRestore: number;
        /**
         * The time it took to create all workbench contributions on the starting and ready
         * lifecycle phase, thus blocking `ellapsedWorkbench`.
         *
         * * Happens in the renderer-process
         * * Measured with the `willCreateWorkbenchContributions/1` and `didCreateWorkbenchContributions/2` performance marks.
         *
         */
        readonly ellapsedWorkbenchContributions: number;
        /**
         * The time it took to create the workbench.
         *
         * * Happens in the renderer-process
         * * Measured with the `willStartWorkbench` and `didStartWorkbench` performance marks.
         */
        readonly ellapsedWorkbench: number;
        /**
         * This time it took inside the renderer to start the workbench.
         *
         * * Happens in the renderer-process
         * * Measured with the `renderer/started` and `didStartWorkbench` performance marks
         */
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
    /**
     * A promise that resolved when startup timings and perf marks
     * are available. This depends on lifecycle phases and extension
     * hosts being started.
     */
    whenReady(): Promise<boolean>;
    /**
     * A baseline performance indicator for this machine. The value will only available
     * late after startup because computing it takes away CPU resources
     *
     * NOTE that this returns -1 if the machine is hopelessly slow...
     */
    perfBaseline: Promise<number>;
    /**
     * Startup metrics. Can ONLY be accessed after `whenReady` has resolved.
     */
    readonly startupMetrics: IStartupMetrics;
    /**
     * Deliver performance marks from a source, like the main process or extension hosts.
     * The source argument acts as an identifier and therefore it must be unique.
     */
    setPerformanceMarks(source: string, marks: perf.PerformanceMark[]): void;
    /**
     * Get all currently known performance marks by source. There is no sorting of the
     * returned tuples but the marks of a tuple are guaranteed to be sorted by start times.
     */
    getPerformanceMarks(): [source: string, marks: readonly perf.PerformanceMark[]][];
    /**
     * Return the duration between two marks.
     * @param from from mark name
     * @param to to mark name
     */
    getDuration(from: string, to: string): number;
    /**
     * Return the timestamp of a mark.
     * @param mark mark name
     */
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
