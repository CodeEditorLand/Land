import { ReplaceCommandWithOffsetCursorState } from '../commands/replaceCommand.js';
import { CursorConfiguration, EditOperationResult, EditOperationType, ICursorSimpleModel } from '../cursorCommon.js';
import { Range } from '../core/range.js';
import { Selection } from '../core/selection.js';
import { ICommand, ICursorStateComputerData } from '../editorCommon.js';
import { ITextModel } from '../model.js';
export declare class AutoIndentOperation {
    static getEdits(config: CursorConfiguration, model: ITextModel, selections: Selection[], ch: string, isDoingComposition: boolean): EditOperationResult | undefined;
    private static _isAutoIndentType;
    private static _findActualIndentationForSelection;
    private static _getIndentationAndAutoClosingPairEdits;
    private static _getEditFromIndentationAndSelection;
}
export declare class AutoClosingOvertypeOperation {
    static getEdits(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ITextModel, selections: Selection[], autoClosedCharacters: Range[], ch: string): EditOperationResult | undefined;
    private static _runAutoClosingOvertype;
}
export declare class AutoClosingOvertypeWithInterceptorsOperation {
    static getEdits(config: CursorConfiguration, model: ITextModel, selections: Selection[], autoClosedCharacters: Range[], ch: string): EditOperationResult | undefined;
}
export declare class AutoClosingOpenCharTypeOperation {
    static getEdits(config: CursorConfiguration, model: ITextModel, selections: Selection[], ch: string, chIsAlreadyTyped: boolean, isDoingComposition: boolean): EditOperationResult | undefined;
    private static _runAutoClosingOpenCharType;
    static getAutoClosingPairClose(config: CursorConfiguration, model: ITextModel, selections: Selection[], ch: string, chIsAlreadyTyped: boolean): string | null;
    private static _findContainedAutoClosingPair;
    private static _findAutoClosingPairOpen;
    private static _isBeforeClosingBrace;
}
export declare class SurroundSelectionOperation {
    static getEdits(config: CursorConfiguration, model: ITextModel, selections: Selection[], ch: string, isDoingComposition: boolean): EditOperationResult | undefined;
    private static _runSurroundSelectionType;
    private static _isSurroundSelectionType;
}
export declare class InterceptorElectricCharOperation {
    static getEdits(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ITextModel, selections: Selection[], ch: string, isDoingComposition: boolean): EditOperationResult | undefined;
    private static _isTypeInterceptorElectricChar;
    private static _typeInterceptorElectricChar;
}
export declare class SimpleCharacterTypeOperation {
    static getEdits(prevEditOperationType: EditOperationType, selections: Selection[], ch: string): EditOperationResult;
}
export declare class EnterOperation {
    static getEdits(config: CursorConfiguration, model: ITextModel, selections: Selection[], ch: string, isDoingComposition: boolean): EditOperationResult | undefined;
    private static _enter;
    static lineInsertBefore(config: CursorConfiguration, model: ITextModel | null, selections: Selection[] | null): ICommand[];
    static lineInsertAfter(config: CursorConfiguration, model: ITextModel | null, selections: Selection[] | null): ICommand[];
    static lineBreakInsert(config: CursorConfiguration, model: ITextModel, selections: Selection[]): ICommand[];
}
export declare class PasteOperation {
    static getEdits(config: CursorConfiguration, model: ICursorSimpleModel, selections: Selection[], text: string, pasteOnNewLine: boolean, multicursorText: string[]): EditOperationResult;
    private static _distributePasteToCursors;
    private static _distributedPaste;
    private static _simplePaste;
}
export declare class CompositionOperation {
    static getEdits(prevEditOperationType: EditOperationType, config: CursorConfiguration, model: ITextModel, selections: Selection[], text: string, replacePrevCharCnt: number, replaceNextCharCnt: number, positionDelta: number): EditOperationResult;
    private static _compositionType;
}
export declare class TypeWithoutInterceptorsOperation {
    static getEdits(prevEditOperationType: EditOperationType, selections: Selection[], str: string): EditOperationResult;
}
export declare class TabOperation {
    static getCommands(config: CursorConfiguration, model: ITextModel, selections: Selection[]): ICommand[];
    private static _goodIndentForLine;
    private static _replaceJumpToNextIndent;
}
export declare class BaseTypeWithAutoClosingCommand extends ReplaceCommandWithOffsetCursorState {
    private readonly _openCharacter;
    private readonly _closeCharacter;
    closeCharacterRange: Range | null;
    enclosingRange: Range | null;
    constructor(selection: Selection, text: string, lineNumberDeltaOffset: number, columnDeltaOffset: number, openCharacter: string, closeCharacter: string);
    protected _computeCursorStateWithRange(model: ITextModel, range: Range, helper: ICursorStateComputerData): Selection;
}
export declare function shiftIndent(config: CursorConfiguration, indentation: string, count?: number): string;
export declare function unshiftIndent(config: CursorConfiguration, indentation: string, count?: number): string;
export declare function shouldSurroundChar(config: CursorConfiguration, ch: string): boolean;
