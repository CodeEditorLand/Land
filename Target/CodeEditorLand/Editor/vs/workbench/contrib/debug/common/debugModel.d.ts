import { VSBuffer } from '../../../../base/common/buffer.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI, URI as uri } from '../../../../base/common/uri.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IEditorPane } from '../../../common/editor.js';
import { DataBreakpointSource, IBaseBreakpoint, IBreakpoint, IBreakpointData, IBreakpointUpdateData, IBreakpointsChangeEvent, IDataBreakpoint, IDebugEvaluatePosition, IDebugModel, IDebugSession, IDebugVisualizationTreeItem, IEnablement, IExceptionBreakpoint, IExceptionInfo, IExpression, IExpressionContainer, IFunctionBreakpoint, IInstructionBreakpoint, IMemoryInvalidationEvent, IMemoryRegion, IRawModelUpdate, IRawStoppedDetails, IScope, IStackFrame, IThread, ITreeElement, MemoryRange } from './debug.js';
import { Source } from './debugSource.js';
import { DebugStorage } from './debugStorage.js';
import { IDebugVisualizerService } from './debugVisualizers.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
export declare class ExpressionContainer implements IExpressionContainer {
    protected session: IDebugSession | undefined;
    protected readonly threadId: number | undefined;
    private _reference;
    private readonly id;
    namedVariables: number | undefined;
    indexedVariables: number | undefined;
    memoryReference: string | undefined;
    private startOfVariables;
    presentationHint: DebugProtocol.VariablePresentationHint | undefined;
    valueLocationReference: number | undefined;
    static readonly allValues: Map<string, string>;
    private static readonly BASE_CHUNK_SIZE;
    type: string | undefined;
    valueChanged: boolean;
    private _value;
    protected children?: Promise<IExpression[]>;
    constructor(session: IDebugSession | undefined, threadId: number | undefined, _reference: number | undefined, id: string, namedVariables?: number | undefined, indexedVariables?: number | undefined, memoryReference?: string | undefined, startOfVariables?: number | undefined, presentationHint?: DebugProtocol.VariablePresentationHint | undefined, valueLocationReference?: number | undefined);
    get reference(): number | undefined;
    set reference(value: number | undefined);
    evaluateLazy(): Promise<void>;
    protected adoptLazyResponse(response: DebugProtocol.Variable): void;
    getChildren(): Promise<IExpression[]>;
    private doGetChildren;
    getId(): string;
    getSession(): IDebugSession | undefined;
    get value(): string;
    get hasChildren(): boolean;
    private fetchVariables;
    private get getChildrenInChunks();
    set value(value: string);
    toString(): string;
    evaluateExpression(expression: string, session: IDebugSession | undefined, stackFrame: IStackFrame | undefined, context: string, keepLazyVars?: boolean, location?: IDebugEvaluatePosition): Promise<boolean>;
}
export declare class VisualizedExpression implements IExpression {
    private readonly session;
    private readonly visualizer;
    readonly treeId: string;
    readonly treeItem: IDebugVisualizationTreeItem;
    readonly original?: Variable | undefined;
    errorMessage?: string;
    private readonly id;
    evaluateLazy(): Promise<void>;
    getChildren(): Promise<IExpression[]>;
    getId(): string;
    get name(): string;
    get value(): string;
    get hasChildren(): boolean;
    constructor(session: IDebugSession | undefined, visualizer: IDebugVisualizerService, treeId: string, treeItem: IDebugVisualizationTreeItem, original?: Variable | undefined);
    getSession(): IDebugSession | undefined;
    /** Edits the value, sets the {@link errorMessage} and returns false if unsuccessful */
    edit(newValue: string): Promise<boolean>;
}
export declare class Expression extends ExpressionContainer implements IExpression {
    name: string;
    static readonly DEFAULT_VALUE: string;
    available: boolean;
    private readonly _onDidChangeValue;
    readonly onDidChangeValue: Event<IExpression>;
    constructor(name: string, id?: string);
    evaluate(session: IDebugSession | undefined, stackFrame: IStackFrame | undefined, context: string, keepLazyVars?: boolean, location?: IDebugEvaluatePosition): Promise<void>;
    toString(): string;
    setExpression(value: string, stackFrame: IStackFrame): Promise<void>;
}
export declare class Variable extends ExpressionContainer implements IExpression {
    readonly parent: IExpressionContainer;
    readonly name: string;
    evaluateName: string | undefined;
    readonly variableMenuContext: string | undefined;
    readonly available: boolean;
    readonly declarationLocationReference: number | undefined;
    errorMessage: string | undefined;
    constructor(session: IDebugSession | undefined, threadId: number | undefined, parent: IExpressionContainer, reference: number | undefined, name: string, evaluateName: string | undefined, value: string | undefined, namedVariables: number | undefined, indexedVariables: number | undefined, memoryReference: string | undefined, presentationHint: DebugProtocol.VariablePresentationHint | undefined, type?: string | undefined, variableMenuContext?: string | undefined, available?: boolean, startOfVariables?: number, idDuplicationIndex?: string, declarationLocationReference?: number | undefined, valueLocationReference?: number | undefined);
    getThreadId(): number | undefined;
    setVariable(value: string, stackFrame: IStackFrame): Promise<any>;
    setExpression(value: string, stackFrame: IStackFrame): Promise<void>;
    toString(): string;
    protected adoptLazyResponse(response: DebugProtocol.Variable): void;
    toDebugProtocolObject(): DebugProtocol.Variable;
}
export declare class Scope extends ExpressionContainer implements IScope {
    readonly stackFrame: IStackFrame;
    readonly name: string;
    expensive: boolean;
    readonly range?: IRange | undefined;
    constructor(stackFrame: IStackFrame, id: number, name: string, reference: number, expensive: boolean, namedVariables?: number, indexedVariables?: number, range?: IRange | undefined);
    toString(): string;
    toDebugProtocolObject(): DebugProtocol.Scope;
}
export declare class ErrorScope extends Scope {
    constructor(stackFrame: IStackFrame, index: number, message: string);
    toString(): string;
}
export declare class StackFrame implements IStackFrame {
    readonly thread: Thread;
    readonly frameId: number;
    readonly source: Source;
    readonly name: string;
    readonly presentationHint: string | undefined;
    readonly range: IRange;
    private readonly index;
    readonly canRestart: boolean;
    readonly instructionPointerReference?: string | undefined;
    private scopes;
    constructor(thread: Thread, frameId: number, source: Source, name: string, presentationHint: string | undefined, range: IRange, index: number, canRestart: boolean, instructionPointerReference?: string | undefined);
    getId(): string;
    getScopes(): Promise<IScope[]>;
    getMostSpecificScopes(range: IRange): Promise<IScope[]>;
    restart(): Promise<void>;
    forgetScopes(): void;
    toString(): string;
    openInEditor(editorService: IEditorService, preserveFocus?: boolean, sideBySide?: boolean, pinned?: boolean): Promise<IEditorPane | undefined>;
    equals(other: IStackFrame): boolean;
}
export declare class Thread implements IThread {
    readonly session: IDebugSession;
    name: string;
    readonly threadId: number;
    private callStack;
    private staleCallStack;
    private callStackCancellationTokens;
    stoppedDetails: IRawStoppedDetails | undefined;
    stopped: boolean;
    reachedEndOfCallStack: boolean;
    lastSteppingGranularity: DebugProtocol.SteppingGranularity | undefined;
    constructor(session: IDebugSession, name: string, threadId: number);
    getId(): string;
    clearCallStack(): void;
    getCallStack(): IStackFrame[];
    getStaleCallStack(): ReadonlyArray<IStackFrame>;
    getTopStackFrame(): IStackFrame | undefined;
    get stateLabel(): string;
    /**
     * Queries the debug adapter for the callstack and returns a promise
     * which completes once the call stack has been retrieved.
     * If the thread is not stopped, it returns a promise to an empty array.
     * Only fetches the first stack frame for performance reasons. Calling this method consecutive times
     * gets the remainder of the call stack.
     */
    fetchCallStack(levels?: number): Promise<void>;
    private getCallStackImpl;
    /**
     * Returns exception info promise if the exception was thrown, otherwise undefined
     */
    get exceptionInfo(): Promise<IExceptionInfo | undefined>;
    next(granularity?: DebugProtocol.SteppingGranularity): Promise<any>;
    stepIn(granularity?: DebugProtocol.SteppingGranularity): Promise<any>;
    stepOut(granularity?: DebugProtocol.SteppingGranularity): Promise<any>;
    stepBack(granularity?: DebugProtocol.SteppingGranularity): Promise<any>;
    continue(): Promise<any>;
    pause(): Promise<any>;
    terminate(): Promise<any>;
    reverseContinue(): Promise<any>;
}
/**
 * Gets a URI to a memory in the given session ID.
 */
