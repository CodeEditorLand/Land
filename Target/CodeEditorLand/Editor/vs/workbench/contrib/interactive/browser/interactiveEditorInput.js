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
var InteractiveEditorInput_1;
import { Event } from '../../../../base/common/event.js';
import * as paths from '../../../../base/common/path.js';
import { isEqual, joinPath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { PLAINTEXT_LANGUAGE_ID } from '../../../../editor/common/languages/modesRegistry.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { EditorInput } from '../../../common/editor/editorInput.js';
import { IInteractiveDocumentService } from './interactiveDocumentService.js';
import { IInteractiveHistoryService } from './interactiveHistoryService.js';
import { NotebookSetting } from '../../notebook/common/notebookCommon.js';
import { NotebookEditorInput } from '../../notebook/common/notebookEditorInput.js';
import { INotebookService } from '../../notebook/common/notebookService.js';
let InteractiveEditorInput = class InteractiveEditorInput extends EditorInput {
    static { InteractiveEditorInput_1 = this; }
    static create(instantiationService, resource, inputResource, title, language) {
        return instantiationService.createInstance(InteractiveEditorInput_1, resource, inputResource, title, language);
    }
    static { this.windowNames = {}; }
    static setName(notebookUri, title) {
        if (title) {
            this.windowNames[notebookUri.path] = title;
        }
    }
    static { this.ID = 'workbench.input.interactive'; }
    get editorId() {
        return 'interactive';
    }
    get typeId() {
        return InteractiveEditorInput_1.ID;
    }
    get language() {
        return this._inputModelRef?.object.textEditorModel.getLanguageId() ?? this._initLanguage;
    }
    get notebookEditorInput() {
        return this._notebookEditorInput;
    }
    get editorInputs() {
        return [this._notebookEditorInput];
    }
    get resource() {
        return this._resource;
    }
    get inputResource() {
        return this._inputResource;
    }
    get primary() {
        return this._notebookEditorInput;
    }
    constructor(resource, inputResource, title, languageId, instantiationService, textModelService, interactiveDocumentService, historyService, _notebookService, _fileDialogService, configurationService) {
        const input = NotebookEditorInput.getOrCreate(instantiationService, resource, undefined, 'interactive', {});
        super();
        this._notebookService = _notebookService;
        this._fileDialogService = _fileDialogService;
        this.isScratchpad = configurationService.getValue(NotebookSetting.InteractiveWindowPromptToSave) !== true;
        this._notebookEditorInput = input;
        this._register(this._notebookEditorInput);
        this.name = title ?? InteractiveEditorInput_1.windowNames[resource.path] ?? paths.basename(resource.path, paths.extname(resource.path));
        this._initLanguage = languageId;
        this._resource = resource;
        this._inputResource = inputResource;
        this._inputResolver = null;
        this._editorModelReference = null;
        this._inputModelRef = null;
        this._textModelService = textModelService;
        this._interactiveDocumentService = interactiveDocumentService;
        this._historyService = historyService;
        this._registerListeners();
    }
    _registerListeners() {
        const oncePrimaryDisposed = Event.once(this.primary.onWillDispose);
        this._register(oncePrimaryDisposed(() => {
            if (!this.isDisposed()) {
                this.dispose();
            }
        }));
        // Re-emit some events from the primary side to the outside
        this._register(this.primary.onDidChangeDirty(() => this._onDidChangeDirty.fire()));
        this._register(this.primary.onDidChangeLabel(() => this._onDidChangeLabel.fire()));
        // Re-emit some events from both sides to the outside
        this._register(this.primary.onDidChangeCapabilities(() => this._onDidChangeCapabilities.fire()));
    }
    get capabilities() {
        const scratchPad = this.isScratchpad ? 512 /* EditorInputCapabilities.Scratchpad */ : 0;
        return 4 /* EditorInputCapabilities.Untitled */
            | 2 /* EditorInputCapabilities.Readonly */
            | scratchPad;
    }
    async _resolveEditorModel() {
        if (!this._editorModelReference) {
            this._editorModelReference = await this._notebookEditorInput.resolve();
        }
        return this._editorModelReference;
    }
    async resolve() {
        if (this._editorModelReference) {
            return this._editorModelReference;
        }
        if (this._inputResolver) {
            return this._inputResolver;
        }
        this._inputResolver = this._resolveEditorModel();
        return this._inputResolver;
    }
    async resolveInput(language) {
        if (this._inputModelRef) {
            return this._inputModelRef.object.textEditorModel;
        }
        const resolvedLanguage = language ?? this._initLanguage ?? PLAINTEXT_LANGUAGE_ID;
        this._interactiveDocumentService.willCreateInteractiveDocument(this.resource, this.inputResource, resolvedLanguage);
        this._inputModelRef = await this._textModelService.createModelReference(this.inputResource);
        return this._inputModelRef.object.textEditorModel;
    }
    async save(group, options) {
        if (this._editorModelReference) {
            if (this.hasCapability(4 /* EditorInputCapabilities.Untitled */)) {
                return this.saveAs(group, options);
            }
            else {
                await this._editorModelReference.save(options);
            }
            return this;
        }
        return undefined;
    }
    async saveAs(group, options) {
        if (!this._editorModelReference) {
            return undefined;
        }
        const provider = this._notebookService.getContributedNotebookType('interactive');
        if (!provider) {
            return undefined;
        }
        const filename = this.getName() + '.ipynb';
        const pathCandidate = joinPath(await this._fileDialogService.defaultFilePath(), filename);
        const target = await this._fileDialogService.pickFileToSave(pathCandidate, options?.availableFileSystems);
        if (!target) {
            return undefined; // save cancelled
        }
        const saved = await this._editorModelReference.saveAs(target);
        if (saved && 'resource' in saved && saved.resource) {
            this._notebookService.getNotebookTextModel(saved.resource)?.dispose();
        }
        return saved;
    }
    matches(otherInput) {
        if (super.matches(otherInput)) {
            return true;
        }
        if (otherInput instanceof InteractiveEditorInput_1) {
            return isEqual(this.resource, otherInput.resource) && isEqual(this.inputResource, otherInput.inputResource);
        }
        return false;
    }
    getName() {
        return this.name;
    }
    isDirty() {
        if (this.isScratchpad) {
            return false;
        }
        return this._editorModelReference?.isDirty() ?? false;
    }
    isModified() {
        return this._editorModelReference?.isModified() ?? false;
    }
    async revert(_group, options) {
        if (this._editorModelReference && this._editorModelReference.isDirty()) {
            await this._editorModelReference.revert(options);
        }
    }
    dispose() {
        // we support closing the interactive window without prompt, so the editor model should not be dirty
        this._editorModelReference?.revert({ soft: true });
        this._notebookEditorInput?.dispose();
        this._editorModelReference?.dispose();
        this._editorModelReference = null;
        this._interactiveDocumentService.willRemoveInteractiveDocument(this.resource, this.inputResource);
        this._inputModelRef?.dispose();
        this._inputModelRef = null;
        super.dispose();
    }
    get historyService() {
        return this._historyService;
    }
};
InteractiveEditorInput = InteractiveEditorInput_1 = __decorate([
    __param(4, IInstantiationService),
    __param(5, ITextModelService),
    __param(6, IInteractiveDocumentService),
    __param(7, IInteractiveHistoryService),
    __param(8, INotebookService),
    __param(9, IFileDialogService),
    __param(10, IConfigurationService),
    __metadata("design:paramtypes", [URI,
        URI, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], InteractiveEditorInput);
export { InteractiveEditorInput };
