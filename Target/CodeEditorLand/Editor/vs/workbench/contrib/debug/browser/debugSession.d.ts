import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IPosition, Position } from '../../../../editor/common/core/position.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ICustomEndpointTelemetryService, ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkspaceContextService, IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { RawDebugSession } from './rawDebugSession.js';
import { AdapterEndEvent, IBreakpoint, IConfig, IDataBreakpoint, IDataBreakpointInfoResponse, IDebugLocationReferenced, IDebugService, IDebugSession, IDebugSessionOptions, IDebugger, IExceptionBreakpoint, IExceptionInfo, IFunctionBreakpoint, IInstructionBreakpoint, IMemoryRegion, IRawModelUpdate, IRawStoppedDetails, IReplElement, IStackFrame, IThread, LoadedSourceEvent, State } from '../common/debug.js';
import { DebugCompoundRoot } from '../common/debugCompoundRoot.js';
import { DebugModel, Thread } from '../common/debugModel.js';
import { Source } from '../common/debugSource.js';
import { INewReplElementData } from '../common/replModel.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
import { IPaneCompositePartService } from '../../../services/panecomposite/browser/panecomposite.js';
import { ITestService } from '../../testing/common/testService.js';
import { ITestResultService } from '../../testing/common/testResultService.js';
import { LiveTestResult } from '../../testing/common/testResult.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
export declare class DebugSession implements IDebugSession, IDisposable {
    private id;
    private _configuration;
    root: IWorkspaceFolder | undefined;
    private model;
    private readonly debugService;
    private readonly telemetryService;
    private readonly hostService;
    private readonly configurationService;
    private readonly paneCompositeService;
    private readonly workspaceContextService;
    private readonly productService;
    private readonly notificationService;
    private readonly uriIdentityService;
    private readonly instantiationService;
    private readonly customEndpointTelemetryService;
    private readonly workbenchEnvironmentService;
    private readonly logService;
    private readonly testService;
    private readonly accessibilityService;
    parentSession: IDebugSession | undefined;
    rememberedCapabilities?: DebugProtocol.Capabilities;
    private _subId;
    raw: RawDebugSession | undefined;
    private initialized;
    private _options;
    private sources;
    private threads;
    private threadIds;
    private cancellationMap;
    private readonly rawListeners;
    private readonly globalDisposables;
    private fetchThreadsScheduler;
    private passFocusScheduler;
    private lastContinuedThreadId;
    private repl;
    private stoppedDetails;
    private readonly statusQueue;
    /** Test run this debug session was spawned by */
    readonly correlatedTestRun?: LiveTestResult;
    /** Whether we terminated the correlated run yet. Used so a 2nd terminate request goes through to the underlying session. */
    private didTerminateTestRun?;
    private readonly _onDidChangeState;
    private readonly _onDidEndAdapter;
    private readonly _onDidLoadedSource;
    private readonly _onDidCustomEvent;
    private readonly _onDidProgressStart;
    private readonly _onDidProgressUpdate;
    private readonly _onDidProgressEnd;
    private readonly _onDidInvalidMemory;
    private readonly _onDidChangeREPLElements;
    private _name;
    private readonly _onDidChangeName;
    /**
     * Promise set while enabling dependent breakpoints to block the debugger
     * from continuing from a stopped state.
     */
    private _waitToResume?;
    constructor(id: string, _configuration: {
        resolved: IConfig;
        unresolved: IConfig | undefined;
    }, root: IWorkspaceFolder | undefined, model: DebugModel, options: IDebugSessionOptions | undefined, debugService: IDebugService, telemetryService: ITelemetryService, hostService: IHostService, configurationService: IConfigurationService, paneCompositeService: IPaneCompositePartService, workspaceContextService: IWorkspaceContextService, productService: IProductService, notificationService: INotificationService, lifecycleService: ILifecycleService, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService, customEndpointTelemetryService: ICustomEndpointTelemetryService, workbenchEnvironmentService: IWorkbenchEnvironmentService, logService: ILogService, testService: ITestService, testResultService: ITestResultService, accessibilityService: IAccessibilityService);
    getId(): string;
    setSubId(subId: string | undefined): void;
    getMemory(memoryReference: string): IMemoryRegion;
    get subId(): string | undefined;
    get configuration(): IConfig;
    get unresolvedConfiguration(): IConfig | undefined;
    get lifecycleManagedByParent(): boolean;
    get compact(): boolean;
    get saveBeforeRestart(): boolean;
    get compoundRoot(): DebugCompoundRoot | undefined;
    get suppressDebugStatusbar(): boolean;
    get suppressDebugToolbar(): boolean;
    get suppressDebugView(): boolean;
    get autoExpandLazyVariables(): boolean;
    setConfiguration(configuration: {
        resolved: IConfig;
        unresolved: IConfig | undefined;
    }): void;
    getLabel(): string;
    setName(name: string): void;
    get name(): string;
    get state(): State;
    get capabilities(): DebugProtocol.Capabilities;
    get onDidChangeState(): Event<void>;
    get onDidEndAdapter(): Event<AdapterEndEvent | undefined>;
    get onDidChangeReplElements(): Event<IReplElement | undefined>;
    get onDidChangeName(): Event<string>;
    get onDidCustomEvent(): Event<DebugProtocol.Event>;
    get onDidLoadedSource(): Event<LoadedSourceEvent>;
    get onDidProgressStart(): Event<DebugProtocol.ProgressStartEvent>;
    get onDidProgressUpdate(): Event<DebugProtocol.ProgressUpdateEvent>;
    get onDidProgressEnd(): Event<DebugProtocol.ProgressEndEvent>;
    get onDidInvalidateMemory(): Event<DebugProtocol.MemoryEvent>;
    /**
     * create and initialize a new debug adapter for this session
     */
    initialize(dbgr: IDebugger): Promise<void>;
    /**
     * launch or attach to the debuggee
     */
    launchOrAttach(config: IConfig): Promise<void>;
    /**
     * terminate the current debug adapter session
     */
    terminate(restart?: boolean): Promise<void>;
    /**
     * end the current debug adapter session
     */
    disconnect(restart?: boolean, suspend?: boolean): Promise<void>;
    /**
     * restart debug adapter session
     */
    restart(): Promise<void>;
    sendBreakpoints(modelUri: URI, breakpointsToSend: IBreakpoint[], sourceModified: boolean): Promise<void>;
    sendFunctionBreakpoints(fbpts: IFunctionBreakpoint[]): Promise<void>;
    sendExceptionBreakpoints(exbpts: IExceptionBreakpoint[]): Promise<void>;
    dataBytesBreakpointInfo(address: string, bytes: number): Promise<IDataBreakpointInfoResponse | undefined>;
    dataBreakpointInfo(name: string, variablesReference?: number): Promise<{
        dataId: string | null;
        description: string;
        canPersist?: boolean;
    } | undefined>;
    private _dataBreakpointInfo;
    sendDataBreakpoints(dataBreakpoints: IDataBreakpoint[]): Promise<void>;
    sendInstructionBreakpoints(instructionBreakpoints: IInstructionBreakpoint[]): Promise<void>;
    breakpointsLocations(uri: URI, lineNumber: number): Promise<IPosition[]>;
    getDebugProtocolBreakpoint(breakpointId: string): DebugProtocol.Breakpoint | undefined;
    customRequest(request: string, args: any): Promise<DebugProtocol.Response | undefined>;
    stackTrace(threadId: number, startFrame: number, levels: number, token: CancellationToken): Promise<DebugProtocol.StackTraceResponse | undefined>;
    exceptionInfo(threadId: number): Promise<IExceptionInfo | undefined>;
    scopes(frameId: number, threadId: number): Promise<DebugProtocol.ScopesResponse | undefined>;
    variables(variablesReference: number, threadId: number | undefined, filter: 'indexed' | 'named' | undefined, start: number | undefined, count: number | undefined): Promise<DebugProtocol.VariablesResponse | undefined>;
    evaluate(expression: string, frameId: number, context?: string, location?: {
        line: number;
        column: number;
        source: DebugProtocol.Source;
    }): Promise<DebugProtocol.EvaluateResponse | undefined>;
    restartFrame(frameId: number, threadId: number): Promise<void>;
    private setLastSteppingGranularity;
    next(threadId: number, granularity?: DebugProtocol.SteppingGranularity): Promise<void>;
    stepIn(threadId: number, targetId?: number, granularity?: DebugProtocol.SteppingGranularity): Promise<void>;
    stepOut(threadId: number, granularity?: DebugProtocol.SteppingGranularity): Promise<void>;
    stepBack(threadId: number, granularity?: DebugProtocol.SteppingGranularity): Promise<void>;
    continue(threadId: number): Promise<void>;
    reverseContinue(threadId: number): Promise<void>;
    pause(threadId: number): Promise<void>;
    terminateThreads(threadIds?: number[]): Promise<void>;
    setVariable(variablesReference: number, name: string, value: string): Promise<DebugProtocol.SetVariableResponse | undefined>;
    setExpression(frameId: number, expression: string, value: string): Promise<DebugProtocol.SetExpressionResponse | undefined>;
    gotoTargets(source: DebugProtocol.Source, line: number, column?: number): Promise<DebugProtocol.GotoTargetsResponse | undefined>;
    goto(threadId: number, targetId: number): Promise<DebugProtocol.GotoResponse | undefined>;
    loadSource(resource: URI): Promise<DebugProtocol.SourceResponse | undefined>;
    getLoadedSources(): Promise<Source[]>;
    completions(frameId: number | undefined, threadId: number, text: string, position: Position, overwriteBefore: number, token: CancellationToken): Promise<DebugProtocol.CompletionsResponse | undefined>;
    stepInTargets(frameId: number): Promise<{
        id: number;
        label: string;
    }[] | undefined>;
    cancel(progressId: string): Promise<DebugProtocol.CancelResponse | undefined>;
    disassemble(memoryReference: string, offset: number, instructionOffset: number, instructionCount: number): Promise<DebugProtocol.DisassembledInstruction[] | undefined>;
    readMemory(memoryReference: string, offset: number, count: number): Promise<DebugProtocol.ReadMemoryResponse | undefined>;
    writeMemory(memoryReference: string, offset: number, data: string, allowPartial?: boolean): Promise<DebugProtocol.WriteMemoryResponse | undefined>;
    resolveLocationReference(locationReference: number): Promise<IDebugLocationReferenced>;
    getThread(threadId: number): Thread | undefined;
    getAllThreads(): IThread[];
    clearThreads(removeThreads: boolean, reference?: number | undefined): void;
    getStoppedDetails(): IRawStoppedDetails | undefined;
    rawUpdate(data: IRawModelUpdate): void;
    private waitForTriggeredBreakpoints;
    private fetchThreads;
    initializeForTest(raw: RawDebugSession): void;
    private registerListeners;
    private handleStop;
    private enableDependentBreakpoints;
    private getBreakpointsAtPosition;
    private onDidExitAdapter;
    private shutdown;
    dispose(): void;
    getSourceForUri(uri: URI): Source | undefined;
    getSource(raw?: DebugProtocol.Source): Source;
    private getRawSource;
    private getNewCancellationToken;
    private cancelAllRequests;
    getReplElements(): IReplElement[];
    hasSeparateRepl(): boolean;
    removeReplExpressions(): void;
    addReplExpression(stackFrame: IStackFrame | undefined, expression: string): Promise<void>;
    appendToRepl(data: INewReplElementData, isImportant?: boolean): void;
}
/**
 * Keeps track of events for threads, and cancels any previous operations for
 * a thread when the thread goes into a new state. Currently, the operations a thread has are:
 *
 * - started
 * - stopped
 * - continue
 * - exited
 *
 * In each case, the new state preempts the old state, so we don't need to
 * queue work, just cancel old work. It's up to the caller to make sure that
 * no UI effects happen at the point when the `token` is cancelled.
 */
export declare class ThreadStatusScheduler extends Disposable {
    /**
     * An array of set of thread IDs. When a 'stopped' event is encountered, the
     * editor refreshes its thread IDs. In the meantime, the thread may change
     * state it again. So the editor puts a Set into this array when it starts
     * the refresh, and checks it after the refresh is finished, to see if
     * any of the threads it looked up should now be invalidated.
     */
    private pendingCancellations;
    /**
     * Cancellation tokens for currently-running operations on threads.
     */
    private readonly threadOps;
    /**
     * Runs the operation.
     * If thread is undefined it affects all threads.
     */
    run(threadIdsP: Promise<number[]>, operation: (threadId: number, ct: CancellationToken) => Promise<unknown>): Promise<void>;
    /**
     * Cancels all ongoing state operations on the given threads.
     * If threads is undefined it cancel all threads.
     */
    cancel(threadIds?: readonly number[]): void;
}
