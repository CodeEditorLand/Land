import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IProcessEnvironment, OperatingSystem } from '../../../base/common/platform.js';
import { URI } from '../../../base/common/uri.js';
import { ILogService } from '../../log/common/log.js';
import { IProcessDataEvent, IProcessReadyEvent, IPtyService, IReconnectConstants, IShellLaunchConfig, ITerminalLaunchError, ITerminalsLayoutInfo, IProcessProperty, TitleEventSource, ProcessPropertyType, IProcessPropertyMap, ISerializedTerminalState, ITerminalProcessOptions, IPtyHostLatencyMeasurement } from '../common/terminal.js';
import { IGetTerminalLayoutInfoArgs, IProcessDetails, ISetTerminalLayoutInfoArgs } from '../common/terminalProcess.js';
import { IPtyHostProcessReplayEvent } from '../common/capabilities/capabilities.js';
import { IProductService } from '../../product/common/productService.js';
import * as performance from '../../../base/common/performance.js';
export declare function traceRpc(_target: any, key: string, descriptor: any): void;
export declare class PtyService extends Disposable implements IPtyService {
    private readonly _logService;
    private readonly _productService;
    private readonly _reconnectConstants;
    private readonly _simulatedLatency;
    readonly _serviceBrand: undefined;
    private readonly _ptys;
    private readonly _workspaceLayoutInfos;
    private readonly _detachInstanceRequestStore;
    private readonly _revivedPtyIdMap;
    private readonly _autoRepliesContribution;
    installAutoReply(match: string, reply: string): Promise<void>;
    uninstallAllAutoReplies(): Promise<void>;
    private readonly _contributions;
    private _lastPtyId;
    private readonly _onHeartbeat;
    readonly onHeartbeat: Event<void>;
    private readonly _onProcessData;
    readonly onProcessData: Event<{
        id: number;
        event: IProcessDataEvent | string;
    }>;
    private readonly _onProcessReplay;
    readonly onProcessReplay: Event<{
        id: number;
        event: IPtyHostProcessReplayEvent;
    }>;
    private readonly _onProcessReady;
    readonly onProcessReady: Event<{
        id: number;
        event: IProcessReadyEvent;
    }>;
    private readonly _onProcessExit;
    readonly onProcessExit: Event<{
        id: number;
        event: number | undefined;
    }>;
    private readonly _onProcessOrphanQuestion;
    readonly onProcessOrphanQuestion: Event<{
        id: number;
    }>;
    private readonly _onDidRequestDetach;
    readonly onDidRequestDetach: Event<{
        requestId: number;
        workspaceId: string;
        instanceId: number;
    }>;
    private readonly _onDidChangeProperty;
    readonly onDidChangeProperty: Event<{
        id: number;
        property: IProcessProperty<any>;
    }>;
    private _traceEvent;
    get traceRpcArgs(): {
        logService: ILogService;
        simulatedLatency: number;
    };
    constructor(_logService: ILogService, _productService: IProductService, _reconnectConstants: IReconnectConstants, _simulatedLatency: number);
    refreshIgnoreProcessNames(names: string[]): Promise<void>;
    requestDetachInstance(workspaceId: string, instanceId: number): Promise<IProcessDetails | undefined>;
    acceptDetachInstanceReply(requestId: number, persistentProcessId: number): Promise<void>;
    freePortKillProcess(port: string): Promise<{
        port: string;
        processId: string;
    }>;
    serializeTerminalState(ids: number[]): Promise<string>;
    reviveTerminalProcesses(workspaceId: string, state: ISerializedTerminalState[], dateTimeFormatLocale: string): Promise<void>;
    private _reviveTerminalProcess;
    shutdownAll(): Promise<void>;
    createProcess(shellLaunchConfig: IShellLaunchConfig, cwd: string, cols: number, rows: number, unicodeVersion: '6' | '11', env: IProcessEnvironment, executableEnv: IProcessEnvironment, options: ITerminalProcessOptions, shouldPersist: boolean, workspaceId: string, workspaceName: string, isReviving?: boolean, rawReviveBuffer?: string): Promise<number>;
    attachToProcess(id: number): Promise<void>;
    updateTitle(id: number, title: string, titleSource: TitleEventSource): Promise<void>;
    updateIcon(id: number, userInitiated: boolean, icon: URI | {
        light: URI;
        dark: URI;
    } | {
        id: string;
        color?: {
            id: string;
        };
    }, color?: string): Promise<void>;
    clearBuffer(id: number): Promise<void>;
    refreshProperty<T extends ProcessPropertyType>(id: number, type: T): Promise<IProcessPropertyMap[T]>;
    updateProperty<T extends ProcessPropertyType>(id: number, type: T, value: IProcessPropertyMap[T]): Promise<void>;
    detachFromProcess(id: number, forcePersist?: boolean): Promise<void>;
    reduceConnectionGraceTime(): Promise<void>;
    listProcesses(): Promise<IProcessDetails[]>;
    getPerformanceMarks(): Promise<performance.PerformanceMark[]>;
    start(id: number): Promise<ITerminalLaunchError | {
        injectedArgs: string[];
    } | undefined>;
    shutdown(id: number, immediate: boolean): Promise<void>;
    input(id: number, data: string): Promise<void>;
    processBinary(id: number, data: string): Promise<void>;
    resize(id: number, cols: number, rows: number): Promise<void>;
    getInitialCwd(id: number): Promise<string>;
    getCwd(id: number): Promise<string>;
    acknowledgeDataEvent(id: number, charCount: number): Promise<void>;
    setUnicodeVersion(id: number, version: '6' | '11'): Promise<void>;
    getLatency(): Promise<IPtyHostLatencyMeasurement[]>;
    orphanQuestionReply(id: number): Promise<void>;
    getDefaultSystemShell(osOverride?: OperatingSystem): Promise<string>;
    getEnvironment(): Promise<IProcessEnvironment>;
    getWslPath(original: string, direction: 'unix-to-win' | 'win-to-unix' | unknown): Promise<string>;
    private _getWSLExecutablePath;
    getRevivedPtyNewId(workspaceId: string, id: number): Promise<number | undefined>;
    setTerminalLayoutInfo(args: ISetTerminalLayoutInfoArgs): Promise<void>;
    getTerminalLayoutInfo(args: IGetTerminalLayoutInfoArgs): Promise<ITerminalsLayoutInfo | undefined>;
    private _expandTerminalTab;
    private _expandTerminalInstance;
    private _getRevivingProcessId;
    private _buildProcessDetails;
    private _throwIfNoPty;
}
