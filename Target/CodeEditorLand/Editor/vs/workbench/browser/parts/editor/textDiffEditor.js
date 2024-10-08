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
var TextDiffEditor_1;
import { localize } from '../../../../nls.js';
import { deepClone } from '../../../../base/common/objects.js';
import { isObject, assertIsDefined } from '../../../../base/common/types.js';
import { AbstractTextEditor } from './textEditor.js';
import { TEXT_DIFF_EDITOR_ID, EditorExtensions, isEditorInput, isTextEditorViewState, createTooLargeFileError } from '../../../common/editor.js';
import { applyTextEditorOptions } from '../../../common/editor/editorOptions.js';
import { DiffEditorInput } from '../../../common/editor/diffEditorInput.js';
import { TextDiffEditorModel } from '../../../common/editor/textDiffEditorModel.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { Registry } from '../../../../platform/registry/common/platform.js';
import { URI } from '../../../../base/common/uri.js';
import { IEditorGroupsService } from '../../../services/editor/common/editorGroupsService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { EditorActivation } from '../../../../platform/editor/common/editor.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { isEqual } from '../../../../base/common/resources.js';
import { multibyteAwareBtoa } from '../../../../base/browser/dom.js';
import { ByteSize, IFileService, TooLargeFileOperationError } from '../../../../platform/files/common/files.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { StopWatch } from '../../../../base/common/stopwatch.js';
import { DiffEditorWidget } from '../../../../editor/browser/widget/diffEditor/diffEditorWidget.js';
/**
 * The text editor that leverages the diff text editor for the editing experience.
 */
