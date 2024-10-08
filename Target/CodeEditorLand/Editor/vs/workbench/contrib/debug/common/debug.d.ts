import { IAction } from '../../../../base/common/actions.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Color } from '../../../../base/common/color.js';
import { Event } from '../../../../base/common/event.js';
import { IJSONSchemaSnippet } from '../../../../base/common/jsonSchema.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import severity from '../../../../base/common/severity.js';
import { URI, UriComponents, URI as uri } from '../../../../base/common/uri.js';
import { IPosition, Position } from '../../../../editor/common/core/position.js';
import { IRange } from '../../../../editor/common/core/range.js';
import * as editorCommon from '../../../../editor/common/editorCommon.js';
import { ITextModel as EditorIModel } from '../../../../editor/common/model.js';
import { ConfigurationTarget } from '../../../../platform/configuration/common/configuration.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { ITelemetryEndpoint } from '../../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { IEditorPane } from '../../../common/editor.js';
import { DebugCompoundRoot } from './debugCompoundRoot.js';
import { IDataBreakpointOptions, IFunctionBreakpointOptions, IInstructionBreakpointOptions } from './debugModel.js';
import { Source } from './debugSource.js';
import { ITaskIdentifier } from '../../tasks/common/tasks.js';
import { LiveTestResult } from '../../testing/common/testResult.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
export declare const VIEWLET_ID = "workbench.view.debug";
export declare const VARIABLES_VIEW_ID = "workbench.debug.variablesView";
export declare const WATCH_VIEW_ID = "workbench.debug.watchExpressionsView";
export declare const CALLSTACK_VIEW_ID = "workbench.debug.callStackView";
export declare const LOADED_SCRIPTS_VIEW_ID = "workbench.debug.loadedScriptsView";
export declare const BREAKPOINTS_VIEW_ID = "workbench.debug.breakPointsView";
export declare const DISASSEMBLY_VIEW_ID = "workbench.debug.disassemblyView";
export declare const DEBUG_PANEL_ID = "workbench.panel.repl";
export declare const REPL_VIEW_ID = "workbench.panel.repl.view";
export declare const CONTEXT_DEBUG_TYPE: RawContextKey<string>;
export declare const CONTEXT_DEBUG_CONFIGURATION_TYPE: RawContextKey<string>;
export declare const CONTEXT_DEBUG_STATE: RawContextKey<string>;
export declare const CONTEXT_DEBUG_UX_KEY = "debugUx";
export declare const CONTEXT_DEBUG_UX: RawContextKey<string>;
export declare const CONTEXT_HAS_DEBUGGED: RawContextKey<boolean>;
export declare const CONTEXT_IN_DEBUG_MODE: RawContextKey<boolean>;
export declare const CONTEXT_IN_DEBUG_REPL: RawContextKey<boolean>;
export declare const CONTEXT_BREAKPOINT_WIDGET_VISIBLE: RawContextKey<boolean>;
export declare const CONTEXT_IN_BREAKPOINT_WIDGET: RawContextKey<boolean>;
export declare const CONTEXT_BREAKPOINTS_FOCUSED: RawContextKey<boolean>;
export declare const CONTEXT_WATCH_EXPRESSIONS_FOCUSED: RawContextKey<boolean>;
export declare const CONTEXT_WATCH_EXPRESSIONS_EXIST: RawContextKey<boolean>;
export declare const CONTEXT_VARIABLES_FOCUSED: RawContextKey<boolean>;
export declare const CONTEXT_EXPRESSION_SELECTED: RawContextKey<boolean>;
export declare const CONTEXT_BREAKPOINT_INPUT_FOCUSED: RawContextKey<boolean>;
export declare const CONTEXT_CALLSTACK_ITEM_TYPE: RawContextKey<string>;
export declare const CONTEXT_CALLSTACK_SESSION_IS_ATTACH: RawContextKey<boolean>;
export declare const CONTEXT_CALLSTACK_ITEM_STOPPED: RawContextKey<boolean>;
export declare const CONTEXT_CALLSTACK_SESSION_HAS_ONE_THREAD: RawContextKey<boolean>;
export declare const CONTEXT_WATCH_ITEM_TYPE: RawContextKey<string>;
export declare const CONTEXT_CAN_VIEW_MEMORY: RawContextKey<boolean>;
export declare const CONTEXT_BREAKPOINT_ITEM_TYPE: RawContextKey<string>;
export declare const CONTEXT_BREAKPOINT_ITEM_IS_DATA_BYTES: RawContextKey<boolean>;
export declare const CONTEXT_BREAKPOINT_HAS_MODES: RawContextKey<boolean>;
export declare const CONTEXT_BREAKPOINT_SUPPORTS_CONDITION: RawContextKey<boolean>;
export declare const CONTEXT_LOADED_SCRIPTS_SUPPORTED: RawContextKey<boolean>;
export declare const CONTEXT_LOADED_SCRIPTS_ITEM_TYPE: RawContextKey<string>;
export declare const CONTEXT_FOCUSED_SESSION_IS_ATTACH: RawContextKey<boolean>;
export declare const CONTEXT_FOCUSED_SESSION_IS_NO_DEBUG: RawContextKey<boolean>;
export declare const CONTEXT_STEP_BACK_SUPPORTED: RawContextKey<boolean>;
export declare const CONTEXT_RESTART_FRAME_SUPPORTED: RawContextKey<boolean>;
export declare const CONTEXT_STACK_FRAME_SUPPORTS_RESTART: RawContextKey<boolean>;
export declare const CONTEXT_JUMP_TO_CURSOR_SUPPORTED: RawContextKey<boolean>;
export declare const CONTEXT_STEP_INTO_TARGETS_SUPPORTED: RawContextKey<boolean>;
export declare const CONTEXT_BREAKPOINTS_EXIST: RawContextKey<boolean>;
export declare const CONTEXT_DEBUGGERS_AVAILABLE: RawContextKey<boolean>;
export declare const CONTEXT_DEBUG_EXTENSION_AVAILABLE: RawContextKey<boolean>;
export declare const CONTEXT_DEBUG_PROTOCOL_VARIABLE_MENU_CONTEXT: RawContextKey<string>;
export declare const CONTEXT_SET_VARIABLE_SUPPORTED: RawContextKey<boolean>;
export declare const CONTEXT_SET_DATA_BREAKPOINT_BYTES_SUPPORTED: RawContextKey<boolean>;
export declare const CONTEXT_SET_EXPRESSION_SUPPORTED: RawContextKey<boolean>;
export declare const CONTEXT_BREAK_WHEN_VALUE_CHANGES_SUPPORTED: RawContextKey<boolean>;
export declare const CONTEXT_BREAK_WHEN_VALUE_IS_ACCESSED_SUPPORTED: RawContextKey<boolean>;
export declare const CONTEXT_BREAK_WHEN_VALUE_IS_READ_SUPPORTED: RawContextKey<boolean>;
export declare const CONTEXT_TERMINATE_DEBUGGEE_SUPPORTED: RawContextKey<boolean>;
export declare const CONTEXT_SUSPEND_DEBUGGEE_SUPPORTED: RawContextKey<boolean>;
export declare const CONTEXT_VARIABLE_EVALUATE_NAME_PRESENT: RawContextKey<boolean>;
export declare const CONTEXT_VARIABLE_IS_READONLY: RawContextKey<boolean>;
export declare const CONTEXT_VARIABLE_VALUE: RawContextKey<boolean>;
export declare const CONTEXT_VARIABLE_TYPE: RawContextKey<boolean>;
export declare const CONTEXT_VARIABLE_INTERFACES: RawContextKey<boolean>;
export declare const CONTEXT_VARIABLE_NAME: RawContextKey<boolean>;
export declare const CONTEXT_VARIABLE_LANGUAGE: RawContextKey<boolean>;
export declare const CONTEXT_VARIABLE_EXTENSIONID: RawContextKey<boolean>;
export declare const CONTEXT_EXCEPTION_WIDGET_VISIBLE: RawContextKey<boolean>;
export declare const CONTEXT_MULTI_SESSION_REPL: RawContextKey<boolean>;
export declare const CONTEXT_MULTI_SESSION_DEBUG: RawContextKey<boolean>;
export declare const CONTEXT_DISASSEMBLE_REQUEST_SUPPORTED: RawContextKey<boolean>;
export declare const CONTEXT_DISASSEMBLY_VIEW_FOCUS: RawContextKey<boolean>;
export declare const CONTEXT_LANGUAGE_SUPPORTS_DISASSEMBLE_REQUEST: RawContextKey<boolean>;
export declare const CONTEXT_FOCUSED_STACK_FRAME_HAS_INSTRUCTION_POINTER_REFERENCE: RawContextKey<boolean>;
export declare const debuggerDisabledMessage: (debugType: string) => string;
export declare const EDITOR_CONTRIBUTION_ID = "editor.contrib.debug";
export declare const BREAKPOINT_EDITOR_CONTRIBUTION_ID = "editor.contrib.breakpoint";
export declare const DEBUG_SCHEME = "debug";
export declare const INTERNAL_CONSOLE_OPTIONS_SCHEMA: {
    enum: string[];
    default: string;
    description: string;
};
export interface IRawModelUpdate {
    sessionId: string;
    threads: DebugProtocol.Thread[];
    stoppedDetails?: IRawStoppedDetails;
}
export interface IRawStoppedDetails {
    reason?: string;
    description?: string;
    threadId?: number;
    text?: string;
    totalFrames?: number;
    allThreadsStopped?: boolean;
    preserveFocusHint?: boolean;
    framesErrorMessage?: string;
    hitBreakpointIds?: number[];
}
export interface ITreeElement {
    getId(): string;
}
export interface IReplElement extends ITreeElement {
    toString(includeSource?: boolean): string;
    readonly sourceData?: IReplElementSource;
}
export interface INestingReplElement extends IReplElement {
    readonly hasChildren: boolean;
    getChildren(): Promise<IReplElement[]> | IReplElement[];
}
export interface IReplElementSource {
    readonly source: Source;
    readonly lineNumber: number;
    readonly column: number;
}
export interface IExpressionValue {
    readonly value: string;
    readonly type?: string;
    valueChanged?: boolean;
}
export interface IExpressionContainer extends ITreeElement, IExpressionValue {
    readonly hasChildren: boolean;
    getSession(): IDebugSession | undefined;
    evaluateLazy(): Promise<void>;
    getChildren(): Promise<IExpression[]>;
    readonly reference?: number;
    readonly memoryReference?: string;
    readonly presentationHint?: DebugProtocol.VariablePresentationHint | undefined;
    readonly valueLocationReference?: number;
}
export interface IExpression extends IExpressionContainer {
    name: string;
}
export interface IDebugger {
    readonly type: string;
    createDebugAdapter(session: IDebugSession): Promise<IDebugAdapter>;
    runInTerminal(args: DebugProtocol.RunInTerminalRequestArguments, sessionId: string): Promise<number | undefined>;
    startDebugging(args: IConfig, parentSessionId: string): Promise<boolean>;
    getCustomTelemetryEndpoint(): ITelemetryEndpoint | undefined;
    getInitialConfigurationContent(initialConfigs?: IConfig[]): Promise<string>;
}
export interface IDebuggerMetadata {
    label: string;
    type: string;
    strings?: {
        [key in DebuggerString]: string;
    };
    interestedInLanguage(languageId: string): boolean;
}
export declare const enum State {
    Inactive = 0,
    Initializing = 1,
    Stopped = 2,
    Running = 3
}
export declare function getStateLabel(state: State): string;
export interface AdapterEndEvent {
    error?: Error;
    sessionLengthInSeconds: number;
    emittedStopped: boolean;
}
export interface LoadedSourceEvent {
    reason: 'new' | 'changed' | 'removed';
    source: Source;
}
export type IDebugSessionReplMode = 'separate' | 'mergeWithParent';
export interface IDebugTestRunReference {
    runId: string;
    taskId: string;
}
export interface IDebugSessionOptions {
    noDebug?: boolean;
    parentSession?: IDebugSession;
    lifecycleManagedByParent?: boolean;
    repl?: IDebugSessionReplMode;
    compoundRoot?: DebugCompoundRoot;
    compact?: boolean;
    startedByUser?: boolean;
    saveBeforeRestart?: boolean;
    suppressDebugToolbar?: boolean;
    suppressDebugStatusbar?: boolean;
    suppressDebugView?: boolean;
    /**
     * Set if the debug session is correlated with a test run. Stopping/restarting
     * the session will instead stop/restart the test run.
     */
    testRun?: IDebugTestRunReference;
}
export interface IDataBreakpointInfoResponse {
    dataId: string | null;
    description: string;
    canPersist?: boolean;
    accessTypes?: DebugProtocol.DataBreakpointAccessType[];
}
export interface IMemoryInvalidationEvent {
    fromOffset: number;
    toOffset: number;
}
export declare const enum MemoryRangeType {
    Valid = 0,
    Unreadable = 1,
    Error = 2
}
export interface IMemoryRange {
    type: MemoryRangeType;
    offset: number;
    length: number;
}
export interface IValidMemoryRange extends IMemoryRange {
    type: MemoryRangeType.Valid;
    offset: number;
    length: number;
    data: VSBuffer;
}
export interface IUnreadableMemoryRange extends IMemoryRange {
    type: MemoryRangeType.Unreadable;
}
export interface IErrorMemoryRange extends IMemoryRange {
    type: MemoryRangeType.Error;
    error: string;
}
/**
 * Union type of memory that can be returned from read(). Since a read request
 * could encompass multiple previously-read ranges, multiple of these types
 * are possible to return.
 */
