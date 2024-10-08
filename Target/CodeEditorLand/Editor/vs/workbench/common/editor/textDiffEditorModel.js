/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { DiffEditorModel } from './diffEditorModel.js';
/**
 * The base text editor model for the diff editor. It is made up of two text editor models, the original version
 * and the modified version.
 */
export class TextDiffEditorModel extends DiffEditorModel {
    get originalModel() { return this._originalModel; }
    get modifiedModel() { return this._modifiedModel; }
    get textDiffEditorModel() { return this._textDiffEditorModel; }
    constructor(originalModel, modifiedModel) {
        super(originalModel, modifiedModel);
        this._textDiffEditorModel = undefined;
        this._originalModel = originalModel;
        this._modifiedModel = modifiedModel;
        this.updateTextDiffEditorModel();
    }
    async resolve() {
        await super.resolve();
        this.updateTextDiffEditorModel();
    }
    updateTextDiffEditorModel() {
        if (this.originalModel?.isResolved() && this.modifiedModel?.isResolved()) {
            // Create new
            if (!this._textDiffEditorModel) {
                this._textDiffEditorModel = {
                    original: this.originalModel.textEditorModel,
                    modified: this.modifiedModel.textEditorModel
                };
            }
            // Update existing
            else {
                this._textDiffEditorModel.original = this.originalModel.textEditorModel;
                this._textDiffEditorModel.modified = this.modifiedModel.textEditorModel;
            }
        }
    }
    isResolved() {
        return !!this._textDiffEditorModel;
    }
    isReadonly() {
        return !!this.modifiedModel && this.modifiedModel.isReadonly();
    }
    dispose() {
        // Free the diff editor model but do not propagate the dispose() call to the two models
        // inside. We never created the two models (original and modified) so we can not dispose
        // them without sideeffects. Rather rely on the models getting disposed when their related
        // inputs get disposed from the diffEditorInput.
        this._textDiffEditorModel = undefined;
        super.dispose();
    }
}
