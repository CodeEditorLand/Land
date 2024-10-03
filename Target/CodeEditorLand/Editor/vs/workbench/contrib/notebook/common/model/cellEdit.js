export class MoveCellEdit {
    get label() {
        return this.length === 1 ? 'Move Cell' : 'Move Cells';
    }
    constructor(resource, fromIndex, length, toIndex, editingDelegate, beforedSelections, endSelections) {
        this.resource = resource;
        this.fromIndex = fromIndex;
        this.length = length;
        this.toIndex = toIndex;
        this.editingDelegate = editingDelegate;
        this.beforedSelections = beforedSelections;
        this.endSelections = endSelections;
        this.type = 0;
        this.code = 'undoredo.textBufferEdit';
    }
    undo() {
        if (!this.editingDelegate.moveCell) {
            throw new Error('Notebook Move Cell not implemented for Undo/Redo');
        }
        this.editingDelegate.moveCell(this.toIndex, this.length, this.fromIndex, this.endSelections, this.beforedSelections);
    }
    redo() {
        if (!this.editingDelegate.moveCell) {
            throw new Error('Notebook Move Cell not implemented for Undo/Redo');
        }
        this.editingDelegate.moveCell(this.fromIndex, this.length, this.toIndex, this.beforedSelections, this.endSelections);
    }
}
export class SpliceCellsEdit {
    get label() {
        if (this.diffs.length === 1 && this.diffs[0][1].length === 0) {
            return this.diffs[0][2].length > 1 ? 'Insert Cells' : 'Insert Cell';
        }
        if (this.diffs.length === 1 && this.diffs[0][2].length === 0) {
            return this.diffs[0][1].length > 1 ? 'Delete Cells' : 'Delete Cell';
        }
        return 'Insert Cell';
    }
    constructor(resource, diffs, editingDelegate, beforeHandles, endHandles) {
        this.resource = resource;
        this.diffs = diffs;
        this.editingDelegate = editingDelegate;
        this.beforeHandles = beforeHandles;
        this.endHandles = endHandles;
        this.type = 0;
        this.code = 'undoredo.textBufferEdit';
    }
    undo() {
        if (!this.editingDelegate.replaceCell) {
            throw new Error('Notebook Replace Cell not implemented for Undo/Redo');
        }
        this.diffs.forEach(diff => {
            this.editingDelegate.replaceCell(diff[0], diff[2].length, diff[1], this.beforeHandles);
        });
    }
    redo() {
        if (!this.editingDelegate.replaceCell) {
            throw new Error('Notebook Replace Cell not implemented for Undo/Redo');
        }
        this.diffs.reverse().forEach(diff => {
            this.editingDelegate.replaceCell(diff[0], diff[1].length, diff[2], this.endHandles);
        });
    }
}
export class CellMetadataEdit {
    constructor(resource, index, oldMetadata, newMetadata, editingDelegate) {
        this.resource = resource;
        this.index = index;
        this.oldMetadata = oldMetadata;
        this.newMetadata = newMetadata;
        this.editingDelegate = editingDelegate;
        this.type = 0;
        this.label = 'Update Cell Metadata';
        this.code = 'undoredo.textBufferEdit';
    }
    undo() {
        if (!this.editingDelegate.updateCellMetadata) {
            return;
        }
        this.editingDelegate.updateCellMetadata(this.index, this.oldMetadata);
    }
    redo() {
        if (!this.editingDelegate.updateCellMetadata) {
            return;
        }
        this.editingDelegate.updateCellMetadata(this.index, this.newMetadata);
    }
}