export type MemoryRange = IValidMemoryRange | IUnreadableMemoryRange | IErrorMemoryRange;
export declare const DEBUG_MEMORY_SCHEME = "vscode-debug-memory";
/**
 * An IMemoryRegion corresponds to a contiguous range of memory referred to
 * by a DAP `memoryReference`.
 */
export interface IMemoryRegion extends IDisposable {
    /**
     * Event that fires when memory changes. Can be a result of memory events or
     * `write` requests.
     */
    readonly onDidInvalidate: Event<IMemoryInvalidationEvent>;
    /**
     * Whether writes are supported on this memory region.
     */
    readonly writable: boolean;
    /**
     * Requests memory ranges from the debug adapter. It returns a list of memory
     * ranges that overlap (but may exceed!) the given offset. Use the `offset`
     * and `length` of each range for display.
     */
    read(fromOffset: number, toOffset: number): Promise<MemoryRange[]>;
    /**
     * Writes memory to the debug adapter at the given offset.
     */
    write(offset: number, data: VSBuffer): Promise<number>;
}
/** Data that can be inserted in {@link IDebugSession.appendToRepl} */
export interface INewReplElementData {
    /**
     * Output string to display
     */
    output: string;
    /**
     * Expression data to display. Will result in the item being expandable in
     * the REPL. Its value will be used if {@link output} is not provided.
     */
    expression?: IExpression;
    /**
     * Output severity.
     */
    sev: severity;
    /**
     * Originating location.
     */
    source?: IReplElementSource;
}
export interface IDebugEvaluatePosition {
    line: number;
    column: number;
    source: DebugProtocol.Source;
}
export interface IDebugLocationReferenced {
    line: number;
    column: number;
    endLine?: number;
    endColumn?: number;
    source: Source;
}
export interface IDebugSession extends ITreeElement {
    readonly configuration: IConfig;
    readonly unresolvedConfiguration: IConfig | undefined;
    readonly state: State;
    readonly root: IWorkspaceFolder | undefined;
    readonly parentSession: IDebugSession | undefined;
    readonly subId: string | undefined;
    readonly compact: boolean;
    readonly compoundRoot: DebugCompoundRoot | undefined;
    readonly saveBeforeRestart: boolean;
    readonly name: string;
    readonly autoExpandLazyVariables: boolean;
    readonly suppressDebugToolbar: boolean;
    readonly suppressDebugStatusbar: boolean;
    readonly suppressDebugView: boolean;
    readonly lifecycleManagedByParent: boolean;
    /** Test run this debug session was spawned by */
    readonly correlatedTestRun?: LiveTestResult;
    setSubId(subId: string | undefined): void;
    getMemory(memoryReference: string): IMemoryRegion;
    setName(name: string): void;
    readonly onDidChangeName: Event<string>;
    getLabel(): string;
    getSourceForUri(modelUri: uri): Source | undefined;
    getSource(raw?: DebugProtocol.Source): Source;
    setConfiguration(configuration: {
        resolved: IConfig;
        unresolved: IConfig | undefined;
    }): void;
    rawUpdate(data: IRawModelUpdate): void;
    getThread(threadId: number): IThread | undefined;
    getAllThreads(): IThread[];
    clearThreads(removeThreads: boolean, reference?: number): void;
    getStoppedDetails(): IRawStoppedDetails | undefined;
    getReplElements(): IReplElement[];
    hasSeparateRepl(): boolean;
    removeReplExpressions(): void;
    addReplExpression(stackFrame: IStackFrame | undefined, name: string): Promise<void>;
    appendToRepl(data: INewReplElementData): void;
    readonly onDidEndAdapter: Event<AdapterEndEvent | undefined>;
    readonly onDidChangeState: Event<void>;
    readonly onDidChangeReplElements: Event<IReplElement | undefined>;
    /** DA capabilities. Set only when there is a running session available. */
    readonly capabilities: DebugProtocol.Capabilities;
    /** DA capabilities. These are retained on the session even after is implementation ends. */
    readonly rememberedCapabilities?: DebugProtocol.Capabilities;
    readonly onDidLoadedSource: Event<LoadedSourceEvent>;
    readonly onDidCustomEvent: Event<DebugProtocol.Event>;
    readonly onDidProgressStart: Event<DebugProtocol.ProgressStartEvent>;
    readonly onDidProgressUpdate: Event<DebugProtocol.ProgressUpdateEvent>;
    readonly onDidProgressEnd: Event<DebugProtocol.ProgressEndEvent>;
    readonly onDidInvalidateMemory: Event<DebugProtocol.MemoryEvent>;
    initialize(dbgr: IDebugger): Promise<void>;
    launchOrAttach(config: IConfig): Promise<void>;
    restart(): Promise<void>;
    terminate(restart?: boolean): Promise<void>;
    disconnect(restart?: boolean, suspend?: boolean): Promise<void>;
    sendBreakpoints(modelUri: uri, bpts: IBreakpoint[], sourceModified: boolean): Promise<void>;
    sendFunctionBreakpoints(fbps: IFunctionBreakpoint[]): Promise<void>;
    dataBreakpointInfo(name: string, variablesReference?: number): Promise<IDataBreakpointInfoResponse | undefined>;
    dataBytesBreakpointInfo(address: string, bytes: number): Promise<IDataBreakpointInfoResponse | undefined>;
    sendDataBreakpoints(dbps: IDataBreakpoint[]): Promise<void>;
    sendInstructionBreakpoints(dbps: IInstructionBreakpoint[]): Promise<void>;
    sendExceptionBreakpoints(exbpts: IExceptionBreakpoint[]): Promise<void>;
    breakpointsLocations(uri: uri, lineNumber: number): Promise<IPosition[]>;
    getDebugProtocolBreakpoint(breakpointId: string): DebugProtocol.Breakpoint | undefined;
    resolveLocationReference(locationReference: number): Promise<IDebugLocationReferenced>;
    stackTrace(threadId: number, startFrame: number, levels: number, token: CancellationToken): Promise<DebugProtocol.StackTraceResponse | undefined>;
    exceptionInfo(threadId: number): Promise<IExceptionInfo | undefined>;
    scopes(frameId: number, threadId: number): Promise<DebugProtocol.ScopesResponse | undefined>;
    variables(variablesReference: number, threadId: number | undefined, filter: 'indexed' | 'named' | undefined, start: number | undefined, count: number | undefined): Promise<DebugProtocol.VariablesResponse | undefined>;
    evaluate(expression: string, frameId?: number, context?: string, location?: IDebugEvaluatePosition): Promise<DebugProtocol.EvaluateResponse | undefined>;
    customRequest(request: string, args: any): Promise<DebugProtocol.Response | undefined>;
    cancel(progressId: string): Promise<DebugProtocol.CancelResponse | undefined>;
    disassemble(memoryReference: string, offset: number, instructionOffset: number, instructionCount: number): Promise<DebugProtocol.DisassembledInstruction[] | undefined>;
    readMemory(memoryReference: string, offset: number, count: number): Promise<DebugProtocol.ReadMemoryResponse | undefined>;
    writeMemory(memoryReference: string, offset: number, data: string, allowPartial?: boolean): Promise<DebugProtocol.WriteMemoryResponse | undefined>;
    restartFrame(frameId: number, threadId: number): Promise<void>;
    next(threadId: number, granularity?: DebugProtocol.SteppingGranularity): Promise<void>;
    stepIn(threadId: number, targetId?: number, granularity?: DebugProtocol.SteppingGranularity): Promise<void>;
    stepInTargets(frameId: number): Promise<DebugProtocol.StepInTarget[] | undefined>;
    stepOut(threadId: number, granularity?: DebugProtocol.SteppingGranularity): Promise<void>;
    stepBack(threadId: number, granularity?: DebugProtocol.SteppingGranularity): Promise<void>;
    continue(threadId: number): Promise<void>;
    reverseContinue(threadId: number): Promise<void>;
    pause(threadId: number): Promise<void>;
    terminateThreads(threadIds: number[]): Promise<void>;
    completions(frameId: number | undefined, threadId: number, text: string, position: Position, overwriteBefore: number, token: CancellationToken): Promise<DebugProtocol.CompletionsResponse | undefined>;
    setVariable(variablesReference: number | undefined, name: string, value: string): Promise<DebugProtocol.SetVariableResponse | undefined>;
    setExpression(frameId: number, expression: string, value: string): Promise<DebugProtocol.SetExpressionResponse | undefined>;
    loadSource(resource: uri): Promise<DebugProtocol.SourceResponse | undefined>;
    getLoadedSources(): Promise<Source[]>;
    gotoTargets(source: DebugProtocol.Source, line: number, column?: number): Promise<DebugProtocol.GotoTargetsResponse | undefined>;
    goto(threadId: number, targetId: number): Promise<DebugProtocol.GotoResponse | undefined>;
}
export interface IThread extends ITreeElement {
    /**
     * Process the thread belongs to
     */
    readonly session: IDebugSession;
    /**
     * Id of the thread generated by the debug adapter backend.
     */
    readonly threadId: number;
    /**
     * Name of the thread.
     */
    readonly name: string;
    /**
     * Information about the current thread stop event. Undefined if thread is not stopped.
     */
    readonly stoppedDetails: IRawStoppedDetails | undefined;
    /**
     * Information about the exception if an 'exception' stopped event raised and DA supports the 'exceptionInfo' request, otherwise undefined.
     */
    readonly exceptionInfo: Promise<IExceptionInfo | undefined>;
    readonly stateLabel: string;
    /**
     * Gets the callstack if it has already been received from the debug
     * adapter.
     */
    getCallStack(): ReadonlyArray<IStackFrame>;
    /**
     * Gets the top stack frame that is not hidden if the callstack has already been received from the debug adapter
     */
    getTopStackFrame(): IStackFrame | undefined;
    /**
     * Invalidates the callstack cache
     */
    clearCallStack(): void;
    /**
     * Indicates whether this thread is stopped. The callstack for stopped
     * threads can be retrieved from the debug adapter.
     */
    readonly stopped: boolean;
    next(granularity?: DebugProtocol.SteppingGranularity): Promise<any>;
    stepIn(granularity?: DebugProtocol.SteppingGranularity): Promise<any>;
    stepOut(granularity?: DebugProtocol.SteppingGranularity): Promise<any>;
    stepBack(granularity?: DebugProtocol.SteppingGranularity): Promise<any>;
    continue(): Promise<any>;
    pause(): Promise<any>;
    terminate(): Promise<any>;
    reverseContinue(): Promise<any>;
}
export interface IScope extends IExpressionContainer {
    readonly name: string;
    readonly expensive: boolean;
    readonly range?: IRange;
    readonly hasChildren: boolean;
}
export interface IStackFrame extends ITreeElement {
    readonly thread: IThread;
    readonly name: string;
    readonly presentationHint: string | undefined;
    readonly frameId: number;
    readonly range: IRange;
    readonly source: Source;
    readonly canRestart: boolean;
    readonly instructionPointerReference?: string;
    getScopes(): Promise<IScope[]>;
    getMostSpecificScopes(range: IRange): Promise<ReadonlyArray<IScope>>;
    forgetScopes(): void;
    restart(): Promise<any>;
    toString(): string;
    openInEditor(editorService: IEditorService, preserveFocus?: boolean, sideBySide?: boolean, pinned?: boolean): Promise<IEditorPane | undefined>;
    equals(other: IStackFrame): boolean;
}
export declare function isFrameDeemphasized(frame: IStackFrame): boolean;
export interface IEnablement extends ITreeElement {
    readonly enabled: boolean;
}
export interface IBreakpointData {
    readonly id?: string;
    readonly lineNumber: number;
    readonly column?: number;
    readonly enabled?: boolean;
    readonly condition?: string;
    readonly logMessage?: string;
    readonly hitCondition?: string;
    readonly triggeredBy?: string;
    readonly mode?: string;
    readonly modeLabel?: string;
}
export interface IBreakpointUpdateData {
    readonly condition?: string;
    readonly hitCondition?: string;
    readonly logMessage?: string;
    readonly lineNumber?: number;
    readonly column?: number;
    readonly triggeredBy?: string;
    readonly mode?: string;
    readonly modeLabel?: string;
}
export interface IBaseBreakpoint extends IEnablement {
    readonly condition?: string;
    readonly hitCondition?: string;
    readonly logMessage?: string;
    readonly verified: boolean;
    readonly supported: boolean;
    readonly message?: string;
    /** The preferred mode of the breakpoint from {@link DebugProtocol.BreakpointMode} */
    readonly mode?: string;
    /** The preferred mode label of the breakpoint from {@link DebugProtocol.BreakpointMode} */
    readonly modeLabel?: string;
    readonly sessionsThatVerified: string[];
    getIdFromAdapter(sessionId: string): number | undefined;
}
export interface IBreakpoint extends IBaseBreakpoint {
    /** URI where the breakpoint was first set by the user. */
    readonly originalUri: uri;
    /** URI where the breakpoint is currently shown; may be moved by debugger */
    readonly uri: uri;
    readonly lineNumber: number;
    readonly endLineNumber?: number;
    readonly column?: number;
    readonly endColumn?: number;
    readonly adapterData: any;
    readonly sessionAgnosticData: {
        lineNumber: number;
        column: number | undefined;
    };
    /** An ID of the breakpoint that triggers this breakpoint. */
    readonly triggeredBy?: string;
    /** Pending on the trigger breakpoint, which means this breakpoint is not yet sent to DA */
    readonly pending: boolean;
    /** Marks that a session did trigger the breakpoint. */
    setSessionDidTrigger(sessionId: string, didTrigger?: boolean): void;
    /** Gets whether the `triggeredBy` condition has been met in the given sesison ID. */
    getSessionDidTrigger(sessionId: string): boolean;
    toDAP(): DebugProtocol.SourceBreakpoint;
}
export interface IFunctionBreakpoint extends IBaseBreakpoint {
    readonly name: string;
    toDAP(): DebugProtocol.FunctionBreakpoint;
}
export interface IExceptionBreakpoint extends IBaseBreakpoint {
    readonly filter: string;
    readonly label: string;
    readonly description: string | undefined;
}
export declare const enum DataBreakpointSetType {
    Variable = 0,
    Address = 1
}
/**
 * Source for a data breakpoint. A data breakpoint on a variable always has a
 * `dataId` because it cannot reference that variable globally, but addresses
 * can request info repeated and use session-specific data.
 */
