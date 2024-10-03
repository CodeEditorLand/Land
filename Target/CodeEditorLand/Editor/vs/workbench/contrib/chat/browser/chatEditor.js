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
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { editorBackground, editorForeground, inputBackground } from '../../../../platform/theme/common/colorRegistry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { EditorPane } from '../../../browser/parts/editor/editorPane.js';
import { Memento } from '../../../common/memento.js';
import { clearChatEditor } from './actions/chatClear.js';
import { ChatEditorInput } from './chatEditorInput.js';
import { ChatWidget } from './chatWidget.js';
import { ChatAgentLocation } from '../common/chatAgents.js';
import { CHAT_PROVIDER_ID } from '../common/chatParticipantContribTypes.js';
import { EDITOR_DRAG_AND_DROP_BACKGROUND } from '../../../common/theme.js';
let ChatEditor = class ChatEditor extends EditorPane {
    get scopedContextKeyService() {
        return this._scopedContextKeyService;
    }
    constructor(group, telemetryService, themeService, instantiationService, storageService, contextKeyService) {
        super(ChatEditorInput.EditorID, group, telemetryService, themeService, storageService);
        this.instantiationService = instantiationService;
        this.storageService = storageService;
        this.contextKeyService = contextKeyService;
    }
    async clear() {
        if (this.input) {
            return this.instantiationService.invokeFunction(clearChatEditor, this.input);
        }
    }
    createEditor(parent) {
        this._scopedContextKeyService = this._register(this.contextKeyService.createScoped(parent));
        const scopedInstantiationService = this._register(this.instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
        this.widget = this._register(scopedInstantiationService.createInstance(ChatWidget, ChatAgentLocation.Panel, undefined, { supportsFileReferences: true }, {
            listForeground: editorForeground,
            listBackground: editorBackground,
            overlayBackground: EDITOR_DRAG_AND_DROP_BACKGROUND,
            inputEditorBackground: inputBackground,
            resultEditorBackground: editorBackground
        }));
        this._register(this.widget.onDidClear(() => this.clear()));
        this.widget.render(parent);
        this.widget.setVisible(true);
    }
    setEditorVisible(visible) {
        super.setEditorVisible(visible);
        this.widget?.setVisible(visible);
    }
    focus() {
        super.focus();
        this.widget?.focusInput();
    }
    clearInput() {
        this.saveState();
        super.clearInput();
    }
    async setInput(input, options, context, token) {
        super.setInput(input, options, context, token);
        const editorModel = await input.resolve();
        if (!editorModel) {
            throw new Error(`Failed to get model for chat editor. id: ${input.sessionId}`);
        }
        if (!this.widget) {
            throw new Error('ChatEditor lifecycle issue: no editor widget');
        }
        this.updateModel(editorModel.model, options?.viewState ?? input.options.viewState);
    }
    updateModel(model, viewState) {
        this._memento = new Memento('interactive-session-editor-' + CHAT_PROVIDER_ID, this.storageService);
        this._viewState = viewState ?? this._memento.getMemento(1, 1);
        this.widget.setModel(model, { ...this._viewState });
    }
    saveState() {
        this.widget?.saveState();
        if (this._memento && this._viewState) {
            const widgetViewState = this.widget.getViewState();
            this._viewState.inputValue = widgetViewState.inputValue;
            this._viewState.selectedLanguageModelId = widgetViewState.selectedLanguageModelId;
            this._memento.saveMemento();
        }
    }
    getViewState() {
        return { ...this._viewState };
    }
    layout(dimension, position) {
        if (this.widget) {
            this.widget.layout(dimension.height, dimension.width);
        }
    }
};
ChatEditor = __decorate([
    __param(1, ITelemetryService),
    __param(2, IThemeService),
    __param(3, IInstantiationService),
    __param(4, IStorageService),
    __param(5, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], ChatEditor);
export { ChatEditor };