let TextDiffEditor = class TextDiffEditor extends AbstractTextEditor {
    static { TextDiffEditor_1 = this; }
    static { this.ID = TEXT_DIFF_EDITOR_ID; }
    get scopedContextKeyService() {
        if (!this.diffEditorControl) {
            return undefined;
        }
        const originalEditor = this.diffEditorControl.getOriginalEditor();
        const modifiedEditor = this.diffEditorControl.getModifiedEditor();
        return (originalEditor.hasTextFocus() ? originalEditor : modifiedEditor).invokeWithinContext(accessor => accessor.get(IContextKeyService));
    }
    constructor(group, telemetryService, instantiationService, storageService, configurationService, editorService, themeService, editorGroupService, fileService, preferencesService) {
        super(TextDiffEditor_1.ID, group, telemetryService, instantiationService, storageService, configurationService, themeService, editorService, editorGroupService, fileService);
        this.preferencesService = preferencesService;
        this.diffEditorControl = undefined;
        this.inputLifecycleStopWatch = undefined;
        this._previousViewModel = null;
    }
    getTitle() {
        if (this.input) {
            return this.input.getName();
        }
        return localize('textDiffEditor', "Text Diff Editor");
    }
    createEditorControl(parent, configuration) {
        this.diffEditorControl = this._register(this.instantiationService.createInstance(DiffEditorWidget, parent, configuration, {}));
    }
    updateEditorControlOptions(options) {
        this.diffEditorControl?.updateOptions(options);
    }
    getMainControl() {
        return this.diffEditorControl?.getModifiedEditor();
    }
    async setInput(input, options, context, token) {
        if (this._previousViewModel) {
            this._previousViewModel.dispose();
            this._previousViewModel = null;
        }
        // Cleanup previous things associated with the input
        this.inputLifecycleStopWatch = undefined;
        // Set input and resolve
        await super.setInput(input, options, context, token);
        try {
            const resolvedModel = await input.resolve();
            // Check for cancellation
            if (token.isCancellationRequested) {
                return undefined;
            }
            // Fallback to open as binary if not text
            if (!(resolvedModel instanceof TextDiffEditorModel)) {
                this.openAsBinary(input, options);
                return undefined;
            }
            // Set Editor Model
            const control = assertIsDefined(this.diffEditorControl);
            const resolvedDiffEditorModel = resolvedModel;
            const vm = resolvedDiffEditorModel.textDiffEditorModel ? control.createViewModel(resolvedDiffEditorModel.textDiffEditorModel) : null;
            this._previousViewModel = vm;
            await vm?.waitForDiff();
            control.setModel(vm);
            // Restore view state (unless provided by options)
            let hasPreviousViewState = false;
            if (!isTextEditorViewState(options?.viewState)) {
                hasPreviousViewState = this.restoreTextDiffEditorViewState(input, options, context, control);
            }
            // Apply options to editor if any
            let optionsGotApplied = false;
            if (options) {
                optionsGotApplied = applyTextEditorOptions(options, control, 1 /* ScrollType.Immediate */);
            }
            if (!optionsGotApplied && !hasPreviousViewState) {
                control.revealFirstDiff();
            }
            // Since the resolved model provides information about being readonly
            // or not, we apply it here to the editor even though the editor input
            // was already asked for being readonly or not. The rationale is that
            // a resolved model might have more specific information about being
            // readonly or not that the input did not have.
            control.updateOptions({
                ...this.getReadonlyConfiguration(resolvedDiffEditorModel.modifiedModel?.isReadonly()),
                originalEditable: !resolvedDiffEditorModel.originalModel?.isReadonly()
            });
            control.handleInitialized();
            // Start to measure input lifecycle
            this.inputLifecycleStopWatch = new StopWatch(false);
        }
        catch (error) {
            await this.handleSetInputError(error, input, options);
        }
    }
    async handleSetInputError(error, input, options) {
        // Handle case where content appears to be binary
        if (this.isFileBinaryError(error)) {
            return this.openAsBinary(input, options);
        }
        // Handle case where a file is too large to open without confirmation
        if (error.fileOperationResult === 7 /* FileOperationResult.FILE_TOO_LARGE */) {
            let message;
            if (error instanceof TooLargeFileOperationError) {
                message = localize('fileTooLargeForHeapErrorWithSize', "At least one file is not displayed in the text compare editor because it is very large ({0}).", ByteSize.formatSize(error.size));
            }
            else {
                message = localize('fileTooLargeForHeapErrorWithoutSize', "At least one file is not displayed in the text compare editor because it is very large.");
            }
            throw createTooLargeFileError(this.group, input, options, message, this.preferencesService);
        }
        // Otherwise make sure the error bubbles up
        throw error;
    }
    restoreTextDiffEditorViewState(editor, options, context, control) {
        const editorViewState = this.loadEditorViewState(editor, context);
        if (editorViewState) {
            if (options?.selection && editorViewState.modified) {
                editorViewState.modified.cursorState = []; // prevent duplicate selections via options
            }
            control.restoreViewState(editorViewState);
            if (options?.revealIfVisible) {
                control.revealFirstDiff();
            }
            return true;
        }
        return false;
    }
    openAsBinary(input, options) {
        const original = input.original;
        const modified = input.modified;
        const binaryDiffInput = this.instantiationService.createInstance(DiffEditorInput, input.getName(), input.getDescription(), original, modified, true);
        // Forward binary flag to input if supported
        const fileEditorFactory = Registry.as(EditorExtensions.EditorFactory).getFileEditorFactory();
        if (fileEditorFactory.isFileEditor(original)) {
            original.setForceOpenAsBinary();
        }
        if (fileEditorFactory.isFileEditor(modified)) {
            modified.setForceOpenAsBinary();
        }
        // Replace this editor with the binary one
        this.group.replaceEditors([{
                editor: input,
                replacement: binaryDiffInput,
                options: {
                    ...options,
                    // Make sure to not steal away the currently active group
                    // because we are triggering another openEditor() call
                    // and do not control the initial intent that resulted
                    // in us now opening as binary.
                    activation: EditorActivation.PRESERVE,
                    pinned: this.group.isPinned(input),
                    sticky: this.group.isSticky(input)
                }
            }]);
    }
    setOptions(options) {
        super.setOptions(options);
        if (options) {
            applyTextEditorOptions(options, assertIsDefined(this.diffEditorControl), 0 /* ScrollType.Smooth */);
        }
    }
    shouldHandleConfigurationChangeEvent(e, resource) {
        if (super.shouldHandleConfigurationChangeEvent(e, resource)) {
            return true;
        }
        return e.affectsConfiguration(resource, 'diffEditor') || e.affectsConfiguration(resource, 'accessibility.verbosity.diffEditor');
    }
    computeConfiguration(configuration) {
        const editorConfiguration = super.computeConfiguration(configuration);
        // Handle diff editor specially by merging in diffEditor configuration
        if (isObject(configuration.diffEditor)) {
            const diffEditorConfiguration = deepClone(configuration.diffEditor);
            // User settings defines `diffEditor.codeLens`, but here we rename that to `diffEditor.diffCodeLens` to avoid collisions with `editor.codeLens`.
            diffEditorConfiguration.diffCodeLens = diffEditorConfiguration.codeLens;
            delete diffEditorConfiguration.codeLens;
            // User settings defines `diffEditor.wordWrap`, but here we rename that to `diffEditor.diffWordWrap` to avoid collisions with `editor.wordWrap`.
            diffEditorConfiguration.diffWordWrap = diffEditorConfiguration.wordWrap;
            delete diffEditorConfiguration.wordWrap;
            Object.assign(editorConfiguration, diffEditorConfiguration);
        }
        const verbose = configuration.accessibility?.verbosity?.diffEditor ?? false;
        editorConfiguration.accessibilityVerbose = verbose;
        return editorConfiguration;
    }
    getConfigurationOverrides(configuration) {
        return {
            ...super.getConfigurationOverrides(configuration),
            ...this.getReadonlyConfiguration(this.input?.isReadonly()),
            originalEditable: this.input instanceof DiffEditorInput && !this.input.original.isReadonly(),
            lineDecorationsWidth: '2ch'
        };
    }
    updateReadonly(input) {
        if (input instanceof DiffEditorInput) {
            this.diffEditorControl?.updateOptions({
                ...this.getReadonlyConfiguration(input.isReadonly()),
                originalEditable: !input.original.isReadonly(),
            });
        }
        else {
            super.updateReadonly(input);
        }
    }
    isFileBinaryError(error) {
        if (Array.isArray(error)) {
            const errors = error;
            return errors.some(error => this.isFileBinaryError(error));
        }
        return error.textFileOperationResult === 0 /* TextFileOperationResult.FILE_IS_BINARY */;
    }
    clearInput() {
        if (this._previousViewModel) {
            this._previousViewModel.dispose();
            this._previousViewModel = null;
        }
        super.clearInput();
        // Log input lifecycle telemetry
        const inputLifecycleElapsed = this.inputLifecycleStopWatch?.elapsed();
        this.inputLifecycleStopWatch = undefined;
        if (typeof inputLifecycleElapsed === 'number') {
            this.logInputLifecycleTelemetry(inputLifecycleElapsed, this.getControl()?.getModel()?.modified?.getLanguageId());
        }
        // Clear Model
        this.diffEditorControl?.setModel(null);
    }
    logInputLifecycleTelemetry(duration, languageId) {
        let collapseUnchangedRegions = false;
        if (this.diffEditorControl instanceof DiffEditorWidget) {
            collapseUnchangedRegions = this.diffEditorControl.collapseUnchangedRegions;
        }
        this.telemetryService.publicLog2('diffEditor.editorVisibleTime', {
            editorVisibleTimeMs: duration,
            languageId: languageId ?? '',
            collapseUnchangedRegions,
        });
    }
    getControl() {
        return this.diffEditorControl;
    }
    focus() {
        super.focus();
        this.diffEditorControl?.focus();
    }
    hasFocus() {
        return this.diffEditorControl?.hasTextFocus() || super.hasFocus();
    }
    setEditorVisible(visible) {
        super.setEditorVisible(visible);
        if (visible) {
            this.diffEditorControl?.onVisible();
        }
        else {
            this.diffEditorControl?.onHide();
        }
    }
    layout(dimension) {
        this.diffEditorControl?.layout(dimension);
    }
    setBoundarySashes(sashes) {
        this.diffEditorControl?.setBoundarySashes(sashes);
    }
    tracksEditorViewState(input) {
        return input instanceof DiffEditorInput;
    }
    computeEditorViewState(resource) {
        if (!this.diffEditorControl) {
            return undefined;
        }
        const model = this.diffEditorControl.getModel();
        if (!model || !model.modified || !model.original) {
            return undefined; // view state always needs a model
        }
        const modelUri = this.toEditorViewStateResource(model);
        if (!modelUri) {
            return undefined; // model URI is needed to make sure we save the view state correctly
        }
        if (!isEqual(modelUri, resource)) {
            return undefined; // prevent saving view state for a model that is not the expected one
        }
        return this.diffEditorControl.saveViewState() ?? undefined;
    }
    toEditorViewStateResource(modelOrInput) {
        let original;
        let modified;
        if (modelOrInput instanceof DiffEditorInput) {
            original = modelOrInput.original.resource;
            modified = modelOrInput.modified.resource;
        }
        else if (!isEditorInput(modelOrInput)) {
            original = modelOrInput.original.uri;
            modified = modelOrInput.modified.uri;
        }
        if (!original || !modified) {
            return undefined;
        }
        // create a URI that is the Base64 concatenation of original + modified resource
        return URI.from({ scheme: 'diff', path: `${multibyteAwareBtoa(original.toString())}${multibyteAwareBtoa(modified.toString())}` });
    }
};
TextDiffEditor = TextDiffEditor_1 = __decorate([
    __param(1, ITelemetryService),
    __param(2, IInstantiationService),
    __param(3, IStorageService),
    __param(4, ITextResourceConfigurationService),
    __param(5, IEditorService),
    __param(6, IThemeService),
    __param(7, IEditorGroupsService),
    __param(8, IFileService),
    __param(9, IPreferencesService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TextDiffEditor);
export { TextDiffEditor };