export type DataBreakpointSource = {
    type: DataBreakpointSetType.Variable;
    dataId: string;
} | {
    type: DataBreakpointSetType.Address;
    address: string;
    bytes: number;
};
export interface IDataBreakpoint extends IBaseBreakpoint {
    readonly description: string;
    readonly canPersist: boolean;
    readonly src: DataBreakpointSource;
    readonly accessType: DebugProtocol.DataBreakpointAccessType;
    toDAP(session: IDebugSession): Promise<DebugProtocol.DataBreakpoint | undefined>;
}
export interface IInstructionBreakpoint extends IBaseBreakpoint {
    readonly instructionReference: string;
    readonly offset?: number;
    /** Original instruction memory address; display purposes only */
    readonly address: bigint;
    toDAP(): DebugProtocol.InstructionBreakpoint;
}
export interface IExceptionInfo {
    readonly id?: string;
    readonly description?: string;
    readonly breakMode: string | null;
    readonly details?: DebugProtocol.ExceptionDetails;
}
export interface IViewModel extends ITreeElement {
    /**
     * Returns the focused debug session or undefined if no session is stopped.
     */
    readonly focusedSession: IDebugSession | undefined;
    /**
     * Returns the focused thread or undefined if no thread is stopped.
     */
    readonly focusedThread: IThread | undefined;
    /**
     * Returns the focused stack frame or undefined if there are no stack frames.
     */
    readonly focusedStackFrame: IStackFrame | undefined;
    setVisualizedExpression(original: IExpression, visualized: IExpression & {
        treeId: string;
    } | undefined): void;
    /** Returns the visualized expression if loaded, or a tree it should be visualized with, or undefined */
    getVisualizedExpression(expression: IExpression): IExpression | string | undefined;
    getSelectedExpression(): {
        expression: IExpression;
        settingWatch: boolean;
    } | undefined;
    setSelectedExpression(expression: IExpression | undefined, settingWatch: boolean): void;
    updateViews(): void;
    isMultiSessionView(): boolean;
    onDidFocusSession: Event<IDebugSession | undefined>;
    onDidFocusThread: Event<{
        thread: IThread | undefined;
        explicit: boolean;
        session: IDebugSession | undefined;
    }>;
    onDidFocusStackFrame: Event<{
        stackFrame: IStackFrame | undefined;
        explicit: boolean;
        session: IDebugSession | undefined;
    }>;
    onDidSelectExpression: Event<{
        expression: IExpression;
        settingWatch: boolean;
    } | undefined>;
    onDidEvaluateLazyExpression: Event<IExpressionContainer>;
    /**
     * Fired when `setVisualizedExpression`, to migrate elements currently
     * rendered as `original` to the `replacement`.
     */
    onDidChangeVisualization: Event<{
        original: IExpression;
        replacement: IExpression;
    }>;
    onWillUpdateViews: Event<void>;
    evaluateLazyExpression(expression: IExpressionContainer): void;
}
export interface IEvaluate {
    evaluate(session: IDebugSession, stackFrame: IStackFrame, context: string): Promise<void>;
}
export interface IDebugModel extends ITreeElement {
    getSession(sessionId: string | undefined, includeInactive?: boolean): IDebugSession | undefined;
    getSessions(includeInactive?: boolean): IDebugSession[];
    getBreakpoints(filter?: {
        uri?: uri;
        originalUri?: uri;
        lineNumber?: number;
        column?: number;
        enabledOnly?: boolean;
        triggeredOnly?: boolean;
    }): ReadonlyArray<IBreakpoint>;
    areBreakpointsActivated(): boolean;
    getFunctionBreakpoints(): ReadonlyArray<IFunctionBreakpoint>;
    getDataBreakpoints(): ReadonlyArray<IDataBreakpoint>;
    /**
     * Returns list of all exception breakpoints.
     */
    getExceptionBreakpoints(): ReadonlyArray<IExceptionBreakpoint>;
    /**
     * Returns list of exception breakpoints for the given session
     * @param sessionId Session id. If falsy, returns the breakpoints from the last set fallback session.
     */
    getExceptionBreakpointsForSession(sessionId?: string): ReadonlyArray<IExceptionBreakpoint>;
    getInstructionBreakpoints(): ReadonlyArray<IInstructionBreakpoint>;
    getWatchExpressions(): ReadonlyArray<IExpression & IEvaluate>;
    registerBreakpointModes(debugType: string, modes: DebugProtocol.BreakpointMode[]): void;
    getBreakpointModes(forBreakpointType: 'source' | 'exception' | 'data' | 'instruction'): DebugProtocol.BreakpointMode[];
    onDidChangeBreakpoints: Event<IBreakpointsChangeEvent | undefined>;
    onDidChangeCallStack: Event<void>;
    /**
     * The expression has been added, removed, or repositioned.
     */
    onDidChangeWatchExpressions: Event<IExpression | undefined>;
    /**
     * The expression's value has changed.
     */
    onDidChangeWatchExpressionValue: Event<IExpression | undefined>;
    fetchCallstack(thread: IThread, levels?: number): Promise<void>;
}
/**
 * An event describing a change to the set of [breakpoints](#debug.Breakpoint).
 */