export declare const getUriForDebugMemory: (sessionId: string, memoryReference: string, range?: {
    fromOffset: number;
    toOffset: number;
}, displayName?: string) => URI;
export declare class MemoryRegion extends Disposable implements IMemoryRegion {
    private readonly memoryReference;
    private readonly session;
    private readonly invalidateEmitter;
    /** @inheritdoc */
    readonly onDidInvalidate: Event<IMemoryInvalidationEvent>;
    /** @inheritdoc */
    readonly writable: boolean;
    constructor(memoryReference: string, session: IDebugSession);
    read(fromOffset: number, toOffset: number): Promise<MemoryRange[]>;
    write(offset: number, data: VSBuffer): Promise<number>;
    dispose(): void;
    private invalidate;
}
export declare class Enablement implements IEnablement {
    enabled: boolean;
    private readonly id;
    constructor(enabled: boolean, id: string);
    getId(): string;
}
interface IBreakpointSessionData extends DebugProtocol.Breakpoint {
    supportsConditionalBreakpoints: boolean;
    supportsHitConditionalBreakpoints: boolean;
    supportsLogPoints: boolean;
    supportsFunctionBreakpoints: boolean;
    supportsDataBreakpoints: boolean;
    supportsInstructionBreakpoints: boolean;
    sessionId: string;
}
export interface IBaseBreakpointOptions {
    enabled?: boolean;
    hitCondition?: string;
    condition?: string;
    logMessage?: string;
    mode?: string;
    modeLabel?: string;
}
export declare abstract class BaseBreakpoint extends Enablement implements IBaseBreakpoint {
    private sessionData;
    protected data: IBreakpointSessionData | undefined;
    hitCondition: string | undefined;
    condition: string | undefined;
    logMessage: string | undefined;
    mode: string | undefined;
    modeLabel: string | undefined;
    constructor(id: string, opts: IBaseBreakpointOptions);
    setSessionData(sessionId: string, data: IBreakpointSessionData | undefined): void;
    get message(): string | undefined;
    get verified(): boolean;
    get sessionsThatVerified(): string[];
    abstract get supported(): boolean;
    getIdFromAdapter(sessionId: string): number | undefined;
    getDebugProtocolBreakpoint(sessionId: string): DebugProtocol.Breakpoint | undefined;
    toJSON(): IBaseBreakpointOptions & {
        id: string;
    };
}
export interface IBreakpointOptions extends IBaseBreakpointOptions {
    uri: uri;
    lineNumber: number;
    column: number | undefined;
    adapterData: any;
    triggeredBy: string | undefined;
}
export declare class Breakpoint extends BaseBreakpoint implements IBreakpoint {
    private readonly textFileService;
    private readonly uriIdentityService;
    private readonly logService;
    private sessionsDidTrigger?;
    private readonly _uri;
    private _adapterData;
    private _lineNumber;
    private _column;
    triggeredBy: string | undefined;
    constructor(opts: IBreakpointOptions, textFileService: ITextFileService, uriIdentityService: IUriIdentityService, logService: ILogService, id?: string);
    toDAP(): DebugProtocol.SourceBreakpoint;
    get originalUri(): URI;
    get lineNumber(): number;
    get verified(): boolean;
    get pending(): boolean;
    get uri(): uri;
    get column(): number | undefined;
    get message(): string | undefined;
    get adapterData(): any;
    get endLineNumber(): number | undefined;
    get endColumn(): number | undefined;
    get sessionAgnosticData(): {
        lineNumber: number;
        column: number | undefined;
    };
    get supported(): boolean;
    setSessionData(sessionId: string, data: IBreakpointSessionData | undefined): void;
    toJSON(): IBreakpointOptions & {
        id: string;
    };
    toString(): string;
    setSessionDidTrigger(sessionId: string, didTrigger?: boolean): void;
    getSessionDidTrigger(sessionId: string): boolean;
    update(data: IBreakpointUpdateData): void;
}
export interface IFunctionBreakpointOptions extends IBaseBreakpointOptions {
    name: string;
}
export declare class FunctionBreakpoint extends BaseBreakpoint implements IFunctionBreakpoint {
    name: string;
    constructor(opts: IFunctionBreakpointOptions, id?: string);
    toDAP(): DebugProtocol.FunctionBreakpoint;
    toJSON(): IFunctionBreakpointOptions & {
        id: string;
    };
    get supported(): boolean;
    toString(): string;
}
export interface IDataBreakpointOptions extends IBaseBreakpointOptions {
    description: string;
    src: DataBreakpointSource;
    canPersist: boolean;
    initialSessionData?: {
        session: IDebugSession;
        dataId: string;
    };
    accessTypes: DebugProtocol.DataBreakpointAccessType[] | undefined;
    accessType: DebugProtocol.DataBreakpointAccessType;
}
export declare class DataBreakpoint extends BaseBreakpoint implements IDataBreakpoint {
    private readonly sessionDataIdForAddr;
    readonly description: string;
    readonly src: DataBreakpointSource;
    readonly canPersist: boolean;
    readonly accessTypes: DebugProtocol.DataBreakpointAccessType[] | undefined;
    readonly accessType: DebugProtocol.DataBreakpointAccessType;
    constructor(opts: IDataBreakpointOptions, id?: string);
    toDAP(session: IDebugSession): Promise<DebugProtocol.DataBreakpoint | undefined>;
    toJSON(): IDataBreakpointOptions & {
        id: string;
    };
    get supported(): boolean;
    toString(): string;
}
export interface IExceptionBreakpointOptions extends IBaseBreakpointOptions {
    filter: string;
    label: string;
    supportsCondition: boolean;
    description: string | undefined;
    conditionDescription: string | undefined;
    fallback?: boolean;
}
export declare class ExceptionBreakpoint extends BaseBreakpoint implements IExceptionBreakpoint {
    private supportedSessions;
    readonly filter: string;
    readonly label: string;
    readonly supportsCondition: boolean;
    readonly description: string | undefined;
    readonly conditionDescription: string | undefined;
    private fallback;
    constructor(opts: IExceptionBreakpointOptions, id?: string);
    toJSON(): IExceptionBreakpointOptions & {
        id: string;
    };
    setSupportedSession(sessionId: string, supported: boolean): void;
    /**
     * Used to specify which breakpoints to show when no session is specified.
     * Useful when no session is active and we want to show the exception breakpoints from the last session.
     */
    setFallback(isFallback: boolean): void;
    get supported(): boolean;
    /**
     * Checks if the breakpoint is applicable for the specified session.
     * If sessionId is undefined, returns true if this breakpoint is a fallback breakpoint.
     */
    isSupportedSession(sessionId?: string): boolean;
    matches(filter: DebugProtocol.ExceptionBreakpointsFilter): boolean;
    toString(): string;
}
export interface IInstructionBreakpointOptions extends IBaseBreakpointOptions {
    instructionReference: string;
    offset: number;
    canPersist: boolean;
    address: bigint;
}
export declare class InstructionBreakpoint extends BaseBreakpoint implements IInstructionBreakpoint {
    readonly instructionReference: string;
    readonly offset: number;
    readonly canPersist: boolean;
    readonly address: bigint;
    constructor(opts: IInstructionBreakpointOptions, id?: string);
    toDAP(): DebugProtocol.InstructionBreakpoint;
    toJSON(): IInstructionBreakpointOptions & {
        id: string;
    };
    get supported(): boolean;
    toString(): string;
}
export declare class ThreadAndSessionIds implements ITreeElement {
    sessionId: string;
    threadId: number;
    constructor(sessionId: string, threadId: number);
    getId(): string;
}
export declare class DebugModel extends Disposable implements IDebugModel {
    private readonly textFileService;
    private readonly uriIdentityService;
    private readonly logService;
    private sessions;
    private schedulers;
    private breakpointsActivated;
    private readonly _onDidChangeBreakpoints;
    private readonly _onDidChangeCallStack;
    private readonly _onDidChangeWatchExpressions;
    private readonly _onDidChangeWatchExpressionValue;
    private readonly _breakpointModes;
    private breakpoints;
    private functionBreakpoints;
    private exceptionBreakpoints;
    private dataBreakpoints;
    private watchExpressions;
    private instructionBreakpoints;
    constructor(debugStorage: DebugStorage, textFileService: ITextFileService, uriIdentityService: IUriIdentityService, logService: ILogService);
    getId(): string;
    getSession(sessionId: string | undefined, includeInactive?: boolean): IDebugSession | undefined;
    getSessions(includeInactive?: boolean): IDebugSession[];
    addSession(session: IDebugSession): void;
    get onDidChangeBreakpoints(): Event<IBreakpointsChangeEvent | undefined>;
    get onDidChangeCallStack(): Event<void>;
    get onDidChangeWatchExpressions(): Event<IExpression | undefined>;
    get onDidChangeWatchExpressionValue(): Event<IExpression | undefined>;
    rawUpdate(data: IRawModelUpdate): void;
    clearThreads(id: string, removeThreads: boolean, reference?: number | undefined): void;
    /**
     * Update the call stack and notify the call stack view that changes have occurred.
     */
    fetchCallstack(thread: IThread, levels?: number): Promise<void>;
    refreshTopOfCallstack(thread: Thread, fetchFullStack?: boolean): {
        topCallStack: Promise<void>;
        wholeCallStack: Promise<void>;
    };
    getBreakpoints(filter?: {
        uri?: uri;
        originalUri?: uri;
        lineNumber?: number;
        column?: number;
        enabledOnly?: boolean;
        triggeredOnly?: boolean;
    }): IBreakpoint[];
    getFunctionBreakpoints(): IFunctionBreakpoint[];
    getDataBreakpoints(): IDataBreakpoint[];
    getExceptionBreakpoints(): IExceptionBreakpoint[];
    getExceptionBreakpointsForSession(sessionId?: string): IExceptionBreakpoint[];
    getInstructionBreakpoints(): IInstructionBreakpoint[];
    setExceptionBreakpointsForSession(sessionId: string, filters: DebugProtocol.ExceptionBreakpointsFilter[]): void;
    removeExceptionBreakpointsForSession(sessionId: string): void;
    setExceptionBreakpointFallbackSession(sessionId: string): void;
    setExceptionBreakpointCondition(exceptionBreakpoint: IExceptionBreakpoint, condition: string | undefined): void;
    areBreakpointsActivated(): boolean;
    setBreakpointsActivated(activated: boolean): void;
    addBreakpoints(uri: uri, rawData: IBreakpointData[], fireEvent?: boolean): IBreakpoint[];
    removeBreakpoints(toRemove: IBreakpoint[]): void;
    updateBreakpoints(data: Map<string, IBreakpointUpdateData>): void;
    setBreakpointSessionData(sessionId: string, capabilites: DebugProtocol.Capabilities, data: Map<string, DebugProtocol.Breakpoint> | undefined): void;
    getDebugProtocolBreakpoint(breakpointId: string, sessionId: string): DebugProtocol.Breakpoint | undefined;
    getBreakpointModes(forBreakpointType: 'source' | 'exception' | 'data' | 'instruction'): DebugProtocol.BreakpointMode[];
    registerBreakpointModes(debugType: string, modes: DebugProtocol.BreakpointMode[]): void;
    private sortAndDeDup;
    setEnablement(element: IEnablement, enable: boolean): void;
    enableOrDisableAllBreakpoints(enable: boolean): void;
    addFunctionBreakpoint(opts: IFunctionBreakpointOptions, id?: string): IFunctionBreakpoint;
    updateFunctionBreakpoint(id: string, update: {
        name?: string;
        hitCondition?: string;
        condition?: string;
    }): void;
    removeFunctionBreakpoints(id?: string): void;
    addDataBreakpoint(opts: IDataBreakpointOptions, id?: string): void;
    updateDataBreakpoint(id: string, update: {
        hitCondition?: string;
        condition?: string;
    }): void;
    removeDataBreakpoints(id?: string): void;
    addInstructionBreakpoint(opts: IInstructionBreakpointOptions): void;
    removeInstructionBreakpoints(instructionReference?: string, offset?: number): void;
    getWatchExpressions(): Expression[];
    addWatchExpression(name?: string): IExpression;
    renameWatchExpression(id: string, newName: string): void;
    removeWatchExpressions(id?: string | null): void;
    moveWatchExpression(id: string, position: number): void;
    sourceIsNotAvailable(uri: uri): void;
}
export {};
