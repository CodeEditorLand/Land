import { IResourceUndoRedoElement, UndoRedoElementType } from '../../../../../platform/undoRedo/common/undoRedo.js';
import { URI } from '../../../../../base/common/uri.js';
import { NotebookCellTextModel } from './notebookCellTextModel.js';
import { ISelectionState, NotebookCellMetadata } from '../notebookCommon.js';
/**
 * It should not modify Undo/Redo stack
 */
export interface ITextCellEditingDelegate {
    insertCell?(index: number, cell: NotebookCellTextModel, endSelections?: ISelectionState): void;
    deleteCell?(index: number, endSelections?: ISelectionState): void;
    replaceCell?(index: number, count: number, cells: NotebookCellTextModel[], endSelections?: ISelectionState): void;
    moveCell?(fromIndex: number, length: number, toIndex: number, beforeSelections: ISelectionState | undefined, endSelections?: ISelectionState): void;
    updateCellMetadata?(index: number, newMetadata: NotebookCellMetadata): void;
}
export declare class MoveCellEdit implements IResourceUndoRedoElement {
    resource: URI;
    private fromIndex;
    private length;
    private toIndex;
    private editingDelegate;
    private beforedSelections;
    private endSelections;
    type: UndoRedoElementType.Resource;
    get label(): "Move Cell" | "Move Cells";
    code: string;
    constructor(resource: URI, fromIndex: number, length: number, toIndex: number, editingDelegate: ITextCellEditingDelegate, beforedSelections: ISelectionState | undefined, endSelections: ISelectionState | undefined);
    undo(): void;
    redo(): void;
}
export declare class SpliceCellsEdit implements IResourceUndoRedoElement {
    resource: URI;
    private diffs;
    private editingDelegate;
    private beforeHandles;
    private endHandles;
    type: UndoRedoElementType.Resource;
    get label(): "Insert Cells" | "Insert Cell" | "Delete Cells" | "Delete Cell";
    code: string;
    constructor(resource: URI, diffs: [number, NotebookCellTextModel[], NotebookCellTextModel[]][], editingDelegate: ITextCellEditingDelegate, beforeHandles: ISelectionState | undefined, endHandles: ISelectionState | undefined);
    undo(): void;
    redo(): void;
}
export declare class CellMetadataEdit implements IResourceUndoRedoElement {
    resource: URI;
    readonly index: number;
    readonly oldMetadata: NotebookCellMetadata;
    readonly newMetadata: NotebookCellMetadata;
    private editingDelegate;
    type: UndoRedoElementType.Resource;
    label: string;
    code: string;
    constructor(resource: URI, index: number, oldMetadata: NotebookCellMetadata, newMetadata: NotebookCellMetadata, editingDelegate: ITextCellEditingDelegate);
    undo(): void;
    redo(): void | Promise<void>;
}
