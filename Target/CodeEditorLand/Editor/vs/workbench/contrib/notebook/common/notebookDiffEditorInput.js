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
var NotebookDiffEditorInput_1;
import { isResourceDiffEditorInput } from '../../../common/editor.js';
import { EditorModel } from '../../../common/editor/editorModel.js';
import { DiffEditorInput } from '../../../common/editor/diffEditorInput.js';
import { NotebookEditorInput } from './notebookEditorInput.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
class NotebookDiffEditorModel extends EditorModel {
    constructor(original, modified) {
        super();
        this.original = original;
        this.modified = modified;
    }
}
let NotebookDiffEditorInput = class NotebookDiffEditorInput extends DiffEditorInput {
    static { NotebookDiffEditorInput_1 = this; }
    static create(instantiationService, resource, name, description, originalResource, viewType) {
        const original = NotebookEditorInput.getOrCreate(instantiationService, originalResource, undefined, viewType);
        const modified = NotebookEditorInput.getOrCreate(instantiationService, resource, undefined, viewType);
        return instantiationService.createInstance(NotebookDiffEditorInput_1, name, description, original, modified, viewType);
    }
    static { this.ID = 'workbench.input.diffNotebookInput'; }
    get resource() {
        return this.modified.resource;
    }
    get editorId() {
        return this.viewType;
    }
    constructor(name, description, original, modified, viewType, editorService) {
        super(name, description, original, modified, undefined, editorService);
        this.original = original;
        this.modified = modified;
        this.viewType = viewType;
        this._modifiedTextModel = null;
        this._originalTextModel = null;
        this._cachedModel = undefined;
    }
    get typeId() {
        return NotebookDiffEditorInput_1.ID;
    }
    async resolve() {
        const [originalEditorModel, modifiedEditorModel] = await Promise.all([
            this.original.resolve(),
            this.modified.resolve(),
        ]);
        this._cachedModel?.dispose();
        // TODO@rebornix check how we restore the editor in text diff editor
        if (!modifiedEditorModel) {
            throw new Error(`Fail to resolve modified editor model for resource ${this.modified.resource} with notebookType ${this.viewType}`);
        }
        if (!originalEditorModel) {
            throw new Error(`Fail to resolve original editor model for resource ${this.original.resource} with notebookType ${this.viewType}`);
        }
        this._originalTextModel = originalEditorModel;
        this._modifiedTextModel = modifiedEditorModel;
        this._cachedModel = new NotebookDiffEditorModel(this._originalTextModel, this._modifiedTextModel);
        return this._cachedModel;
    }
    toUntyped() {
        const original = { resource: this.original.resource };
        const modified = { resource: this.resource };
        return {
            original,
            modified,
            primary: modified,
            secondary: original,
            options: {
                override: this.viewType
            }
        };
    }
    matches(otherInput) {
        if (this === otherInput) {
            return true;
        }
        if (otherInput instanceof NotebookDiffEditorInput_1) {
            return this.modified.matches(otherInput.modified)
                && this.original.matches(otherInput.original)
                && this.viewType === otherInput.viewType;
        }
        if (isResourceDiffEditorInput(otherInput)) {
            return this.modified.matches(otherInput.modified)
                && this.original.matches(otherInput.original)
                && this.editorId !== undefined
                && (this.editorId === otherInput.options?.override || otherInput.options?.override === undefined);
        }
        return false;
    }
    dispose() {
        super.dispose();
        this._cachedModel?.dispose();
        this._cachedModel = undefined;
        this.original.dispose();
        this.modified.dispose();
        this._originalTextModel = null;
        this._modifiedTextModel = null;
    }
};
NotebookDiffEditorInput = NotebookDiffEditorInput_1 = __decorate([
    __param(5, IEditorService),
    __metadata("design:paramtypes", [Object, Object, NotebookEditorInput,
        NotebookEditorInput, String, Object])
], NotebookDiffEditorInput);
export { NotebookDiffEditorInput };
