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
var TerminalChatController_1;
import { CancellationTokenSource } from '../../../../../base/common/cancellation.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { Lazy } from '../../../../../base/common/lazy.js';
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from '../../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatCodeBlockContextProviderService, showChatView } from '../../../chat/browser/chat.js';
import { IChatService } from '../../../chat/common/chatService.js';
import { isDetachedTerminalInstance, ITerminalService } from '../../../terminal/browser/terminal.js';
import { TerminalChatWidget } from './terminalChatWidget.js';
import { createCancelablePromise, DeferredPromise } from '../../../../../base/common/async.js';
import { assertType } from '../../../../../base/common/types.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
import { ChatAgentLocation } from '../../../chat/common/chatAgents.js';
import { TerminalChatContextKeys } from './terminalChat.js';
let TerminalChatController = class TerminalChatController extends Disposable {
    static { TerminalChatController_1 = this; }
    static { this.ID = 'terminal.chat'; }
    static get(instance) {
        return instance.getContribution(TerminalChatController_1.ID);
    }
    static { this._storageKey = 'terminal-inline-chat-history'; }
    static { this._promptHistory = []; }
    /**
     * The terminal chat widget for the controller, this will be undefined if xterm is not ready yet (ie. the
     * terminal is still initializing). This wraps the inline chat widget.
     */
    get terminalChatWidget() { return this._terminalChatWidget?.value; }
    /**
     * The base chat widget for the controller, this will be undefined if xterm is not ready yet (ie. the
     * terminal is still initializing).
     */
    get chatWidget() { return this._terminalChatWidget?.value.inlineChatWidget?.chatWidget; }
    get lastResponseContent() {
        return this._lastResponseContent;
    }
    get onDidHide() { return this.terminalChatWidget?.onDidHide ?? Event.None; }
    get scopedContextKeyService() {
        return this._terminalChatWidget?.value.inlineChatWidget.scopedContextKeyService ?? this._contextKeyService;
    }
    constructor(_ctx, chatCodeBlockContextProviderService, _chatService, _contextKeyService, _instantiationService, _storageService, _terminalService, _viewsService) {
        super();
        this._ctx = _ctx;
        this._chatService = _chatService;
        this._contextKeyService = _contextKeyService;
        this._instantiationService = _instantiationService;
        this._storageService = _storageService;
        this._terminalService = _terminalService;
        this._viewsService = _viewsService;
        this._messages = this._store.add(new Emitter());
        this.onDidAcceptInput = Event.filter(this._messages.event, m => m === 32 /* Message.AcceptInput */, this._store);
        this._terminalAgentName = 'terminal';
        this._model = this._register(new MutableDisposable());
        this._historyOffset = -1;
        this._historyCandidate = '';
        this._forcedPlaceholder = undefined;
        this._requestActiveContextKey = TerminalChatContextKeys.requestActive.bindTo(this._contextKeyService);
        this._responseContainsCodeBlockContextKey = TerminalChatContextKeys.responseContainsCodeBlock.bindTo(this._contextKeyService);
        this._responseContainsMulitpleCodeBlocksContextKey = TerminalChatContextKeys.responseContainsMultipleCodeBlocks.bindTo(this._contextKeyService);
        this._register(chatCodeBlockContextProviderService.registerProvider({
            getCodeBlockContext: (editor) => {
                if (!editor || !this._terminalChatWidget?.hasValue || !this.hasFocus()) {
                    return;
                }
                return {
                    element: editor,
                    code: editor.getValue(),
                    codeBlockIndex: 0,
                    languageId: editor.getModel().getLanguageId()
                };
            }
        }, 'terminal'));
        TerminalChatController_1._promptHistory = JSON.parse(this._storageService.get(TerminalChatController_1._storageKey, 0 /* StorageScope.PROFILE */, '[]'));
        this._historyUpdate = (prompt) => {
            const idx = TerminalChatController_1._promptHistory.indexOf(prompt);
            if (idx >= 0) {
                TerminalChatController_1._promptHistory.splice(idx, 1);
            }
            TerminalChatController_1._promptHistory.unshift(prompt);
            this._historyOffset = -1;
            this._historyCandidate = '';
            this._storageService.store(TerminalChatController_1._storageKey, JSON.stringify(TerminalChatController_1._promptHistory), 0 /* StorageScope.PROFILE */, 0 /* StorageTarget.USER */);
        };
    }
    xtermReady(xterm) {
        this._terminalChatWidget = new Lazy(() => {
            const chatWidget = this._register(this._instantiationService.createInstance(TerminalChatWidget, this._ctx.instance.domElement, this._ctx.instance, xterm));
            this._register(chatWidget.focusTracker.onDidFocus(() => {
                TerminalChatController_1.activeChatController = this;
                if (!isDetachedTerminalInstance(this._ctx.instance)) {
                    this._terminalService.setActiveInstance(this._ctx.instance);
                }
            }));
            this._register(chatWidget.focusTracker.onDidBlur(() => {
                TerminalChatController_1.activeChatController = undefined;
                this._ctx.instance.resetScrollbarVisibility();
            }));
            if (!this._ctx.instance.domElement) {
                throw new Error('FindWidget expected terminal DOM to be initialized');
            }
            return chatWidget;
        });
    }
    async _createSession() {
        this._sessionCtor = createCancelablePromise(async (token) => {
            if (!this._model.value) {
                this._model.value = this._chatService.startSession(ChatAgentLocation.Terminal, token);
                if (!this._model.value) {
                    throw new Error('Failed to start chat session');
                }
            }
        });
        this._register(toDisposable(() => this._sessionCtor?.cancel()));
    }
    _updatePlaceholder() {
        const inlineChatWidget = this._terminalChatWidget?.value.inlineChatWidget;
        if (inlineChatWidget) {
            inlineChatWidget.placeholder = this._getPlaceholderText();
        }
    }
    _getPlaceholderText() {
        return this._forcedPlaceholder ?? '';
    }
    setPlaceholder(text) {
        this._forcedPlaceholder = text;
        this._updatePlaceholder();
    }
    resetPlaceholder() {
        this._forcedPlaceholder = undefined;
        this._updatePlaceholder();
    }
    clear() {
        this.cancel();
        this._model.clear();
        this._responseContainsCodeBlockContextKey.reset();
        this._requestActiveContextKey.reset();
        this._terminalChatWidget?.value.hide();
        this._terminalChatWidget?.value.setValue(undefined);
    }
    async acceptInput(isVoiceInput) {
        assertType(this._terminalChatWidget);
        if (!this._model.value) {
            await this.reveal();
        }
        assertType(this._model.value);
        this._messages.fire(32 /* Message.AcceptInput */);
        const lastInput = this._terminalChatWidget.value.inlineChatWidget.value;
        if (!lastInput) {
            return;
        }
        const model = this._model.value;
        this._terminalChatWidget.value.inlineChatWidget.setChatModel(model);
        this._historyUpdate(lastInput);
        this._activeRequestCts?.cancel();
        this._activeRequestCts = new CancellationTokenSource();
        const store = new DisposableStore();
        this._requestActiveContextKey.set(true);
        let responseContent = '';
        const response = await this._terminalChatWidget.value.inlineChatWidget.chatWidget.acceptInput(lastInput, isVoiceInput);
        this._currentRequestId = response?.requestId;
        const responsePromise = new DeferredPromise();
        try {
            this._requestActiveContextKey.set(true);
            if (response) {
                store.add(response.onDidChange(async () => {
                    responseContent += response.response.value;
                    if (response.isCanceled) {
                        this._requestActiveContextKey.set(false);
                        responsePromise.complete(undefined);
                        return;
                    }
                    if (response.isComplete) {
                        this._requestActiveContextKey.set(false);
                        this._requestActiveContextKey.set(false);
                        const firstCodeBlock = await this.terminalChatWidget?.inlineChatWidget.getCodeBlockInfo(0);
                        const secondCodeBlock = await this.terminalChatWidget?.inlineChatWidget.getCodeBlockInfo(1);
                        this._responseContainsCodeBlockContextKey.set(!!firstCodeBlock);
                        this._responseContainsMulitpleCodeBlocksContextKey.set(!!secondCodeBlock);
                        this._terminalChatWidget?.value.inlineChatWidget.updateToolbar(true);
                        responsePromise.complete(response);
                    }
                }));
            }
            await responsePromise.p;
            this._lastResponseContent = response?.response.toMarkdown();
            return response;
        }
        catch {
            this._lastResponseContent = undefined;
            return;
        }
        finally {
            store.dispose();
        }
    }
    updateInput(text, selectAll = true) {
        const widget = this._terminalChatWidget?.value.inlineChatWidget;
        if (widget) {
            widget.value = text;
            if (selectAll) {
                widget.selectAll();
            }
        }
    }
    getInput() {
        return this._terminalChatWidget?.value.input() ?? '';
    }
    focus() {
        this._terminalChatWidget?.value.focus();
    }
    hasFocus() {
        return this._terminalChatWidget?.rawValue?.hasFocus() ?? false;
    }
    populateHistory(up) {
        if (!this._terminalChatWidget?.value) {
            return;
        }
        const len = TerminalChatController_1._promptHistory.length;
        if (len === 0) {
            return;
        }
        if (this._historyOffset === -1) {
            // remember the current value
            this._historyCandidate = this._terminalChatWidget.value.inlineChatWidget.value;
        }
        const newIdx = this._historyOffset + (up ? 1 : -1);
        if (newIdx >= len) {
            // reached the end
            return;
        }
        let entry;
        if (newIdx < 0) {
            entry = this._historyCandidate;
            this._historyOffset = -1;
        }
        else {
            entry = TerminalChatController_1._promptHistory[newIdx];
            this._historyOffset = newIdx;
        }
        this._terminalChatWidget.value.inlineChatWidget.value = entry;
        this._terminalChatWidget.value.inlineChatWidget.selectAll();
    }
    cancel() {
        this._sessionCtor?.cancel();
        this._sessionCtor = undefined;
        this._activeRequestCts?.cancel();
        this._requestActiveContextKey.set(false);
        const model = this._terminalChatWidget?.value.inlineChatWidget.getChatModel();
        if (!model?.sessionId) {
            return;
        }
        this._chatService.cancelCurrentRequestForSession(model?.sessionId);
    }
    async acceptCommand(shouldExecute) {
        const code = await this.terminalChatWidget?.inlineChatWidget.getCodeBlockInfo(0);
        if (!code) {
            return;
        }
        this._terminalChatWidget?.value.acceptCommand(code.textEditorModel.getValue(), shouldExecute);
    }
    async reveal() {
        await this._createSession();
        this._terminalChatWidget?.value.reveal();
        this._terminalChatWidget?.value.focus();
    }
    async viewInChat() {
        //TODO: is this necessary? better way?
        const widget = await showChatView(this._viewsService);
        const currentRequest = this.terminalChatWidget?.inlineChatWidget.chatWidget.viewModel?.model.getRequests().find(r => r.id === this._currentRequestId);
        if (!widget || !currentRequest?.response) {
            return;
        }
        const message = [];
        for (const item of currentRequest.response.response.value) {
            if (item.kind === 'textEditGroup') {
                for (const group of item.edits) {
                    message.push({
                        kind: 'textEdit',
                        edits: group,
                        uri: item.uri
                    });
                }
            }
            else {
                message.push(item);
            }
        }
        this._chatService.addCompleteRequest(widget.viewModel.sessionId, 
        // DEBT: Add hardcoded agent name until its removed
        `@${this._terminalAgentName} ${currentRequest.message.text}`, currentRequest.variableData, currentRequest.attempt, {
            message,
            result: currentRequest.response.result,
            followups: currentRequest.response.followups
        });
        widget.focusLastMessage();
        this._terminalChatWidget?.rawValue?.hide();
    }
};
TerminalChatController = TerminalChatController_1 = __decorate([
    __param(1, IChatCodeBlockContextProviderService),
    __param(2, IChatService),
    __param(3, IContextKeyService),
    __param(4, IInstantiationService),
    __param(5, IStorageService),
    __param(6, ITerminalService),
    __param(7, IViewsService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], TerminalChatController);
export { TerminalChatController };
