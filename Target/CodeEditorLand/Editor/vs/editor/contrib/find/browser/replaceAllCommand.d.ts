import { Range } from '../../../common/core/range.js';
import { Selection } from '../../../common/core/selection.js';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from '../../../common/editorCommon.js';
import { ITextModel } from '../../../common/model.js';
export declare class ReplaceAllCommand implements ICommand {
    private readonly _editorSelection;
    private _trackedEditorSelectionId;
    private readonly _ranges;
    private readonly _replaceStrings;
    constructor(editorSelection: Selection, ranges: Range[], replaceStrings: string[]);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
