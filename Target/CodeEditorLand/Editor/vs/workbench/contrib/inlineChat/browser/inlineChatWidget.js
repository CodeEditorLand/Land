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
var HunkAccessibleDiffViewer_1;
import { $, getActiveElement, getTotalHeight, h, reset, trackFocus } from '../../../../base/browser/dom.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { renderLabelWithIcons } from '../../../../base/browser/ui/iconLabel/iconLabels.js';
import { isNonEmptyArray, tail } from '../../../../base/common/arrays.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { DisposableStore, MutableDisposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { constObservable, derived, observableValue } from '../../../../base/common/observable.js';
import './media/inlineChat.css';
import { AccessibleDiffViewer } from '../../../../editor/browser/widget/diffEditor/components/accessibleDiffViewer.js';
import { LineRange } from '../../../../editor/common/core/lineRange.js';
import { Selection } from '../../../../editor/common/core/selection.js';
import { DetailedLineRangeMapping, RangeMapping } from '../../../../editor/common/diff/rangeMapping.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { localize } from '../../../../nls.js';
import { IAccessibleViewService } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { MenuWorkbenchButtonBar } from '../../../../platform/actions/browser/buttonbar.js';
import { createActionViewItem } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { MenuWorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
import { MenuId, MenuItemAction } from '../../../../platform/actions/common/actions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { asCssVariable, asCssVariableName, editorBackground, inputBackground } from '../../../../platform/theme/common/colorRegistry.js';
import { MarkUnhelpfulActionId } from '../../chat/browser/actions/chatTitleActions.js';
import { ChatVoteDownButton } from '../../chat/browser/chatListRenderer.js';
import { ChatWidget } from '../../chat/browser/chatWidget.js';
import { ChatAgentLocation } from '../../chat/common/chatAgents.js';
import { chatRequestBackground } from '../../chat/common/chatColors.js';
import { CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING, CONTEXT_RESPONSE, CONTEXT_RESPONSE_ERROR, CONTEXT_RESPONSE_FILTERED, CONTEXT_RESPONSE_VOTE } from '../../chat/common/chatContextKeys.js';
import { ChatModel } from '../../chat/common/chatModel.js';
import { ChatAgentVoteDirection, IChatService } from '../../chat/common/chatService.js';
import { isResponseVM } from '../../chat/common/chatViewModel.js';
import { Session } from './inlineChatSession.js';
import { CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_RESPONSE_FOCUSED, inlineChatBackground, inlineChatForeground } from '../common/inlineChat.js';
import { EDITOR_DRAG_AND_DROP_BACKGROUND } from '../../../common/theme.js';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
let InlineChatWidget = class InlineChatWidget {
    constructor(location, options, _instantiationService, _contextKeyService, _keybindingService, _accessibilityService, _configurationService, _accessibleViewService, _textModelResolverService, _chatService, _hoverService) {
        this._instantiationService = _instantiationService;
        this._contextKeyService = _contextKeyService;
        this._keybindingService = _keybindingService;
        this._accessibilityService = _accessibilityService;
        this._configurationService = _configurationService;
        this._accessibleViewService = _accessibleViewService;
        this._textModelResolverService = _textModelResolverService;
        this._chatService = _chatService;
        this._hoverService = _hoverService;
        this._elements = h('div.inline-chat@root', [
            h('div.chat-widget@chatWidget'),
            h('div.accessibleViewer@accessibleViewer'),
            h('div.status@status', [
                h('div.label.info.hidden@infoLabel'),
                h('div.actions.hidden@toolbar1'),
                h('div.label.status.hidden@statusLabel'),
                h('div.actions.secondary.hidden@toolbar2'),
            ]),
        ]);
        this._store = new DisposableStore();
        this._onDidChangeHeight = this._store.add(new Emitter());
        this.onDidChangeHeight = Event.filter(this._onDidChangeHeight.event, _ => !this._isLayouting);
        this._onDidChangeInput = this._store.add(new Emitter());
        this.onDidChangeInput = this._onDidChangeInput.event;
        this._isLayouting = false;
        this.scopedContextKeyService = this._store.add(_contextKeyService.createScoped(this._elements.chatWidget));
        const scopedInstaService = _instantiationService.createChild(new ServiceCollection([
            IContextKeyService,
            this.scopedContextKeyService
        ]), this._store);
        this._chatWidget = scopedInstaService.createInstance(ChatWidget, location, undefined, {
            defaultElementHeight: 32,
            renderStyle: 'minimal',
            renderInputOnTop: false,
            renderFollowups: true,
            supportsFileReferences: _configurationService.getValue(`chat.experimental.variables.${location.location}`) === true,
            filter: item => {
                if (isResponseVM(item) && item.isComplete && !item.errorDetails) {
                    if (item.response.value.length > 0 && item.response.value.every(item => item.kind === 'textEditGroup' && options.chatWidgetViewOptions?.rendererOptions?.renderTextEditsAsSummary?.(item.uri))) {
                        return false;
                    }
                    if (item.response.value.length === 0) {
                        return false;
                    }
                    return true;
                }
                return true;
            },
            ...options.chatWidgetViewOptions
        }, {
            listForeground: inlineChatForeground,
            listBackground: inlineChatBackground,
            overlayBackground: EDITOR_DRAG_AND_DROP_BACKGROUND,
            inputEditorBackground: inputBackground,
            resultEditorBackground: editorBackground
        });
        this._chatWidget.render(this._elements.chatWidget);
        this._elements.chatWidget.style.setProperty(asCssVariableName(chatRequestBackground), asCssVariable(inlineChatBackground));
        this._chatWidget.setVisible(true);
        this._store.add(this._chatWidget);
        const ctxResponse = CONTEXT_RESPONSE.bindTo(this.scopedContextKeyService);
        const ctxResponseVote = CONTEXT_RESPONSE_VOTE.bindTo(this.scopedContextKeyService);
        const ctxResponseSupportIssues = CONTEXT_CHAT_RESPONSE_SUPPORT_ISSUE_REPORTING.bindTo(this.scopedContextKeyService);
        const ctxResponseError = CONTEXT_RESPONSE_ERROR.bindTo(this.scopedContextKeyService);
        const ctxResponseErrorFiltered = CONTEXT_RESPONSE_FILTERED.bindTo(this.scopedContextKeyService);
        const viewModelStore = this._store.add(new DisposableStore());
        this._store.add(this._chatWidget.onDidChangeViewModel(() => {
            viewModelStore.clear();
            const viewModel = this._chatWidget.viewModel;
            if (!viewModel) {
                return;
            }
            viewModelStore.add(toDisposable(() => {
                toolbar2.context = undefined;
                ctxResponse.reset();
                ctxResponseVote.reset();
                ctxResponseError.reset();
                ctxResponseErrorFiltered.reset();
                ctxResponseSupportIssues.reset();
            }));
            viewModelStore.add(viewModel.onDidChange(() => {
                const last = viewModel.getItems().at(-1);
                toolbar2.context = last;
                ctxResponse.set(isResponseVM(last));
                ctxResponseVote.set(isResponseVM(last) ? last.vote === ChatAgentVoteDirection.Down ? 'down' : last.vote === ChatAgentVoteDirection.Up ? 'up' : '' : '');
                ctxResponseError.set(isResponseVM(last) && last.errorDetails !== undefined);
                ctxResponseErrorFiltered.set((!!(isResponseVM(last) && last.errorDetails?.responseIsFiltered)));
                ctxResponseSupportIssues.set(isResponseVM(last) && (last.agent?.metadata.supportIssueReporting ?? false));
                this._onDidChangeHeight.fire();
            }));
            this._onDidChangeHeight.fire();
        }));
        this._store.add(this.chatWidget.onDidChangeContentHeight(() => {
            this._onDidChangeHeight.fire();
        }));
        this._ctxResponseFocused = CTX_INLINE_CHAT_RESPONSE_FOCUSED.bindTo(this._contextKeyService);
        const tracker = this._store.add(trackFocus(this.domNode));
        this._store.add(tracker.onDidBlur(() => this._ctxResponseFocused.set(false)));
        this._store.add(tracker.onDidFocus(() => this._ctxResponseFocused.set(true)));
        this._ctxInputEditorFocused = CTX_INLINE_CHAT_FOCUSED.bindTo(_contextKeyService);
        this._store.add(this._chatWidget.inputEditor.onDidFocusEditorWidget(() => this._ctxInputEditorFocused.set(true)));
        this._store.add(this._chatWidget.inputEditor.onDidBlurEditorWidget(() => this._ctxInputEditorFocused.set(false)));
        const statusMenuId = options.statusMenuId instanceof MenuId ? options.statusMenuId : options.statusMenuId.menu;
        const statusMenuOptions = options.statusMenuId instanceof MenuId ? undefined : options.statusMenuId.options;
        const statusButtonBar = scopedInstaService.createInstance(MenuWorkbenchButtonBar, this._elements.toolbar1, statusMenuId, {
            toolbarOptions: { primaryGroup: '0_main' },
            telemetrySource: options.chatWidgetViewOptions?.menus?.telemetrySource,
            menuOptions: { renderShortTitle: true },
            ...statusMenuOptions,
        });
        this._store.add(statusButtonBar.onDidChange(() => this._onDidChangeHeight.fire()));
        this._store.add(statusButtonBar);
        const toolbar2 = scopedInstaService.createInstance(MenuWorkbenchToolBar, this._elements.toolbar2, options.secondaryMenuId ?? MenuId.for(''), {
            telemetrySource: options.chatWidgetViewOptions?.menus?.telemetrySource,
            menuOptions: { renderShortTitle: true, shouldForwardArgs: true },
            actionViewItemProvider: (action, options) => {
                if (action instanceof MenuItemAction && action.item.id === MarkUnhelpfulActionId) {
                    return scopedInstaService.createInstance(ChatVoteDownButton, action, options);
                }
                return createActionViewItem(scopedInstaService, action, options);
            }
        });
        this._store.add(toolbar2.onDidChangeMenuItems(() => this._onDidChangeHeight.fire()));
        this._store.add(toolbar2);
        this._store.add(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("accessibility.verbosity.inlineChat")) {
                this._updateAriaLabel();
            }
        }));
        this._elements.root.tabIndex = 0;
        this._elements.statusLabel.tabIndex = 0;
        this._updateAriaLabel();
        this._store.add(this._hoverService.setupManagedHover(getDefaultHoverDelegate('element'), this._elements.statusLabel, () => {
            return this._elements.statusLabel.dataset['title'];
        }));
        this._store.add(this._chatService.onDidPerformUserAction(e => {
            if (e.sessionId === this._chatWidget.viewModel?.model.sessionId && e.action.kind === 'vote') {
                this.updateStatus('Thank you for your feedback!', { resetAfter: 1250 });
            }
        }));
        this._defaultChatModel = this._store.add(this._instantiationService.createInstance(ChatModel, undefined, ChatAgentLocation.Editor));
        this._defaultChatModel.startInitialize();
        this._defaultChatModel.initialize(undefined);
        this.setChatModel(this._defaultChatModel);
    }
    _updateAriaLabel() {
        this._elements.root.ariaLabel = this._accessibleViewService.getOpenAriaHint("accessibility.verbosity.inlineChat");
        if (this._accessibilityService.isScreenReaderOptimized()) {
            let label = defaultAriaLabel;
            if (this._configurationService.getValue("accessibility.verbosity.inlineChat")) {
                const kbLabel = this._keybindingService.lookupKeybinding("editor.action.accessibilityHelp")?.getLabel();
                label = kbLabel
                    ? localize('inlineChat.accessibilityHelp', "Inline Chat Input, Use {0} for Inline Chat Accessibility Help.", kbLabel)
                    : localize('inlineChat.accessibilityHelpNoKb', "Inline Chat Input, Run the Inline Chat Accessibility Help command for more information.");
            }
            this._chatWidget.inputEditor.updateOptions({ ariaLabel: label });
        }
    }
    dispose() {
        this._store.dispose();
    }
    get domNode() {
        return this._elements.root;
    }
    get chatWidget() {
        return this._chatWidget;
    }
    saveState() {
        this._chatWidget.saveState();
    }
    layout(widgetDim) {
        this._isLayouting = true;
        try {
            this._doLayout(widgetDim);
        }
        finally {
            this._isLayouting = false;
        }
    }
    _doLayout(dimension) {
        const extraHeight = this._getExtraHeight();
        const statusHeight = getTotalHeight(this._elements.status);
        this._elements.root.style.height = `${dimension.height - extraHeight}px`;
        this._elements.root.style.width = `${dimension.width}px`;
        this._chatWidget.layout(dimension.height - statusHeight - extraHeight, dimension.width);
    }
    get contentHeight() {
        const data = {
            chatWidgetContentHeight: this._chatWidget.contentHeight,
            statusHeight: getTotalHeight(this._elements.status),
            extraHeight: this._getExtraHeight()
        };
        const result = data.chatWidgetContentHeight + data.statusHeight + data.extraHeight;
        return result;
    }
    get minHeight() {
        let maxWidgetOutputHeight = 100;
        for (const item of this._chatWidget.viewModel?.getItems() ?? []) {
            if (isResponseVM(item) && item.response.value.some(r => r.kind === 'textEditGroup' && !r.state?.applied)) {
                maxWidgetOutputHeight = 270;
                break;
            }
        }
        let value = this.contentHeight;
        value -= this._chatWidget.contentHeight;
        value += Math.min(this._chatWidget.input.contentHeight + maxWidgetOutputHeight, this._chatWidget.contentHeight);
        return value;
    }
    _getExtraHeight() {
        return 2 + 4;
    }
    get value() {
        return this._chatWidget.getInput();
    }
    set value(value) {
        this._chatWidget.setInput(value);
    }
    selectAll(includeSlashCommand = true) {
        let startColumn = 1;
        if (!includeSlashCommand) {
            const match = /^(\/\w+)\s*/.exec(this._chatWidget.inputEditor.getModel().getLineContent(1));
            if (match) {
                startColumn = match[1].length + 1;
            }
        }
        this._chatWidget.inputEditor.setSelection(new Selection(1, startColumn, Number.MAX_SAFE_INTEGER, 1));
    }
    set placeholder(value) {
        this._chatWidget.setInputPlaceholder(value);
    }
    toggleStatus(show) {
        this._elements.toolbar1.classList.toggle('hidden', !show);
        this._elements.toolbar2.classList.toggle('hidden', !show);
        this._elements.status.classList.toggle('hidden', !show);
        this._elements.infoLabel.classList.toggle('hidden', !show);
        this._onDidChangeHeight.fire();
    }
    updateToolbar(show) {
        this._elements.root.classList.toggle('toolbar', show);
        this._elements.toolbar1.classList.toggle('hidden', !show);
        this._elements.toolbar2.classList.toggle('hidden', !show);
        this._elements.status.classList.toggle('actions', show);
        this._elements.infoLabel.classList.toggle('hidden', show);
        this._onDidChangeHeight.fire();
    }
    async getCodeBlockInfo(codeBlockIndex) {
        const { viewModel } = this._chatWidget;
        if (!viewModel) {
            return undefined;
        }
        const items = viewModel.getItems().filter(i => isResponseVM(i));
        if (!items.length) {
            return;
        }
        const item = items[items.length - 1];
        return viewModel.codeBlockModelCollection.get(viewModel.sessionId, item, codeBlockIndex)?.model;
    }
    get responseContent() {
        const requests = this._chatWidget.viewModel?.model.getRequests();
        if (!isNonEmptyArray(requests)) {
            return undefined;
        }
        return tail(requests)?.response?.response.toString();
    }
    getChatModel() {
        return this._chatWidget.viewModel?.model ?? this._defaultChatModel;
    }
    setChatModel(chatModel) {
        this._chatWidget.setModel(chatModel, { inputValue: undefined });
    }
    updateChatMessage(message, isIncomplete, isCodeBlockEditable) {
        if (!this._chatWidget.viewModel || this._chatWidget.viewModel.model !== this._defaultChatModel) {
            return;
        }
        const model = this._defaultChatModel;
        if (!message?.message.value) {
            for (const request of model.getRequests()) {
                model.removeRequest(request.id);
            }
            return;
        }
        const chatRequest = model.addRequest({ parts: [], text: '' }, { variables: [] }, 0);
        model.acceptResponseProgress(chatRequest, {
            kind: 'markdownContent',
            content: message.message
        });
        if (!isIncomplete) {
            model.completeResponse(chatRequest);
            return;
        }
        return {
            cancel: () => model.cancelRequest(chatRequest),
            complete: () => model.completeResponse(chatRequest),
            appendContent: (fragment) => {
                model.acceptResponseProgress(chatRequest, {
                    kind: 'markdownContent',
                    content: new MarkdownString(fragment)
                });
            }
        };
    }
    updateInfo(message) {
        this._elements.infoLabel.classList.toggle('hidden', !message);
        const renderedMessage = renderLabelWithIcons(message);
        reset(this._elements.infoLabel, ...renderedMessage);
        this._onDidChangeHeight.fire();
    }
    updateStatus(message, ops = {}) {
        const isTempMessage = typeof ops.resetAfter === 'number';
        if (isTempMessage && !this._elements.statusLabel.dataset['state']) {
            const statusLabel = this._elements.statusLabel.innerText;
            const title = this._elements.statusLabel.dataset['title'];
            const classes = Array.from(this._elements.statusLabel.classList.values());
            setTimeout(() => {
                this.updateStatus(statusLabel, { classes, keepMessage: true, title });
            }, ops.resetAfter);
        }
        const renderedMessage = renderLabelWithIcons(message);
        reset(this._elements.statusLabel, ...renderedMessage);
        this._elements.statusLabel.className = `label status ${(ops.classes ?? []).join(' ')}`;
        this._elements.statusLabel.classList.toggle('hidden', !message);
        if (isTempMessage) {
            this._elements.statusLabel.dataset['state'] = 'temp';
        }
        else {
            delete this._elements.statusLabel.dataset['state'];
        }
        if (ops.title) {
            this._elements.statusLabel.dataset['title'] = ops.title;
        }
        else {
            delete this._elements.statusLabel.dataset['title'];
        }
        this._onDidChangeHeight.fire();
    }
    reset() {
        this._chatWidget.setContext(true);
        this._chatWidget.saveState();
        this.updateChatMessage(undefined);
        reset(this._elements.statusLabel);
        this._elements.statusLabel.classList.toggle('hidden', true);
        this._elements.toolbar1.classList.add('hidden');
        this._elements.toolbar2.classList.add('hidden');
        this.updateInfo('');
        this.chatWidget.setModel(this._defaultChatModel, {});
        this._elements.accessibleViewer.classList.toggle('hidden', true);
        this._onDidChangeHeight.fire();
    }
    focus() {
        this._chatWidget.focusInput();
    }
    hasFocus() {
        return this.domNode.contains(getActiveElement());
    }
};
InlineChatWidget = __decorate([
    __param(2, IInstantiationService),
    __param(3, IContextKeyService),
    __param(4, IKeybindingService),
    __param(5, IAccessibilityService),
    __param(6, IConfigurationService),
    __param(7, IAccessibleViewService),
    __param(8, ITextModelService),
    __param(9, IChatService),
    __param(10, IHoverService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], InlineChatWidget);
export { InlineChatWidget };
const defaultAriaLabel = localize('aria-label', "Inline Chat Input");
let EditorBasedInlineChatWidget = class EditorBasedInlineChatWidget extends InlineChatWidget {
    constructor(location, _parentEditor, options, contextKeyService, keybindingService, instantiationService, accessibilityService, configurationService, accessibleViewService, textModelResolverService, chatService, hoverService, layoutService) {
        super(location, {
            ...options,
            chatWidgetViewOptions: {
                ...options.chatWidgetViewOptions,
                editorOverflowWidgetsDomNode: layoutService.mainContainer.appendChild($('.inline-chat-overflow.monaco-editor'))
            }
        }, instantiationService, contextKeyService, keybindingService, accessibilityService, configurationService, accessibleViewService, textModelResolverService, chatService, hoverService);
        this._parentEditor = _parentEditor;
        this._accessibleViewer = this._store.add(new MutableDisposable());
    }
    get contentHeight() {
        let result = super.contentHeight;
        if (this._accessibleViewer.value) {
            result += this._accessibleViewer.value.height + 8;
        }
        return result;
    }
    _doLayout(dimension) {
        let newHeight = dimension.height;
        if (this._accessibleViewer.value) {
            this._accessibleViewer.value.width = dimension.width - 12;
            newHeight -= this._accessibleViewer.value.height + 8;
        }
        super._doLayout(dimension.with(undefined, newHeight));
        this._elements.root.style.height = `${dimension.height - this._getExtraHeight()}px`;
    }
    reset() {
        this._accessibleViewer.clear();
        super.reset();
    }
    showAccessibleHunk(session, hunkData) {
        this._elements.accessibleViewer.classList.remove('hidden');
        this._accessibleViewer.clear();
        this._accessibleViewer.value = this._instantiationService.createInstance(HunkAccessibleDiffViewer, this._elements.accessibleViewer, session, hunkData, new AccessibleHunk(this._parentEditor, session, hunkData));
        this._onDidChangeHeight.fire();
    }
};
EditorBasedInlineChatWidget = __decorate([
    __param(3, IContextKeyService),
    __param(4, IKeybindingService),
    __param(5, IInstantiationService),
    __param(6, IAccessibilityService),
    __param(7, IConfigurationService),
    __param(8, IAccessibleViewService),
    __param(9, ITextModelService),
    __param(10, IChatService),
    __param(11, IHoverService),
    __param(12, ILayoutService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], EditorBasedInlineChatWidget);
export { EditorBasedInlineChatWidget };
let HunkAccessibleDiffViewer = HunkAccessibleDiffViewer_1 = class HunkAccessibleDiffViewer extends AccessibleDiffViewer {
    set width(value) {
        this._width2.set(value, undefined);
    }
    constructor(parentNode, session, hunk, models, instantiationService) {
        const width = observableValue('width', 0);
        const diff = observableValue('diff', HunkAccessibleDiffViewer_1._asMapping(hunk));
        const diffs = derived(r => [diff.read(r)]);
        const lines = Math.min(10, 8 + diff.get().changedLineCount);
        const height = models.getModifiedOptions().get(69) * lines;
        super(parentNode, constObservable(true), () => { }, constObservable(false), width, constObservable(height), diffs, models, instantiationService);
        this.height = height;
        this._width2 = width;
        this._store.add(session.textModelN.onDidChangeContent(() => {
            diff.set(HunkAccessibleDiffViewer_1._asMapping(hunk), undefined);
        }));
    }
    static _asMapping(hunk) {
        const ranges0 = hunk.getRanges0();
        const rangesN = hunk.getRangesN();
        const originalLineRange = LineRange.fromRangeInclusive(ranges0[0]);
        const modifiedLineRange = LineRange.fromRangeInclusive(rangesN[0]);
        const innerChanges = [];
        for (let i = 1; i < ranges0.length; i++) {
            innerChanges.push(new RangeMapping(ranges0[i], rangesN[i]));
        }
        return new DetailedLineRangeMapping(originalLineRange, modifiedLineRange, innerChanges);
    }
};
HunkAccessibleDiffViewer = HunkAccessibleDiffViewer_1 = __decorate([
    __param(4, IInstantiationService),
    __metadata("design:paramtypes", [HTMLElement,
        Session, Object, Object, Object])
], HunkAccessibleDiffViewer);
class AccessibleHunk {
    constructor(_editor, _session, _hunk) {
        this._editor = _editor;
        this._session = _session;
        this._hunk = _hunk;
    }
    getOriginalModel() {
        return this._session.textModel0;
    }
    getModifiedModel() {
        return this._session.textModelN;
    }
    getOriginalOptions() {
        return this._editor.getOptions();
    }
    getModifiedOptions() {
        return this._editor.getOptions();
    }
    originalReveal(range) {
    }
    modifiedReveal(range) {
        this._editor.revealRangeInCenterIfOutsideViewport(range || this._hunk.getRangesN()[0], 0);
    }
    modifiedSetSelection(range) {
    }
    modifiedFocus() {
        this._editor.focus();
    }
    getModifiedPosition() {
        return this._hunk.getRangesN()[0].getStartPosition();
    }
}
