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
/**
 * The base class of editors that leverage any kind of text editor for the editing experience.
 */
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
        // Listen to configuration changes
        this._register(this.textResourceConfigurationService.onDidChangeConfiguration(e => this.handleConfigurationChangeEvent(e)));
        // ARIA: if a group is added or removed, update the editor's ARIA
        // label so that it appears in the label for when there are > 1 groups
        this._register(Event.any(this.editorGroupService.onDidAddGroup, this.editorGroupService.onDidRemoveGroup)(() => {
            const ariaLabel = this.computeAriaLabel();
            this.editorContainer?.setAttribute('aria-label', ariaLabel);
            this.updateEditorControlOptions({ ariaLabel });
        }));
        // Listen to file system provider changes
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
        // Specific editor options always overwrite user configuration
        const editorConfiguration = isObject(configuration.editor) ? deepClone(configuration.editor) : Object.create(null);
        Object.assign(editorConfiguration, this.getConfigurationOverrides(configuration));
        // ARIA label
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
        // Create editor control
        this.editorContainer = parent;
        this.createEditorControl(parent, this.computeConfiguration(this.textResourceConfigurationService.getValue(this.getActiveResource())));
        // Listeners
        this.registerCodeEditorListeners();
    }
    registerCodeEditorListeners() {
        const mainControl = this.getMainControl();
        if (mainControl) {
            this._register(mainControl.onDidChangeModelLanguage(() => this.updateEditorConfiguration()));
            this._register(mainControl.onDidChangeModel(() => this.updateEditorConfiguration()));
            this._register(mainControl.onDidChangeCursorPosition(e => this._onDidChangeSelection.fire({ reason: this.toEditorPaneSelectionChangeReason(e) })));
            this._register(mainControl.onDidChangeModelContent(() => this._onDidChangeSelection.fire({ reason: 3 /* EditorPaneSelectionChangeReason.EDIT */ })));
            this._register(mainControl.onDidScrollChange(() => this._onDidChangeScroll.fire()));
        }
    }
    toEditorPaneSelectionChangeReason(e) {
        switch (e.source) {
            case "api" /* TextEditorSelectionSource.PROGRAMMATIC */: return 1 /* EditorPaneSelectionChangeReason.PROGRAMMATIC */;
            case "code.navigation" /* TextEditorSelectionSource.NAVIGATION */: return 4 /* EditorPaneSelectionChangeReason.NAVIGATION */;
            case "code.jump" /* TextEditorSelectionSource.JUMP */: return 5 /* EditorPaneSelectionChangeReason.JUMP */;
            default: return 2 /* EditorPaneSelectionChangeReason.USER */;
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
        // Update our listener for input capabilities
        this.inputListener.value = input.onDidChangeCapabilities(() => this.onDidChangeInputCapabilities(input));
        // Update editor options after having set the input. We do this because there can be
        // editor input specific options (e.g. an ARIA label depending on the input showing)
        this.updateEditorConfiguration();
        // Update aria label on editor
        const editorContainer = assertIsDefined(this.editorContainer);
        editorContainer.setAttribute('aria-label', this.computeAriaLabel());
    }
    clearInput() {
        // Clear input listener
        this.inputListener.clear();
        super.clearInput();
    }
    getScrollPosition() {
        const editor = this.getMainControl();
        if (!editor) {
            throw new Error('Control has not yet been initialized');
        }
        return {
            // The top position can vary depending on the view zones (find widget for example)
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
        // Try to figure out the actual editor options that changed from the last time we updated the editor.
        // We do this so that we are not overwriting some dynamic editor settings (e.g. word wrap) that might
        // have been applied to the editor directly.
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
    static { this.TEXT_EDITOR_SELECTION_THRESHOLD = 10; } // number of lines to move in editor to justify for significant change
    constructor(textSelection) {
        this.textSelection = textSelection;
    }
    compare(other) {
        if (!(other instanceof TextEditorPaneSelection)) {
            return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
        }
        const thisLineNumber = Math.min(this.textSelection.selectionStartLineNumber, this.textSelection.positionLineNumber);
        const otherLineNumber = Math.min(other.textSelection.selectionStartLineNumber, other.textSelection.positionLineNumber);
        if (thisLineNumber === otherLineNumber) {
            return 1 /* EditorPaneSelectionCompareResult.IDENTICAL */;
        }
        if (Math.abs(thisLineNumber - otherLineNumber) < TextEditorPaneSelection.TEXT_EDITOR_SELECTION_THRESHOLD) {
            return 2 /* EditorPaneSelectionCompareResult.SIMILAR */; // when in close proximity, treat selection as being similar
        }
        return 3 /* EditorPaneSelectionCompareResult.DIFFERENT */;
    }
    restore(options) {
        const textEditorOptions = {
            ...options,
            selection: this.textSelection,
            selectionRevealType: 1 /* TextEditorSelectionRevealType.CenterIfOutsideViewport */
        };
        return textEditorOptions;
    }
    log() {
        return `line: ${this.textSelection.startLineNumber}-${this.textSelection.endLineNumber}, col:  ${this.textSelection.startColumn}-${this.textSelection.endColumn}`;
    }
}
