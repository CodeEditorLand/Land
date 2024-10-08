import { Position } from '../../../common/core/position.js';
import { Selection } from '../../../common/core/selection.js';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from '../../../common/editorCommon.js';
import { ITextModel } from '../../../common/model.js';
export declare class DragAndDropCommand implements ICommand {
    private readonly selection;
    private readonly targetPosition;
    private targetSelection;
    private readonly copy;
    constructor(selection: Selection, targetPosition: Position, copy: boolean);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
