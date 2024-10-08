/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var InlineChatController_1;
import * as aria from '../../../../base/browser/ui/aria/aria.js';
import { Barrier, DeferredPromise, Queue } from '../../../../base/common/async.js';
import { CancellationToken, CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { Lazy } from '../../../../base/common/lazy.js';
import { DisposableStore, MutableDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { MovingAverage } from '../../../../base/common/numbers.js';
import { isEqual } from '../../../../base/common/resources.js';
import { StopWatch } from '../../../../base/common/stopwatch.js';
import { assertType } from '../../../../base/common/types.js';
import { generateUuid } from '../../../../base/common/uuid.js';
import { isCodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { Position } from '../../../../editor/common/core/position.js';
import { Range } from '../../../../editor/common/core/range.js';
import { Selection } from '../../../../editor/common/core/selection.js';
import { TextEdit } from '../../../../editor/common/languages.js';
import { IEditorWorkerService } from '../../../../editor/common/services/editorWorker.js';
import { DefaultModelSHA1Computer } from '../../../../editor/common/services/modelService.js';
import { InlineCompletionsController } from '../../../../editor/contrib/inlineCompletions/browser/controller/inlineCompletionsController.js';
import { MessageController } from '../../../../editor/contrib/message/browser/messageController.js';
import { localize } from '../../../../nls.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { showChatView } from '../../chat/browser/chat.js';
import { ChatAgentLocation } from '../../chat/common/chatAgents.js';
import { IChatService } from '../../chat/common/chatService.js';
import { Session } from './inlineChatSession.js';
import { InlineChatError } from './inlineChatSessionServiceImpl.js';
import { LiveStrategy, PreviewStrategy } from './inlineChatStrategies.js';
import { CTX_INLINE_CHAT_EDITING, CTX_INLINE_CHAT_REQUEST_IN_PROGRESS, CTX_INLINE_CHAT_RESPONSE_TYPE, CTX_INLINE_CHAT_USER_DID_EDIT, CTX_INLINE_CHAT_VISIBLE, INLINE_CHAT_ID } from '../common/inlineChat.js';
import { INotebookEditorService } from '../../notebook/browser/services/notebookEditorService.js';
import { IEditorService, SIDE_GROUP } from '../../../services/editor/common/editorService.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IInlineChatSavingService } from './inlineChatSavingService.js';
import { IInlineChatSessionService } from './inlineChatSessionService.js';
import { InlineChatZoneWidget } from './inlineChatZoneWidget.js';
import { CONTEXT_RESPONSE, CONTEXT_RESPONSE_ERROR } from '../../chat/common/chatContextKeys.js';
export class InlineChatRunOptions {
    static isInlineChatRunOptions(options) {
        const { initialSelection, initialRange, message, autoSend, position, existingSession } = options;
        if (typeof message !== 'undefined' && typeof message !== 'string'
            || typeof autoSend !== 'undefined' && typeof autoSend !== 'boolean'
            || typeof initialRange !== 'undefined' && !Range.isIRange(initialRange)
            || typeof initialSelection !== 'undefined' && !Selection.isISelection(initialSelection)
            || typeof position !== 'undefined' && !Position.isIPosition(position)
            || typeof existingSession !== 'undefined' && !(existingSession instanceof Session)) {
            return false;
        }
        return true;
    }
}
let InlineChatController = InlineChatController_1 = class InlineChatController {
    static get(editor) {
        return editor.getContribution(INLINE_CHAT_ID);
    }
    get chatWidget() {
        return this._ui.value.widget.chatWidget;
    }
    constructor(_editor, _instaService, _inlineChatSessionService, _inlineChatSavingService, _editorWorkerService, _logService, _configurationService, _dialogService, contextKeyService, _chatService, _editorService, notebookEditorService) {
        this._editor = _editor;
        this._instaService = _instaService;
        this._inlineChatSessionService = _inlineChatSessionService;
        this._inlineChatSavingService = _inlineChatSavingService;
        this._editorWorkerService = _editorWorkerService;
        this._logService = _logService;
        this._configurationService = _configurationService;
        this._dialogService = _dialogService;
        this._chatService = _chatService;
        this._editorService = _editorService;
        this._isDisposed = false;
        this._store = new DisposableStore();
        this._messages = this._store.add(new Emitter());
        this._onDidEnterState = this._store.add(new Emitter());
        this.onDidEnterState = this._onDidEnterState.event;
        this._onWillStartSession = this._store.add(new Emitter());
        this.onWillStartSession = this._onWillStartSession.event;
        this._sessionStore = this._store.add(new DisposableStore());
        this._stashedSession = this._store.add(new MutableDisposable());
        this._forcedPlaceholder = undefined;
        this._ctxVisible = CTX_INLINE_CHAT_VISIBLE.bindTo(contextKeyService);
        this._ctxEditing = CTX_INLINE_CHAT_EDITING.bindTo(contextKeyService);
        this._ctxUserDidEdit = CTX_INLINE_CHAT_USER_DID_EDIT.bindTo(contextKeyService);
        this._ctxResponseType = CTX_INLINE_CHAT_RESPONSE_TYPE.bindTo(contextKeyService);
        this._ctxRequestInProgress = CTX_INLINE_CHAT_REQUEST_IN_PROGRESS.bindTo(contextKeyService);
        this._ctxResponse = CONTEXT_RESPONSE.bindTo(contextKeyService);
        CONTEXT_RESPONSE_ERROR.bindTo(contextKeyService);
        this._ui = new Lazy(() => {
            const location = {
                location: ChatAgentLocation.Editor,
                resolveData: () => {
                    assertType(this._editor.hasModel());
                    assertType(this._session);
                    return {
                        type: ChatAgentLocation.Editor,
                        selection: this._editor.getSelection(),
                        document: this._session.textModelN.uri,
                        wholeRange: this._session?.wholeRange.trackedInitialRange,
                    };
                }
            };
            // inline chat in notebooks
            // check if this editor is part of a notebook editor
            // and iff so, use the notebook location but keep the resolveData
            // talk about editor data
            for (const notebookEditor of notebookEditorService.listNotebookEditors()) {
                for (const [, codeEditor] of notebookEditor.codeEditors) {
                    if (codeEditor === this._editor) {
                        location.location = ChatAgentLocation.Notebook;
                        break;
                    }
                }
            }
            return this._store.add(_instaService.createInstance(InlineChatZoneWidget, location, this._editor));
        });
        this._store.add(this._editor.onDidChangeModel(async (e) => {
            if (this._session || !e.newModelUrl) {
                return;
            }
            const existingSession = this._inlineChatSessionService.getSession(this._editor, e.newModelUrl);
            if (!existingSession) {
                return;
            }
            this._log('session RESUMING after model change', e);
            await this.run({ existingSession });
        }));
        this._store.add(this._inlineChatSessionService.onDidEndSession(e => {
            if (e.session === this._session && e.endedByExternalCause) {
                this._log('session ENDED by external cause');
                this.finishExistingSession();
            }
        }));
        this._store.add(this._inlineChatSessionService.onDidMoveSession(async (e) => {
            if (e.editor === this._editor) {
                this._log('session RESUMING after move', e);
                await this.run({ existingSession: e.session });
            }
        }));
        this._log(`NEW controller`);
    }
    dispose() {
        if (this._currentRun) {
            this._messages.fire(this._session?.chatModel.hasRequests
                ? 4 /* Message.PAUSE_SESSION */
                : 2 /* Message.CANCEL_SESSION */);
        }
        this._store.dispose();
        this._isDisposed = true;
        this._log('DISPOSED controller');
    }
    _log(message, ...more) {
        if (message instanceof Error) {
            this._logService.error(message, ...more);
        }
        else {
            this._logService.trace(`[IE] (editor:${this._editor.getId()}) ${message}`, ...more);
        }
    }
    getMessage() {
        return this._ui.value.widget.responseContent;
    }
    getId() {
        return INLINE_CHAT_ID;
    }
    _getMode() {
        return this._configurationService.getValue("inlineChat.mode" /* InlineChatConfigKeys.Mode */);
    }
    getWidgetPosition() {
        return this._ui.value.position;
    }
    async run(options = {}) {
        try {
            this.finishExistingSession();
            if (this._currentRun) {
                await this._currentRun;
            }
            if (options.initialSelection) {
                this._editor.setSelection(options.initialSelection);
            }
            this._stashedSession.clear();
            this._onWillStartSession.fire();
            this._currentRun = this._nextState("CREATE_SESSION" /* State.CREATE_SESSION */, options);
            await this._currentRun;
        }
        catch (error) {
            // this should not happen but when it does make sure to tear down the UI and everything
            this._log('error during run', error);
            onUnexpectedError(error);
            if (this._session) {
                this._inlineChatSessionService.releaseSession(this._session);
            }
            this["PAUSE" /* State.PAUSE */]();
        }
        finally {
            this._currentRun = undefined;
        }
    }
    // ---- state machine
    async _nextState(state, options) {
        let nextState = state;
        while (nextState && !this._isDisposed) {
            this._log('setState to ', nextState);
            const p = this[nextState](options);
            this._onDidEnterState.fire(nextState);
            nextState = await p;
        }
    }
    async ["CREATE_SESSION" /* State.CREATE_SESSION */](options) {
        assertType(this._session === undefined);
        assertType(this._editor.hasModel());
        let session = options.existingSession;
        let initPosition;
        if (options.position) {
            initPosition = Position.lift(options.position).delta(-1);
            delete options.position;
        }
        const widgetPosition = this._showWidget(options.headless ?? session?.headless, true, initPosition);
        // this._updatePlaceholder();
        let errorMessage = localize('create.fail', "Failed to start editor chat");
        if (!session) {
            const createSessionCts = new CancellationTokenSource();
            const msgListener = Event.once(this._messages.event)(m => {
                this._log('state=_createSession) message received', m);
                if (m === 32 /* Message.ACCEPT_INPUT */) {
                    // user accepted the input before having a session
                    options.autoSend = true;
                    this._ui.value.widget.updateInfo(localize('welcome.2', "Getting ready..."));
                }
                else {
                    createSessionCts.cancel();
                }
            });
            try {
                session = await this._inlineChatSessionService.createSession(this._editor, { editMode: this._getMode(), wholeRange: options.initialRange }, createSessionCts.token);
            }
            catch (error) {
                // Inline chat errors are from the provider and have their error messages shown to the user
                if (error instanceof InlineChatError || error?.name === InlineChatError.code) {
                    errorMessage = error.message;
                }
            }
            createSessionCts.dispose();
            msgListener.dispose();
            if (createSessionCts.token.isCancellationRequested) {
                if (session) {
                    this._inlineChatSessionService.releaseSession(session);
                }
                return "CANCEL" /* State.CANCEL */;
            }
        }
        delete options.initialRange;
        delete options.existingSession;
        if (!session) {
            MessageController.get(this._editor)?.showMessage(errorMessage, widgetPosition);
            this._log('Failed to start editor chat');
            return "CANCEL" /* State.CANCEL */;
        }
        await session.chatModel.waitForInitialization();
        // create a new strategy
        switch (session.editMode) {
            case "preview" /* EditMode.Preview */:
                this._strategy = this._instaService.createInstance(PreviewStrategy, session, this._editor, this._ui.value);
                break;
            case "live" /* EditMode.Live */:
            default:
                this._strategy = this._instaService.createInstance(LiveStrategy, session, this._editor, this._ui.value, session.headless || this._configurationService.getValue("inlineChat.experimental.enableZoneToolbar" /* InlineChatConfigKeys.ZoneToolbar */));
                break;
        }
        this._session = session;
        return "INIT_UI" /* State.INIT_UI */;
    }
    async ["INIT_UI" /* State.INIT_UI */](options) {
        assertType(this._session);
        assertType(this._strategy);
        // hide/cancel inline completions when invoking IE
        InlineCompletionsController.get(this._editor)?.hide();
        this._sessionStore.clear();
        const wholeRangeDecoration = this._editor.createDecorationsCollection();
        const handleWholeRangeChange = () => {
            const newDecorations = this._strategy?.getWholeRangeDecoration() ?? [];
            wholeRangeDecoration.set(newDecorations);
            this._ctxEditing.set(!this._session?.wholeRange.trackedInitialRange.isEmpty());
        };
        this._sessionStore.add(toDisposable(() => {
            wholeRangeDecoration.clear();
            this._ctxEditing.reset();
        }));
        this._sessionStore.add(this._session.wholeRange.onDidChange(handleWholeRangeChange));
        handleWholeRangeChange();
        this._ui.value.widget.setChatModel(this._session.chatModel);
        this._updatePlaceholder();
        const isModelEmpty = !this._session.chatModel.hasRequests;
        this._ui.value.widget.updateToolbar(true);
        this._ui.value.widget.toggleStatus(!isModelEmpty);
        this._showWidget(this._session.headless, isModelEmpty);
        this._sessionStore.add(this._editor.onDidChangeModel((e) => {
            const msg = this._session?.chatModel.hasRequests
                ? 4 /* Message.PAUSE_SESSION */
                : 2 /* Message.CANCEL_SESSION */;
            this._log('model changed, pause or cancel session', msg, e);
            this._messages.fire(msg);
        }));
        const altVersionNow = this._editor.getModel()?.getAlternativeVersionId();
        this._sessionStore.add(this._editor.onDidChangeModelContent(e => {
            if (!this._session?.hunkData.ignoreTextModelNChanges) {
                this._ctxUserDidEdit.set(altVersionNow !== this._editor.getModel()?.getAlternativeVersionId());
            }
            if (this._session?.hunkData.ignoreTextModelNChanges || this._strategy?.hasFocus()) {
                return;
            }
            const wholeRange = this._session.wholeRange;
            let shouldFinishSession = false;
            if (this._configurationService.getValue("inlineChat.finishOnType" /* InlineChatConfigKeys.FinishOnType */)) {
                for (const { range } of e.changes) {
                    shouldFinishSession = !Range.areIntersectingOrTouching(range, wholeRange.value);
                }
            }
            this._session.recordExternalEditOccurred(shouldFinishSession);
            if (shouldFinishSession) {
                this._log('text changed outside of whole range, FINISH session');
                this.finishExistingSession();
            }
        }));
        this._sessionStore.add(this._session.chatModel.onDidChange(async (e) => {
            if (e.kind === 'removeRequest') {
                // TODO@jrieken there is still some work left for when a request "in the middle"
                // is removed. We will undo all changes till that point but not remove those
                // later request
                await this._session.undoChangesUntil(e.requestId);
            }
        }));
        // apply edits from completed requests that haven't been applied yet
        const editState = this._createChatTextEditGroupState();
        let didEdit = false;
        for (const request of this._session.chatModel.getRequests()) {
            if (!request.response) {
                // done when seeing the first request that is still pending (no response).
                break;
            }
            for (const part of request.response.response.value) {
                if (part.kind !== 'textEditGroup' || !isEqual(part.uri, this._session.textModelN.uri)) {
                    continue;
                }
                if (part.state?.applied) {
                    continue;
                }
                for (const edit of part.edits) {
                    this._makeChanges(edit, undefined, !didEdit);
                    didEdit = true;
                }
                part.state ??= editState;
            }
        }
        if (didEdit) {
            const diff = await this._editorWorkerService.computeDiff(this._session.textModel0.uri, this._session.textModelN.uri, { computeMoves: false, maxComputationTimeMs: Number.MAX_SAFE_INTEGER, ignoreTrimWhitespace: false }, 'advanced');
            this._session.wholeRange.fixup(diff?.changes ?? []);
            await this._session.hunkData.recompute(editState, diff);
            this._updateCtxResponseType();
        }
        options.position = await this._strategy.renderChanges();
        if (this._session.chatModel.requestInProgress) {
            return "SHOW_REQUEST" /* State.SHOW_REQUEST */;
        }
        else {
            return "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
        }
    }
    async ["WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */](options) {
        assertType(this._session);
        assertType(this._strategy);
        this._updatePlaceholder();
        if (options.message) {
            this.updateInput(options.message);
            aria.alert(options.message);
            delete options.message;
            this._showWidget(this._session.headless, false);
        }
        let message = 0 /* Message.NONE */;
        let request;
        const barrier = new Barrier();
        const store = new DisposableStore();
        store.add(this._session.chatModel.onDidChange(e => {
            if (e.kind === 'addRequest') {
                request = e.request;
                message = 32 /* Message.ACCEPT_INPUT */;
                barrier.open();
            }
        }));
        store.add(this._strategy.onDidAccept(() => this.acceptSession()));
        store.add(this._strategy.onDidDiscard(() => this.cancelSession()));
        store.add(Event.once(this._messages.event)(m => {
            this._log('state=_waitForInput) message received', m);
            message = m;
            barrier.open();
        }));
        if (options.autoSend) {
            delete options.autoSend;
            this._showWidget(this._session.headless, false);
            this._ui.value.widget.chatWidget.acceptInput();
        }
        await barrier.wait();
        store.dispose();
        if (message & (16 /* Message.CANCEL_INPUT */ | 2 /* Message.CANCEL_SESSION */)) {
            return "CANCEL" /* State.CANCEL */;
        }
        if (message & 4 /* Message.PAUSE_SESSION */) {
            return "PAUSE" /* State.PAUSE */;
        }
        if (message & 1 /* Message.ACCEPT_SESSION */) {
            this._ui.value.widget.selectAll(false);
            return "DONE" /* State.ACCEPT */;
        }
        if (!request?.message.text) {
            return "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
        }
        return "SHOW_REQUEST" /* State.SHOW_REQUEST */;
    }
    async ["SHOW_REQUEST" /* State.SHOW_REQUEST */](options) {
        assertType(this._session);
        assertType(this._strategy);
        assertType(this._session.chatModel.requestInProgress);
        this._ctxRequestInProgress.set(true);
        const { chatModel } = this._session;
        const request = chatModel.lastRequest;
        assertType(request);
        assertType(request.response);
        this._showWidget(this._session.headless, false);
        this._ui.value.widget.selectAll(false);
        this._ui.value.widget.updateInfo('');
        this._ui.value.widget.toggleStatus(true);
        const { response } = request;
        const responsePromise = new DeferredPromise();
        const store = new DisposableStore();
        const progressiveEditsCts = store.add(new CancellationTokenSource());
        const progressiveEditsAvgDuration = new MovingAverage();
        const progressiveEditsClock = StopWatch.create();
        const progressiveEditsQueue = new Queue();
        let next = "WAIT_FOR_INPUT" /* State.WAIT_FOR_INPUT */;
        store.add(Event.once(this._messages.event)(message => {
            this._log('state=_makeRequest) message received', message);
            this._chatService.cancelCurrentRequestForSession(chatModel.sessionId);
            if (message & 2 /* Message.CANCEL_SESSION */) {
                next = "CANCEL" /* State.CANCEL */;
            }
            else if (message & 4 /* Message.PAUSE_SESSION */) {
                next = "PAUSE" /* State.PAUSE */;
            }
            else if (message & 1 /* Message.ACCEPT_SESSION */) {
                next = "DONE" /* State.ACCEPT */;
            }
        }));
        store.add(chatModel.onDidChange(async (e) => {
            if (e.kind === 'removeRequest' && e.requestId === request.id) {
                progressiveEditsCts.cancel();
                responsePromise.complete();
                if (e.reason === 1 /* ChatRequestRemovalReason.Resend */) {
                    next = "SHOW_REQUEST" /* State.SHOW_REQUEST */;
                }
                else {
                    next = "CANCEL" /* State.CANCEL */;
                }
                return;
            }
            if (e.kind === 'move') {
                assertType(this._session);
                const log = (msg, ...args) => this._log('state=_showRequest) moving inline chat', msg, ...args);
                log('move was requested', e.target, e.range);
                // if there's already a tab open for targetUri, show it and move inline chat to that tab
                // otherwise, open the tab to the side
                const initialSelection = Selection.fromRange(Range.lift(e.range), 0 /* SelectionDirection.LTR */);
                const editorPane = await this._editorService.openEditor({ resource: e.target, options: { selection: initialSelection } }, SIDE_GROUP);
                if (!editorPane) {
                    log('opening editor failed');
                    return;
                }
                const newEditor = editorPane.getControl();
                if (!isCodeEditor(newEditor) || !newEditor.hasModel()) {
                    log('new editor is either missing or not a code editor or does not have a model');
                    return;
                }
                if (this._inlineChatSessionService.getSession(newEditor, e.target)) {
                    log('new editor ALREADY has a session');
                    return;
                }
                const newSession = await this._inlineChatSessionService.createSession(newEditor, {
                    editMode: this._getMode(),
                    session: this._session,
                }, CancellationToken.None); // TODO@ulugbekna: add proper cancellation?
                InlineChatController_1.get(newEditor)?.run({ existingSession: newSession });
                next = "CANCEL" /* State.CANCEL */;
                responsePromise.complete();
                return;
            }
        }));
        // cancel the request when the user types
        store.add(this._ui.value.widget.chatWidget.inputEditor.onDidChangeModelContent(() => {
            this._chatService.cancelCurrentRequestForSession(chatModel.sessionId);
        }));
        let lastLength = 0;
        let isFirstChange = true;
        const editState = this._createChatTextEditGroupState();
        let localEditGroup;
        // apply edits
        const handleResponse = () => {
            this._updateCtxResponseType();
            if (!localEditGroup) {
                localEditGroup = response.response.value.find(part => part.kind === 'textEditGroup' && isEqual(part.uri, this._session?.textModelN.uri));
            }
            if (localEditGroup) {
                localEditGroup.state ??= editState;
                const edits = localEditGroup.edits;
                const newEdits = edits.slice(lastLength);
                if (newEdits.length > 0) {
                    this._log(`${this._session?.textModelN.uri.toString()} received ${newEdits.length} edits`);
                    // NEW changes
                    lastLength = edits.length;
                    progressiveEditsAvgDuration.update(progressiveEditsClock.elapsed());
                    progressiveEditsClock.reset();
                    progressiveEditsQueue.queue(async () => {
                        const startThen = this._session.wholeRange.value.getStartPosition();
                        // making changes goes into a queue because otherwise the async-progress time will
                        // influence the time it takes to receive the changes and progressive typing will
                        // become infinitely fast
                        for (const edits of newEdits) {
                            await this._makeChanges(edits, {
                                duration: progressiveEditsAvgDuration.value,
                                token: progressiveEditsCts.token
                            }, isFirstChange);
                            isFirstChange = false;
                        }
                        // reshow the widget if the start position changed or shows at the wrong position
                        const startNow = this._session.wholeRange.value.getStartPosition();
                        if (!startNow.equals(startThen) || !this._ui.value.position?.equals(startNow)) {
                            this._showWidget(this._session.headless, false, startNow.delta(-1));
                        }
                    });
                }
            }
            if (response.isCanceled) {
                progressiveEditsCts.cancel();
                responsePromise.complete();
            }
            else if (response.isComplete) {
                responsePromise.complete();
            }
        };
        store.add(response.onDidChange(handleResponse));
        handleResponse();
        // (1) we must wait for the request to finish
        // (2) we must wait for all edits that came in via progress to complete
        await responsePromise.p;
        await progressiveEditsQueue.whenIdle();
        if (response.result?.errorDetails) {
            await this._session.undoChangesUntil(response.requestId);
        }
        store.dispose();
        const diff = await this._editorWorkerService.computeDiff(this._session.textModel0.uri, this._session.textModelN.uri, { computeMoves: false, maxComputationTimeMs: Number.MAX_SAFE_INTEGER, ignoreTrimWhitespace: false }, 'advanced');
        this._session.wholeRange.fixup(diff?.changes ?? []);
        await this._session.hunkData.recompute(editState, diff);
        this._ctxRequestInProgress.set(false);
        let newPosition;
        if (response.result?.errorDetails) {
            // error -> no message, errors are shown with the request
        }
        else if (response.response.value.length === 0) {
            // empty -> show message
            const status = localize('empty', "No results, please refine your input and try again");
            this._ui.value.widget.updateStatus(status, { classes: ['warn'] });
        }
        else {
            // real response -> no message
            this._ui.value.widget.updateStatus('');
        }
        const position = await this._strategy.renderChanges();
        if (position) {
            // if the selection doesn't start far off we keep the widget at its current position
            // because it makes reading this nicer
            const selection = this._editor.getSelection();
            if (selection?.containsPosition(position)) {
                if (position.lineNumber - selection.startLineNumber > 8) {
                    newPosition = position;
                }
            }
            else {
                newPosition = position;
            }
        }
        this._showWidget(this._session.headless, false, newPosition);
        return next;
    }
    async ["PAUSE" /* State.PAUSE */]() {
        this._resetWidget();
        this._strategy?.dispose?.();
        this._session = undefined;
    }
    async ["DONE" /* State.ACCEPT */]() {
        assertType(this._session);
        assertType(this._strategy);
        this._sessionStore.clear();
        try {
            await this._strategy.apply();
        }
        catch (err) {
            this._dialogService.error(localize('err.apply', "Failed to apply changes.", toErrorMessage(err)));
            this._log('FAILED to apply changes');
            this._log(err);
        }
        this._inlineChatSessionService.releaseSession(this._session);
        this._resetWidget();
        this._strategy?.dispose();
        this._strategy = undefined;
        this._session = undefined;
    }
    async ["CANCEL" /* State.CANCEL */]() {
        if (this._session) {
            // assertType(this._session);
            assertType(this._strategy);
            this._sessionStore.clear();
            // only stash sessions that were not unstashed, not "empty", and not interacted with
            const shouldStash = !this._session.isUnstashed && this._session.chatModel.hasRequests && this._session.hunkData.size === this._session.hunkData.pending;
            let undoCancelEdits = [];
            try {
                undoCancelEdits = this._strategy.cancel();
            }
            catch (err) {
                this._dialogService.error(localize('err.discard', "Failed to discard changes.", toErrorMessage(err)));
                this._log('FAILED to discard changes');
                this._log(err);
            }
            this._stashedSession.clear();
            if (shouldStash) {
                this._stashedSession.value = this._inlineChatSessionService.stashSession(this._session, this._editor, undoCancelEdits);
            }
            else {
                this._inlineChatSessionService.releaseSession(this._session);
            }
        }
        this._resetWidget();
        this._strategy?.dispose();
        this._strategy = undefined;
        this._session = undefined;
    }
    // ----
    _showWidget(headless = false, initialRender = false, position) {
        assertType(this._editor.hasModel());
        this._ctxVisible.set(true);
        let widgetPosition;
        if (position) {
            // explicit position wins
            widgetPosition = position;
        }
        else if (this._ui.rawValue?.position) {
            // already showing - special case of line 1
            if (this._ui.rawValue?.position.lineNumber === 1) {
                widgetPosition = this._ui.rawValue?.position.delta(-1);
            }
            else {
                widgetPosition = this._ui.rawValue?.position;
            }
        }
        else {
            // default to ABOVE the selection
            widgetPosition = this._editor.getSelection().getStartPosition().delta(-1);
        }
        if (this._session && !position && (this._session.hasChangedText || this._session.chatModel.hasRequests)) {
            widgetPosition = this._session.wholeRange.trackedInitialRange.getStartPosition().delta(-1);
        }
        if (!headless) {
            if (this._ui.rawValue?.position) {
                this._ui.value.updatePositionAndHeight(widgetPosition);
            }
            else {
                this._ui.value.show(widgetPosition);
            }
        }
        return widgetPosition;
    }
    _resetWidget() {
        this._sessionStore.clear();
        this._ctxVisible.reset();
        this._ctxUserDidEdit.reset();
        this._ui.rawValue?.hide();
        // Return focus to the editor only if the current focus is within the editor widget
        if (this._editor.hasWidgetFocus()) {
            this._editor.focus();
        }
    }
    _updateCtxResponseType() {
        if (!this._session) {
            this._ctxResponseType.set("none" /* InlineChatResponseType.None */);
            return;
        }
        const hasLocalEdit = (response) => {
            return response.value.some(part => part.kind === 'textEditGroup' && isEqual(part.uri, this._session?.textModelN.uri));
        };
        let responseType = "none" /* InlineChatResponseType.None */;
        for (const request of this._session.chatModel.getRequests()) {
            if (!request.response) {
                continue;
            }
            responseType = "messages" /* InlineChatResponseType.Messages */;
            if (hasLocalEdit(request.response.response)) {
                responseType = "messagesAndEdits" /* InlineChatResponseType.MessagesAndEdits */;
                break; // no need to check further
            }
        }
        this._ctxResponseType.set(responseType);
        this._ctxResponse.set(responseType !== "none" /* InlineChatResponseType.None */);
    }
    _createChatTextEditGroupState() {
        assertType(this._session);
        const sha1 = new DefaultModelSHA1Computer();
        const textModel0Sha1 = sha1.canComputeSHA1(this._session.textModel0)
            ? sha1.computeSHA1(this._session.textModel0)
            : generateUuid();
        return {
            sha1: textModel0Sha1,
            applied: 0
        };
    }
    async _makeChanges(edits, opts, undoStopBefore) {
        assertType(this._session);
        assertType(this._strategy);
        const moreMinimalEdits = await this._editorWorkerService.computeMoreMinimalEdits(this._session.textModelN.uri, edits);
        this._log('edits from PROVIDER and after making them MORE MINIMAL', this._session.agent.extensionId, edits, moreMinimalEdits);
        if (moreMinimalEdits?.length === 0) {
            // nothing left to do
            return;
        }
        const actualEdits = !opts && moreMinimalEdits ? moreMinimalEdits : edits;
        const editOperations = actualEdits.map(TextEdit.asEditOperation);
        const editsObserver = {
            start: () => this._session.hunkData.ignoreTextModelNChanges = true,
            stop: () => this._session.hunkData.ignoreTextModelNChanges = false,
        };
        this._inlineChatSavingService.markChanged(this._session);
        if (opts) {
            await this._strategy.makeProgressiveChanges(editOperations, editsObserver, opts, undoStopBefore);
        }
        else {
            await this._strategy.makeChanges(editOperations, editsObserver, undoStopBefore);
        }
    }
    _updatePlaceholder() {
        this._ui.value.widget.placeholder = this._getPlaceholderText();
    }
    _getPlaceholderText() {
        return this._forcedPlaceholder ?? this._session?.agent.description ?? '';
    }
    // ---- controller API
    showSaveHint() {
        if (!this._session) {
            return;
        }
        const status = localize('savehint', "Accept or discard changes to continue saving.");
        this._ui.value.widget.updateStatus(status, { classes: ['warn'] });
        if (this._ui.value.position) {
            this._editor.revealLineInCenterIfOutsideViewport(this._ui.value.position.lineNumber);
        }
        else {
            const hunk = this._session.hunkData.getInfo().find(info => info.getState() === 0 /* HunkState.Pending */);
            if (hunk) {
                this._editor.revealLineInCenterIfOutsideViewport(hunk.getRangesN()[0].startLineNumber);
            }
        }
    }
    acceptInput() {
        return this.chatWidget.acceptInput();
    }
    updateInput(text, selectAll = true) {
        this._ui.value.widget.chatWidget.setInput(text);
        if (selectAll) {
            const newSelection = new Selection(1, 1, Number.MAX_SAFE_INTEGER, 1);
            this._ui.value.widget.chatWidget.inputEditor.setSelection(newSelection);
        }
    }
    cancelCurrentRequest() {
        this._messages.fire(16 /* Message.CANCEL_INPUT */ | 8 /* Message.CANCEL_REQUEST */);
    }
    arrowOut(up) {
        if (this._ui.value.position && this._editor.hasModel()) {
            const { column } = this._editor.getPosition();
            const { lineNumber } = this._ui.value.position;
            const newLine = up ? lineNumber : lineNumber + 1;
            this._editor.setPosition({ lineNumber: newLine, column });
            this._editor.focus();
        }
    }
    focus() {
        this._ui.value.widget.focus();
    }
    hasFocus() {
        return this._ui.value.widget.hasFocus();
    }
    async viewInChat() {
        if (!this._strategy || !this._session) {
            return;
        }
        let someApplied = false;
        let lastEdit;
        const uri = this._editor.getModel()?.uri;
        const requests = this._session.chatModel.getRequests();
        for (const request of requests) {
            if (!request.response) {
                continue;
            }
            for (const part of request.response.response.value) {
                if (part.kind === 'textEditGroup' && isEqual(part.uri, uri)) {
                    // fully or partially applied edits
                    someApplied = someApplied || Boolean(part.state?.applied);
                    lastEdit = part;
                }
            }
        }
        const doEdits = this._strategy.cancel();
        if (someApplied) {
            assertType(lastEdit);
            lastEdit.edits = [doEdits];
            lastEdit.state.applied = 0;
        }
        await this._instaService.invokeFunction(moveToPanelChat, this._session?.chatModel);
        this.cancelSession();
    }
    acceptSession() {
        const response = this._session?.chatModel.getRequests().at(-1)?.response;
        if (response) {
            this._chatService.notifyUserAction({
                sessionId: response.session.sessionId,
                requestId: response.requestId,
                agentId: response.agent?.id,
                command: response.slashCommand?.name,
                result: response.result,
                action: {
                    kind: 'inlineChat',
                    action: 'accepted'
                }
            });
        }
        this._messages.fire(1 /* Message.ACCEPT_SESSION */);
    }
    acceptHunk(hunkInfo) {
        return this._strategy?.performHunkAction(hunkInfo, 0 /* HunkAction.Accept */);
    }
    discardHunk(hunkInfo) {
        return this._strategy?.performHunkAction(hunkInfo, 1 /* HunkAction.Discard */);
    }
    toggleDiff(hunkInfo) {
        return this._strategy?.performHunkAction(hunkInfo, 4 /* HunkAction.ToggleDiff */);
    }
    moveHunk(next) {
        this.focus();
        this._strategy?.performHunkAction(undefined, next ? 2 /* HunkAction.MoveNext */ : 3 /* HunkAction.MovePrev */);
    }
    async cancelSession() {
        const response = this._session?.chatModel.lastRequest?.response;
        if (response) {
            this._chatService.notifyUserAction({
                sessionId: response.session.sessionId,
                requestId: response.requestId,
                agentId: response.agent?.id,
                command: response.slashCommand?.name,
                result: response.result,
                action: {
                    kind: 'inlineChat',
                    action: 'discarded'
                }
            });
        }
        this._messages.fire(2 /* Message.CANCEL_SESSION */);
    }
    finishExistingSession() {
        if (this._session) {
            if (this._session.editMode === "preview" /* EditMode.Preview */) {
                this._log('finishing existing session, using CANCEL', this._session.editMode);
                this.cancelSession();
            }
            else {
                this._log('finishing existing session, using APPLY', this._session.editMode);
                this.acceptSession();
            }
        }
    }
    reportIssue() {
        const response = this._session?.chatModel.lastRequest?.response;
        if (response) {
            this._chatService.notifyUserAction({
                sessionId: response.session.sessionId,
                requestId: response.requestId,
                agentId: response.agent?.id,
                command: response.slashCommand?.name,
                result: response.result,
                action: { kind: 'bug' }
            });
        }
    }
    unstashLastSession() {
        const result = this._stashedSession.value?.unstash();
        if (result) {
            this._inlineChatSavingService.markChanged(result);
        }
        return result;
    }
    joinCurrentRun() {
        return this._currentRun;
    }
    async reviewEdits(anchor, stream, token) {
        if (!this._editor.hasModel()) {
            return false;
        }
        const session = await this._inlineChatSessionService.createSession(this._editor, { editMode: "live" /* EditMode.Live */, wholeRange: anchor, headless: true }, token);
        if (!session) {
            return false;
        }
        const request = session.chatModel.addRequest({ text: 'DUMMY', parts: [] }, { variables: [] }, 0);
        const run = this.run({
            existingSession: session,
            headless: true
        });
        await Event.toPromise(Event.filter(this._onDidEnterState.event, candidate => candidate === "SHOW_REQUEST" /* State.SHOW_REQUEST */));
        for await (const chunk of stream) {
            session.chatModel.acceptResponseProgress(request, { kind: 'textEdit', uri: this._editor.getModel().uri, edits: [chunk] });
        }
        if (token.isCancellationRequested) {
            session.chatModel.cancelRequest(request);
        }
        else {
            session.chatModel.completeResponse(request);
        }
        await run;
        return true;
    }
};
InlineChatController = InlineChatController_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, IInlineChatSessionService),
    __param(3, IInlineChatSavingService),
    __param(4, IEditorWorkerService),
    __param(5, ILogService),
    __param(6, IConfigurationService),
    __param(7, IDialogService),
    __param(8, IContextKeyService),
    __param(9, IChatService),
    __param(10, IEditorService),
    __param(11, INotebookEditorService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], InlineChatController);
export { InlineChatController };
async function moveToPanelChat(accessor, model) {
    const viewsService = accessor.get(IViewsService);
    const chatService = accessor.get(IChatService);
    const widget = await showChatView(viewsService);
    if (widget && widget.viewModel && model) {
        for (const request of model.getRequests().slice()) {
            await chatService.adoptRequest(widget.viewModel.model.sessionId, request);
        }
        widget.focusLastMessage();
    }
}
