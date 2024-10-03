import { Range } from '../core/range.js';
import { Selection } from '../core/selection.js';
import { ICommand, ICursorStateComputerData, IEditOperationBuilder } from '../editorCommon.js';
import { ITextModel } from '../model.js';
export declare class ReplaceCommand implements ICommand {
    private readonly _range;
    private readonly _text;
    readonly insertsAutoWhitespace: boolean;
    constructor(range: Range, text: string, insertsAutoWhitespace?: boolean);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
export declare class ReplaceCommandThatSelectsText implements ICommand {
    private readonly _range;
    private readonly _text;
    constructor(range: Range, text: string);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
export declare class ReplaceCommandWithoutChangingPosition implements ICommand {
    private readonly _range;
    private readonly _text;
    readonly insertsAutoWhitespace: boolean;
    constructor(range: Range, text: string, insertsAutoWhitespace?: boolean);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
export declare class ReplaceCommandWithOffsetCursorState implements ICommand {
    private readonly _range;
    private readonly _text;
    private readonly _columnDeltaOffset;
    private readonly _lineNumberDeltaOffset;
    readonly insertsAutoWhitespace: boolean;
    constructor(range: Range, text: string, lineNumberDeltaOffset: number, columnDeltaOffset: number, insertsAutoWhitespace?: boolean);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
export declare class ReplaceCommandThatPreservesSelection implements ICommand {
    private readonly _range;
    private readonly _text;
    private readonly _initialSelection;
    private readonly _forceMoveMarkers;
    private _selectionId;
    constructor(editRange: Range, text: string, initialSelection: Selection, forceMoveMarkers?: boolean);
    getEditOperations(model: ITextModel, builder: IEditOperationBuilder): void;
    computeCursorState(model: ITextModel, helper: ICursorStateComputerData): Selection;
}
