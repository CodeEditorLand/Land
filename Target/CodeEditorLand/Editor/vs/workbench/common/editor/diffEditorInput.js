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
var DiffEditorInput_1;
import { localize } from '../../../nls.js';
import { AbstractSideBySideEditorInputSerializer, SideBySideEditorInput } from './sideBySideEditorInput.js';
import { EditorInput } from './editorInput.js';
import { TEXT_DIFF_EDITOR_ID, BINARY_DIFF_EDITOR_ID, isResourceDiffEditorInput } from '../editor.js';
import { BaseTextEditorModel } from './textEditorModel.js';
import { DiffEditorModel } from './diffEditorModel.js';
import { TextDiffEditorModel } from './textDiffEditorModel.js';
import { IEditorService } from '../../services/editor/common/editorService.js';
import { shorten } from '../../../base/common/labels.js';
import { isResolvedEditorModel } from '../../../platform/editor/common/editor.js';
/**
 * The base editor input for the diff editor. It is made up of two editor inputs, the original version
 * and the modified version.
 */
let DiffEditorInput = class DiffEditorInput extends SideBySideEditorInput {
    static { DiffEditorInput_1 = this; }
    static { this.ID = 'workbench.editors.diffEditorInput'; }
    get typeId() {
        return DiffEditorInput_1.ID;
    }
    get editorId() {
        return this.modified.editorId === this.original.editorId ? this.modified.editorId : undefined;
    }
    get capabilities() {
        let capabilities = super.capabilities;
        // Force description capability depends on labels
        if (this.labels.forceDescription) {
            capabilities |= 64 /* EditorInputCapabilities.ForceDescription */;
        }
        return capabilities;
    }
    constructor(preferredName, preferredDescription, original, modified, forceOpenAsBinary, editorService) {
        super(preferredName, preferredDescription, original, modified, editorService);
        this.original = original;
        this.modified = modified;
        this.forceOpenAsBinary = forceOpenAsBinary;
        this.cachedModel = undefined;
        this.labels = this.computeLabels();
    }
    computeLabels() {
        // Name
        let name;
        let forceDescription = false;
        if (this.preferredName) {
            name = this.preferredName;
        }
        else {
            const originalName = this.original.getName();
            const modifiedName = this.modified.getName();
            name = localize('sideBySideLabels', "{0} ↔ {1}", originalName, modifiedName);
            // Enforce description when the names are identical
            forceDescription = originalName === modifiedName;
        }
        // Description
        let shortDescription;
        let mediumDescription;
        let longDescription;
        if (this.preferredDescription) {
            shortDescription = this.preferredDescription;
            mediumDescription = this.preferredDescription;
            longDescription = this.preferredDescription;
        }
        else {
            shortDescription = this.computeLabel(this.original.getDescription(0 /* Verbosity.SHORT */), this.modified.getDescription(0 /* Verbosity.SHORT */));
            longDescription = this.computeLabel(this.original.getDescription(2 /* Verbosity.LONG */), this.modified.getDescription(2 /* Verbosity.LONG */));
            // Medium Description: try to be verbose by computing
            // a label that resembles the difference between the two
            const originalMediumDescription = this.original.getDescription(1 /* Verbosity.MEDIUM */);
            const modifiedMediumDescription = this.modified.getDescription(1 /* Verbosity.MEDIUM */);
            if ((typeof originalMediumDescription === 'string' && typeof modifiedMediumDescription === 'string') && // we can only `shorten` when both sides are strings...
                (originalMediumDescription || modifiedMediumDescription) // ...however never when both sides are empty strings
            ) {
                const [shortenedOriginalMediumDescription, shortenedModifiedMediumDescription] = shorten([originalMediumDescription, modifiedMediumDescription]);
                mediumDescription = this.computeLabel(shortenedOriginalMediumDescription, shortenedModifiedMediumDescription);
            }
        }
        // Title
        let shortTitle = this.computeLabel(this.original.getTitle(0 /* Verbosity.SHORT */) ?? this.original.getName(), this.modified.getTitle(0 /* Verbosity.SHORT */) ?? this.modified.getName(), ' ↔ ');
        let mediumTitle = this.computeLabel(this.original.getTitle(1 /* Verbosity.MEDIUM */) ?? this.original.getName(), this.modified.getTitle(1 /* Verbosity.MEDIUM */) ?? this.modified.getName(), ' ↔ ');
        let longTitle = this.computeLabel(this.original.getTitle(2 /* Verbosity.LONG */) ?? this.original.getName(), this.modified.getTitle(2 /* Verbosity.LONG */) ?? this.modified.getName(), ' ↔ ');
        const preferredTitle = this.getPreferredTitle();
        if (preferredTitle) {
            shortTitle = `${preferredTitle} (${shortTitle})`;
            mediumTitle = `${preferredTitle} (${mediumTitle})`;
            longTitle = `${preferredTitle} (${longTitle})`;
        }
        return { name, shortDescription, mediumDescription, longDescription, forceDescription, shortTitle, mediumTitle, longTitle };
    }
    computeLabel(originalLabel, modifiedLabel, separator = ' - ') {
        if (!originalLabel || !modifiedLabel) {
            return undefined;
        }
        if (originalLabel === modifiedLabel) {
            return modifiedLabel;
        }
        return `${originalLabel}${separator}${modifiedLabel}`;
    }
    getName() {
        return this.labels.name;
    }
    getDescription(verbosity = 1 /* Verbosity.MEDIUM */) {
        switch (verbosity) {
            case 0 /* Verbosity.SHORT */:
                return this.labels.shortDescription;
            case 2 /* Verbosity.LONG */:
                return this.labels.longDescription;
            case 1 /* Verbosity.MEDIUM */:
            default:
                return this.labels.mediumDescription;
        }
    }
    getTitle(verbosity) {
        switch (verbosity) {
            case 0 /* Verbosity.SHORT */:
                return this.labels.shortTitle;
            case 2 /* Verbosity.LONG */:
                return this.labels.longTitle;
            default:
            case 1 /* Verbosity.MEDIUM */:
                return this.labels.mediumTitle;
        }
    }
    async resolve() {
        // Create Model - we never reuse our cached model if refresh is true because we cannot
        // decide for the inputs within if the cached model can be reused or not. There may be
        // inputs that need to be loaded again and thus we always recreate the model and dispose
        // the previous one - if any.
        const resolvedModel = await this.createModel();
        this.cachedModel?.dispose();
        this.cachedModel = resolvedModel;
        return this.cachedModel;
    }
    prefersEditorPane(editorPanes) {
        if (this.forceOpenAsBinary) {
            return editorPanes.find(editorPane => editorPane.typeId === BINARY_DIFF_EDITOR_ID);
        }
        return editorPanes.find(editorPane => editorPane.typeId === TEXT_DIFF_EDITOR_ID);
    }
    async createModel() {
        // Join resolve call over two inputs and build diff editor model
        const [originalEditorModel, modifiedEditorModel] = await Promise.all([
            this.original.resolve(),
            this.modified.resolve()
        ]);
        // If both are text models, return textdiffeditor model
        if (modifiedEditorModel instanceof BaseTextEditorModel && originalEditorModel instanceof BaseTextEditorModel) {
            return new TextDiffEditorModel(originalEditorModel, modifiedEditorModel);
        }
        // Otherwise return normal diff model
        return new DiffEditorModel(isResolvedEditorModel(originalEditorModel) ? originalEditorModel : undefined, isResolvedEditorModel(modifiedEditorModel) ? modifiedEditorModel : undefined);
    }
    toUntyped(options) {
        const untyped = super.toUntyped(options);
        if (untyped) {
            return {
                ...untyped,
                modified: untyped.primary,
                original: untyped.secondary
            };
        }
        return undefined;
    }
    matches(otherInput) {
        if (this === otherInput) {
            return true;
        }
        if (otherInput instanceof DiffEditorInput_1) {
            return this.modified.matches(otherInput.modified) && this.original.matches(otherInput.original) && otherInput.forceOpenAsBinary === this.forceOpenAsBinary;
        }
        if (isResourceDiffEditorInput(otherInput)) {
            return this.modified.matches(otherInput.modified) && this.original.matches(otherInput.original);
        }
        return false;
    }
    dispose() {
        // Free the diff editor model but do not propagate the dispose() call to the two inputs
        // We never created the two inputs (original and modified) so we can not dispose
        // them without sideeffects.
        if (this.cachedModel) {
            this.cachedModel.dispose();
            this.cachedModel = undefined;
        }
        super.dispose();
    }
};
DiffEditorInput = DiffEditorInput_1 = __decorate([
    __param(5, IEditorService),
    __metadata("design:paramtypes", [Object, Object, EditorInput,
        EditorInput, Object, Object])
], DiffEditorInput);
export { DiffEditorInput };
export class DiffEditorInputSerializer extends AbstractSideBySideEditorInputSerializer {
    createEditorInput(instantiationService, name, description, secondaryInput, primaryInput) {
        return instantiationService.createInstance(DiffEditorInput, name, description, secondaryInput, primaryInput, undefined);
    }
}
