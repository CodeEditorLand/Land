import { ConfigurationChangedEvent, EditorAutoClosingEditStrategy, EditorAutoClosingStrategy, EditorAutoIndentStrategy, EditorAutoSurroundStrategy } from './config/editorOptions.js';
import { LineTokens } from './tokens/lineTokens.js';
import { Position } from './core/position.js';
import { Range } from './core/range.js';
import { ISelection, Selection } from './core/selection.js';
import { ICommand } from './editorCommon.js';
import { IEditorConfiguration } from './config/editorConfiguration.js';
import { PositionAffinity, TextModelResolvedOptions } from './model.js';
import { AutoClosingPairs } from './languages/languageConfiguration.js';
import { ILanguageConfigurationService } from './languages/languageConfigurationRegistry.js';
import { IElectricAction } from './languages/supports/electricCharacter.js';
export interface IColumnSelectData {
    isReal: boolean;
    fromViewLineNumber: number;
    fromViewVisualColumn: number;
    toViewLineNumber: number;
    toViewVisualColumn: number;
}
export declare const enum EditOperationType {
    Other = 0,
    DeletingLeft = 2,
    DeletingRight = 3,
    TypingOther = 4,
    TypingFirstSpace = 5,
    TypingConsecutiveSpace = 6
}
export interface CharacterMap {
    [char: string]: string;
}
export declare class CursorConfiguration {
    readonly languageConfigurationService: ILanguageConfigurationService;
    _cursorMoveConfigurationBrand: void;
    readonly readOnly: boolean;
    readonly tabSize: number;
    readonly indentSize: number;
    readonly insertSpaces: boolean;
    readonly stickyTabStops: boolean;
    readonly pageSize: number;
    readonly lineHeight: number;
    readonly typicalHalfwidthCharacterWidth: number;
    readonly useTabStops: boolean;
    readonly wordSeparators: string;
    readonly emptySelectionClipboard: boolean;
    readonly copyWithSyntaxHighlighting: boolean;
    readonly multiCursorMergeOverlapping: boolean;
    readonly multiCursorPaste: 'spread' | 'full';
    readonly multiCursorLimit: number;
    readonly autoClosingBrackets: EditorAutoClosingStrategy;
    readonly autoClosingComments: EditorAutoClosingStrategy;
    readonly autoClosingQuotes: EditorAutoClosingStrategy;
    readonly autoClosingDelete: EditorAutoClosingEditStrategy;
    readonly autoClosingOvertype: EditorAutoClosingEditStrategy;
    readonly autoSurround: EditorAutoSurroundStrategy;
    readonly autoIndent: EditorAutoIndentStrategy;
    readonly autoClosingPairs: AutoClosingPairs;
    readonly surroundingPairs: CharacterMap;
    readonly blockCommentStartToken: string | null;
    readonly shouldAutoCloseBefore: {
        quote: (ch: string) => boolean;
        bracket: (ch: string) => boolean;
        comment: (ch: string) => boolean;
    };
    readonly wordSegmenterLocales: string[];
    private readonly _languageId;
    private _electricChars;
    static shouldRecreate(e: ConfigurationChangedEvent): boolean;
    constructor(languageId: string, modelOptions: TextModelResolvedOptions, configuration: IEditorConfiguration, languageConfigurationService: ILanguageConfigurationService);
    get electricChars(): {
        [key: string]: boolean;
    };
    onElectricCharacter(character: string, context: LineTokens, column: number): IElectricAction | null;
    normalizeIndentation(str: string): string;
    private _getShouldAutoClose;
    private _getLanguageDefinedShouldAutoClose;
    visibleColumnFromColumn(model: ICursorSimpleModel, position: Position): number;
    columnFromVisibleColumn(model: ICursorSimpleModel, lineNumber: number, visibleColumn: number): number;
}
export interface ICursorSimpleModel {
    getLineCount(): number;
    getLineContent(lineNumber: number): string;
    getLineMinColumn(lineNumber: number): number;
    getLineMaxColumn(lineNumber: number): number;
    getLineFirstNonWhitespaceColumn(lineNumber: number): number;
    getLineLastNonWhitespaceColumn(lineNumber: number): number;
    normalizePosition(position: Position, affinity: PositionAffinity): Position;
    getLineIndentColumn(lineNumber: number): number;
}
export type PartialCursorState = CursorState | PartialModelCursorState | PartialViewCursorState;
export declare class CursorState {
    _cursorStateBrand: void;
    static fromModelState(modelState: SingleCursorState): PartialModelCursorState;
    static fromViewState(viewState: SingleCursorState): PartialViewCursorState;
    static fromModelSelection(modelSelection: ISelection): PartialModelCursorState;
    static fromModelSelections(modelSelections: readonly ISelection[]): PartialModelCursorState[];
    readonly modelState: SingleCursorState;
    readonly viewState: SingleCursorState;
    constructor(modelState: SingleCursorState, viewState: SingleCursorState);
    equals(other: CursorState): boolean;
}
export declare class PartialModelCursorState {
    readonly modelState: SingleCursorState;
    readonly viewState: null;
    constructor(modelState: SingleCursorState);
}
export declare class PartialViewCursorState {
    readonly modelState: null;
    readonly viewState: SingleCursorState;
    constructor(viewState: SingleCursorState);
}
export declare const enum SelectionStartKind {
    Simple = 0,
    Word = 1,
    Line = 2
}
export declare class SingleCursorState {
    readonly selectionStart: Range;
    readonly selectionStartKind: SelectionStartKind;
    readonly selectionStartLeftoverVisibleColumns: number;
    readonly position: Position;
    readonly leftoverVisibleColumns: number;
    _singleCursorStateBrand: void;
    readonly selection: Selection;
    constructor(selectionStart: Range, selectionStartKind: SelectionStartKind, selectionStartLeftoverVisibleColumns: number, position: Position, leftoverVisibleColumns: number);
    equals(other: SingleCursorState): boolean;
    hasSelection(): boolean;
    move(inSelectionMode: boolean, lineNumber: number, column: number, leftoverVisibleColumns: number): SingleCursorState;
    private static _computeSelection;
}
export declare class EditOperationResult {
    _editOperationResultBrand: void;
    readonly type: EditOperationType;
    readonly commands: Array<ICommand | null>;
    readonly shouldPushStackElementBefore: boolean;
    readonly shouldPushStackElementAfter: boolean;
    constructor(type: EditOperationType, commands: Array<ICommand | null>, opts: {
        shouldPushStackElementBefore: boolean;
        shouldPushStackElementAfter: boolean;
    });
}
export declare function isQuote(ch: string): boolean;
