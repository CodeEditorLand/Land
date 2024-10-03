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
import './output.css';
import * as nls from '../../../../nls.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { AbstractTextResourceEditor } from '../../../browser/parts/editor/textResourceEditor.js';
import { OUTPUT_VIEW_ID, CONTEXT_IN_OUTPUT, CONTEXT_OUTPUT_SCROLL_LOCK } from '../../../services/output/common/output.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ViewPane } from '../../../browser/parts/views/viewPane.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { IContextMenuService } from '../../../../platform/contextview/browser/contextView.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { TextResourceEditorInput } from '../../../common/editor/textResourceEditorInput.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { Dimension } from '../../../../base/browser/dom.js';
import { createCancelablePromise } from '../../../../base/common/async.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ResourceContextKey } from '../../../common/contextkeys.js';
import { ServiceCollection } from '../../../../platform/instantiation/common/serviceCollection.js';
import { computeEditorAriaLabel } from '../../../browser/editor.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
let OutputViewPane = class OutputViewPane extends ViewPane {
    get scrollLock() { return !!this.scrollLockContextKey.get(); }
    set scrollLock(scrollLock) { this.scrollLockContextKey.set(scrollLock); }
    constructor(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService) {
        super(options, keybindingService, contextMenuService, configurationService, contextKeyService, viewDescriptorService, instantiationService, openerService, themeService, telemetryService, hoverService);
        this.editorPromise = null;
        this.scrollLockContextKey = CONTEXT_OUTPUT_SCROLL_LOCK.bindTo(this.contextKeyService);
        const editorInstantiationService = this._register(instantiationService.createChild(new ServiceCollection([IContextKeyService, this.scopedContextKeyService])));
        this.editor = this._register(editorInstantiationService.createInstance(OutputEditor));
        this._register(this.editor.onTitleAreaUpdate(() => {
            this.updateTitle(this.editor.getTitle());
            this.updateActions();
        }));
        this._register(this.onDidChangeBodyVisibility(() => this.onDidChangeVisibility(this.isBodyVisible())));
    }
    showChannel(channel, preserveFocus) {
        if (this.channelId !== channel.id) {
            this.setInput(channel);
        }
        if (!preserveFocus) {
            this.focus();
        }
    }
    focus() {
        super.focus();
        this.editorPromise?.then(() => this.editor.focus());
    }
    renderBody(container) {
        super.renderBody(container);
        this.editor.create(container);
        container.classList.add('output-view');
        const codeEditor = this.editor.getControl();
        codeEditor.setAriaOptions({ role: 'document', activeDescendant: undefined });
        this._register(codeEditor.onDidChangeModelContent(() => {
            if (!this.scrollLock) {
                this.editor.revealLastLine();
            }
        }));
        this._register(codeEditor.onDidChangeCursorPosition((e) => {
            if (e.reason !== 3) {
                return;
            }
            if (!this.configurationService.getValue('output.smartScroll.enabled')) {
                return;
            }
            const model = codeEditor.getModel();
            if (model) {
                const newPositionLine = e.position.lineNumber;
                const lastLine = model.getLineCount();
                this.scrollLock = lastLine !== newPositionLine;
            }
        }));
    }
    layoutBody(height, width) {
        super.layoutBody(height, width);
        this.editor.layout(new Dimension(width, height));
    }
    onDidChangeVisibility(visible) {
        this.editor.setVisible(visible);
        if (!visible) {
            this.clearInput();
        }
    }
    setInput(channel) {
        this.channelId = channel.id;
        const input = this.createInput(channel);
        if (!this.editor.input || !input.matches(this.editor.input)) {
            this.editorPromise?.cancel();
            this.editorPromise = createCancelablePromise(token => this.editor.setInput(this.createInput(channel), { preserveFocus: true }, Object.create(null), token)
                .then(() => this.editor));
        }
    }
    clearInput() {
        this.channelId = undefined;
        this.editor.clearInput();
        this.editorPromise = null;
    }
    createInput(channel) {
        return this.instantiationService.createInstance(TextResourceEditorInput, channel.uri, nls.localize('output model title', "{0} - Output", channel.label), nls.localize('channel', "Output channel for '{0}'", channel.label), undefined, undefined);
    }
};
OutputViewPane = __decorate([
    __param(1, IKeybindingService),
    __param(2, IContextMenuService),
    __param(3, IConfigurationService),
    __param(4, IContextKeyService),
    __param(5, IViewDescriptorService),
    __param(6, IInstantiationService),
    __param(7, IOpenerService),
    __param(8, IThemeService),
    __param(9, ITelemetryService),
    __param(10, IHoverService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], OutputViewPane);
export { OutputViewPane };
let OutputEditor = class OutputEditor extends AbstractTextResourceEditor {
    constructor(telemetryService, instantiationService, storageService, configurationService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService) {
        super(OUTPUT_VIEW_ID, editorGroupService.activeGroup, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorGroupService, editorService, fileService);
        this.configurationService = configurationService;
        this.resourceContext = this._register(instantiationService.createInstance(ResourceContextKey));
    }
    getId() {
        return OUTPUT_VIEW_ID;
    }
    getTitle() {
        return nls.localize('output', "Output");
    }
    getConfigurationOverrides(configuration) {
        const options = super.getConfigurationOverrides(configuration);
        options.wordWrap = 'on';
        options.lineNumbers = 'off';
        options.glyphMargin = false;
        options.lineDecorationsWidth = 20;
        options.rulers = [];
        options.folding = false;
        options.scrollBeyondLastLine = false;
        options.renderLineHighlight = 'none';
        options.minimap = { enabled: false };
        options.renderValidationDecorations = 'editable';
        options.padding = undefined;
        options.readOnly = true;
        options.domReadOnly = true;
        options.unicodeHighlight = {
            nonBasicASCII: false,
            invisibleCharacters: false,
            ambiguousCharacters: false,
        };
        const outputConfig = this.configurationService.getValue('[Log]');
        if (outputConfig) {
            if (outputConfig['editor.minimap.enabled']) {
                options.minimap = { enabled: true };
            }
            if ('editor.wordWrap' in outputConfig) {
                options.wordWrap = outputConfig['editor.wordWrap'];
            }
        }
        return options;
    }
    getAriaLabel() {
        return this.input ? this.input.getAriaLabel() : nls.localize('outputViewAriaLabel', "Output panel");
    }
    computeAriaLabel() {
        return this.input ? computeEditorAriaLabel(this.input, undefined, undefined, this.editorGroupService.count) : this.getAriaLabel();
    }
    async setInput(input, options, context, token) {
        const focus = !(options && options.preserveFocus);
        if (this.input && input.matches(this.input)) {
            return;
        }
        if (this.input) {
            this.input.dispose();
        }
        await super.setInput(input, options, context, token);
        this.resourceContext.set(input.resource);
        if (focus) {
            this.focus();
        }
        this.revealLastLine();
    }
    clearInput() {
        if (this.input) {
            this.input.dispose();
        }
        super.clearInput();
        this.resourceContext.reset();
    }
    createEditor(parent) {
        parent.setAttribute('role', 'document');
        super.createEditor(parent);
        const scopedContextKeyService = this.scopedContextKeyService;
        if (scopedContextKeyService) {
            CONTEXT_IN_OUTPUT.bindTo(scopedContextKeyService).set(true);
        }
    }
};
OutputEditor = __decorate([
    __param(0, ITelemetryService),
    __param(1, IInstantiationService),
    __param(2, IStorageService),
    __param(3, IConfigurationService),
    __param(4, ITextResourceConfigurationService),
    __param(5, IThemeService),
    __param(6, IEditorGroupsService),
    __param(7, IEditorService),
    __param(8, IFileService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], OutputEditor);
