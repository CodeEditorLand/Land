import { CursorConfiguration, EditOperationResult, EditOperationType, ICursorSimpleModel } from '../cursorCommon.js';
import { Range } from '../core/range.js';
import { Selection } from '../core/selection.js';
import { ICommand } from '../editorCommon.js';
import { ITextModel } from '../model.js';
export declare class TypeOperations {
    static indent(config: CursorConfiguration, model: ICursorSimpleModel | null, selections: Selection[] | null): ICommand[];
    static outdent(config: CursorConfiguration, model: ICursorSimpleModel, selections: Selection[]): ICommand[];
    static shiftIndent(config: CursorConfiguration, indentation: string, count?: number): string;
    static unshiftIndent(config: CursorConfiguration, indentation: string, count?: number): string;
    static paste(config: CursorConfiguration, model: ICursorSimpleModel, selections: Selection[], text: string, pasteOnNewLine: boolean, multicursorText: string[]): EditOperationResult;
    static tab(config: CursorConfiguration, model: ITextModel, selections: Selection[]): ICommand[];
    static compositionType(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ITextModel, selections: Selection[], text: string, replacePrevCharCnt: number, replaceNextCharCnt: number, positionDelta: number): EditOperationResult;
    static compositionEndWithInterceptors(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ITextModel, compositions: CompositionOutcome[] | null, selections: Selection[], autoClosedCharacters: Range[]): EditOperationResult | null;
    static typeWithInterceptors(isDoingComposition: boolean, prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ITextModel, selections: Selection[], autoClosedCharacters: Range[], ch: string): EditOperationResult;
    static typeWithoutInterceptors(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ITextModel, selections: Selection[], str: string): EditOperationResult;
}
export declare class CompositionOutcome {
    readonly deletedText: string;
    readonly deletedSelectionStart: number;
    readonly deletedSelectionEnd: number;
    readonly insertedText: string;
    readonly insertedSelectionStart: number;
    readonly insertedSelectionEnd: number;
    constructor(deletedText: string, deletedSelectionStart: number, deletedSelectionEnd: number, insertedText: string, insertedSelectionStart: number, insertedSelectionEnd: number);
}
