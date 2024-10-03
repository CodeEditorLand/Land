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
var AbstractTextEditor_1;
import { localize } from '../../../../nls.js';
import { distinct, deepClone } from '../../../../base/common/objects.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { isObject, assertIsDefined } from '../../../../base/common/types.js';
import { MutableDisposable } from '../../../../base/common/lifecycle.js';
import { computeEditorAriaLabel } from '../../editor.js';
import { AbstractEditorWithViewState } from './editorWithViewState.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IFileService } from '../../../../platform/files/common/files.js';
let AbstractTextEditor = class AbstractTextEditor extends AbstractEditorWithViewState {
    static { AbstractTextEditor_1 = this; }
    static { this.VIEW_STATE_PREFERENCE_KEY = 'textEditorViewState'; }
    constructor(id, group, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService, fileService) {
        super(id, group, AbstractTextEditor_1.VIEW_STATE_PREFERENCE_KEY, telemetryService, instantiationService, storageService, textResourceConfigurationService, themeService, editorService, editorGroupService);
        this.fileService = fileService;
        this._onDidChangeSelection = this._register(new Emitter());
        this.onDidChangeSelection = this._onDidChangeSelection.event;
        this._onDidChangeScroll = this._register(new Emitter());
        this.onDidChangeScroll = this._onDidChangeScroll.event;
        this.inputListener = this._register(new MutableDisposable());
        this._register(this.textResourceConfigurationService.onDidChangeConfiguration(e => this.handleConfigurationChangeEvent(e)));
        this._register(Event.any(this.editorGroupService.onDidAddGroup, this.editorGroupService.onDidRemoveGroup)(() => {
            const ariaLabel = this.computeAriaLabel();
            this.editorContainer?.setAttribute('aria-label', ariaLabel);
            this.updateEditorControlOptions({ ariaLabel });
        }));
        this._register(this.fileService.onDidChangeFileSystemProviderCapabilities(e => this.onDidChangeFileSystemProvider(e.scheme)));
        this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(e => this.onDidChangeFileSystemProvider(e.scheme)));
    }
    handleConfigurationChangeEvent(e) {
        const resource = this.getActiveResource();
        if (!this.shouldHandleConfigurationChangeEvent(e, resource)) {
            return;
        }
        if (this.isVisible()) {
            this.updateEditorConfiguration(resource);
        }
        else {
            this.hasPendingConfigurationChange = true;
        }
    }
    shouldHandleConfigurationChangeEvent(e, resource) {
        return e.affectsConfiguration(resource, 'editor') || e.affectsConfiguration(resource, 'problems.visibility');
    }
    consumePendingConfigurationChangeEvent() {
        if (this.hasPendingConfigurationChange) {
            this.updateEditorConfiguration();
            this.hasPendingConfigurationChange = false;
        }
    }
    computeConfiguration(configuration) {
        const editorConfiguration = isObject(configuration.editor) ? deepClone(configuration.editor) : Object.create(null);
        Object.assign(editorConfiguration, this.getConfigurationOverrides(configuration));
        editorConfiguration.ariaLabel = this.computeAriaLabel();
        return editorConfiguration;
    }
    computeAriaLabel() {
        return this.input ? computeEditorAriaLabel(this.input, undefined, this.group, this.editorGroupService.count) : localize('editor', "Editor");
    }
    onDidChangeFileSystemProvider(scheme) {
        if (!this.input) {
            return;
        }
        if (this.getActiveResource()?.scheme === scheme) {
            this.updateReadonly(this.input);
        }
    }
    onDidChangeInputCapabilities(input) {
        if (this.input === input) {
            this.updateReadonly(input);
        }
    }
    updateReadonly(input) {
        this.updateEditorControlOptions({ ...this.getReadonlyConfiguration(input.isReadonly()) });
    }
    getReadonlyConfiguration(isReadonly) {
        return {
            readOnly: !!isReadonly,
            readOnlyMessage: typeof isReadonly !== 'boolean' ? isReadonly : undefined
        };
    }
    getConfigurationOverrides(configuration) {
        return {
            overviewRulerLanes: 3,
            lineNumbersMinChars: 3,
            fixedOverflowWidgets: true,
            ...this.getReadonlyConfiguration(this.input?.isReadonly()),
            renderValidationDecorations: configuration.problems?.visibility !== false ? 'on' : 'off'
        };
    }
    createEditor(parent) {
        this.editorContainer = parent;
        this.createEditorControl(parent, this.computeConfiguration(this.textResourceConfigurationService.getValue(this.getActiveResource())));
        this.registerCodeEditorListeners();
    }
    registerCodeEditorListeners() {
        const mainControl = this.getMainControl();
        if (mainControl) {
            this._register(mainControl.onDidChangeModelLanguage(() => this.updateEditorConfiguration()));
            this._register(mainControl.onDidChangeModel(() => this.updateEditorConfiguration()));
            this._register(mainControl.onDidChangeCursorPosition(e => this._onDidChangeSelection.fire({ reason: this.toEditorPaneSelectionChangeReason(e) })));
            this._register(mainControl.onDidChangeModelContent(() => this._onDidChangeSelection.fire({ reason: 3 })));
            this._register(mainControl.onDidScrollChange(() => this._onDidChangeScroll.fire()));
        }
    }
    toEditorPaneSelectionChangeReason(e) {
        switch (e.source) {
            case "api": return 1;
            case "code.navigation": return 4;
            case "code.jump": return 5;
            default: return 2;
        }
    }
    getSelection() {
        const mainControl = this.getMainControl();
        if (mainControl) {
            const selection = mainControl.getSelection();
            if (selection) {
                return new TextEditorPaneSelection(selection);
            }
        }
        return undefined;
    }
    async setInput(input, options, context, token) {
        await super.setInput(input, options, context, token);
        this.inputListener.value = input.onDidChangeCapabilities(() => this.onDidChangeInputCapabilities(input));
        this.updateEditorConfiguration();
        const editorContainer = assertIsDefined(this.editorContainer);
        editorContainer.setAttribute('aria-label', this.computeAriaLabel());
    }
    clearInput() {
        this.inputListener.clear();
        super.clearInput();
    }
    getScrollPosition() {
        const editor = this.getMainControl();
        if (!editor) {
            throw new Error('Control has not yet been initialized');
        }
        return {
            scrollTop: editor.getScrollTop() - editor.getTopForLineNumber(1),
            scrollLeft: editor.getScrollLeft(),
        };
    }
    setScrollPosition(scrollPosition) {
        const editor = this.getMainControl();
        if (!editor) {
            throw new Error('Control has not yet been initialized');
        }
        editor.setScrollTop(scrollPosition.scrollTop);
        if (scrollPosition.scrollLeft) {
            editor.setScrollLeft(scrollPosition.scrollLeft);
        }
    }
    setEditorVisible(visible) {
        if (visible) {
            this.consumePendingConfigurationChangeEvent();
        }
        super.setEditorVisible(visible);
    }
    toEditorViewStateResource(input) {
        return input.resource;
    }
    updateEditorConfiguration(resource = this.getActiveResource()) {
        let configuration = undefined;
        if (resource) {
            configuration = this.textResourceConfigurationService.getValue(resource);
        }
        if (!configuration) {
            return;
        }
        const editorConfiguration = this.computeConfiguration(configuration);
        let editorSettingsToApply = editorConfiguration;
        if (this.lastAppliedEditorOptions) {
            editorSettingsToApply = distinct(this.lastAppliedEditorOptions, editorSettingsToApply);
        }
        if (Object.keys(editorSettingsToApply).length > 0) {
            this.lastAppliedEditorOptions = editorConfiguration;
            this.updateEditorControlOptions(editorSettingsToApply);
        }
    }
    getActiveResource() {
        const mainControl = this.getMainControl();
        if (mainControl) {
            const model = mainControl.getModel();
            if (model) {
                return model.uri;
            }
        }
        if (this.input) {
            return this.input.resource;
        }
        return undefined;
    }
    dispose() {
        this.lastAppliedEditorOptions = undefined;
        super.dispose();
    }
};
AbstractTextEditor = AbstractTextEditor_1 = __decorate([
    __param(2, ITelemetryService),
    __param(3, IInstantiationService),
    __param(4, IStorageService),
    __param(5, ITextResourceConfigurationService),
    __param(6, IThemeService),
    __param(7, IEditorService),
    __param(8, IEditorGroupsService),
    __param(9, IFileService),
    __metadata("design:paramtypes", [String, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], AbstractTextEditor);
export { AbstractTextEditor };
export class TextEditorPaneSelection {
    static { this.TEXT_EDITOR_SELECTION_THRESHOLD = 10; }
    constructor(textSelection) {
        this.textSelection = textSelection;
    }
    compare(other) {
        if (!(other instanceof TextEditorPaneSelection)) {
            return 3;
        }
        const thisLineNumber = Math.min(this.textSelection.selectionStartLineNumber, this.textSelection.positionLineNumber);
        const otherLineNumber = Math.min(other.textSelection.selectionStartLineNumber, other.textSelection.positionLineNumber);
        if (thisLineNumber === otherLineNumber) {
            return 1;
        }
        if (Math.abs(thisLineNumber - otherLineNumber) < TextEditorPaneSelection.TEXT_EDITOR_SELECTION_THRESHOLD) {
            return 2;
        }
        return 3;
    }
    restore(options) {
        const textEditorOptions = {
            ...options,
            selection: this.textSelection,
            selectionRevealType: 1
        };
        return textEditorOptions;
    }
    log() {
        return `line: ${this.textSelection.startLineNumber}-${this.textSelection.endLineNumber}, col:  ${this.textSelection.startColumn}-${this.textSelection.endColumn}`;
    }
}
