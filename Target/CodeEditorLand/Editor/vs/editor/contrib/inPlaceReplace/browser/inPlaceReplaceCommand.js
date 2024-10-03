import { Selection } from '../../../common/core/selection.js';
export class InPlaceReplaceCommand {
    constructor(editRange, originalSelection, text) {
        this._editRange = editRange;
        this._originalSelection = originalSelection;
        this._text = text;
    }
    getEditOperations(model, builder) {
        builder.addTrackedEditOperation(this._editRange, this._text);
    }
    computeCursorState(model, helper) {
        const inverseEditOperations = helper.getInverseEditOperations();
        const srcRange = inverseEditOperations[0].range;
        if (!this._originalSelection.isEmpty()) {
            return new Selection(srcRange.endLineNumber, srcRange.endColumn - this._text.length, srcRange.endLineNumber, srcRange.endColumn);
        }
        return new Selection(srcRange.endLineNumber, Math.min(this._originalSelection.positionColumn, srcRange.endColumn), srcRange.endLineNumber, Math.min(this._originalSelection.positionColumn, srcRange.endColumn));
    }
}
