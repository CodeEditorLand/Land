import { Event } from '../../../../base/common/event.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IDebugSession, IExpression, IExpressionContainer, IStackFrame, IThread, IViewModel } from './debug.js';
export declare class ViewModel implements IViewModel {
    private contextKeyService;
    firstSessionStart: boolean;
    private _focusedStackFrame;
    private _focusedSession;
    private _focusedThread;
    private selectedExpression;
    private readonly _onDidFocusSession;
    private readonly _onDidFocusThread;
    private readonly _onDidFocusStackFrame;
    private readonly _onDidSelectExpression;
    private readonly _onDidEvaluateLazyExpression;
    private readonly _onWillUpdateViews;
    private readonly _onDidChangeVisualization;
    private readonly visualized;
    private readonly preferredVisualizers;
    private expressionSelectedContextKey;
    private loadedScriptsSupportedContextKey;
    private stepBackSupportedContextKey;
    private focusedSessionIsAttach;
    private focusedSessionIsNoDebug;
    private restartFrameSupportedContextKey;
    private stepIntoTargetsSupported;
    private jumpToCursorSupported;
    private setVariableSupported;
    private setDataBreakpointAtByteSupported;
    private setExpressionSupported;
    private multiSessionDebug;
    private terminateDebuggeeSupported;
    private suspendDebuggeeSupported;
    private disassembleRequestSupported;
    private focusedStackFrameHasInstructionPointerReference;
    constructor(contextKeyService: IContextKeyService);
    getId(): string;
    get focusedSession(): IDebugSession | undefined;
    get focusedThread(): IThread | undefined;
    get focusedStackFrame(): IStackFrame | undefined;
    setFocus(stackFrame: IStackFrame | undefined, thread: IThread | undefined, session: IDebugSession | undefined, explicit: boolean): void;
    get onDidFocusSession(): Event<IDebugSession | undefined>;
    get onDidFocusThread(): Event<{
        thread: IThread | undefined;
        explicit: boolean;
        session: IDebugSession | undefined;
    }>;
    get onDidFocusStackFrame(): Event<{
        stackFrame: IStackFrame | undefined;
        explicit: boolean;
        session: IDebugSession | undefined;
    }>;
    get onDidChangeVisualization(): Event<{
        original: IExpression;
        replacement: IExpression;
    }>;
    getSelectedExpression(): {
        expression: IExpression;
        settingWatch: boolean;
    } | undefined;
    setSelectedExpression(expression: IExpression | undefined, settingWatch: boolean): void;
    get onDidSelectExpression(): Event<{
        expression: IExpression;
        settingWatch: boolean;
    } | undefined>;
    get onDidEvaluateLazyExpression(): Event<IExpressionContainer>;
    updateViews(): void;
    get onWillUpdateViews(): Event<void>;
    isMultiSessionView(): boolean;
    setMultiSessionView(isMultiSessionView: boolean): void;
    setVisualizedExpression(original: IExpression, visualized: IExpression & {
        treeId: string;
    } | undefined): void;
    getVisualizedExpression(expression: IExpression): IExpression | string | undefined;
    evaluateLazyExpression(expression: IExpressionContainer): Promise<void>;
    private getPreferredVisualizedKey;
}