export interface IBreakpointsChangeEvent {
    added?: Array<IBreakpoint | IFunctionBreakpoint | IDataBreakpoint | IInstructionBreakpoint>;
    removed?: Array<IBreakpoint | IFunctionBreakpoint | IDataBreakpoint | IInstructionBreakpoint>;
    changed?: Array<IBreakpoint | IFunctionBreakpoint | IDataBreakpoint | IInstructionBreakpoint>;
    sessionOnly: boolean;
}
export interface IDebugConfiguration {
    allowBreakpointsEverywhere: boolean;
    gutterMiddleClickAction: 'logpoint' | 'conditionalBreakpoint' | 'triggeredBreakpoint' | 'none';
    openDebug: 'neverOpen' | 'openOnSessionStart' | 'openOnFirstSessionStart' | 'openOnDebugBreak';
    openExplorerOnEnd: boolean;
    inlineValues: boolean | 'auto' | 'on' | 'off';
    toolBarLocation: 'floating' | 'docked' | 'commandCenter' | 'hidden';
    showInStatusBar: 'never' | 'always' | 'onFirstSessionStart';
    internalConsoleOptions: 'neverOpen' | 'openOnSessionStart' | 'openOnFirstSessionStart';
    extensionHostDebugAdapter: boolean;
    enableAllHovers: boolean;
    showSubSessionsInToolBar: boolean;
    closeReadonlyTabsOnEnd: boolean;
    console: {
        fontSize: number;
        fontFamily: string;
        lineHeight: number;
        wordWrap: boolean;
        closeOnEnd: boolean;
        collapseIdenticalLines: boolean;
        historySuggestions: boolean;
        acceptSuggestionOnEnter: 'off' | 'on';
    };
    focusWindowOnBreak: boolean;
    focusEditorOnBreak: boolean;
    onTaskErrors: 'debugAnyway' | 'showErrors' | 'prompt' | 'abort';
    showBreakpointsInOverviewRuler: boolean;
    showInlineBreakpointCandidates: boolean;
    confirmOnExit: 'always' | 'never';
    disassemblyView: {
        showSourceCode: boolean;
    };
    autoExpandLazyVariables: 'auto' | 'off' | 'on';
    enableStatusBarColor: boolean;
    showVariableTypes: boolean;
}
export interface IGlobalConfig {
    version: string;
    compounds: ICompound[];
    configurations: IConfig[];
}
interface IEnvConfig {
    internalConsoleOptions?: 'neverOpen' | 'openOnSessionStart' | 'openOnFirstSessionStart';
    preRestartTask?: string | ITaskIdentifier;
    postRestartTask?: string | ITaskIdentifier;
    preLaunchTask?: string | ITaskIdentifier;
    postDebugTask?: string | ITaskIdentifier;
    debugServer?: number;
    noDebug?: boolean;
    suppressMultipleSessionWarning?: boolean;
}
export interface IConfigPresentation {
    hidden?: boolean;
    group?: string;
    order?: number;
}
export interface IConfig extends IEnvConfig {
    type: string;
    request: string;
    name: string;
    presentation?: IConfigPresentation;
    windows?: IEnvConfig;
    osx?: IEnvConfig;
    linux?: IEnvConfig;
    __configurationTarget?: ConfigurationTarget;
    __sessionId?: string;
    __restart?: any;
    __autoAttach?: boolean;
    port?: number;
}
export interface ICompound {
    name: string;
    stopAll?: boolean;
    preLaunchTask?: string | ITaskIdentifier;
    configurations: (string | {
        name: string;
        folder: string;
    })[];
    presentation?: IConfigPresentation;
}
export interface IDebugAdapter extends IDisposable {
    readonly onError: Event<Error>;
    readonly onExit: Event<number | null>;
    onRequest(callback: (request: DebugProtocol.Request) => void): void;
    onEvent(callback: (event: DebugProtocol.Event) => void): void;
    startSession(): Promise<void>;
    sendMessage(message: DebugProtocol.ProtocolMessage): void;
    sendResponse(response: DebugProtocol.Response): void;
    sendRequest(command: string, args: any, clb: (result: DebugProtocol.Response) => void, timeout?: number): number;
    stopSession(): Promise<void>;
}
export interface IDebugAdapterFactory extends ITerminalLauncher {
    createDebugAdapter(session: IDebugSession): IDebugAdapter;
    substituteVariables(folder: IWorkspaceFolder | undefined, config: IConfig): Promise<IConfig>;
}
export interface IDebugAdapterExecutableOptions {
    cwd?: string;
    env?: {
        [key: string]: string;
    };
}
export interface IDebugAdapterExecutable {
    readonly type: 'executable';
    readonly command: string;
    readonly args: string[];
    readonly options?: IDebugAdapterExecutableOptions;
}
export interface IDebugAdapterServer {
    readonly type: 'server';
    readonly port: number;
    readonly host?: string;
}
export interface IDebugAdapterNamedPipeServer {
    readonly type: 'pipeServer';
    readonly path: string;
}
export interface IDebugAdapterInlineImpl extends IDisposable {
    readonly onDidSendMessage: Event<DebugProtocol.Message>;
    handleMessage(message: DebugProtocol.Message): void;
}
export interface IDebugAdapterImpl {
    readonly type: 'implementation';
}
export type IAdapterDescriptor = IDebugAdapterExecutable | IDebugAdapterServer | IDebugAdapterNamedPipeServer | IDebugAdapterImpl;
export interface IPlatformSpecificAdapterContribution {
    program?: string;
    args?: string[];
    runtime?: string;
    runtimeArgs?: string[];
}
export interface IDebuggerContribution extends IPlatformSpecificAdapterContribution {
    type: string;
    label?: string;
    win?: IPlatformSpecificAdapterContribution;
    winx86?: IPlatformSpecificAdapterContribution;
    windows?: IPlatformSpecificAdapterContribution;
    osx?: IPlatformSpecificAdapterContribution;
    linux?: IPlatformSpecificAdapterContribution;
    aiKey?: string;
    languages?: string[];
    configurationAttributes?: any;
    initialConfigurations?: any[];
    configurationSnippets?: IJSONSchemaSnippet[];
    variables?: {
        [key: string]: string;
    };
    when?: string;
    hiddenWhen?: string;
    deprecated?: string;
    strings?: {
        [key in DebuggerString]: string;
    };
}
export interface IBreakpointContribution {
    language: string;
    when?: string;
}
export declare enum DebugConfigurationProviderTriggerKind {
    /**
     *	`DebugConfigurationProvider.provideDebugConfigurations` is called to provide the initial debug configurations for a newly created launch.json.
     */
    Initial = 1,
    /**
     * `DebugConfigurationProvider.provideDebugConfigurations` is called to provide dynamically generated debug configurations when the user asks for them through the UI (e.g. via the "Select and Start Debugging" command).
     */
    Dynamic = 2
}
export interface IDebugConfigurationProvider {
    readonly type: string;
    readonly triggerKind: DebugConfigurationProviderTriggerKind;
    resolveDebugConfiguration?(folderUri: uri | undefined, debugConfiguration: IConfig, token: CancellationToken): Promise<IConfig | null | undefined>;
    resolveDebugConfigurationWithSubstitutedVariables?(folderUri: uri | undefined, debugConfiguration: IConfig, token: CancellationToken): Promise<IConfig | null | undefined>;
    provideDebugConfigurations?(folderUri: uri | undefined, token: CancellationToken): Promise<IConfig[]>;
}
export interface IDebugAdapterDescriptorFactory {
    readonly type: string;
    createDebugAdapterDescriptor(session: IDebugSession): Promise<IAdapterDescriptor>;
}
interface ITerminalLauncher {
    runInTerminal(args: DebugProtocol.RunInTerminalRequestArguments, sessionId: string): Promise<number | undefined>;
}
export interface IConfigurationManager {
    /**
     * Returns an object containing the selected launch configuration and the selected configuration name. Both these fields can be null (no folder workspace).
     */
    readonly selectedConfiguration: {
        launch: ILaunch | undefined;
        getConfig: () => Promise<IConfig | undefined>;
        name: string | undefined;
        type: string | undefined;
    };
    selectConfiguration(launch: ILaunch | undefined, name?: string, config?: IConfig, dynamicConfigOptions?: {
        type?: string;
    }): Promise<void>;
    getLaunches(): ReadonlyArray<ILaunch>;
    getLaunch(workspaceUri: uri | undefined): ILaunch | undefined;
    getAllConfigurations(): {
        launch: ILaunch;
        name: string;
        presentation?: IConfigPresentation;
    }[];
    removeRecentDynamicConfigurations(name: string, type: string): void;
    getRecentDynamicConfigurations(): {
        name: string;
        type: string;
    }[];
    /**
     * Allows to register on change of selected debug configuration.
     */
    onDidSelectConfiguration: Event<void>;
    /**
     * Allows to register on change of selected debug configuration.
     */
    onDidChangeConfigurationProviders: Event<void>;
    hasDebugConfigurationProvider(debugType: string, triggerKind?: DebugConfigurationProviderTriggerKind): boolean;
    getDynamicProviders(): Promise<{
        label: string;
        type: string;
        pick: () => Promise<{
            launch: ILaunch;
            config: IConfig;
        } | undefined>;
    }[]>;
    registerDebugConfigurationProvider(debugConfigurationProvider: IDebugConfigurationProvider): IDisposable;
    unregisterDebugConfigurationProvider(debugConfigurationProvider: IDebugConfigurationProvider): void;
    resolveConfigurationByProviders(folderUri: uri | undefined, type: string | undefined, debugConfiguration: any, token: CancellationToken): Promise<any>;
}
export declare enum DebuggerString {
    UnverifiedBreakpoints = "unverifiedBreakpoints"
}
export interface IAdapterManager {
    onDidRegisterDebugger: Event<void>;
    hasEnabledDebuggers(): boolean;
    getDebugAdapterDescriptor(session: IDebugSession): Promise<IAdapterDescriptor | undefined>;
    getDebuggerLabel(type: string): string | undefined;
    someDebuggerInterestedInLanguage(language: string): boolean;
    getDebugger(type: string): IDebuggerMetadata | undefined;
    activateDebuggers(activationEvent: string, debugType?: string): Promise<void>;
    registerDebugAdapterFactory(debugTypes: string[], debugAdapterFactory: IDebugAdapterFactory): IDisposable;
    createDebugAdapter(session: IDebugSession): IDebugAdapter | undefined;
    registerDebugAdapterDescriptorFactory(debugAdapterDescriptorFactory: IDebugAdapterDescriptorFactory): IDisposable;
    unregisterDebugAdapterDescriptorFactory(debugAdapterDescriptorFactory: IDebugAdapterDescriptorFactory): void;
    substituteVariables(debugType: string, folder: IWorkspaceFolder | undefined, config: IConfig): Promise<IConfig>;
    runInTerminal(debugType: string, args: DebugProtocol.RunInTerminalRequestArguments, sessionId: string): Promise<number | undefined>;
    getEnabledDebugger(type: string): (IDebugger & IDebuggerMetadata) | undefined;
    guessDebugger(gettingConfigurations: boolean): Promise<(IDebugger & IDebuggerMetadata) | undefined>;
    get onDidDebuggersExtPointRead(): Event<void>;
}
export interface ILaunch {
    /**
     * Resource pointing to the launch.json this object is wrapping.
     */
    readonly uri: uri;
    /**
     * Name of the launch.
     */
    readonly name: string;
    /**
     * Workspace of the launch. Can be undefined.
     */
    readonly workspace: IWorkspaceFolder | undefined;
    /**
     * Should this launch be shown in the debug dropdown.
     */
    readonly hidden: boolean;
    /**
     * Returns a configuration with the specified name.
     * Returns undefined if there is no configuration with the specified name.
     */
    getConfiguration(name: string): IConfig | undefined;
    /**
     * Returns a compound with the specified name.
     * Returns undefined if there is no compound with the specified name.
     */
    getCompound(name: string): ICompound | undefined;
    /**
     * Returns the names of all configurations and compounds.
     * Ignores configurations which are invalid.
     */
    getConfigurationNames(ignoreCompoundsAndPresentation?: boolean): string[];
    /**
     * Opens the launch.json file. Creates if it does not exist.
     */
    openConfigFile(options: {
        preserveFocus: boolean;
        type?: string;
        suppressInitialConfigs?: boolean;
    }, token?: CancellationToken): Promise<{
        editor: IEditorPane | null;
        created: boolean;
    }>;
}
export declare const IDebugService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IDebugService>;
export interface IDebugService {
    readonly _serviceBrand: undefined;
    /**
     * Gets the current debug state.
     */
    readonly state: State;
    readonly initializingOptions?: IDebugSessionOptions | undefined;
    /**
     * Allows to register on debug state changes.
     */
    onDidChangeState: Event<State>;
    /**
     * Allows to register on sessions about to be created (not yet fully initialised).
     * This is fired exactly one time for any given session.
     */
    onWillNewSession: Event<IDebugSession>;
    /**
     * Fired when a new debug session is started. This may fire multiple times
     * for a single session due to restarts.
     */
    onDidNewSession: Event<IDebugSession>;
    /**
     * Allows to register on end session events.
     *
     * Contains a boolean indicating whether the session will restart. If restart
     * is true, the session should not considered to be dead yet.
     */
    onDidEndSession: Event<{
        session: IDebugSession;
        restart: boolean;
    }>;
    /**
     * Gets the configuration manager.
     */
    getConfigurationManager(): IConfigurationManager;
    /**
     * Gets the adapter manager.
     */
    getAdapterManager(): IAdapterManager;
    /**
     * Sets the focused stack frame and evaluates all expressions against the newly focused stack frame,
     */
    focusStackFrame(focusedStackFrame: IStackFrame | undefined, thread?: IThread, session?: IDebugSession, options?: {
        explicit?: boolean;
        preserveFocus?: boolean;
        sideBySide?: boolean;
        pinned?: boolean;
    }): Promise<void>;
    /**
     * Returns true if breakpoints can be set for a given editor model. Depends on mode.
     */
    canSetBreakpointsIn(model: EditorIModel): boolean;
    /**
     * Adds new breakpoints to the model for the file specified with the uri. Notifies debug adapter of breakpoint changes.
     */
    addBreakpoints(uri: uri, rawBreakpoints: IBreakpointData[], ariaAnnounce?: boolean): Promise<IBreakpoint[]>;
    /**
     * Updates the breakpoints.
     */
    updateBreakpoints(originalUri: uri, data: Map<string, IBreakpointUpdateData>, sendOnResourceSaved: boolean): Promise<void>;
    /**
     * Enables or disables all breakpoints. If breakpoint is passed only enables or disables the passed breakpoint.
     * Notifies debug adapter of breakpoint changes.
     */
    enableOrDisableBreakpoints(enable: boolean, breakpoint?: IEnablement): Promise<void>;
    /**
     * Sets the global activated property for all breakpoints.
     * Notifies debug adapter of breakpoint changes.
     */
    setBreakpointsActivated(activated: boolean): Promise<void>;
    /**
     * Removes all breakpoints. If id is passed only removes the breakpoint associated with that id.
     * Notifies debug adapter of breakpoint changes.
     */
    removeBreakpoints(id?: string): Promise<any>;
    /**
     * Adds a new function breakpoint for the given name.
     */
    addFunctionBreakpoint(opts?: IFunctionBreakpointOptions, id?: string): void;
    /**
     * Updates an already existing function breakpoint.
     * Notifies debug adapter of breakpoint changes.
     */
    updateFunctionBreakpoint(id: string, update: {
        name?: string;
        hitCondition?: string;
        condition?: string;
    }): Promise<void>;
    /**
     * Removes all function breakpoints. If id is passed only removes the function breakpoint with the passed id.
     * Notifies debug adapter of breakpoint changes.
     */
    removeFunctionBreakpoints(id?: string): Promise<void>;
    /**
     * Adds a new data breakpoint.
     */
    addDataBreakpoint(opts: IDataBreakpointOptions): Promise<void>;
    /**
     * Updates an already existing data breakpoint.
     * Notifies debug adapter of breakpoint changes.
     */
    updateDataBreakpoint(id: string, update: {
        hitCondition?: string;
        condition?: string;
    }): Promise<void>;
    /**
     * Removes all data breakpoints. If id is passed only removes the data breakpoint with the passed id.
     * Notifies debug adapter of breakpoint changes.
     */
    removeDataBreakpoints(id?: string): Promise<void>;
    /**
     * Adds a new instruction breakpoint.
     */
    addInstructionBreakpoint(opts: IInstructionBreakpointOptions): Promise<void>;
    /**
     * Removes all instruction breakpoints. If address is passed only removes the instruction breakpoint with the passed address.
     * The address should be the address string supplied by the debugger from the "Disassemble" request.
     * Notifies debug adapter of breakpoint changes.
     */
    removeInstructionBreakpoints(instructionReference?: string, offset?: number): Promise<void>;
    setExceptionBreakpointCondition(breakpoint: IExceptionBreakpoint, condition: string | undefined): Promise<void>;
    /**
     * Creates breakpoints based on the sesison filter options. This will create
     * disabled breakpoints (or enabled, if the filter indicates it's a default)
     * for each filter provided in the session.
     */
    setExceptionBreakpointsForSession(session: IDebugSession, filters: DebugProtocol.ExceptionBreakpointsFilter[]): void;
    /**
     * Sends all breakpoints to the passed session.
     * If session is not passed, sends all breakpoints to each session.
     */
    sendAllBreakpoints(session?: IDebugSession): Promise<any>;
    /**
     * Sends breakpoints of the given source to the passed session.
     */
    sendBreakpoints(modelUri: uri, sourceModified?: boolean, session?: IDebugSession): Promise<any>;
    /**
     * Adds a new watch expression and evaluates it against the debug adapter.
     */
    addWatchExpression(name?: string): void;
    /**
     * Renames a watch expression and evaluates it against the debug adapter.
     */
    renameWatchExpression(id: string, newName: string): void;
    /**
     * Moves a watch expression to a new possition. Used for reordering watch expressions.
     */
    moveWatchExpression(id: string, position: number): void;
    /**
     * Removes all watch expressions. If id is passed only removes the watch expression with the passed id.
     */
    removeWatchExpressions(id?: string): void;
    /**
     * Starts debugging. If the configOrName is not passed uses the selected configuration in the debug dropdown.
     * Also saves all files, manages if compounds are present in the configuration
     * and resolveds configurations via DebugConfigurationProviders.
     *
     * Returns true if the start debugging was successful. For compound launches, all configurations have to start successfully for it to return success.
     * On errors the startDebugging will throw an error, however some error and cancelations are handled and in that case will simply return false.
     */
    startDebugging(launch: ILaunch | undefined, configOrName?: IConfig | string, options?: IDebugSessionOptions, saveBeforeStart?: boolean): Promise<boolean>;
    /**
     * Restarts a session or creates a new one if there is no active session.
     */
    restartSession(session: IDebugSession, restartData?: any): Promise<any>;
    /**
     * Stops the session. If no session is specified then all sessions are stopped.
     */
    stopSession(session: IDebugSession | undefined, disconnect?: boolean, suspend?: boolean): Promise<any>;
    /**
     * Makes unavailable all sources with the passed uri. Source will appear as grayed out in callstack view.
     */
    sourceIsNotAvailable(uri: uri): void;
    /**
     * Gets the current debug model.
     */
    getModel(): IDebugModel;
    /**
     * Gets the current view model.
     */
    getViewModel(): IViewModel;
    /**
     * Resumes execution and pauses until the given position is reached.
     */
    runTo(uri: uri, lineNumber: number, column?: number): Promise<void>;
}
export declare const enum BreakpointWidgetContext {
    CONDITION = 0,
    HIT_COUNT = 1,
    LOG_MESSAGE = 2,
    TRIGGER_POINT = 3
}
export interface IDebugEditorContribution extends editorCommon.IEditorContribution {
    showHover(range: Position, focus: boolean): Promise<void>;
    addLaunchConfiguration(): Promise<any>;
    closeExceptionWidget(): void;
}
export interface IBreakpointEditorContribution extends editorCommon.IEditorContribution {
    showBreakpointWidget(lineNumber: number, column: number | undefined, context?: BreakpointWidgetContext): void;
    closeBreakpointWidget(): void;
    getContextMenuActionsAtPosition(lineNumber: number, model: EditorIModel): IAction[];
}
export interface IReplConfiguration {
    readonly fontSize: number;
    readonly fontFamily: string;
    readonly lineHeight: number;
    readonly cssLineHeight: string;
    readonly backgroundColor: Color | undefined;
    readonly fontSizeForTwistie: number;
}
export interface IReplOptions {
    readonly replConfiguration: IReplConfiguration;
}
export interface IDebugVisualizationContext {
    variable: DebugProtocol.Variable;
    containerId?: number;
    frameId?: number;
    threadId: number;
    sessionId: string;
}
export declare const enum DebugVisualizationType {
    Command = 0,
    Tree = 1
}
export type MainThreadDebugVisualization = {
    type: DebugVisualizationType.Command;
} | {
    type: DebugVisualizationType.Tree;
    id: string;
};
export declare const enum DebugTreeItemCollapsibleState {
    None = 0,
    Collapsed = 1,
    Expanded = 2
}
export interface IDebugVisualizationTreeItem {
    id: number;
    label: string;
    description?: string;
    collapsibleState: DebugTreeItemCollapsibleState;
    contextValue?: string;
    canEdit?: boolean;
}
export declare namespace IDebugVisualizationTreeItem {
    type Serialized = IDebugVisualizationTreeItem;
    const deserialize: (v: Serialized) => IDebugVisualizationTreeItem;
    const serialize: (item: IDebugVisualizationTreeItem) => Serialized;
}
export interface IDebugVisualization {
    id: number;
    name: string;
    iconPath: {
        light?: URI;
        dark: URI;
    } | undefined;
    iconClass: string | undefined;
    visualization: MainThreadDebugVisualization | undefined;
}
export declare namespace IDebugVisualization {
    interface Serialized {
        id: number;
        name: string;
        iconPath?: {
            light?: UriComponents;
            dark: UriComponents;
        };
        iconClass?: string;
        visualization?: MainThreadDebugVisualization;
    }
    const deserialize: (v: Serialized) => IDebugVisualization;
    const serialize: (visualizer: IDebugVisualization) => Serialized;
}
export {};
