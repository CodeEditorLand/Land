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
var VoiceChatSessions_1, ChatSynthesizerSessions_1, KeywordActivationContribution_1, KeywordActivationStatusEntry_1;
import './media/voiceChatActions.css';
import { RunOnceScheduler, disposableTimeout, raceCancellation } from '../../../../../base/common/async.js';
import { CancellationTokenSource } from '../../../../../base/common/cancellation.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { Event } from '../../../../../base/common/event.js';
import { Disposable, DisposableStore, MutableDisposable, toDisposable } from '../../../../../base/common/lifecycle.js';
import { isNumber } from '../../../../../base/common/types.js';
import { getCodeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { EditorContextKeys } from '../../../../../editor/common/editorContextKeys.js';
import { localize, localize2 } from '../../../../../nls.js';
import { Action2, MenuId } from '../../../../../platform/actions/common/actions.js';
import { CommandsRegistry, ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { Extensions } from '../../../../../platform/configuration/common/configurationRegistry.js';
import { ContextKeyExpr, IContextKeyService, RawContextKey } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../../platform/keybinding/common/keybinding.js';
import { Registry } from '../../../../../platform/registry/common/platform.js';
import { contrastBorder, focusBorder } from '../../../../../platform/theme/common/colorRegistry.js';
import { spinningLoading, syncing } from '../../../../../platform/theme/common/iconRegistry.js';
import { ColorScheme } from '../../../../../platform/theme/common/theme.js';
import { registerThemingParticipant } from '../../../../../platform/theme/common/themeService.js';
import { ActiveEditorContext } from '../../../../common/contextkeys.js';
import { ACTIVITY_BAR_BADGE_BACKGROUND } from '../../../../common/theme.js';
import { SpeechTimeoutDefault, accessibilityConfigurationNodeBase } from '../../../accessibility/browser/accessibilityConfiguration.js';
import { CHAT_CATEGORY } from '../../browser/actions/chatActions.js';
import { IChatWidgetService, IQuickChatService, showChatView } from '../../browser/chat.js';
import { ChatAgentLocation, IChatAgentService } from '../../common/chatAgents.js';
import { CONTEXT_CHAT_REQUEST_IN_PROGRESS, CONTEXT_IN_CHAT_INPUT, CONTEXT_CHAT_ENABLED, CONTEXT_RESPONSE, CONTEXT_RESPONSE_FILTERED, CONTEXT_CHAT_LOCATION } from '../../common/chatContextKeys.js';
import { KEYWORD_ACTIVIATION_SETTING_ID } from '../../common/chatService.js';
import { ChatResponseViewModel, isResponseVM } from '../../common/chatViewModel.js';
import { IVoiceChatService, VoiceChatInProgress as GlobalVoiceChatInProgress } from '../../common/voiceChatService.js';
import { IExtensionsWorkbenchService } from '../../../extensions/common/extensions.js';
import { InlineChatController } from '../../../inlineChat/browser/inlineChatController.js';
import { CTX_INLINE_CHAT_FOCUSED, MENU_INLINE_CHAT_WIDGET_SECONDARY } from '../../../inlineChat/common/inlineChat.js';
import { NOTEBOOK_EDITOR_FOCUSED } from '../../../notebook/common/notebookContextKeys.js';
import { HasSpeechProvider, ISpeechService, KeywordRecognitionStatus, SpeechToTextInProgress, SpeechToTextStatus, TextToSpeechStatus, TextToSpeechInProgress as GlobalTextToSpeechInProgress } from '../../../speech/common/speechService.js';
import { ITerminalService } from '../../../terminal/browser/terminal.js';
import { TerminalChatContextKeys, TerminalChatController } from '../../../terminal/terminalContribChatExports.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
import { IHostService } from '../../../../services/host/browser/host.js';
import { IWorkbenchLayoutService } from '../../../../services/layout/browser/layoutService.js';
import { IStatusbarService } from '../../../../services/statusbar/browser/statusbar.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
import { IAccessibilityService } from '../../../../../platform/accessibility/common/accessibility.js';
import { renderStringAsPlaintext } from '../../../../../base/browser/markdownRenderer.js';
const VoiceChatSessionContexts = ['view', 'inline', 'terminal', 'quick', 'editor'];
const CanVoiceChat = ContextKeyExpr.and(CONTEXT_CHAT_ENABLED, HasSpeechProvider);
const FocusInChatInput = ContextKeyExpr.or(CTX_INLINE_CHAT_FOCUSED, CONTEXT_IN_CHAT_INPUT);
const AnyChatRequestInProgress = ContextKeyExpr.or(CONTEXT_CHAT_REQUEST_IN_PROGRESS, TerminalChatContextKeys.requestActive);
const ScopedVoiceChatGettingReady = new RawContextKey('scopedVoiceChatGettingReady', false, { type: 'boolean', description: localize('scopedVoiceChatGettingReady', "True when getting ready for receiving voice input from the microphone for voice chat. This key is only defined scoped, per chat context.") });
const ScopedVoiceChatInProgress = new RawContextKey('scopedVoiceChatInProgress', undefined, { type: 'string', description: localize('scopedVoiceChatInProgress', "Defined as a location where voice recording from microphone is in progress for voice chat. This key is only defined scoped, per chat context.") });
const AnyScopedVoiceChatInProgress = ContextKeyExpr.or(...VoiceChatSessionContexts.map(context => ScopedVoiceChatInProgress.isEqualTo(context)));
var VoiceChatSessionState;
(function (VoiceChatSessionState) {
    VoiceChatSessionState[VoiceChatSessionState["Stopped"] = 1] = "Stopped";
    VoiceChatSessionState[VoiceChatSessionState["GettingReady"] = 2] = "GettingReady";
    VoiceChatSessionState[VoiceChatSessionState["Started"] = 3] = "Started";
})(VoiceChatSessionState || (VoiceChatSessionState = {}));
class VoiceChatSessionControllerFactory {
    static async create(accessor, context) {
        const chatWidgetService = accessor.get(IChatWidgetService);
        const quickChatService = accessor.get(IQuickChatService);
        const layoutService = accessor.get(IWorkbenchLayoutService);
        const editorService = accessor.get(IEditorService);
        const terminalService = accessor.get(ITerminalService);
        const viewsService = accessor.get(IViewsService);
        switch (context) {
            case 'focused': {
                const controller = VoiceChatSessionControllerFactory.doCreateForFocusedChat(terminalService, chatWidgetService, layoutService);
                return controller ?? VoiceChatSessionControllerFactory.create(accessor, 'view');
            }
            case 'view': {
                const chatWidget = await showChatView(viewsService);
                if (chatWidget) {
                    return VoiceChatSessionControllerFactory.doCreateForChatWidget('view', chatWidget);
                }
                break;
            }
            case 'inline': {
                const activeCodeEditor = getCodeEditor(editorService.activeTextEditorControl);
                if (activeCodeEditor) {
                    const inlineChat = InlineChatController.get(activeCodeEditor);
                    if (inlineChat) {
                        if (!inlineChat.joinCurrentRun()) {
                            inlineChat.run();
                        }
                        return VoiceChatSessionControllerFactory.doCreateForChatWidget('inline', inlineChat.chatWidget);
                    }
                }
                break;
            }
            case 'quick': {
                quickChatService.open();
                return VoiceChatSessionControllerFactory.create(accessor, 'focused');
            }
        }
        return undefined;
    }
    static doCreateForFocusedChat(terminalService, chatWidgetService, layoutService) {
        const activeInstance = terminalService.activeInstance;
        if (activeInstance) {
            const terminalChat = TerminalChatController.activeChatController || TerminalChatController.get(activeInstance);
            if (terminalChat?.hasFocus()) {
                return VoiceChatSessionControllerFactory.doCreateForTerminalChat(terminalChat);
            }
        }
        const chatWidget = chatWidgetService.lastFocusedWidget;
        if (chatWidget?.hasInputFocus()) {
            let context;
            if (layoutService.hasFocus("workbench.parts.editor")) {
                context = chatWidget.location === ChatAgentLocation.Panel ? 'editor' : 'inline';
            }
            else if (["workbench.parts.sidebar", "workbench.parts.panel", "workbench.parts.auxiliarybar", "workbench.parts.titlebar", "workbench.parts.statusbar", "workbench.parts.banner", "workbench.parts.activitybar"].some(part => layoutService.hasFocus(part))) {
                context = 'view';
            }
            else {
                context = 'quick';
            }
            return VoiceChatSessionControllerFactory.doCreateForChatWidget(context, chatWidget);
        }
        return undefined;
    }
    static createChatContextKeyController(contextKeyService, context) {
        const contextVoiceChatGettingReady = ScopedVoiceChatGettingReady.bindTo(contextKeyService);
        const contextVoiceChatInProgress = ScopedVoiceChatInProgress.bindTo(contextKeyService);
        return (state) => {
            switch (state) {
                case VoiceChatSessionState.GettingReady:
                    contextVoiceChatGettingReady.set(true);
                    contextVoiceChatInProgress.reset();
                    break;
                case VoiceChatSessionState.Started:
                    contextVoiceChatGettingReady.reset();
                    contextVoiceChatInProgress.set(context);
                    break;
                case VoiceChatSessionState.Stopped:
                    contextVoiceChatGettingReady.reset();
                    contextVoiceChatInProgress.reset();
                    break;
            }
        };
    }
    static doCreateForChatWidget(context, chatWidget) {
        return {
            context,
            scopedContextKeyService: chatWidget.scopedContextKeyService,
            onDidAcceptInput: chatWidget.onDidAcceptInput,
            onDidHideInput: chatWidget.onDidHide,
            focusInput: () => chatWidget.focusInput(),
            acceptInput: () => chatWidget.acceptInput(undefined, true),
            updateInput: text => chatWidget.setInput(text),
            getInput: () => chatWidget.getInput(),
            setInputPlaceholder: text => chatWidget.setInputPlaceholder(text),
            clearInputPlaceholder: () => chatWidget.resetInputPlaceholder(),
            updateState: VoiceChatSessionControllerFactory.createChatContextKeyController(chatWidget.scopedContextKeyService, context)
        };
    }
    static doCreateForTerminalChat(terminalChat) {
        const context = 'terminal';
        return {
            context,
            scopedContextKeyService: terminalChat.scopedContextKeyService,
            onDidAcceptInput: terminalChat.onDidAcceptInput,
            onDidHideInput: terminalChat.onDidHide,
            focusInput: () => terminalChat.focus(),
            acceptInput: () => terminalChat.acceptInput(true),
            updateInput: text => terminalChat.updateInput(text, false),
            getInput: () => terminalChat.getInput(),
            setInputPlaceholder: text => terminalChat.setPlaceholder(text),
            clearInputPlaceholder: () => terminalChat.resetPlaceholder(),
            updateState: VoiceChatSessionControllerFactory.createChatContextKeyController(terminalChat.scopedContextKeyService, context)
        };
    }
}
let VoiceChatSessions = class VoiceChatSessions {
    static { VoiceChatSessions_1 = this; }
    static { this.instance = undefined; }
    static getInstance(instantiationService) {
        if (!VoiceChatSessions_1.instance) {
            VoiceChatSessions_1.instance = instantiationService.createInstance(VoiceChatSessions_1);
        }
        return VoiceChatSessions_1.instance;
    }
    constructor(voiceChatService, configurationService, instantiationService, accessibilityService) {
        this.voiceChatService = voiceChatService;
        this.configurationService = configurationService;
        this.instantiationService = instantiationService;
        this.accessibilityService = accessibilityService;
        this.currentVoiceChatSession = undefined;
        this.voiceChatSessionIds = 0;
    }
    async start(controller, context) {
        this.stop();
        ChatSynthesizerSessions.getInstance(this.instantiationService).stop();
        let disableTimeout = false;
        const sessionId = ++this.voiceChatSessionIds;
        const session = this.currentVoiceChatSession = {
            id: sessionId,
            controller,
            hasRecognizedInput: false,
            disposables: new DisposableStore(),
            setTimeoutDisabled: (disabled) => { disableTimeout = disabled; },
            accept: () => this.accept(sessionId),
            stop: () => this.stop(sessionId, controller.context)
        };
        const cts = new CancellationTokenSource();
        session.disposables.add(toDisposable(() => cts.dispose(true)));
        session.disposables.add(controller.onDidAcceptInput(() => this.stop(sessionId, controller.context)));
        session.disposables.add(controller.onDidHideInput(() => this.stop(sessionId, controller.context)));
        controller.focusInput();
        controller.updateState(VoiceChatSessionState.GettingReady);
        const voiceChatSession = await this.voiceChatService.createVoiceChatSession(cts.token, { usesAgents: controller.context !== 'inline', model: context?.widget?.viewModel?.model });
        let inputValue = controller.getInput();
        let voiceChatTimeout = this.configurationService.getValue("accessibility.voice.speechTimeout");
        if (!isNumber(voiceChatTimeout) || voiceChatTimeout < 0) {
            voiceChatTimeout = SpeechTimeoutDefault;
        }
        const acceptTranscriptionScheduler = session.disposables.add(new RunOnceScheduler(() => this.accept(sessionId), voiceChatTimeout));
        session.disposables.add(voiceChatSession.onDidChange(({ status, text, waitingForInput }) => {
            if (cts.token.isCancellationRequested) {
                return;
            }
            switch (status) {
                case SpeechToTextStatus.Started:
                    this.onDidSpeechToTextSessionStart(controller, session.disposables);
                    break;
                case SpeechToTextStatus.Recognizing:
                    if (text) {
                        session.hasRecognizedInput = true;
                        session.controller.updateInput(inputValue ? [inputValue, text].join(' ') : text);
                        if (voiceChatTimeout > 0 && context?.voice?.disableTimeout !== true && !disableTimeout) {
                            acceptTranscriptionScheduler.cancel();
                        }
                    }
                    break;
                case SpeechToTextStatus.Recognized:
                    if (text) {
                        session.hasRecognizedInput = true;
                        inputValue = inputValue ? [inputValue, text].join(' ') : text;
                        session.controller.updateInput(inputValue);
                        if (voiceChatTimeout > 0 && context?.voice?.disableTimeout !== true && !waitingForInput && !disableTimeout) {
                            acceptTranscriptionScheduler.schedule();
                        }
                    }
                    break;
                case SpeechToTextStatus.Stopped:
                    this.stop(session.id, controller.context);
                    break;
            }
        }));
        return session;
    }
    onDidSpeechToTextSessionStart(controller, disposables) {
        controller.updateState(VoiceChatSessionState.Started);
        let dotCount = 0;
        const updatePlaceholder = () => {
            dotCount = (dotCount + 1) % 4;
            controller.setInputPlaceholder(`${localize('listening', "I'm listening")}${'.'.repeat(dotCount)}`);
            placeholderScheduler.schedule();
        };
        const placeholderScheduler = disposables.add(new RunOnceScheduler(updatePlaceholder, 500));
        updatePlaceholder();
    }
    stop(voiceChatSessionId = this.voiceChatSessionIds, context) {
        if (!this.currentVoiceChatSession ||
            this.voiceChatSessionIds !== voiceChatSessionId ||
            (context && this.currentVoiceChatSession.controller.context !== context)) {
            return;
        }
        this.currentVoiceChatSession.controller.clearInputPlaceholder();
        this.currentVoiceChatSession.controller.updateState(VoiceChatSessionState.Stopped);
        this.currentVoiceChatSession.disposables.dispose();
        this.currentVoiceChatSession = undefined;
    }
    async accept(voiceChatSessionId = this.voiceChatSessionIds) {
        if (!this.currentVoiceChatSession ||
            this.voiceChatSessionIds !== voiceChatSessionId) {
            return;
        }
        if (!this.currentVoiceChatSession.hasRecognizedInput) {
            this.stop(voiceChatSessionId, this.currentVoiceChatSession.controller.context);
            return;
        }
        const controller = this.currentVoiceChatSession.controller;
        const response = await controller.acceptInput();
        if (!response) {
            return;
        }
        const autoSynthesize = this.configurationService.getValue("accessibility.voice.autoSynthesize");
        if (autoSynthesize === 'on' || autoSynthesize === 'auto' && !this.accessibilityService.isScreenReaderOptimized()) {
            let context;
            if (controller.context === 'inline') {
                context = 'focused';
            }
            else {
                context = controller;
            }
            ChatSynthesizerSessions.getInstance(this.instantiationService).start(this.instantiationService.invokeFunction(accessor => ChatSynthesizerSessionController.create(accessor, context, response)));
        }
    }
};
VoiceChatSessions = VoiceChatSessions_1 = __decorate([
    __param(0, IVoiceChatService),
    __param(1, IConfigurationService),
    __param(2, IInstantiationService),
    __param(3, IAccessibilityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], VoiceChatSessions);
export const VOICE_KEY_HOLD_THRESHOLD = 500;
async function startVoiceChatWithHoldMode(id, accessor, target, context) {
    const instantiationService = accessor.get(IInstantiationService);
    const keybindingService = accessor.get(IKeybindingService);
    const holdMode = keybindingService.enableKeybindingHoldMode(id);
    const controller = await VoiceChatSessionControllerFactory.create(accessor, target);
    if (!controller) {
        return;
    }
    const session = await VoiceChatSessions.getInstance(instantiationService).start(controller, context);
    let acceptVoice = false;
    const handle = disposableTimeout(() => {
        acceptVoice = true;
        session?.setTimeoutDisabled(true);
    }, VOICE_KEY_HOLD_THRESHOLD);
    await holdMode;
    handle.dispose();
    if (acceptVoice) {
        session.accept();
    }
}
class VoiceChatWithHoldModeAction extends Action2 {
    constructor(desc, target) {
        super(desc);
        this.target = target;
    }
    run(accessor, context) {
        return startVoiceChatWithHoldMode(this.desc.id, accessor, this.target, context);
    }
}
export class VoiceChatInChatViewAction extends VoiceChatWithHoldModeAction {
    static { this.ID = 'workbench.action.chat.voiceChatInChatView'; }
    constructor() {
        super({
            id: VoiceChatInChatViewAction.ID,
            title: localize2('workbench.action.chat.voiceChatInView.label', "Voice Chat in Chat View"),
            category: CHAT_CATEGORY,
            precondition: ContextKeyExpr.and(CanVoiceChat, CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate()),
            f1: true
        }, 'view');
    }
}
export class HoldToVoiceChatInChatViewAction extends Action2 {
    static { this.ID = 'workbench.action.chat.holdToVoiceChatInChatView'; }
    constructor() {
        super({
            id: HoldToVoiceChatInChatViewAction.ID,
            title: localize2('workbench.action.chat.holdToVoiceChatInChatView.label', "Hold to Voice Chat in Chat View"),
            keybinding: {
                weight: 200,
                when: ContextKeyExpr.and(CanVoiceChat, CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate(), FocusInChatInput?.negate(), EditorContextKeys.focus.negate(), NOTEBOOK_EDITOR_FOCUSED.negate()),
                primary: 2048 | 39
            }
        });
    }
    async run(accessor, context) {
        const instantiationService = accessor.get(IInstantiationService);
        const keybindingService = accessor.get(IKeybindingService);
        const viewsService = accessor.get(IViewsService);
        const holdMode = keybindingService.enableKeybindingHoldMode(HoldToVoiceChatInChatViewAction.ID);
        let session;
        const handle = disposableTimeout(async () => {
            const controller = await VoiceChatSessionControllerFactory.create(accessor, 'view');
            if (controller) {
                session = await VoiceChatSessions.getInstance(instantiationService).start(controller, context);
                session.setTimeoutDisabled(true);
            }
        }, VOICE_KEY_HOLD_THRESHOLD);
        (await showChatView(viewsService))?.focusInput();
        await holdMode;
        handle.dispose();
        if (session) {
            session.accept();
        }
    }
}
export class InlineVoiceChatAction extends VoiceChatWithHoldModeAction {
    static { this.ID = 'workbench.action.chat.inlineVoiceChat'; }
    constructor() {
        super({
            id: InlineVoiceChatAction.ID,
            title: localize2('workbench.action.chat.inlineVoiceChat', "Inline Voice Chat"),
            category: CHAT_CATEGORY,
            precondition: ContextKeyExpr.and(CanVoiceChat, ActiveEditorContext, CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate()),
            f1: true
        }, 'inline');
    }
}
export class QuickVoiceChatAction extends VoiceChatWithHoldModeAction {
    static { this.ID = 'workbench.action.chat.quickVoiceChat'; }
    constructor() {
        super({
            id: QuickVoiceChatAction.ID,
            title: localize2('workbench.action.chat.quickVoiceChat.label', "Quick Voice Chat"),
            category: CHAT_CATEGORY,
            precondition: ContextKeyExpr.and(CanVoiceChat, CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate()),
            f1: true
        }, 'quick');
    }
}
export class StartVoiceChatAction extends Action2 {
    static { this.ID = 'workbench.action.chat.startVoiceChat'; }
    constructor() {
        const menuCondition = ContextKeyExpr.and(HasSpeechProvider, ScopedChatSynthesisInProgress.negate(), AnyScopedVoiceChatInProgress?.negate());
        super({
            id: StartVoiceChatAction.ID,
            title: localize2('workbench.action.chat.startVoiceChat.label', "Start Voice Chat"),
            category: CHAT_CATEGORY,
            f1: true,
            keybinding: {
                weight: 200,
                when: ContextKeyExpr.and(FocusInChatInput, EditorContextKeys.focus.negate(), NOTEBOOK_EDITOR_FOCUSED.negate()),
                primary: 2048 | 39
            },
            icon: Codicon.mic,
            precondition: ContextKeyExpr.and(CanVoiceChat, ScopedVoiceChatGettingReady.negate(), AnyChatRequestInProgress?.negate(), SpeechToTextInProgress.negate()),
            menu: [
                {
                    id: MenuId.ChatInput,
                    when: ContextKeyExpr.and(ContextKeyExpr.or(CONTEXT_CHAT_LOCATION.isEqualTo(ChatAgentLocation.Panel), CONTEXT_CHAT_LOCATION.isEqualTo(ChatAgentLocation.EditingSession)), menuCondition),
                    group: 'navigation',
                    order: 3
                },
                {
                    id: MenuId.ChatExecute,
                    when: ContextKeyExpr.and(CONTEXT_CHAT_LOCATION.isEqualTo(ChatAgentLocation.Panel).negate(), menuCondition),
                    group: 'navigation',
                    order: 2
                },
            ]
        });
    }
    async run(accessor, context) {
        const widget = context?.widget;
        if (widget) {
            widget.focusInput();
        }
        return startVoiceChatWithHoldMode(this.desc.id, accessor, 'focused', context);
    }
}
export class StopListeningAction extends Action2 {
    static { this.ID = 'workbench.action.chat.stopListening'; }
    constructor() {
        super({
            id: StopListeningAction.ID,
            title: localize2('workbench.action.chat.stopListening.label', "Stop Listening"),
            category: CHAT_CATEGORY,
            f1: true,
            keybinding: {
                weight: 200 + 100,
                primary: 9,
                when: AnyScopedVoiceChatInProgress
            },
            icon: spinningLoading,
            precondition: GlobalVoiceChatInProgress,
            menu: [
                {
                    id: MenuId.ChatInput,
                    when: ContextKeyExpr.and(CONTEXT_CHAT_LOCATION.isEqualTo(ChatAgentLocation.Panel), AnyScopedVoiceChatInProgress),
                    group: 'navigation',
                    order: 3
                },
                {
                    id: MenuId.ChatExecute,
                    when: ContextKeyExpr.and(CONTEXT_CHAT_LOCATION.isEqualTo(ChatAgentLocation.Panel).negate(), AnyScopedVoiceChatInProgress),
                    group: 'navigation',
                    order: 2
                },
            ]
        });
    }
    async run(accessor) {
        VoiceChatSessions.getInstance(accessor.get(IInstantiationService)).stop();
    }
}
export class StopListeningAndSubmitAction extends Action2 {
    static { this.ID = 'workbench.action.chat.stopListeningAndSubmit'; }
    constructor() {
        super({
            id: StopListeningAndSubmitAction.ID,
            title: localize2('workbench.action.chat.stopListeningAndSubmit.label', "Stop Listening and Submit"),
            category: CHAT_CATEGORY,
            f1: true,
            keybinding: {
                weight: 200,
                when: ContextKeyExpr.and(FocusInChatInput, AnyScopedVoiceChatInProgress),
                primary: 2048 | 39
            },
            precondition: GlobalVoiceChatInProgress
        });
    }
    run(accessor) {
        VoiceChatSessions.getInstance(accessor.get(IInstantiationService)).accept();
    }
}
const ScopedChatSynthesisInProgress = new RawContextKey('scopedChatSynthesisInProgress', false, { type: 'boolean', description: localize('scopedChatSynthesisInProgress', "Defined as a location where voice recording from microphone is in progress for voice chat. This key is only defined scoped, per chat context.") });
class ChatSynthesizerSessionController {
    static create(accessor, context, response) {
        if (context === 'focused') {
            return ChatSynthesizerSessionController.doCreateForFocusedChat(accessor, response);
        }
        else {
            return {
                onDidHideChat: context.onDidHideInput,
                contextKeyService: context.scopedContextKeyService,
                response
            };
        }
    }
    static doCreateForFocusedChat(accessor, response) {
        const chatWidgetService = accessor.get(IChatWidgetService);
        const contextKeyService = accessor.get(IContextKeyService);
        const terminalService = accessor.get(ITerminalService);
        const activeInstance = terminalService.activeInstance;
        if (activeInstance) {
            const terminalChat = TerminalChatController.activeChatController || TerminalChatController.get(activeInstance);
            if (terminalChat?.hasFocus()) {
                return {
                    onDidHideChat: terminalChat.onDidHide,
                    contextKeyService: terminalChat.scopedContextKeyService,
                    response
                };
            }
        }
        let chatWidget = chatWidgetService.getWidgetBySessionId(response.session.sessionId);
        if (chatWidget?.location === ChatAgentLocation.Editor) {
            chatWidget = chatWidgetService.lastFocusedWidget;
        }
        return {
            onDidHideChat: chatWidget?.onDidHide ?? Event.None,
            contextKeyService: chatWidget?.scopedContextKeyService ?? contextKeyService,
            response
        };
    }
}
let ChatSynthesizerSessions = class ChatSynthesizerSessions {
    static { ChatSynthesizerSessions_1 = this; }
    static { this.instance = undefined; }
    static getInstance(instantiationService) {
        if (!ChatSynthesizerSessions_1.instance) {
            ChatSynthesizerSessions_1.instance = instantiationService.createInstance(ChatSynthesizerSessions_1);
        }
        return ChatSynthesizerSessions_1.instance;
    }
    constructor(speechService, instantiationService) {
        this.speechService = speechService;
        this.instantiationService = instantiationService;
        this.activeSession = undefined;
    }
    async start(controller) {
        this.stop();
        VoiceChatSessions.getInstance(this.instantiationService).stop();
        const activeSession = this.activeSession = new CancellationTokenSource();
        const disposables = new DisposableStore();
        activeSession.token.onCancellationRequested(() => disposables.dispose());
        const session = await this.speechService.createTextToSpeechSession(activeSession.token, 'chat');
        if (activeSession.token.isCancellationRequested) {
            return;
        }
        disposables.add(controller.onDidHideChat(() => this.stop()));
        const scopedChatToSpeechInProgress = ScopedChatSynthesisInProgress.bindTo(controller.contextKeyService);
        disposables.add(toDisposable(() => scopedChatToSpeechInProgress.reset()));
        disposables.add(session.onDidChange(e => {
            switch (e.status) {
                case TextToSpeechStatus.Started:
                    scopedChatToSpeechInProgress.set(true);
                    break;
                case TextToSpeechStatus.Stopped:
                    scopedChatToSpeechInProgress.reset();
                    break;
            }
        }));
        for await (const chunk of this.nextChatResponseChunk(controller.response, activeSession.token)) {
            if (activeSession.token.isCancellationRequested) {
                return;
            }
            await raceCancellation(session.synthesize(chunk), activeSession.token);
        }
    }
    async *nextChatResponseChunk(response, token) {
        let totalOffset = 0;
        let complete = false;
        do {
            const responseLength = response.response.toString().length;
            const { chunk, offset } = this.parseNextChatResponseChunk(response, totalOffset);
            totalOffset = offset;
            complete = response.isComplete;
            if (chunk) {
                yield chunk;
            }
            if (token.isCancellationRequested) {
                return;
            }
            if (!complete && responseLength === response.response.toString().length) {
                await raceCancellation(Event.toPromise(response.onDidChange), token);
            }
        } while (!token.isCancellationRequested && !complete);
    }
    parseNextChatResponseChunk(response, offset) {
        let chunk = undefined;
        const text = response.response.toString();
        if (response.isComplete) {
            chunk = text.substring(offset);
            offset = text.length + 1;
        }
        else {
            const res = parseNextChatResponseChunk(text, offset);
            chunk = res.chunk;
            offset = res.offset;
        }
        return {
            chunk: chunk ? renderStringAsPlaintext({ value: chunk }) : chunk,
            offset
        };
    }
    stop() {
        this.activeSession?.dispose(true);
        this.activeSession = undefined;
    }
};
ChatSynthesizerSessions = ChatSynthesizerSessions_1 = __decorate([
    __param(0, ISpeechService),
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object])
], ChatSynthesizerSessions);
const sentenceDelimiter = ['.', '!', '?', ':'];
const lineDelimiter = '\n';
const wordDelimiter = ' ';
export function parseNextChatResponseChunk(text, offset) {
    let chunk = undefined;
    for (let i = text.length - 1; i >= offset; i--) {
        const cur = text[i];
        const next = text[i + 1];
        if (sentenceDelimiter.includes(cur) && next === wordDelimiter ||
            lineDelimiter === cur) {
            chunk = text.substring(offset, i + 1).trim();
            offset = i + 1;
            break;
        }
    }
    return { chunk, offset };
}
export class ReadChatResponseAloud extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.chat.readChatResponseAloud',
            title: localize2('workbench.action.chat.readChatResponseAloud', "Read Aloud"),
            icon: Codicon.unmute,
            precondition: CanVoiceChat,
            menu: [{
                    id: MenuId.ChatMessageFooter,
                    when: ContextKeyExpr.and(CanVoiceChat, CONTEXT_RESPONSE, ScopedChatSynthesisInProgress.negate(), CONTEXT_RESPONSE_FILTERED.negate()),
                    group: 'navigation'
                }, {
                    id: MENU_INLINE_CHAT_WIDGET_SECONDARY,
                    when: ContextKeyExpr.and(CanVoiceChat, CONTEXT_RESPONSE, ScopedChatSynthesisInProgress.negate(), CONTEXT_RESPONSE_FILTERED.negate()),
                    group: 'navigation'
                }]
        });
    }
    run(accessor, ...args) {
        const instantiationService = accessor.get(IInstantiationService);
        const chatWidgetService = accessor.get(IChatWidgetService);
        let response = undefined;
        if (args.length > 0) {
            const responseArg = args[0];
            if (isResponseVM(responseArg)) {
                response = responseArg;
            }
        }
        else {
            const chatWidget = chatWidgetService.lastFocusedWidget;
            if (chatWidget) {
                const focus = chatWidget.getFocus();
                if (focus instanceof ChatResponseViewModel) {
                    response = focus;
                }
                else {
                    const chatViewModel = chatWidget.viewModel;
                    if (chatViewModel) {
                        const items = chatViewModel.getItems();
                        for (let i = items.length - 1; i >= 0; i--) {
                            const item = items[i];
                            if (isResponseVM(item)) {
                                response = item;
                                break;
                            }
                        }
                    }
                }
            }
        }
        if (!response) {
            return;
        }
        const controller = ChatSynthesizerSessionController.create(accessor, 'focused', response.model);
        ChatSynthesizerSessions.getInstance(instantiationService).start(controller);
    }
}
export class StopReadAloud extends Action2 {
    static { this.ID = 'workbench.action.speech.stopReadAloud'; }
    constructor() {
        super({
            id: StopReadAloud.ID,
            icon: syncing,
            title: localize2('workbench.action.speech.stopReadAloud', "Stop Reading Aloud"),
            f1: true,
            category: CHAT_CATEGORY,
            precondition: GlobalTextToSpeechInProgress,
            keybinding: {
                weight: 200 + 100,
                primary: 9,
                when: ScopedChatSynthesisInProgress
            },
            menu: [
                {
                    id: MenuId.ChatInput,
                    when: ContextKeyExpr.and(CONTEXT_CHAT_LOCATION.isEqualTo(ChatAgentLocation.Panel), ScopedChatSynthesisInProgress),
                    group: 'navigation',
                    order: 3
                },
                {
                    id: MenuId.ChatExecute,
                    when: ContextKeyExpr.and(CONTEXT_CHAT_LOCATION.isEqualTo(ChatAgentLocation.Panel).negate(), ScopedChatSynthesisInProgress),
                    group: 'navigation',
                    order: 2
                },
            ]
        });
    }
    async run(accessor) {
        ChatSynthesizerSessions.getInstance(accessor.get(IInstantiationService)).stop();
    }
}
export class StopReadChatItemAloud extends Action2 {
    static { this.ID = 'workbench.action.chat.stopReadChatItemAloud'; }
    constructor() {
        super({
            id: StopReadChatItemAloud.ID,
            icon: Codicon.mute,
            title: localize2('workbench.action.chat.stopReadChatItemAloud', "Stop Reading Aloud"),
            precondition: ScopedChatSynthesisInProgress,
            keybinding: {
                weight: 200 + 100,
                primary: 9,
            },
            menu: [
                {
                    id: MenuId.ChatMessageFooter,
                    when: ContextKeyExpr.and(ScopedChatSynthesisInProgress, CONTEXT_RESPONSE, CONTEXT_RESPONSE_FILTERED.negate()),
                    group: 'navigation'
                },
                {
                    id: MENU_INLINE_CHAT_WIDGET_SECONDARY,
                    when: ContextKeyExpr.and(ScopedChatSynthesisInProgress, CONTEXT_RESPONSE, CONTEXT_RESPONSE_FILTERED.negate()),
                    group: 'navigation'
                }
            ]
        });
    }
    async run(accessor, ...args) {
        ChatSynthesizerSessions.getInstance(accessor.get(IInstantiationService)).stop();
    }
}
function supportsKeywordActivation(configurationService, speechService, chatAgentService) {
    if (!speechService.hasSpeechProvider || !chatAgentService.getDefaultAgent(ChatAgentLocation.Panel)) {
        return false;
    }
    const value = configurationService.getValue(KEYWORD_ACTIVIATION_SETTING_ID);
    return typeof value === 'string' && value !== KeywordActivationContribution.SETTINGS_VALUE.OFF;
}
let KeywordActivationContribution = class KeywordActivationContribution extends Disposable {
    static { KeywordActivationContribution_1 = this; }
    static { this.ID = 'workbench.contrib.keywordActivation'; }
    static { this.SETTINGS_VALUE = {
        OFF: 'off',
        INLINE_CHAT: 'inlineChat',
        QUICK_CHAT: 'quickChat',
        VIEW_CHAT: 'chatInView',
        CHAT_IN_CONTEXT: 'chatInContext'
    }; }
    constructor(speechService, configurationService, commandService, instantiationService, editorService, hostService, chatAgentService) {
        super();
        this.speechService = speechService;
        this.configurationService = configurationService;
        this.commandService = commandService;
        this.editorService = editorService;
        this.hostService = hostService;
        this.chatAgentService = chatAgentService;
        this.activeSession = undefined;
        this._register(instantiationService.createInstance(KeywordActivationStatusEntry));
        this.registerListeners();
    }
    registerListeners() {
        this._register(Event.runAndSubscribe(this.speechService.onDidChangeHasSpeechProvider, () => {
            this.updateConfiguration();
            this.handleKeywordActivation();
        }));
        const onDidAddDefaultAgent = this._register(this.chatAgentService.onDidChangeAgents(() => {
            if (this.chatAgentService.getDefaultAgent(ChatAgentLocation.Panel)) {
                this.updateConfiguration();
                this.handleKeywordActivation();
                onDidAddDefaultAgent.dispose();
            }
        }));
        this._register(this.speechService.onDidStartSpeechToTextSession(() => this.handleKeywordActivation()));
        this._register(this.speechService.onDidEndSpeechToTextSession(() => this.handleKeywordActivation()));
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(KEYWORD_ACTIVIATION_SETTING_ID)) {
                this.handleKeywordActivation();
            }
        }));
    }
    updateConfiguration() {
        if (!this.speechService.hasSpeechProvider || !this.chatAgentService.getDefaultAgent(ChatAgentLocation.Panel)) {
            return;
        }
        const registry = Registry.as(Extensions.Configuration);
        registry.registerConfiguration({
            ...accessibilityConfigurationNodeBase,
            properties: {
                [KEYWORD_ACTIVIATION_SETTING_ID]: {
                    'type': 'string',
                    'enum': [
                        KeywordActivationContribution_1.SETTINGS_VALUE.OFF,
                        KeywordActivationContribution_1.SETTINGS_VALUE.VIEW_CHAT,
                        KeywordActivationContribution_1.SETTINGS_VALUE.QUICK_CHAT,
                        KeywordActivationContribution_1.SETTINGS_VALUE.INLINE_CHAT,
                        KeywordActivationContribution_1.SETTINGS_VALUE.CHAT_IN_CONTEXT
                    ],
                    'enumDescriptions': [
                        localize('voice.keywordActivation.off', "Keyword activation is disabled."),
                        localize('voice.keywordActivation.chatInView', "Keyword activation is enabled and listening for 'Hey Code' to start a voice chat session in the chat view."),
                        localize('voice.keywordActivation.quickChat', "Keyword activation is enabled and listening for 'Hey Code' to start a voice chat session in the quick chat."),
                        localize('voice.keywordActivation.inlineChat', "Keyword activation is enabled and listening for 'Hey Code' to start a voice chat session in the active editor if possible."),
                        localize('voice.keywordActivation.chatInContext', "Keyword activation is enabled and listening for 'Hey Code' to start a voice chat session in the active editor or view depending on keyboard focus.")
                    ],
                    'description': localize('voice.keywordActivation', "Controls whether the keyword phrase 'Hey Code' is recognized to start a voice chat session. Enabling this will start recording from the microphone but the audio is processed locally and never sent to a server."),
                    'default': 'off',
                    'tags': ['accessibility']
                }
            }
        });
    }
    handleKeywordActivation() {
        const enabled = supportsKeywordActivation(this.configurationService, this.speechService, this.chatAgentService) &&
            !this.speechService.hasActiveSpeechToTextSession;
        if ((enabled && this.activeSession) ||
            (!enabled && !this.activeSession)) {
            return;
        }
        if (enabled) {
            this.enableKeywordActivation();
        }
        else {
            this.disableKeywordActivation();
        }
    }
    async enableKeywordActivation() {
        const session = this.activeSession = new CancellationTokenSource();
        const result = await this.speechService.recognizeKeyword(session.token);
        if (session.token.isCancellationRequested || session !== this.activeSession) {
            return;
        }
        this.activeSession = undefined;
        if (result === KeywordRecognitionStatus.Recognized) {
            if (this.hostService.hasFocus) {
                this.commandService.executeCommand(this.getKeywordCommand());
            }
            this.handleKeywordActivation();
        }
    }
    getKeywordCommand() {
        const setting = this.configurationService.getValue(KEYWORD_ACTIVIATION_SETTING_ID);
        switch (setting) {
            case KeywordActivationContribution_1.SETTINGS_VALUE.INLINE_CHAT:
                return InlineVoiceChatAction.ID;
            case KeywordActivationContribution_1.SETTINGS_VALUE.QUICK_CHAT:
                return QuickVoiceChatAction.ID;
            case KeywordActivationContribution_1.SETTINGS_VALUE.CHAT_IN_CONTEXT: {
                const activeCodeEditor = getCodeEditor(this.editorService.activeTextEditorControl);
                if (activeCodeEditor?.hasWidgetFocus()) {
                    return InlineVoiceChatAction.ID;
                }
            }
            default:
                return VoiceChatInChatViewAction.ID;
        }
    }
    disableKeywordActivation() {
        this.activeSession?.dispose(true);
        this.activeSession = undefined;
    }
    dispose() {
        this.activeSession?.dispose();
        super.dispose();
    }
};
KeywordActivationContribution = KeywordActivationContribution_1 = __decorate([
    __param(0, ISpeechService),
    __param(1, IConfigurationService),
    __param(2, ICommandService),
    __param(3, IInstantiationService),
    __param(4, IEditorService),
    __param(5, IHostService),
    __param(6, IChatAgentService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], KeywordActivationContribution);
export { KeywordActivationContribution };
let KeywordActivationStatusEntry = class KeywordActivationStatusEntry extends Disposable {
    static { KeywordActivationStatusEntry_1 = this; }
    static { this.STATUS_NAME = localize('keywordActivation.status.name', "Voice Keyword Activation"); }
    static { this.STATUS_COMMAND = 'keywordActivation.status.command'; }
    static { this.STATUS_ACTIVE = localize('keywordActivation.status.active', "Listening to 'Hey Code'..."); }
    static { this.STATUS_INACTIVE = localize('keywordActivation.status.inactive', "Waiting for voice chat to end..."); }
    constructor(speechService, statusbarService, commandService, configurationService, chatAgentService) {
        super();
        this.speechService = speechService;
        this.statusbarService = statusbarService;
        this.commandService = commandService;
        this.configurationService = configurationService;
        this.chatAgentService = chatAgentService;
        this.entry = this._register(new MutableDisposable());
        this._register(CommandsRegistry.registerCommand(KeywordActivationStatusEntry_1.STATUS_COMMAND, () => this.commandService.executeCommand('workbench.action.openSettings', KEYWORD_ACTIVIATION_SETTING_ID)));
        this.registerListeners();
        this.updateStatusEntry();
    }
    registerListeners() {
        this._register(this.speechService.onDidStartKeywordRecognition(() => this.updateStatusEntry()));
        this._register(this.speechService.onDidEndKeywordRecognition(() => this.updateStatusEntry()));
        this._register(this.configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration(KEYWORD_ACTIVIATION_SETTING_ID)) {
                this.updateStatusEntry();
            }
        }));
    }
    updateStatusEntry() {
        const visible = supportsKeywordActivation(this.configurationService, this.speechService, this.chatAgentService);
        if (visible) {
            if (!this.entry.value) {
                this.createStatusEntry();
            }
            this.updateStatusLabel();
        }
        else {
            this.entry.clear();
        }
    }
    createStatusEntry() {
        this.entry.value = this.statusbarService.addEntry(this.getStatusEntryProperties(), 'status.voiceKeywordActivation', 1, 103);
    }
    getStatusEntryProperties() {
        return {
            name: KeywordActivationStatusEntry_1.STATUS_NAME,
            text: this.speechService.hasActiveKeywordRecognition ? '$(mic-filled)' : '$(mic)',
            tooltip: this.speechService.hasActiveKeywordRecognition ? KeywordActivationStatusEntry_1.STATUS_ACTIVE : KeywordActivationStatusEntry_1.STATUS_INACTIVE,
            ariaLabel: this.speechService.hasActiveKeywordRecognition ? KeywordActivationStatusEntry_1.STATUS_ACTIVE : KeywordActivationStatusEntry_1.STATUS_INACTIVE,
            command: KeywordActivationStatusEntry_1.STATUS_COMMAND,
            kind: 'prominent',
            showInAllWindows: true
        };
    }
    updateStatusLabel() {
        this.entry.value?.update(this.getStatusEntryProperties());
    }
};
KeywordActivationStatusEntry = KeywordActivationStatusEntry_1 = __decorate([
    __param(0, ISpeechService),
    __param(1, IStatusbarService),
    __param(2, ICommandService),
    __param(3, IConfigurationService),
    __param(4, IChatAgentService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], KeywordActivationStatusEntry);
const InstallingSpeechProvider = new RawContextKey('installingSpeechProvider', false, true);
class BaseInstallSpeechProviderAction extends Action2 {
    static { this.SPEECH_EXTENSION_ID = 'ms-vscode.vscode-speech'; }
    async run(accessor) {
        const contextKeyService = accessor.get(IContextKeyService);
        const extensionsWorkbenchService = accessor.get(IExtensionsWorkbenchService);
        try {
            InstallingSpeechProvider.bindTo(contextKeyService).set(true);
            await extensionsWorkbenchService.install(BaseInstallSpeechProviderAction.SPEECH_EXTENSION_ID, {
                justification: this.getJustification(),
                enable: true
            }, 15);
        }
        finally {
            InstallingSpeechProvider.bindTo(contextKeyService).reset();
        }
    }
}
export class InstallSpeechProviderForVoiceChatAction extends BaseInstallSpeechProviderAction {
    static { this.ID = 'workbench.action.chat.installProviderForVoiceChat'; }
    constructor() {
        super({
            id: InstallSpeechProviderForVoiceChatAction.ID,
            title: localize2('workbench.action.chat.installProviderForVoiceChat.label', "Start Voice Chat"),
            icon: Codicon.mic,
            precondition: InstallingSpeechProvider.negate(),
            menu: [{
                    id: MenuId.ChatInput,
                    when: HasSpeechProvider.negate(),
                    group: 'navigation',
                    order: 3
                }]
        });
    }
    getJustification() {
        return localize('installProviderForVoiceChat.justification', "Microphone support requires this extension.");
    }
}
registerThemingParticipant((theme, collector) => {
    let activeRecordingColor;
    let activeRecordingDimmedColor;
    if (theme.type === ColorScheme.LIGHT || theme.type === ColorScheme.DARK) {
        activeRecordingColor = theme.getColor(ACTIVITY_BAR_BADGE_BACKGROUND) ?? theme.getColor(focusBorder);
        activeRecordingDimmedColor = activeRecordingColor?.transparent(0.38);
    }
    else {
        activeRecordingColor = theme.getColor(contrastBorder);
        activeRecordingDimmedColor = theme.getColor(contrastBorder);
    }
    collector.addRule(`
		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-sync.codicon-modifier-spin:not(.disabled),
		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled) {
			color: ${activeRecordingColor};
			outline: 1px solid ${activeRecordingColor};
			outline-offset: -1px;
			animation: pulseAnimation 1s infinite;
			border-radius: 50%;
		}

		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-sync.codicon-modifier-spin:not(.disabled)::before,
		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled)::before {
			position: absolute;
			outline: 1px solid ${activeRecordingColor};
			outline-offset: 2px;
			border-radius: 50%;
			width: 16px;
			height: 16px;
		}

		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-sync.codicon-modifier-spin:not(.disabled)::after,
		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled)::after {
			outline: 2px solid ${activeRecordingColor};
			outline-offset: -1px;
			animation: pulseAnimation 1500ms cubic-bezier(0.75, 0, 0.25, 1) infinite;
		}

		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-sync.codicon-modifier-spin:not(.disabled)::before,
		.monaco-workbench:not(.reduce-motion) .interactive-input-part .monaco-action-bar .action-label.codicon-loading.codicon-modifier-spin:not(.disabled)::before {
			position: absolute;
			outline: 1px solid ${activeRecordingColor};
			outline-offset: 2px;
			border-radius: 50%;
			width: 16px;
			height: 16px;
		}

		@keyframes pulseAnimation {
			0% {
				outline-width: 2px;
			}
			62% {
				outline-width: 5px;
				outline-color: ${activeRecordingDimmedColor};
			}
			100% {
				outline-width: 2px;
			}
		}
	`);
});
