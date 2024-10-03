import { Disposable } from '../../../base/common/lifecycle.js';
import { Event } from '../../../base/common/event.js';
import { ILogService } from '../../log/common/log.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
import Severity from '../../../base/common/severity.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
export interface IUtilityProcessConfiguration {
    readonly type: string;
    readonly entryPoint: string;
    readonly payload?: unknown;
    readonly env?: {
        [key: string]: string | undefined;
    };
    readonly args?: string[];
    readonly execArgv?: string[];
    readonly allowLoadingUnsignedLibraries?: boolean;
    readonly correlationId?: string;
    readonly parentLifecycleBound?: number;
    readonly respondToAuthRequestsFromMainProcess?: boolean;
}
export interface IWindowUtilityProcessConfiguration extends IUtilityProcessConfiguration {
    readonly responseWindowId: number;
    readonly responseChannel: string;
    readonly responseNonce: string;
    readonly windowLifecycleBound?: boolean;
}
interface IUtilityProcessExitBaseEvent {
    readonly pid: number;
    readonly code: number;
}
export interface IUtilityProcessExitEvent extends IUtilityProcessExitBaseEvent {
    readonly signal: 'unknown';
}
export interface IUtilityProcessCrashEvent extends IUtilityProcessExitBaseEvent {
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
