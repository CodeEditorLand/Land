import { Selection } from '../../../common/core/selection.js';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from '../../../common/editorCommon.js';
import { ITextModel } from '../../../common/model.js';
export declare class CopyLinesCommand implements ICommand {
    private readonly _selection;
    private readonly _isCopyingDown;
    private readonly _noop;
    private _selectionDirection;
    private _selectionId;
    private _startLineNumberDelta;
    private _endLineNumberDelta;
    constructor(selection: Selection, isCopyingDown: boolean, noop?: boolean);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
