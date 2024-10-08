import { Event } from '../../../../base/common/event.js';
import { IDebugAdapter, IConfig, AdapterEndEvent, IDebugger } from '../common/debug.js';
import { IExtensionHostDebugService } from '../../../../platform/debug/common/extensionHostDebug.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
/**
 * Encapsulates the DebugAdapter lifecycle and some idiosyncrasies of the Debug Adapter Protocol.
 */
export declare class RawDebugSession implements IDisposable {
    readonly dbgr: IDebugger;
    private readonly sessionId;
    private readonly name;
    private readonly extensionHostDebugService;
    private readonly openerService;
    private readonly notificationService;
    private readonly dialogSerivce;
    private allThreadsContinued;
    private _readyForBreakpoints;
    private _capabilities;
    private debugAdapterStopped;
    private inShutdown;
    private terminated;
    private firedAdapterExitEvent;
    private startTime;
    private didReceiveStoppedEvent;
    private readonly _onDidInitialize;
    private readonly _onDidStop;
    private readonly _onDidContinued;
    private readonly _onDidTerminateDebugee;
    private readonly _onDidExitDebugee;
    private readonly _onDidThread;
    private readonly _onDidOutput;
    private readonly _onDidBreakpoint;
    private readonly _onDidLoadedSource;
    private readonly _onDidProgressStart;
    private readonly _onDidProgressUpdate;
    private readonly _onDidProgressEnd;
    private readonly _onDidInvalidated;
    private readonly _onDidInvalidateMemory;
    private readonly _onDidCustomEvent;
    private readonly _onDidEvent;
    private readonly _onDidExitAdapter;
    private debugAdapter;
    private stoppedSinceLastStep;
    private toDispose;
    constructor(debugAdapter: IDebugAdapter, dbgr: IDebugger, sessionId: string, name: string, extensionHostDebugService: IExtensionHostDebugService, openerService: IOpenerService, notificationService: INotificationService, dialogSerivce: IDialogService);
    get isInShutdown(): boolean;
    get onDidExitAdapter(): Event<AdapterEndEvent>;
    get capabilities(): DebugProtocol.Capabilities;
    /**
     * DA is ready to accepts setBreakpoint requests.
     * Becomes true after "initialized" events has been received.
     */
    get readyForBreakpoints(): boolean;
    get onDidInitialize(): Event<DebugProtocol.InitializedEvent>;
    get onDidStop(): Event<DebugProtocol.StoppedEvent>;
    get onDidContinued(): Event<DebugProtocol.ContinuedEvent>;
    get onDidTerminateDebugee(): Event<DebugProtocol.TerminatedEvent>;
    get onDidExitDebugee(): Event<DebugProtocol.ExitedEvent>;
    get onDidThread(): Event<DebugProtocol.ThreadEvent>;
    get onDidOutput(): Event<DebugProtocol.OutputEvent>;
    get onDidBreakpoint(): Event<DebugProtocol.BreakpointEvent>;
    get onDidLoadedSource(): Event<DebugProtocol.LoadedSourceEvent>;
    get onDidCustomEvent(): Event<DebugProtocol.Event>;
    get onDidProgressStart(): Event<DebugProtocol.ProgressStartEvent>;
    get onDidProgressUpdate(): Event<DebugProtocol.ProgressUpdateEvent>;
    get onDidProgressEnd(): Event<DebugProtocol.ProgressEndEvent>;
    get onDidInvalidated(): Event<DebugProtocol.InvalidatedEvent>;
    get onDidInvalidateMemory(): Event<DebugProtocol.MemoryEvent>;
    get onDidEvent(): Event<DebugProtocol.Event>;
    /**
     * Starts the underlying debug adapter and tracks the session time for telemetry.
     */
    start(): Promise<void>;
    /**
     * Send client capabilities to the debug adapter and receive DA capabilities in return.
     */
    initialize(args: DebugProtocol.InitializeRequestArguments): Promise<DebugProtocol.InitializeResponse | undefined>;
    /**
     * Terminate the debuggee and shutdown the adapter
     */
    disconnect(args: DebugProtocol.DisconnectArguments): Promise<any>;
    launchOrAttach(config: IConfig): Promise<DebugProtocol.Response | undefined>;
    /**
     * Try killing the debuggee softly...
     */
    terminate(restart?: boolean): Promise<DebugProtocol.TerminateResponse | undefined>;
    restart(args: DebugProtocol.RestartArguments): Promise<DebugProtocol.RestartResponse | undefined>;
    next(args: DebugProtocol.NextArguments): Promise<DebugProtocol.NextResponse | undefined>;
    stepIn(args: DebugProtocol.StepInArguments): Promise<DebugProtocol.StepInResponse | undefined>;
    stepOut(args: DebugProtocol.StepOutArguments): Promise<DebugProtocol.StepOutResponse | undefined>;
    continue(args: DebugProtocol.ContinueArguments): Promise<DebugProtocol.ContinueResponse | undefined>;
    pause(args: DebugProtocol.PauseArguments): Promise<DebugProtocol.PauseResponse | undefined>;
    terminateThreads(args: DebugProtocol.TerminateThreadsArguments): Promise<DebugProtocol.TerminateThreadsResponse | undefined>;
    setVariable(args: DebugProtocol.SetVariableArguments): Promise<DebugProtocol.SetVariableResponse | undefined>;
    setExpression(args: DebugProtocol.SetExpressionArguments): Promise<DebugProtocol.SetExpressionResponse | undefined>;
    restartFrame(args: DebugProtocol.RestartFrameArguments, threadId: number): Promise<DebugProtocol.RestartFrameResponse | undefined>;
    stepInTargets(args: DebugProtocol.StepInTargetsArguments): Promise<DebugProtocol.StepInTargetsResponse | undefined>;
    completions(args: DebugProtocol.CompletionsArguments, token: CancellationToken): Promise<DebugProtocol.CompletionsResponse | undefined>;
    setBreakpoints(args: DebugProtocol.SetBreakpointsArguments): Promise<DebugProtocol.SetBreakpointsResponse | undefined>;
    setFunctionBreakpoints(args: DebugProtocol.SetFunctionBreakpointsArguments): Promise<DebugProtocol.SetFunctionBreakpointsResponse | undefined>;
    dataBreakpointInfo(args: DebugProtocol.DataBreakpointInfoArguments): Promise<DebugProtocol.DataBreakpointInfoResponse | undefined>;
    setDataBreakpoints(args: DebugProtocol.SetDataBreakpointsArguments): Promise<DebugProtocol.SetDataBreakpointsResponse | undefined>;
    setExceptionBreakpoints(args: DebugProtocol.SetExceptionBreakpointsArguments): Promise<DebugProtocol.SetExceptionBreakpointsResponse | undefined>;
    breakpointLocations(args: DebugProtocol.BreakpointLocationsArguments): Promise<DebugProtocol.BreakpointLocationsResponse | undefined>;
    configurationDone(): Promise<DebugProtocol.ConfigurationDoneResponse | undefined>;
    stackTrace(args: DebugProtocol.StackTraceArguments, token: CancellationToken): Promise<DebugProtocol.StackTraceResponse | undefined>;
    exceptionInfo(args: DebugProtocol.ExceptionInfoArguments): Promise<DebugProtocol.ExceptionInfoResponse | undefined>;
    scopes(args: DebugProtocol.ScopesArguments, token: CancellationToken): Promise<DebugProtocol.ScopesResponse | undefined>;
    variables(args: DebugProtocol.VariablesArguments, token?: CancellationToken): Promise<DebugProtocol.VariablesResponse | undefined>;
    source(args: DebugProtocol.SourceArguments): Promise<DebugProtocol.SourceResponse | undefined>;
    locations(args: DebugProtocol.LocationsArguments): Promise<DebugProtocol.LocationsResponse | undefined>;
    loadedSources(args: DebugProtocol.LoadedSourcesArguments): Promise<DebugProtocol.LoadedSourcesResponse | undefined>;
    threads(): Promise<DebugProtocol.ThreadsResponse | undefined>;
    evaluate(args: DebugProtocol.EvaluateArguments): Promise<DebugProtocol.EvaluateResponse | undefined>;
    stepBack(args: DebugProtocol.StepBackArguments): Promise<DebugProtocol.StepBackResponse | undefined>;
    reverseContinue(args: DebugProtocol.ReverseContinueArguments): Promise<DebugProtocol.ReverseContinueResponse | undefined>;
    gotoTargets(args: DebugProtocol.GotoTargetsArguments): Promise<DebugProtocol.GotoTargetsResponse | undefined>;
    goto(args: DebugProtocol.GotoArguments): Promise<DebugProtocol.GotoResponse | undefined>;
    setInstructionBreakpoints(args: DebugProtocol.SetInstructionBreakpointsArguments): Promise<DebugProtocol.SetInstructionBreakpointsResponse | undefined>;
    disassemble(args: DebugProtocol.DisassembleArguments): Promise<DebugProtocol.DisassembleResponse | undefined>;
    readMemory(args: DebugProtocol.ReadMemoryArguments): Promise<DebugProtocol.ReadMemoryResponse | undefined>;
    writeMemory(args: DebugProtocol.WriteMemoryArguments): Promise<DebugProtocol.WriteMemoryResponse | undefined>;
    cancel(args: DebugProtocol.CancelArguments): Promise<DebugProtocol.CancelResponse | undefined>;
    custom(request: string, args: any): Promise<DebugProtocol.Response | undefined>;
    private shutdown;
    private stopAdapter;
    private fireAdapterExitEvent;
    private dispatchRequest;
    private launchVsCode;
    private send;
    private handleErrorResponse;
    private mergeCapabilities;
    private fireSimulatedContinuedEvent;
    dispose(): void;
}
