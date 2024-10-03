import { ISingleEditOperation } from '../core/editOperation.js';
import { Position } from '../core/position.js';
import { Selection } from '../core/selection.js';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from '../editorCommon.js';
import { ITextModel } from '../model.js';
export declare class TrimTrailingWhitespaceCommand implements ICommand {
    private readonly _selection;
    private _selectionId;
    private readonly _cursors;
    private readonly _trimInRegexesAndStrings;
    constructor(selection: Selection, cursors: Position[], trimInRegexesAndStrings: boolean);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
export declare function trimTrailingWhitespace(model: ITextModel, cursors: Position[], trimInRegexesAndStrings: boolean): ISingleEditOperation[];
