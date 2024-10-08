import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IPosition, Position } from '../../../../editor/common/core/position.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { ISelection } from '../../../../editor/common/core/selection.js';
import { IEditorContribution } from '../../../../editor/common/editorCommon.js';
import { TextEdit } from '../../../../editor/common/languages.js';
import { IEditorWorkerService } from '../../../../editor/common/services/editorWorker.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IChatService } from '../../chat/common/chatService.js';
import { HunkInformation, Session } from './inlineChatSession.js';
import { INotebookEditorService } from '../../notebook/browser/services/notebookEditorService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IInlineChatSavingService } from './inlineChatSavingService.js';
import { IInlineChatSessionService } from './inlineChatSessionService.js';
export declare const enum State {
    CREATE_SESSION = "CREATE_SESSION",
    INIT_UI = "INIT_UI",
    WAIT_FOR_INPUT = "WAIT_FOR_INPUT",
    SHOW_REQUEST = "SHOW_REQUEST",
    PAUSE = "PAUSE",
    CANCEL = "CANCEL",
    ACCEPT = "DONE"
}
export declare abstract class InlineChatRunOptions {
    initialSelection?: ISelection;
    initialRange?: IRange;
    message?: string;
    autoSend?: boolean;
    existingSession?: Session;
    isUnstashed?: boolean;
    position?: IPosition;
    withIntentDetection?: boolean;
    headless?: boolean;
    static isInlineChatRunOptions(options: any): options is InlineChatRunOptions;
}
export declare class InlineChatController implements IEditorContribution {
    private readonly _editor;
    private readonly _instaService;
    private readonly _inlineChatSessionService;
    private readonly _inlineChatSavingService;
    private readonly _editorWorkerService;
    private readonly _logService;
    private readonly _configurationService;
    private readonly _dialogService;
    private readonly _chatService;
    private readonly _editorService;
    static get(editor: ICodeEditor): InlineChatController | null;
    private _isDisposed;
    private readonly _store;
    private readonly _ui;
    private readonly _ctxVisible;
    private readonly _ctxEditing;
    private readonly _ctxResponseType;
    private readonly _ctxUserDidEdit;
    private readonly _ctxRequestInProgress;
    private readonly _ctxResponse;
    private readonly _messages;
    protected readonly _onDidEnterState: Emitter<State>;
    readonly onDidEnterState: Event<State>;
    private readonly _onWillStartSession;
    readonly onWillStartSession: Event<void>;
    get chatWidget(): import("../../chat/browser/chatWidget.js").ChatWidget;
    private readonly _sessionStore;
    private readonly _stashedSession;
    private _session?;
    private _strategy?;
    constructor(_editor: ICodeEditor, _instaService: IInstantiationService, _inlineChatSessionService: IInlineChatSessionService, _inlineChatSavingService: IInlineChatSavingService, _editorWorkerService: IEditorWorkerService, _logService: ILogService, _configurationService: IConfigurationService, _dialogService: IDialogService, contextKeyService: IContextKeyService, _chatService: IChatService, _editorService: IEditorService, notebookEditorService: INotebookEditorService);
    dispose(): void;
    private _log;
    getMessage(): string | undefined;
    getId(): string;
    private _getMode;
    getWidgetPosition(): Position | undefined;
    private _currentRun?;
    run(options?: InlineChatRunOptions | undefined): Promise<void>;
    protected _nextState(state: State, options: InlineChatRunOptions): Promise<void>;
    private [State.CREATE_SESSION];
    private [State.INIT_UI];
    private [State.WAIT_FOR_INPUT];
    private [State.SHOW_REQUEST];
    private [State.PAUSE];
    private [State.ACCEPT];
    private [State.CANCEL];
    private _showWidget;
    private _resetWidget;
    private _updateCtxResponseType;
    private _createChatTextEditGroupState;
    private _makeChanges;
    private _forcedPlaceholder;
    private _updatePlaceholder;
    private _getPlaceholderText;
    showSaveHint(): void;
    acceptInput(): Promise<import("../../chat/common/chatModel.js").IChatResponseModel | undefined>;
    updateInput(text: string, selectAll?: boolean): void;
    cancelCurrentRequest(): void;
    arrowOut(up: boolean): void;
    focus(): void;
    hasFocus(): boolean;
    viewInChat(): Promise<void>;
    acceptSession(): void;
    acceptHunk(hunkInfo?: HunkInformation): void | undefined;
    discardHunk(hunkInfo?: HunkInformation): void | undefined;
    toggleDiff(hunkInfo?: HunkInformation): void | undefined;
    moveHunk(next: boolean): void;
    cancelSession(): Promise<void>;
    finishExistingSession(): void;
    reportIssue(): void;
    unstashLastSession(): Session | undefined;
    joinCurrentRun(): Promise<void> | undefined;
    reviewEdits(anchor: IRange, stream: AsyncIterable<TextEdit>, token: CancellationToken): Promise<boolean>;
}
