/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { observableValue } from '../../../../../base/common/observable.js';
import { RENDERER_NOT_AVAILABLE } from '../../common/notebookCommon.js';
let handle = 0;
export class CellOutputViewModel extends Disposable {
    setVisible(visible = true, force = false) {
        if (!visible && this.alwaysShow) {
            // we are forced to show, so no-op
            return;
        }
        if (force && visible) {
            this.alwaysShow = true;
        }
        this.visible.set(visible, undefined);
    }
    get model() {
        return this._outputRawData;
    }
    get pickedMimeType() {
        return this._pickedMimeType;
    }
    set pickedMimeType(value) {
        this._pickedMimeType = value;
    }
    constructor(cellViewModel, _outputRawData, _notebookService) {
        super();
        this.cellViewModel = cellViewModel;
        this._outputRawData = _outputRawData;
        this._notebookService = _notebookService;
        this._onDidResetRendererEmitter = this._register(new Emitter());
        this.onDidResetRenderer = this._onDidResetRendererEmitter.event;
        this.alwaysShow = false;
        this.visible = observableValue('outputVisible', false);
        this.outputHandle = handle++;
    }
    hasMultiMimeType() {
        if (this._outputRawData.outputs.length < 2) {
            return false;
        }
        const firstMimeType = this._outputRawData.outputs[0].mime;
        return this._outputRawData.outputs.some(output => output.mime !== firstMimeType);
    }
    resolveMimeTypes(textModel, kernelProvides) {
        const mimeTypes = this._notebookService.getOutputMimeTypeInfo(textModel, kernelProvides, this.model);
        const index = mimeTypes.findIndex(mimeType => mimeType.rendererId !== RENDERER_NOT_AVAILABLE && mimeType.isTrusted);
        return [mimeTypes, Math.max(index, 0)];
    }
    resetRenderer() {
        // reset the output renderer
        this._pickedMimeType = undefined;
        this.model.bumpVersion();
        this._onDidResetRendererEmitter.fire();
    }
    toRawJSON() {
        return {
            outputs: this._outputRawData.outputs,
            // TODO@rebronix, no id, right?
        };
    }
}
