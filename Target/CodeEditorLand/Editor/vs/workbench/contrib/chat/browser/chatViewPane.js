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
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { editorBackground } from '../../../../platform/theme/common/colorRegistry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { Memento } from '../../../common/memento.js';
import { SIDE_BAR_FOREGROUND } from '../../../common/theme.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { ChatAgentLocation, IChatAgentService } from '../common/chatAgents.js';
import { ChatModelInitState } from '../common/chatModel.js';
import { CHAT_PROVIDER_ID } from '../common/chatParticipantContribTypes.js';
import { IChatService } from '../common/chatService.js';
import { ChatWidget } from './chatWidget.js';
export const CHAT_SIDEBAR_PANEL_ID = 'workbench.panel.chatSidebar';
export const CHAT_EDITING_SIDEBAR_PANEL_ID = 'workbench.panel.chatEditing';
let ChatViewPane = class ChatViewPane extends ViewPane {
    get widget() { return this._widget; }
    constructor(options, chatOptions = { location: ChatAgentLocation.Panel }, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService, storageService, chatService, chatAgentService, logService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
        this.chatOptions = chatOptions;
        this.storageService = storageService;
        this.chatService = chatService;
        this.chatAgentService = chatAgentService;
        this.logService = logService;
        this.modelDisposables = this._register(new DisposableStore());
        this.didProviderRegistrationFail = false;
        this.didUnregisterProvider = false;
        this.isInitialized = false;
        this.memento = new Memento('interactive-session-view-' + CHAT_PROVIDER_ID + (this.chatOptions.location === ChatAgentLocation.EditingSession ? `-edits` : ''), this.storageService);
        this.viewState = this.memento.getMemento(1, 1);
        this._register(this.chatAgentService.onDidChangeAgents(() => {
            this.isInitialized = true;
            if (this.chatAgentService.getDefaultAgent(this.chatOptions?.location)) {
                if (!this._widget?.viewModel) {
                    const sessionId = this.getSessionId();
                    const model = sessionId ? this.chatService.getOrRestoreSession(sessionId) : undefined;
                    const wasVisible = this._widget.visible;
                    try {
                        this._widget.setVisible(false);
                        this.updateModel(model);
                        this.didProviderRegistrationFail = false;
                        this.didUnregisterProvider = false;
                        this._onDidChangeViewWelcomeState.fire();
                    }
                    finally {
                        this.widget.setVisible(wasVisible);
                    }
                }
            }
            else if (this._widget?.viewModel?.initState === ChatModelInitState.Initialized) {
                this.didUnregisterProvider = true;
            }
            this._onDidChangeViewWelcomeState.fire();
        }));
    }
    getActionsContext() {
        return {
            chatView: this
        };
    }
    updateModel(model, viewState) {
        this.modelDisposables.clear();
        model = model ?? (this.chatService.transferredSessionData?.sessionId
            ? this.chatService.getOrRestoreSession(this.chatService.transferredSessionData.sessionId)
            : this.chatService.startSession(this.chatOptions.location, CancellationToken.None));
        if (!model) {
            throw new Error('Could not start chat session');
        }
        if (viewState) {
            this.updateViewState(viewState);
        }
        this.viewState.sessionId = model.sessionId;
        this._widget.setModel(model, { ...this.viewState });
    }
    shouldShowWelcome() {
        if (!this.chatAgentService.getContributedDefaultAgent(this.chatOptions.location)) {
            return true;
        }
        const noPersistedSessions = !this.chatService.hasSessions();
        return this.didUnregisterProvider || !this._widget?.viewModel && (noPersistedSessions || this.didProviderRegistrationFail) || !this.isInitialized;
    }
    getSessionId() {
        let sessionId;
        if (this.chatService.transferredSessionData) {
            sessionId = this.chatService.transferredSessionData.sessionId;
            this.viewState.inputValue = this.chatService.transferredSessionData.inputValue;
        }
        else {
            sessionId = this.viewState.sessionId;
        }
        return sessionId;
    }
    renderBody(parent) {
        try {
            super.renderBody(parent);
            const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
            const locationBasedColors = this.getLocationBasedColors();
            this._widget = this._register(scopedInstantiationService.createInstance(ChatWidget, this.chatOptions.location, { viewId: this.id }, { supportsFileReferences: true, supportsAdditionalParticipants: this.chatOptions.location === ChatAgentLocation.Panel }, {
                listForeground: SIDE_BAR_FOREGROUND,
                listBackground: locationBasedColors.background,
                overlayBackground: locationBasedColors.overlayBackground,
                inputEditorBackground: locationBasedColors.background,
                resultEditorBackground: editorBackground
            }));
            this._register(this.onDidChangeBodyVisibility(visible => {
                this._widget.setVisible(visible);
            }));
            this._register(this._widget.onDidClear(() => this.clear()));
            this._widget.render(parent);
            const sessionId = this.getSessionId();
            const disposeListener = sessionId ? this._register(this.chatService.onDidDisposeSession((e) => {
                if (e.reason === 'initializationFailed') {
                    this.didProviderRegistrationFail = true;
                    disposeListener?.dispose();
                    this._onDidChangeViewWelcomeState.fire();
                }
            })) : undefined;
            const model = sessionId ? this.chatService.getOrRestoreSession(sessionId) : undefined;
            this.updateModel(model);
        }
        catch (e) {
            this.logService.error(e);
            throw e;
        }
    }
    acceptInput(query) {
        this._widget.acceptInput(query);
    }
    clear() {
        if (this.widget.viewModel) {
            this.chatService.clearSession(this.widget.viewModel.sessionId);
        }
        this.updateViewState();
        this.updateModel(undefined);
    }
    loadSession(sessionId, viewState) {
        if (this.widget.viewModel) {
            this.chatService.clearSession(this.widget.viewModel.sessionId);
        }
        const newModel = this.chatService.getOrRestoreSession(sessionId);
        this.updateModel(newModel, viewState);
    }
    focusInput() {
        this._widget.focusInput();
    }
    focus() {
        super.focus();
        this._widget.focusInput();
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        this._widget.layout(height, width);
    }
    saveState() {
        if (this._widget) {
            this._widget.saveState();
            this.updateViewState();
            this.memento.saveMemento();
        }
        super.saveState();
    }
    updateViewState(viewState) {
        const newViewState = viewState ?? this._widget.getViewState();
        this.viewState.inputValue = newViewState.inputValue;
        this.viewState.inputState = newViewState.inputState;
        this.viewState.selectedLanguageModelId = newViewState.selectedLanguageModelId;
    }
};
ChatViewPane = __decorate([
    __param(2, IKeybindingService),
    __param(3, IContextMenuService),
    __param(4, IConfigurationService),
    __param(5, IContextKeyService),
    __param(6, IViewDescriptorService),
    __param(7, IInstantiationService),
    __param(8, IOpenerService),
    __param(9, IThemeService),
    __param(10, ITelemetryService),
    __param(11, IHoverService),
    __param(12, IStorageService),
    __param(13, IChatService),
    __param(14, IChatAgentService),
    __param(15, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ChatViewPane);
export { ChatViewPane };
