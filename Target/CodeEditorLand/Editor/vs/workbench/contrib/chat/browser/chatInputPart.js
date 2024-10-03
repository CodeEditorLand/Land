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
var ChatInputPart_1;
import * as dom from '../../../../base/browser/dom.js';
import { DEFAULT_FONT_FAMILY } from '../../../../base/browser/fonts.js';
import { StandardKeyboardEvent } from '../../../../base/browser/keyboardEvent.js';
import * as aria from '../../../../base/browser/ui/aria/aria.js';
import { Button } from '../../../../base/browser/ui/button/button.js';
import { createInstantHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { renderLabelWithIcons } from '../../../../base/browser/ui/iconLabel/iconLabels.js';
import { ProgressBar } from '../../../../base/browser/ui/progressbar/progressbar.js';
import { Codicon } from '../../../../base/common/codicons.js';
import { Emitter } from '../../../../base/common/event.js';
import { HistoryNavigator2 } from '../../../../base/common/history.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../base/common/lifecycle.js';
import { ResourceSet } from '../../../../base/common/map.js';
import { basename, dirname } from '../../../../base/common/path.js';
import { isMacintosh } from '../../../../base/common/platform.js';
import { URI } from '../../../../base/common/uri.js';
import { EditorExtensionsRegistry } from '../../../../editor/browser/editorExtensions.js';
import { CodeEditorWidget } from '../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import { EditorOptions } from '../../../../editor/common/config/editorOptions.js';
import { Range } from '../../../../editor/common/core/range.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { CopyPasteController } from '../../../../editor/contrib/dropOrPasteInto/browser/copyPasteController.js';
import { ContentHoverController } from '../../../../editor/contrib/hover/browser/contentHoverController.js';
import { GlyphHoverController } from '../../../../editor/contrib/hover/browser/glyphHoverController.js';
import { SuggestController } from '../../../../editor/contrib/suggest/browser/suggestController.js';
import { localize } from '../../../../nls.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { DropdownWithPrimaryActionViewItem } from '../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js';
import { createAndFillInActionBarActions, MenuEntryActionViewItem } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { MenuWorkbenchToolBar } from '../../../../platform/actions/browser/toolbar.js';
import { IMenuService, MenuId, MenuItemAction } from '../../../../platform/actions/common/actions.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { FileKind, IFileService } from '../../../../platform/files/common/files.js';
import { registerAndCreateHistoryNavigationContext } from '../../../../platform/history/browser/contextScopedHistoryWidget.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ResourceLabels } from '../../../browser/labels.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { getSimpleCodeEditorWidgetOptions, getSimpleEditorOptions, setupSimpleEditorSelectionStyling } from '../../codeEditor/browser/simpleEditorOptions.js';
import { ChatAgentLocation, IChatAgentService } from '../common/chatAgents.js';
import { CONTEXT_CHAT_INPUT_CURSOR_AT_TOP, CONTEXT_CHAT_INPUT_HAS_FOCUS, CONTEXT_CHAT_INPUT_HAS_TEXT, CONTEXT_IN_CHAT_INPUT } from '../common/chatContextKeys.js';
import { IChatWidgetHistoryService } from '../common/chatWidgetHistoryService.js';
import { ILanguageModelsService } from '../common/languageModels.js';
import { CancelAction, ChatModelPickerActionId, ChatSubmitSecondaryAgentAction, SubmitAction } from './actions/chatExecuteActions.js';
import { CollapsibleListPool } from './chatContentParts/chatReferencesContentPart.js';
import { ChatEditingAcceptAllAction, ChatEditingDiscardAllAction, ChatEditingShowChangesAction } from './chatEditingService.js';
import { ChatFollowups } from './chatFollowups.js';
const $ = dom.$;
const INPUT_EDITOR_MAX_HEIGHT = 250;
let ChatInputPart = class ChatInputPart extends Disposable {
    static { ChatInputPart_1 = this; }
    static { this.INPUT_SCHEME = 'chatSessionInput'; }
    static { this._counter = 0; }
    get attachedContext() {
        return this._attachedContext;
    }
    get inputPartHeight() {
        return this._inputPartHeight;
    }
    get followupsHeight() {
        return this._followupsHeight;
    }
    get inputEditor() {
        return this._inputEditor;
    }
    get currentLanguageModel() {
        return this._currentLanguageModel;
    }
    get selectedElements() {
        const edits = [];
        const editsList = this._chatEditList?.object;
        const selectedElements = editsList?.getSelectedElements() ?? [];
        for (const element of selectedElements) {
            if (element.kind === 'reference' && URI.isUri(element.reference)) {
                edits.push(element.reference);
            }
        }
        return edits;
    }
    constructor(location, options, getInputState, historyService, modelService, instantiationService, contextKeyService, configurationService, keybindingService, accessibilityService, languageModelsService, logService, hoverService, fileService, commandService, editorService) {
        super();
        this.location = location;
        this.options = options;
        this.getInputState = getInputState;
        this.historyService = historyService;
        this.modelService = modelService;
        this.instantiationService = instantiationService;
        this.contextKeyService = contextKeyService;
        this.configurationService = configurationService;
        this.keybindingService = keybindingService;
        this.accessibilityService = accessibilityService;
        this.languageModelsService = languageModelsService;
        this.logService = logService;
        this.hoverService = hoverService;
        this.fileService = fileService;
        this.commandService = commandService;
        this.editorService = editorService;
        this._onDidLoadInputState = this._register(new Emitter());
        this.onDidLoadInputState = this._onDidLoadInputState.event;
        this._onDidChangeHeight = this._register(new Emitter());
        this.onDidChangeHeight = this._onDidChangeHeight.event;
        this._onDidFocus = this._register(new Emitter());
        this.onDidFocus = this._onDidFocus.event;
        this._onDidBlur = this._register(new Emitter());
        this.onDidBlur = this._onDidBlur.event;
        this._onDidChangeContext = this._register(new Emitter());
        this.onDidChangeContext = this._onDidChangeContext.event;
        this._onDidAcceptFollowup = this._register(new Emitter());
        this.onDidAcceptFollowup = this._onDidAcceptFollowup.event;
        this._indexOfLastAttachedContextDeletedWithKeyboard = -1;
        this._attachedContext = new Set();
        this._onDidChangeVisibility = this._register(new Emitter());
        this._contextResourceLabels = this.instantiationService.createInstance(ResourceLabels, { onDidChangeVisibility: this._onDidChangeVisibility.event });
        this.inputEditorHeight = 0;
        this.followupsDisposables = this._register(new DisposableStore());
        this.attachedContextDisposables = this._register(new DisposableStore());
        this._inputPartHeight = 0;
        this._followupsHeight = 0;
        this.inHistoryNavigation = false;
        this._waitForPersistedLanguageModel = this._register(new MutableDisposable());
        this._onDidChangeCurrentLanguageModel = new Emitter();
        this.inputUri = URI.parse(`${ChatInputPart_1.INPUT_SCHEME}:input-${ChatInputPart_1._counter++}`);
        this._chatEditsActionsDisposables = this._register(new DisposableStore());
        this._chatEditsDisposables = this._register(new DisposableStore());
        this.inputEditorMaxHeight = this.options.renderStyle === 'compact' ? INPUT_EDITOR_MAX_HEIGHT / 3 : INPUT_EDITOR_MAX_HEIGHT;
        this.inputEditorHasText = CONTEXT_CHAT_INPUT_HAS_TEXT.bindTo(contextKeyService);
        this.chatCursorAtTop = CONTEXT_CHAT_INPUT_CURSOR_AT_TOP.bindTo(contextKeyService);
        this.inputEditorHasFocus = CONTEXT_CHAT_INPUT_HAS_FOCUS.bindTo(contextKeyService);
        this.history = this.loadHistory();
        this._register(this.historyService.onDidClearHistory(() => this.history = new HistoryNavigator2([{ text: '' }], 50, historyKeyFn)));
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration("accessibility.verbosity.panelChat")) {
                this.inputEditor.updateOptions({ ariaLabel: this._getAriaLabel() });
            }
        }));
        this._chatEditsListPool = this._register(this.instantiationService.createInstance(CollapsibleListPool, this._onDidChangeVisibility.event, MenuId.ChatEditingSessionWidgetToolbar, { enableFileDecorations: true }));
    }
    setCurrentLanguageModelToDefault() {
        const defaultLanguageModel = this.languageModelsService.getLanguageModelIds().find(id => this.languageModelsService.lookupLanguageModel(id)?.isDefault);
        const hasUserSelectableLanguageModels = this.languageModelsService.getLanguageModelIds().find(id => {
            const model = this.languageModelsService.lookupLanguageModel(id);
            return model?.isUserSelectable && !model.isDefault;
        });
        this._currentLanguageModel = hasUserSelectableLanguageModels ? defaultLanguageModel : undefined;
    }
    setCurrentLanguageModelByUser(modelId) {
        this._currentLanguageModel = modelId;
        this._waitForPersistedLanguageModel.clear();
        if (this.cachedDimensions) {
            this.layout(this.cachedDimensions.height, this.cachedDimensions.width);
        }
    }
    loadHistory() {
        const history = this.historyService.getHistory(this.location);
        if (history.length === 0) {
            history.push({ text: '' });
        }
        return new HistoryNavigator2(history, 50, historyKeyFn);
    }
    _getAriaLabel() {
        const verbose = this.configurationService.getValue("accessibility.verbosity.panelChat");
        if (verbose) {
            const kbLabel = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp")?.getLabel();
            return kbLabel ? localize('actions.chat.accessibiltyHelp', "Chat Input,  Type to ask questions or type / for topics, press enter to send out the request. Use {0} for Chat Accessibility Help.", kbLabel) : localize('chatInput.accessibilityHelpNoKb', "Chat Input,  Type code here and press Enter to run. Use the Chat Accessibility Help command for more information.");
        }
        return localize('chatInput', "Chat Input");
    }
    updateState(inputState) {
        if (this.inHistoryNavigation) {
            return;
        }
        const newEntry = { text: this._inputEditor.getValue(), state: inputState };
        if (this.history.isAtEnd()) {
            this.history.replaceLast(newEntry);
        }
        else {
            this.history.replaceLast(newEntry);
            this.history.resetCursor();
        }
    }
    initForNewChatModel(state) {
        this.history = this.loadHistory();
        this.history.add({
            text: state.inputValue ?? this.history.current().text,
            state: state.inputState ?? this.getInputState()
        });
        if (state.inputValue) {
            this.setValue(state.inputValue, false);
        }
        if (state.selectedLanguageModelId) {
            const model = this.languageModelsService.lookupLanguageModel(state.selectedLanguageModelId);
            if (model) {
                this._currentLanguageModel = state.selectedLanguageModelId;
                this._onDidChangeCurrentLanguageModel.fire(this._currentLanguageModel);
            }
            else {
                this._waitForPersistedLanguageModel.value = this.languageModelsService.onDidChangeLanguageModels(e => {
                    const persistedModel = e.added?.find(m => m.identifier === state.selectedLanguageModelId);
                    if (persistedModel) {
                        this._waitForPersistedLanguageModel.clear();
                        if (persistedModel.metadata.isUserSelectable) {
                            this._currentLanguageModel = state.selectedLanguageModelId;
                            this._onDidChangeCurrentLanguageModel.fire(this._currentLanguageModel);
                        }
                    }
                });
            }
        }
    }
    logInputHistory() {
        const historyStr = [...this.history].map(entry => JSON.stringify(entry)).join('\n');
        this.logService.info(`[${this.location}] Chat input history:`, historyStr);
    }
    setVisible(visible) {
        this._onDidChangeVisibility.fire(visible);
    }
    get element() {
        return this.container;
    }
    showPreviousValue() {
        const inputState = this.getInputState();
        if (this.history.isAtEnd()) {
            this.saveCurrentValue(inputState);
        }
        else {
            if (!this.history.has({ text: this._inputEditor.getValue(), state: inputState })) {
                this.saveCurrentValue(inputState);
                this.history.resetCursor();
            }
        }
        this.navigateHistory(true);
    }
    showNextValue() {
        const inputState = this.getInputState();
        if (this.history.isAtEnd()) {
            return;
        }
        else {
            if (!this.history.has({ text: this._inputEditor.getValue(), state: inputState })) {
                this.saveCurrentValue(inputState);
                this.history.resetCursor();
            }
        }
        this.navigateHistory(false);
    }
    navigateHistory(previous) {
        const historyEntry = previous ?
            this.history.previous() : this.history.next();
        aria.status(historyEntry.text);
        this.inHistoryNavigation = true;
        this.setValue(historyEntry.text, true);
        this.inHistoryNavigation = false;
        this._onDidLoadInputState.fire(historyEntry.state);
        const model = this._inputEditor.getModel();
        if (!model) {
            return;
        }
        if (previous) {
            const endOfFirstViewLine = this._inputEditor._getViewModel()?.getLineLength(1) ?? 1;
            const endOfFirstModelLine = model.getLineLength(1);
            if (endOfFirstViewLine === endOfFirstModelLine) {
                this._inputEditor.setPosition({ lineNumber: 1, column: endOfFirstViewLine + 1 });
            }
            else {
                this._inputEditor.setPosition({ lineNumber: 1, column: endOfFirstViewLine });
            }
        }
        else {
            this._inputEditor.setPosition(getLastPosition(model));
        }
    }
    setValue(value, transient) {
        this.inputEditor.setValue(value);
        this.inputEditor.setPosition({ lineNumber: 1, column: value.length + 1 });
        if (!transient) {
            this.saveCurrentValue(this.getInputState());
        }
    }
    saveCurrentValue(inputState) {
        const newEntry = { text: this._inputEditor.getValue(), state: inputState };
        this.history.replaceLast(newEntry);
    }
    focus() {
        this._inputEditor.focus();
    }
    hasFocus() {
        return this._inputEditor.hasWidgetFocus();
    }
    async acceptInput(isUserQuery) {
        if (isUserQuery) {
            const userQuery = this._inputEditor.getValue();
            const entry = { text: userQuery, state: this.getInputState() };
            this.history.replaceLast(entry);
            this.history.add({ text: '' });
        }
        this._attachedContext.clear();
        this._onDidLoadInputState.fire({});
        if (this.accessibilityService.isScreenReaderOptimized() && isMacintosh) {
            this._acceptInputForVoiceover();
        }
        else {
            this._inputEditor.focus();
            this._inputEditor.setValue('');
        }
    }
    _acceptInputForVoiceover() {
        const domNode = this._inputEditor.getDomNode();
        if (!domNode) {
            return;
        }
        domNode.remove();
        this._inputEditor.setValue('');
        this._inputEditorElement.appendChild(domNode);
        this._inputEditor.focus();
    }
    attachContext(overwrite, ...contentReferences) {
        const removed = [];
        if (overwrite) {
            removed.push(...Array.from(this._attachedContext));
            this._attachedContext.clear();
        }
        if (contentReferences.length > 0) {
            for (const reference of contentReferences) {
                this._attachedContext.add(reference);
            }
        }
        if (removed.length > 0 || contentReferences.length > 0) {
            this.initAttachedContext(this.attachedContextContainer);
            if (!overwrite) {
                this._onDidChangeContext.fire({ removed, added: contentReferences });
            }
        }
    }
    render(container, initialValue, widget) {
        let elements;
        if (this.options.renderStyle === 'compact') {
            elements = dom.h('.interactive-input-part', [
                dom.h('.interactive-input-and-edit-session', [
                    dom.h('.chat-editing-session@chatEditingSessionWidgetContainer'),
                    dom.h('.interactive-input-and-side-toolbar@inputAndSideToolbar', [
                        dom.h('.chat-input-container@inputContainer', [
                            dom.h('.chat-editor-container@editorContainer'),
                            dom.h('.chat-input-toolbars@inputToolbars'),
                        ]),
                    ]),
                    dom.h('.chat-attached-context@attachedContextContainer'),
                    dom.h('.interactive-input-followups@followupsContainer'),
                ])
            ]);
        }
        else {
            elements = dom.h('.interactive-input-part', [
                dom.h('.interactive-input-followups@followupsContainer'),
                dom.h('.chat-editing-session@chatEditingSessionWidgetContainer'),
                dom.h('.interactive-input-and-side-toolbar@inputAndSideToolbar', [
                    dom.h('.chat-input-container@inputContainer', [
                        dom.h('.chat-editor-container@editorContainer'),
                        dom.h('.chat-attached-context@attachedContextContainer'),
                        dom.h('.chat-input-toolbars@inputToolbars'),
                    ]),
                ]),
            ]);
        }
        this.container = elements.root;
        container.append(this.container);
        this.container.classList.toggle('compact', this.options.renderStyle === 'compact');
        this.followupsContainer = elements.followupsContainer;
        const inputAndSideToolbar = elements.inputAndSideToolbar;
        const inputContainer = elements.inputContainer;
        const editorContainer = elements.editorContainer;
        this.attachedContextContainer = elements.attachedContextContainer;
        const toolbarsContainer = elements.inputToolbars;
        this.chatEditingSessionWidgetContainer = elements.chatEditingSessionWidgetContainer;
        this.initAttachedContext(this.attachedContextContainer);
        this.renderChatEditingSessionState(null, undefined, widget);
        const inputScopedContextKeyService = this._register(this.contextKeyService.createScoped(inputContainer));
        CONTEXT_IN_CHAT_INPUT.bindTo(inputScopedContextKeyService).set(true);
        const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, inputScopedContextKeyService])));
        const { historyNavigationBackwardsEnablement, historyNavigationForwardsEnablement } = this._register(registerAndCreateHistoryNavigationContext(inputScopedContextKeyService, this));
        this.historyNavigationBackwardsEnablement = historyNavigationBackwardsEnablement;
        this.historyNavigationForewardsEnablement = historyNavigationForwardsEnablement;
        const options = getSimpleEditorOptions(this.configurationService);
        options.overflowWidgetsDomNode = this.options.editorOverflowWidgetsDomNode;
        options.pasteAs = EditorOptions.pasteAs.defaultValue;
        options.readOnly = false;
        options.ariaLabel = this._getAriaLabel();
        options.fontFamily = DEFAULT_FONT_FAMILY;
        options.fontSize = 13;
        options.lineHeight = 20;
        options.padding = this.options.renderStyle === 'compact' ? { top: 2, bottom: 2 } : { top: 8, bottom: 8 };
        options.cursorWidth = 1;
        options.wrappingStrategy = 'advanced';
        options.bracketPairColorization = { enabled: false };
        options.suggest = {
            showIcons: false,
            showSnippets: false,
            showWords: true,
            showStatusBar: false,
            insertMode: 'replace',
        };
        options.scrollbar = { ...(options.scrollbar ?? {}), vertical: 'hidden' };
        options.stickyScroll = { enabled: false };
        this._inputEditorElement = dom.append(editorContainer, $(chatInputEditorContainerSelector));
        const editorOptions = getSimpleCodeEditorWidgetOptions();
        editorOptions.contributions?.push(...EditorExtensionsRegistry.getSomeEditorContributions([ContentHoverController.ID, GlyphHoverController.ID, CopyPasteController.ID]));
        this._inputEditor = this._register(scopedInstantiationService.createInstance(CodeEditorWidget, this._inputEditorElement, options, editorOptions));
        SuggestController.get(this._inputEditor)?.forceRenderingAbove();
        this._register(this._inputEditor.onDidChangeModelContent(() => {
            const currentHeight = Math.min(this._inputEditor.getContentHeight(), this.inputEditorMaxHeight);
            if (currentHeight !== this.inputEditorHeight) {
                this.inputEditorHeight = currentHeight;
                this._onDidChangeHeight.fire();
            }
            const model = this._inputEditor.getModel();
            const inputHasText = !!model && model.getValue().trim().length > 0;
            this.inputEditorHasText.set(inputHasText);
        }));
        this._register(this._inputEditor.onDidFocusEditorText(() => {
            this.inputEditorHasFocus.set(true);
            this._onDidFocus.fire();
            inputContainer.classList.toggle('focused', true);
        }));
        this._register(this._inputEditor.onDidBlurEditorText(() => {
            this.inputEditorHasFocus.set(false);
            inputContainer.classList.toggle('focused', false);
            this._onDidBlur.fire();
        }));
        const hoverDelegate = this._register(createInstantHoverDelegate());
        this._register(dom.addStandardDisposableListener(toolbarsContainer, dom.EventType.CLICK, e => this.inputEditor.focus()));
        this.inputActionsToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, toolbarsContainer, MenuId.ChatInput, {
            telemetrySource: this.options.menus.telemetrySource,
            menuOptions: { shouldForwardArgs: true },
            hiddenItemStrategy: 0,
            hoverDelegate
        }));
        this.inputActionsToolbar.context = { widget };
        this._register(this.inputActionsToolbar.onDidChangeMenuItems(() => {
            if (this.cachedDimensions && typeof this.cachedInputToolbarWidth === 'number' && this.cachedInputToolbarWidth !== this.inputActionsToolbar.getItemsWidth()) {
                this.layout(this.cachedDimensions.height, this.cachedDimensions.width);
            }
        }));
        this.executeToolbar = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, toolbarsContainer, this.options.menus.executeToolbar, {
            telemetrySource: this.options.menus.telemetrySource,
            menuOptions: {
                shouldForwardArgs: true
            },
            hoverDelegate,
            hiddenItemStrategy: 0,
            actionViewItemProvider: (action, options) => {
                if (this.location === ChatAgentLocation.Panel) {
                    if ((action.id === SubmitAction.ID || action.id === CancelAction.ID) && action instanceof MenuItemAction) {
                        const dropdownAction = this.instantiationService.createInstance(MenuItemAction, { id: 'chat.moreExecuteActions', title: localize('notebook.moreExecuteActionsLabel', "More..."), icon: Codicon.chevronDown }, undefined, undefined, undefined, undefined);
                        return this.instantiationService.createInstance(ChatSubmitDropdownActionItem, action, dropdownAction, options);
                    }
                }
                if (action.id === ChatModelPickerActionId && action instanceof MenuItemAction) {
                    if (!this._currentLanguageModel) {
                        this.setCurrentLanguageModelToDefault();
                    }
                    if (this._currentLanguageModel) {
                        const itemDelegate = {
                            onDidChangeModel: this._onDidChangeCurrentLanguageModel.event,
                            setModel: (modelId) => {
                                this.setCurrentLanguageModelByUser(modelId);
                            }
                        };
                        return this.instantiationService.createInstance(ModelPickerActionViewItem, action, this._currentLanguageModel, itemDelegate, { hoverDelegate: options.hoverDelegate, keybinding: options.keybinding ?? undefined });
                    }
                }
                return undefined;
            }
        }));
        this.executeToolbar.context = { widget };
        this._register(this.executeToolbar.onDidChangeMenuItems(() => {
            if (this.cachedDimensions && typeof this.cachedExecuteToolbarWidth === 'number' && this.cachedExecuteToolbarWidth !== this.executeToolbar.getItemsWidth()) {
                this.layout(this.cachedDimensions.height, this.cachedDimensions.width);
            }
        }));
        if (this.options.menus.inputSideToolbar) {
            const toolbarSide = this._register(this.instantiationService.createInstance(MenuWorkbenchToolBar, inputAndSideToolbar, this.options.menus.inputSideToolbar, {
                telemetrySource: this.options.menus.telemetrySource,
                menuOptions: {
                    shouldForwardArgs: true
                },
                hoverDelegate
            }));
            this.inputSideToolbarContainer = toolbarSide.getElement();
            toolbarSide.getElement().classList.add('chat-side-toolbar');
            toolbarSide.context = { widget };
        }
        let inputModel = this.modelService.getModel(this.inputUri);
        if (!inputModel) {
            inputModel = this.modelService.createModel('', null, this.inputUri, true);
            this._register(inputModel);
        }
        this.inputModel = inputModel;
        this.inputModel.updateOptions({ bracketColorizationOptions: { enabled: false, independentColorPoolPerBracketType: false } });
        this._inputEditor.setModel(this.inputModel);
        if (initialValue) {
            this.inputModel.setValue(initialValue);
            const lineNumber = this.inputModel.getLineCount();
            this._inputEditor.setPosition({ lineNumber, column: this.inputModel.getLineMaxColumn(lineNumber) });
        }
        const onDidChangeCursorPosition = () => {
            const model = this._inputEditor.getModel();
            if (!model) {
                return;
            }
            const position = this._inputEditor.getPosition();
            if (!position) {
                return;
            }
            const atTop = position.lineNumber === 1 && position.column - 1 <= (this._inputEditor._getViewModel()?.getLineLength(1) ?? 0);
            this.chatCursorAtTop.set(atTop);
            this.historyNavigationBackwardsEnablement.set(atTop);
            this.historyNavigationForewardsEnablement.set(position.equals(getLastPosition(model)));
        };
        this._register(this._inputEditor.onDidChangeCursorPosition(e => onDidChangeCursorPosition()));
        onDidChangeCursorPosition();
    }
    initAttachedContext(container, isLayout = false) {
        const oldHeight = container.offsetHeight;
        dom.clearNode(container);
        this.attachedContextDisposables.clear();
        const hoverDelegate = this.attachedContextDisposables.add(createInstantHoverDelegate());
        dom.setVisibility(Boolean(this.attachedContext.size), this.attachedContextContainer);
        if (!this.attachedContext.size) {
            this._indexOfLastAttachedContextDeletedWithKeyboard = -1;
        }
        [...this.attachedContext.values()].forEach(async (attachment, index) => {
            if (attachment.isFile && this.location === ChatAgentLocation.EditingSession) {
                return;
            }
            const widget = dom.append(container, $('.chat-attached-context-attachment.show-file-icons'));
            const label = this._contextResourceLabels.create(widget, { supportIcons: true, hoverDelegate });
            let hoverElement;
            let ariaLabel;
            const file = URI.isUri(attachment.value) ? attachment.value : attachment.value && typeof attachment.value === 'object' && 'uri' in attachment.value && URI.isUri(attachment.value.uri) ? attachment.value.uri : undefined;
            const range = attachment.value && typeof attachment.value === 'object' && 'range' in attachment.value && Range.isIRange(attachment.value.range) ? attachment.value.range : undefined;
            if (file && attachment.isFile) {
                const fileBasename = basename(file.path);
                const fileDirname = dirname(file.path);
                const friendlyName = `${fileBasename} ${fileDirname}`;
                ariaLabel = range ? localize('chat.fileAttachmentWithRange', "Attached file, {0}, line {1} to line {2}", friendlyName, range.startLineNumber, range.endLineNumber) : localize('chat.fileAttachment', "Attached file, {0}", friendlyName);
                hoverElement = file.fsPath;
                label.setFile(file, {
                    fileKind: FileKind.FILE,
                    hidePath: true,
                    range,
                });
                this.attachButtonAndDisposables(widget, index, attachment, hoverDelegate);
            }
            else if (attachment.isImage) {
                ariaLabel = localize('chat.imageAttachment', "Attached image, {0}", attachment.name);
                hoverElement = dom.$('div.chat-attached-context-hover');
                hoverElement.setAttribute('aria-label', ariaLabel);
                const pillIcon = dom.$('div.chat-attached-context-pill', {}, dom.$('span.codicon.codicon-file-media'));
                const textLabel = dom.$('span.chat-attached-context-custom-text', {}, attachment.name);
                widget.appendChild(pillIcon);
                widget.appendChild(textLabel);
                let buffer;
                try {
                    if (attachment.value instanceof URI) {
                        this.attachButtonAndDisposables(widget, index, attachment, hoverDelegate);
                        const readFile = await this.fileService.readFile(attachment.value);
                        buffer = readFile.value.buffer;
                    }
                    else {
                        buffer = attachment.value;
                        this.attachButtonAndDisposables(widget, index, attachment, hoverDelegate);
                    }
                    this.createImageElements(buffer, widget, hoverElement);
                }
                catch (error) {
                    console.error('Error processing attachment:', error);
                }
                widget.style.position = 'relative';
            }
            else {
                const attachmentLabel = attachment.fullName ?? attachment.name;
                const withIcon = attachment.icon?.id ? `$(${attachment.icon.id}) ${attachmentLabel}` : attachmentLabel;
                label.setLabel(withIcon, undefined);
                ariaLabel = localize('chat.attachment', "Attached context, {0}", attachment.name);
                hoverElement = attachmentLabel;
                this.attachButtonAndDisposables(widget, index, attachment, hoverDelegate);
            }
            widget.tabIndex = 0;
            widget.ariaLabel = ariaLabel;
            if (!this.attachedContextDisposables.isDisposed) {
                this.attachedContextDisposables.add(this.hoverService.setupManagedHover(hoverDelegate, widget, hoverElement, { trapFocus: false }));
            }
        });
        if (oldHeight !== container.offsetHeight && !isLayout) {
            this._onDidChangeHeight.fire();
        }
    }
    attachButtonAndDisposables(widget, index, attachment, hoverDelegate) {
        const clearButton = new Button(widget, {
            supportIcons: true,
            hoverDelegate,
            title: localize('chat.attachment.clearButton', "Remove from context"),
        });
        if (index === Math.min(this._indexOfLastAttachedContextDeletedWithKeyboard, this.attachedContext.size - 1)) {
            clearButton.focus();
        }
        this.attachedContextDisposables.add(clearButton);
        clearButton.icon = Codicon.close;
        const disp = clearButton.onDidClick((e) => {
            this._attachedContext.delete(attachment);
            disp.dispose();
            if (dom.isKeyboardEvent(e)) {
                const event = new StandardKeyboardEvent(e);
                if (event.equals(3) || event.equals(10)) {
                    this._indexOfLastAttachedContextDeletedWithKeyboard = index;
                }
            }
            if (this._attachedContext.size === 0) {
                this.focus();
            }
            this._onDidChangeHeight.fire();
            this._onDidChangeContext.fire({ removed: [attachment] });
        });
        this.attachedContextDisposables.add(disp);
    }
    createImageElements(buffer, widget, hoverElement) {
        const blob = new Blob([buffer], { type: 'image/png' });
        const url = URL.createObjectURL(blob);
        const img = dom.$('img.chat-attached-context-image', { src: url, alt: '' });
        const pillImg = dom.$('img.chat-attached-context-pill-image', { src: url, alt: '' });
        const pill = dom.$('div.chat-attached-context-pill', {}, pillImg);
        const existingPill = widget.querySelector('.chat-attached-context-pill');
        if (existingPill) {
            existingPill.replaceWith(pill);
        }
        hoverElement.appendChild(img);
    }
    async renderChatEditingSessionState(chatEditingSession, initialState, chatWidget) {
        dom.setVisibility(Boolean(chatEditingSession) || Boolean(initialState), this.chatEditingSessionWidgetContainer);
        if (!chatEditingSession && !initialState) {
            dom.clearNode(this.chatEditingSessionWidgetContainer);
            this._chatEditsDisposables.clear();
            this._chatEditList = undefined;
            this._chatEditsProgress?.dispose();
            this._chatEditsProgress = undefined;
            return;
        }
        if (this._chatEditList && chatEditingSession?.state.get() === 2) {
            this._chatEditsProgress?.stop();
            this._chatEditsProgress?.dispose();
            this._chatEditsProgress = undefined;
        }
        const innerContainer = this.chatEditingSessionWidgetContainer.querySelector('.chat-editing-session-container.show-file-icons') ?? dom.append(this.chatEditingSessionWidgetContainer, $('.chat-editing-session-container.show-file-icons'));
        const modifiedFiles = new ResourceSet();
        const entries = chatEditingSession?.entries.get().map((entry) => {
            modifiedFiles.add(entry.modifiedURI);
            return {
                reference: entry.modifiedURI,
                kind: 'reference',
            };
        }) ?? [];
        for (const attachment of this._attachedContext) {
            if (attachment.isFile && URI.isUri(attachment.value) && !modifiedFiles.has(attachment.value)) {
                entries.unshift({
                    reference: attachment.value,
                    kind: 'reference',
                });
                modifiedFiles.add(attachment.value);
            }
        }
        chatEditingSession?.workingSet.get().forEach((file) => {
            if (!modifiedFiles.has(file)) {
                entries.unshift({
                    reference: file,
                    kind: 'reference',
                });
            }
        });
        const overviewRegion = innerContainer.querySelector('.chat-editing-session-overview') ?? dom.append(innerContainer, $('.chat-editing-session-overview'));
        if (entries.length !== this._chatEditList?.object.length) {
            const overviewText = overviewRegion.querySelector('span') ?? dom.append(overviewRegion, $('span'));
            overviewText.textContent = localize('chatEditingSession.workingSet', 'Working Set');
            if (entries.length === 1) {
                overviewText.textContent += ' ' + localize('chatEditingSession.oneFile', '(1 file)');
            }
            else if (entries.length > 1) {
                overviewText.textContent += ' ' + localize('chatEditingSession.manyFiles', '({0} files)', entries.length);
            }
        }
        this._chatEditsActionsDisposables.clear();
        const actionsContainer = innerContainer.querySelector('.chat-editing-session-toolbar-actions') ?? dom.append(overviewRegion, $('.chat-editing-session-toolbar-actions'));
        const button = this._chatEditsActionsDisposables.add(new Button(actionsContainer, {
            supportIcons: false,
            secondary: true
        }));
        button.label = localize('chatAddFiles', 'Add Files...');
        this._chatEditsActionsDisposables.add(button.onDidClick(() => {
            this.commandService.executeCommand('workbench.action.chat.attachContext', { widget: chatWidget });
        }));
        dom.append(actionsContainer, button.element);
        const clearButton = this._chatEditsActionsDisposables.add(new Button(actionsContainer, { supportIcons: true }));
        clearButton.icon = Codicon.close;
        this._chatEditsActionsDisposables.add(clearButton.onDidClick((e) => {
            this.commandService.executeCommand('workbench.action.chat.newEditSession');
        }));
        dom.append(actionsContainer, clearButton.element);
        if (!chatEditingSession) {
            return;
        }
        if (!this._chatEditsProgress && chatEditingSession.state.get() === 1) {
            this._chatEditsProgress = new ProgressBar(innerContainer);
            this._chatEditsProgress.infinite().show(500);
        }
        if (!this._chatEditList) {
            this._chatEditList = this._chatEditsListPool.get();
            const list = this._chatEditList.object;
            this._chatEditsDisposables.add(this._chatEditList);
            this._chatEditsDisposables.add(list.onDidOpen((e) => {
                if (e.element?.kind === 'reference' && URI.isUri(e.element.reference)) {
                    const modifiedFileUri = e.element.reference;
                    const editedFile = chatEditingSession.entries.get().find((e) => e.modifiedURI.toString() === modifiedFileUri.toString());
                    if (editedFile?.state.get() === 0) {
                        void this.editorService.openEditor({
                            original: { resource: URI.from(editedFile.originalURI, true) },
                            modified: { resource: URI.from(editedFile.modifiedURI, true) },
                        });
                    }
                    else if (editedFile) {
                        void this.editorService.openEditor({ resource: modifiedFileUri });
                    }
                }
            }));
            dom.append(innerContainer, list.getHTMLElement());
        }
        const maxItemsShown = 6;
        const itemsShown = Math.min(entries.length, maxItemsShown);
        const height = itemsShown * 22;
        const list = this._chatEditList.object;
        list.layout(height);
        list.getHTMLElement().style.height = `${height}px`;
        list.splice(0, list.length, entries);
        {
            const actionsContainer = innerContainer.querySelector('.chat-editing-session-actions') ?? dom.append(innerContainer, $('.chat-editing-session-actions'));
            dom.clearNode(actionsContainer);
            const actionsContainerRight = actionsContainer.querySelector('.chat-editing-session-actions-group') ?? $('.chat-editing-session-actions-group');
            if (chatEditingSession.entries.get().find((e) => e.state.get() === 0)) {
                const actions = [];
                actions.push({
                    command: ChatEditingShowChangesAction.ID,
                    label: ChatEditingShowChangesAction.LABEL,
                    isSecondary: true
                }, {
                    command: ChatEditingDiscardAllAction.ID,
                    label: ChatEditingDiscardAllAction.LABEL,
                    isSecondary: true,
                    container: actionsContainerRight
                }, {
                    command: ChatEditingAcceptAllAction.ID,
                    label: ChatEditingAcceptAllAction.LABEL,
                    isSecondary: false,
                    container: actionsContainerRight
                });
                for (const action of actions) {
                    const button = this._chatEditsActionsDisposables.add(new Button(action.container ?? actionsContainer, {
                        supportIcons: false,
                        secondary: action.isSecondary
                    }));
                    button.label = action.label;
                    this._chatEditsActionsDisposables.add(button.onDidClick(() => {
                        this.commandService.executeCommand(action.command);
                    }));
                    dom.append(action.container ?? actionsContainer, button.element);
                }
                dom.append(actionsContainer, actionsContainerRight);
            }
        }
    }
    async renderFollowups(items, response) {
        if (!this.options.renderFollowups) {
            return;
        }
        this.followupsDisposables.clear();
        dom.clearNode(this.followupsContainer);
        if (items && items.length > 0) {
            this.followupsDisposables.add(this.instantiationService.createInstance(ChatFollowups, this.followupsContainer, items, this.location, undefined, followup => this._onDidAcceptFollowup.fire({ followup, response })));
        }
        this._onDidChangeHeight.fire();
    }
    get contentHeight() {
        const data = this.getLayoutData();
        return data.followupsHeight + data.inputPartEditorHeight + data.inputPartVerticalPadding + data.inputEditorBorder + data.attachmentsHeight + data.toolbarsHeight + data.chatEditingStateHeight;
    }
    layout(height, width) {
        this.cachedDimensions = new dom.Dimension(width, height);
        return this._layout(height, width);
    }
    _layout(height, width, allowRecurse = true) {
        this.initAttachedContext(this.attachedContextContainer, true);
        const data = this.getLayoutData();
        const inputEditorHeight = Math.min(data.inputPartEditorHeight, height - data.followupsHeight - data.attachmentsHeight - data.inputPartVerticalPadding - data.toolbarsHeight);
        const followupsWidth = width - data.inputPartHorizontalPadding;
        this.followupsContainer.style.width = `${followupsWidth}px`;
        this._inputPartHeight = data.inputPartVerticalPadding + data.followupsHeight + inputEditorHeight + data.inputEditorBorder + data.attachmentsHeight + data.toolbarsHeight + data.chatEditingStateHeight;
        this._followupsHeight = data.followupsHeight;
        const initialEditorScrollWidth = this._inputEditor.getScrollWidth();
        const newEditorWidth = width - data.inputPartHorizontalPadding - data.editorBorder - data.inputPartHorizontalPaddingInside - data.toolbarsWidth - data.sideToolbarWidth;
        const newDimension = { width: newEditorWidth, height: inputEditorHeight };
        if (!this.previousInputEditorDimension || (this.previousInputEditorDimension.width !== newDimension.width || this.previousInputEditorDimension.height !== newDimension.height)) {
            this._inputEditor.layout(newDimension);
            this.previousInputEditorDimension = newDimension;
        }
        if (allowRecurse && initialEditorScrollWidth < 10) {
            return this._layout(height, width, false);
        }
    }
    getLayoutData() {
        const executeToolbarWidth = this.cachedExecuteToolbarWidth = this.executeToolbar.getItemsWidth();
        const inputToolbarWidth = this.cachedInputToolbarWidth = this.inputActionsToolbar.getItemsWidth();
        const executeToolbarPadding = (this.executeToolbar.getItemsLength() - 1) * 4;
        const inputToolbarPadding = this.inputActionsToolbar.getItemsLength() ? (this.inputActionsToolbar.getItemsLength() - 1) * 4 : 0;
        return {
            inputEditorBorder: 2,
            followupsHeight: this.followupsContainer.offsetHeight,
            inputPartEditorHeight: Math.min(this._inputEditor.getContentHeight(), this.inputEditorMaxHeight),
            inputPartHorizontalPadding: this.options.renderStyle === 'compact' ? 16 : 32,
            inputPartVerticalPadding: this.options.renderStyle === 'compact' ? 12 : 28,
            attachmentsHeight: this.attachedContextContainer.offsetHeight,
            editorBorder: 2,
            inputPartHorizontalPaddingInside: 12,
            toolbarsWidth: this.options.renderStyle === 'compact' ? executeToolbarWidth + executeToolbarPadding + inputToolbarWidth + inputToolbarPadding : 0,
            toolbarsHeight: this.options.renderStyle === 'compact' ? 0 : 22,
            chatEditingStateHeight: this.chatEditingSessionWidgetContainer.offsetHeight,
            sideToolbarWidth: this.inputSideToolbarContainer ? dom.getTotalWidth(this.inputSideToolbarContainer) + 4 : 0,
        };
    }
    saveState() {
        this.saveCurrentValue(this.getInputState());
        const inputHistory = [...this.history];
        this.historyService.saveHistory(this.location, inputHistory);
    }
};
ChatInputPart = ChatInputPart_1 = __decorate([
    __param(3, IChatWidgetHistoryService),
    __param(4, IModelService),
    __param(5, IInstantiationService),
    __param(6, IContextKeyService),
    __param(7, IConfigurationService),
    __param(8, IKeybindingService),
    __param(9, IAccessibilityService),
    __param(10, ILanguageModelsService),
    __param(11, ILogService),
    __param(12, IHoverService),
    __param(13, IFileService),
    __param(14, ICommandService),
    __param(15, IEditorService),
    __metadata("design:paramtypes", [String, Object, Function, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ChatInputPart);
export { ChatInputPart };
const historyKeyFn = (entry) => JSON.stringify(entry);
function getLastPosition(model) {
    return { lineNumber: model.getLineCount(), column: model.getLineLength(model.getLineCount()) + 1 };
}
let ChatSubmitDropdownActionItem = class ChatSubmitDropdownActionItem extends DropdownWithPrimaryActionViewItem {
    constructor(action, dropdownAction, options, menuService, contextMenuService, chatAgentService, contextKeyService, keybindingService, notificationService, themeService, accessibilityService) {
        super(action, dropdownAction, [], '', {
            ...options,
            getKeyBinding: (action) => keybindingService.lookupKeybinding(action.id, contextKeyService)
        }, contextMenuService, keybindingService, notificationService, contextKeyService, themeService, accessibilityService);
        const menu = menuService.createMenu(MenuId.ChatExecuteSecondary, contextKeyService);
        const setActions = () => {
            const secondary = [];
            createAndFillInActionBarActions(menu, { shouldForwardArgs: true }, secondary);
            const secondaryAgent = chatAgentService.getSecondaryAgent();
            if (secondaryAgent) {
                secondary.forEach(a => {
                    if (a.id === ChatSubmitSecondaryAgentAction.ID) {
                        a.label = localize('chat.submitToSecondaryAgent', "Send to @{0}", secondaryAgent.name);
                    }
                    return a;
                });
            }
            this.update(dropdownAction, secondary);
        };
        setActions();
        this._register(menu.onDidChange(() => setActions()));
    }
};
ChatSubmitDropdownActionItem = __decorate([
    __param(3, IMenuService),
    __param(4, IContextMenuService),
    __param(5, IChatAgentService),
    __param(6, IContextKeyService),
    __param(7, IKeybindingService),
    __param(8, INotificationService),
    __param(9, IThemeService),
    __param(10, IAccessibilityService),
    __metadata("design:paramtypes", [MenuItemAction, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ChatSubmitDropdownActionItem);
let ModelPickerActionViewItem = class ModelPickerActionViewItem extends MenuEntryActionViewItem {
    constructor(action, currentLanguageModel, delegate, options, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, _languageModelsService, _accessibilityService) {
        super(action, options, keybindingService, notificationService, contextKeyService, themeService, contextMenuService, _accessibilityService);
        this.currentLanguageModel = currentLanguageModel;
        this.delegate = delegate;
        this._languageModelsService = _languageModelsService;
        this._register(delegate.onDidChangeModel(modelId => {
            this.currentLanguageModel = modelId;
            this.updateLabel();
        }));
    }
    async onClick(event) {
        this._openContextMenu();
    }
    render(container) {
        super.render(container);
        container.classList.add('chat-modelPicker-item');
        this._register(dom.addDisposableListener(container, dom.EventType.KEY_UP, e => {
            const event = new StandardKeyboardEvent(e);
            if (event.equals(3) || event.equals(10)) {
                this._openContextMenu();
            }
        }));
    }
    updateLabel() {
        if (this.label) {
            const model = this._languageModelsService.lookupLanguageModel(this.currentLanguageModel);
            if (model) {
                this.label.textContent = model.name;
                dom.reset(this.label, ...renderLabelWithIcons(`${model.name}$(chevron-down)`));
            }
        }
    }
    _openContextMenu() {
        const setLanguageModelAction = (id, modelMetadata) => {
            return {
                id,
                label: modelMetadata.name,
                tooltip: '',
                class: undefined,
                enabled: true,
                checked: id === this.currentLanguageModel,
                run: () => {
                    this.currentLanguageModel = id;
                    this.updateLabel();
                    this.delegate.setModel(id);
                }
            };
        };
        const models = this._languageModelsService.getLanguageModelIds()
            .map(modelId => ({ id: modelId, model: this._languageModelsService.lookupLanguageModel(modelId) }))
            .filter(entry => entry.model?.isUserSelectable);
        this._contextMenuService.showContextMenu({
            getAnchor: () => this.element,
            getActions: () => models.map(entry => setLanguageModelAction(entry.id, entry.model)),
        });
    }
};
ModelPickerActionViewItem = __decorate([
    __param(4, IKeybindingService),
    __param(5, INotificationService),
    __param(6, IContextKeyService),
    __param(7, IThemeService),
    __param(8, IContextMenuService),
    __param(9, ILanguageModelsService),
    __param(10, IAccessibilityService),
    __metadata("design:paramtypes", [MenuItemAction, String, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ModelPickerActionViewItem);
const chatInputEditorContainerSelector = '.interactive-input-editor';
setupSimpleEditorSelectionStyling(chatInputEditorContainerSelector);
