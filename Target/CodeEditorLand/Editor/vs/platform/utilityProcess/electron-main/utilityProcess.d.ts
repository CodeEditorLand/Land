import { Disposable } from '../../../base/common/lifecycle.js';
import { Event } from '../../../base/common/event.js';
import { ILogService } from '../../log/common/log.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
import Severity from '../../../base/common/severity.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
export interface IUtilityProcessConfiguration {
    /**
     * A way to group utility processes of same type together.
     */
    readonly type: string;
    /**
     * The entry point to load in the utility process.
     */
    readonly entryPoint: string;
    /**
     * An optional serializable object to be sent into the utility process
     * as first message alongside the message port.
     */
    readonly payload?: unknown;
    /**
     * Environment key-value pairs. Default is `process.env`.
     */
    readonly env?: {
        [key: string]: string | undefined;
    };
    /**
     * List of string arguments that will be available as `process.argv`
     * in the child process.
     */
    readonly args?: string[];
    /**
     * List of string arguments passed to the executable.
     */
    readonly execArgv?: string[];
    /**
     * Allow the utility process to load unsigned libraries.
     */
    readonly allowLoadingUnsignedLibraries?: boolean;
    /**
     * Used in log messages to correlate the process
     * with other components.
     */
    readonly correlationId?: string;
    /**
     * Optional pid of the parent process. If set, the
     * utility process will be terminated when the parent
     * process exits.
     */
    readonly parentLifecycleBound?: number;
    /**
     * HTTP 401 and 407 requests created via electron:net module
     * will be redirected to the main process and can be handled
     * via the app#login event.
     */
    readonly respondToAuthRequestsFromMainProcess?: boolean;
}
export interface IWindowUtilityProcessConfiguration extends IUtilityProcessConfiguration {
    readonly responseWindowId: number;
    readonly responseChannel: string;
    readonly responseNonce: string;
    /**
     * If set to `true`, will terminate the utility process
     * when the associated browser window closes or reloads.
     */
    readonly windowLifecycleBound?: boolean;
}
interface IUtilityProcessExitBaseEvent {
    /**
     * The process id of the process that exited.
     */
    readonly pid: number;
    /**
     * The exit code of the process.
     */
    readonly code: number;
}
export interface IUtilityProcessExitEvent extends IUtilityProcessExitBaseEvent {
    /**
     * The signal that caused the process to exit is unknown
     * for utility processes.
     */
    readonly signal: 'unknown';
}
export interface IUtilityProcessCrashEvent extends IUtilityProcessExitBaseEvent {
    /**
     * The reason of the utility process crash.
     */
    readonly reason: 'clean-exit' | 'abnormal-exit' | 'killed' | 'crashed' | 'oom' | 'launch-failed' | 'integrity-failure';
}
export interface IUtilityProcessInfo {
    readonly pid: number;
    readonly name: string;
}
export declare class UtilityProcess extends Disposable {
    private readonly logService;
    private readonly telemetryService;
    protected readonly lifecycleMainService: ILifecycleMainService;
    private static ID_COUNTER;
    private static readonly all;
    static getAll(): IUtilityProcessInfo[];
    private readonly id;
    private readonly _onStdout;
    readonly onStdout: Event<string>;
    private readonly _onStderr;
    readonly onStderr: Event<string>;
    private readonly _onMessage;
    readonly onMessage: Event<unknown>;
    private readonly _onSpawn;
    readonly onSpawn: Event<number | undefined>;
    private readonly _onExit;
    readonly onExit: Event<IUtilityProcessExitEvent>;
    private readonly _onCrash;
    readonly onCrash: Event<IUtilityProcessCrashEvent>;
    private process;
    private processPid;
    private configuration;
    private killed;
    constructor(logService: ILogService, telemetryService: ITelemetryService, lifecycleMainService: ILifecycleMainService);
    protected log(msg: string, severity: Severity): void;
    private validateCanStart;
    start(configuration: IUtilityProcessConfiguration): boolean;
    protected doStart(configuration: IUtilityProcessConfiguration): boolean;
    private createEnv;
    private registerListeners;
    once(message: unknown, callback: () => void): void;
    postMessage(message: unknown, transfer?: Electron.MessagePortMain[]): boolean;
    connect(payload?: unknown): Electron.MessagePortMain;
    enableInspectPort(): boolean;
    kill(): void;
    private isNormalExit;
    private onDidExitOrCrashOrKill;
    waitForExit(maxWaitTimeMs: number): Promise<void>;
}
export declare class WindowUtilityProcess extends UtilityProcess {
    private readonly windowsMainService;
    constructor(logService: ILogService, windowsMainService: IWindowsMainService, telemetryService: ITelemetryService, lifecycleMainService: ILifecycleMainService);
    start(configuration: IWindowUtilityProcessConfiguration): boolean;
    private registerWindowListeners;
}
export {};
