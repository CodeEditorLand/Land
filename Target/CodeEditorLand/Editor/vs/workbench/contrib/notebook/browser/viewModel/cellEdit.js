/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { SelectionStateType } from '../../common/notebookCommon.js';
import { CellFocusMode } from '../notebookBrowser.js';
export class JoinCellEdit {
    constructor(resource, index, direction, cell, selections, inverseRange, insertContent, removedCell, editingDelegate) {
        this.resource = resource;
        this.index = index;
        this.direction = direction;
        this.cell = cell;
        this.selections = selections;
        this.inverseRange = inverseRange;
        this.insertContent = insertContent;
        this.removedCell = removedCell;
        this.editingDelegate = editingDelegate;
        this.type = 0 /* UndoRedoElementType.Resource */;
        this.label = 'Join Cell';
        this.code = 'undoredo.textBufferEdit';
        this._deletedRawCell = this.removedCell.model;
    }
    async undo() {
        if (!this.editingDelegate.insertCell || !this.editingDelegate.createCellViewModel) {
            throw new Error('Notebook Insert Cell not implemented for Undo/Redo');
        }
        await this.cell.resolveTextModel();
        this.cell.textModel?.applyEdits([
            { range: this.inverseRange, text: '' }
        ]);
        this.cell.setSelections(this.selections);
        const cell = this.editingDelegate.createCellViewModel(this._deletedRawCell);
        if (this.direction === 'above') {
            this.editingDelegate.insertCell(this.index, this._deletedRawCell, { kind: SelectionStateType.Handle, primary: cell.handle, selections: [cell.handle] });
            cell.focusMode = CellFocusMode.Editor;
        }
        else {
            this.editingDelegate.insertCell(this.index, cell.model, { kind: SelectionStateType.Handle, primary: this.cell.handle, selections: [this.cell.handle] });
            this.cell.focusMode = CellFocusMode.Editor;
        }
    }
    async redo() {
        if (!this.editingDelegate.deleteCell) {
            throw new Error('Notebook Delete Cell not implemented for Undo/Redo');
        }
        await this.cell.resolveTextModel();
        this.cell.textModel?.applyEdits([
            { range: this.inverseRange, text: this.insertContent }
        ]);
        this.editingDelegate.deleteCell(this.index, { kind: SelectionStateType.Handle, primary: this.cell.handle, selections: [this.cell.handle] });
        this.cell.focusMode = CellFocusMode.Editor;
    }
}
