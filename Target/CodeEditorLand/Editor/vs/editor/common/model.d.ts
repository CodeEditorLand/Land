import { Event } from '../../base/common/event.js';
import { IMarkdownString } from '../../base/common/htmlContent.js';
import { IDisposable } from '../../base/common/lifecycle.js';
import { ThemeColor } from '../../base/common/themables.js';
import { URI } from '../../base/common/uri.js';
import { ISingleEditOperation } from './core/editOperation.js';
import { IPosition, Position } from './core/position.js';
import { IRange, Range } from './core/range.js';
import { Selection } from './core/selection.js';
import { TextChange } from './core/textChange.js';
import { WordCharacterClassifier } from './core/wordCharacterClassifier.js';
import { IWordAtPosition } from './core/wordHelper.js';
import { FormattingOptions } from './languages.js';
import { ILanguageSelection } from './languages/language.js';
import { IBracketPairsTextModelPart } from './textModelBracketPairs.js';
import { IModelContentChange, IModelContentChangedEvent, IModelDecorationsChangedEvent, IModelLanguageChangedEvent, IModelLanguageConfigurationChangedEvent, IModelOptionsChangedEvent, IModelTokensChangedEvent, InternalModelContentChangeEvent, ModelInjectedTextChangedEvent } from './textModelEvents.js';
import { IGuidesTextModelPart } from './textModelGuides.js';
import { ITokenizationTextModelPart } from './tokenizationTextModelPart.js';
import { UndoRedoGroup } from '../../platform/undoRedo/common/undoRedo.js';
import { TokenArray } from './tokens/tokenArray.js';
export declare enum OverviewRulerLane {
    Left = 1,
    Center = 2,
    Right = 4,
    Full = 7
}
export declare enum GlyphMarginLane {
    Left = 1,
    Center = 2,
    Right = 3
}
export interface IGlyphMarginLanesModel {
    readonly requiredLanes: number;
    getLanesAtLine(lineNumber: number): GlyphMarginLane[];
    reset(maxLine: number): void;
    push(lane: GlyphMarginLane, range: Range, persist?: boolean): void;
}
export declare const enum MinimapPosition {
    Inline = 1,
    Gutter = 2
}
export declare const enum MinimapSectionHeaderStyle {
    Normal = 1,
    Underlined = 2
}
export interface IDecorationOptions {
    color: string | ThemeColor | undefined;
    darkColor?: string | ThemeColor;
}
export interface IModelDecorationGlyphMarginOptions {
    position: GlyphMarginLane;
    persistLane?: boolean;
}
export interface IModelDecorationOverviewRulerOptions extends IDecorationOptions {
    position: OverviewRulerLane;
}
export interface IModelDecorationMinimapOptions extends IDecorationOptions {
    position: MinimapPosition;
    sectionHeaderStyle?: MinimapSectionHeaderStyle | null;
    sectionHeaderText?: string | null;
}
export interface IModelDecorationOptions {
    description: string;
    stickiness?: TrackedRangeStickiness;
    className?: string | null;
    shouldFillLineOnLineBreak?: boolean | null;
    blockClassName?: string | null;
    blockIsAfterEnd?: boolean | null;
    blockDoesNotCollapse?: boolean | null;
    blockPadding?: [top: number, right: number, bottom: number, left: number] | null;
    glyphMarginHoverMessage?: IMarkdownString | IMarkdownString[] | null;
    hoverMessage?: IMarkdownString | IMarkdownString[] | null;
    lineNumberHoverMessage?: IMarkdownString | IMarkdownString[] | null;
    isWholeLine?: boolean;
    showIfCollapsed?: boolean;
    collapseOnReplaceEdit?: boolean;
    zIndex?: number;
    overviewRuler?: IModelDecorationOverviewRulerOptions | null;
    minimap?: IModelDecorationMinimapOptions | null;
    glyphMarginClassName?: string | null;
    glyphMargin?: IModelDecorationGlyphMarginOptions | null;
    linesDecorationsClassName?: string | null;
    linesDecorationsTooltip?: string | null;
    lineNumberClassName?: string | null;
    firstLineDecorationClassName?: string | null;
    marginClassName?: string | null;
    inlineClassName?: string | null;
    inlineClassNameAffectsLetterSpacing?: boolean;
    beforeContentClassName?: string | null;
    afterContentClassName?: string | null;
    after?: InjectedTextOptions | null;
    before?: InjectedTextOptions | null;
    hideInCommentTokens?: boolean | null;
    hideInStringTokens?: boolean | null;
}
export interface InjectedTextOptions {
    readonly content: string;
    readonly tokens?: TokenArray | null;
    readonly inlineClassName?: string | null;
    readonly inlineClassNameAffectsLetterSpacing?: boolean;
    readonly attachedData?: unknown;
    readonly cursorStops?: InjectedTextCursorStops | null;
}
export declare enum InjectedTextCursorStops {
    Both = 0,
    Right = 1,
    Left = 2,
    None = 3
}
export interface IModelDeltaDecoration {
    range: IRange;
    options: IModelDecorationOptions;
}
export interface IModelDecoration {
    readonly id: string;
    readonly ownerId: number;
    readonly range: Range;
    readonly options: IModelDecorationOptions;
}
export interface IModelDecorationsChangeAccessor {
    addDecoration(range: IRange, options: IModelDecorationOptions): string;
    changeDecoration(id: string, newRange: IRange): void;
    changeDecorationOptions(id: string, newOptions: IModelDecorationOptions): void;
    removeDecoration(id: string): void;
    deltaDecorations(oldDecorations: readonly string[], newDecorations: readonly IModelDeltaDecoration[]): string[];
}
export declare const enum EndOfLinePreference {
    TextDefined = 0,
    LF = 1,
    CRLF = 2
}
export declare const enum DefaultEndOfLine {
    LF = 1,
    CRLF = 2
}
export declare const enum EndOfLineSequence {
    LF = 0,
    CRLF = 1
}
export interface ISingleEditOperationIdentifier {
    major: number;
    minor: number;
}
export interface IIdentifiedSingleEditOperation extends ISingleEditOperation {
    identifier?: ISingleEditOperationIdentifier | null;
    isAutoWhitespaceEdit?: boolean;
    _isTracked?: boolean;
}
export interface IValidEditOperation {
    identifier: ISingleEditOperationIdentifier | null;
    range: Range;
    text: string;
    textChange: TextChange;
}
export interface ICursorStateComputer {
    (inverseEditOperations: IValidEditOperation[]): Selection[] | null;
}
export declare class TextModelResolvedOptions {
    _textModelResolvedOptionsBrand: void;
    readonly tabSize: number;
    readonly indentSize: number;
    private readonly _indentSizeIsTabSize;
    readonly insertSpaces: boolean;
    readonly defaultEOL: DefaultEndOfLine;
    readonly trimAutoWhitespace: boolean;
    readonly bracketPairColorizationOptions: BracketPairColorizationOptions;
    get originalIndentSize(): number | 'tabSize';
    constructor(src: {
        tabSize: number;
        indentSize: number | 'tabSize';
        insertSpaces: boolean;
        defaultEOL: DefaultEndOfLine;
        trimAutoWhitespace: boolean;
        bracketPairColorizationOptions: BracketPairColorizationOptions;
    });
    equals(other: TextModelResolvedOptions): boolean;
    createChangeEvent(newOpts: TextModelResolvedOptions): IModelOptionsChangedEvent;
}
export interface ITextModelCreationOptions {
    tabSize: number;
    indentSize: number | 'tabSize';
    insertSpaces: boolean;
    detectIndentation: boolean;
    trimAutoWhitespace: boolean;
    defaultEOL: DefaultEndOfLine;
    isForSimpleWidget: boolean;
    largeFileOptimizations: boolean;
    bracketPairColorizationOptions: BracketPairColorizationOptions;
}
export interface BracketPairColorizationOptions {
    enabled: boolean;
    independentColorPoolPerBracketType: boolean;
}
export interface ITextModelUpdateOptions {
    tabSize?: number;
    indentSize?: number | 'tabSize';
    insertSpaces?: boolean;
    trimAutoWhitespace?: boolean;
    bracketColorizationOptions?: BracketPairColorizationOptions;
}
export declare class FindMatch {
    _findMatchBrand: void;
    readonly range: Range;
    readonly matches: string[] | null;
    constructor(range: Range, matches: string[] | null);
}
export declare const enum TrackedRangeStickiness {
    AlwaysGrowsWhenTypingAtEdges = 0,
    NeverGrowsWhenTypingAtEdges = 1,
    GrowsOnlyWhenTypingBefore = 2,
    GrowsOnlyWhenTypingAfter = 3
}
export interface ITextSnapshot {
    read(): string | null;
}
export declare function isITextSnapshot(obj: any): obj is ITextSnapshot;
export interface ITextModel {
    readonly uri: URI;
    readonly id: string;
    readonly isForSimpleWidget: boolean;
    mightContainRTL(): boolean;
    mightContainUnusualLineTerminators(): boolean;
    removeUnusualLineTerminators(selections?: Selection[]): void;
    mightContainNonBasicASCII(): boolean;
    getOptions(): TextModelResolvedOptions;
    getFormattingOptions(): FormattingOptions;
    getVersionId(): number;
    getAlternativeVersionId(): number;
    setValue(newValue: string | ITextSnapshot): void;
    getValue(eol?: EndOfLinePreference, preserveBOM?: boolean): string;
    createSnapshot(preserveBOM?: boolean): ITextSnapshot;
    getValueLength(eol?: EndOfLinePreference, preserveBOM?: boolean): number;
    equalsTextBuffer(other: ITextBuffer): boolean;
    getTextBuffer(): ITextBuffer;
    getValueInRange(range: IRange, eol?: EndOfLinePreference): string;
    getValueLengthInRange(range: IRange, eol?: EndOfLinePreference): number;
    getCharacterCountInRange(range: IRange, eol?: EndOfLinePreference): number;
    isDominatedByLongLines(): boolean;
    getLineCount(): number;
    getLineContent(lineNumber: number): string;
    getLineLength(lineNumber: number): number;
    getLinesContent(): string[];
    getEOL(): string;
    getEndOfLineSequence(): EndOfLineSequence;
    getLineMinColumn(lineNumber: number): number;
    getLineMaxColumn(lineNumber: number): number;
    getLineFirstNonWhitespaceColumn(lineNumber: number): number;
    getLineLastNonWhitespaceColumn(lineNumber: number): number;
    validatePosition(position: IPosition): Position;
    modifyPosition(position: IPosition, offset: number): Position;
    validateRange(range: IRange): Range;
    getOffsetAt(position: IPosition): number;
    getPositionAt(offset: number): Position;
    getFullModelRange(): Range;
    isDisposed(): boolean;
    isTooLargeForSyncing(): boolean;
    isTooLargeForTokenization(): boolean;
    isTooLargeForHeapOperation(): boolean;
    findMatches(searchString: string, searchOnlyEditableRange: boolean, isRegex: boolean, matchCase: boolean, wordSeparators: string | null, captureMatches: boolean, limitResultCount?: number): FindMatch[];
    findMatches(searchString: string, searchScope: IRange | IRange[], isRegex: boolean, matchCase: boolean, wordSeparators: string | null, captureMatches: boolean, limitResultCount?: number): FindMatch[];
    findNextMatch(searchString: string, searchStart: IPosition, isRegex: boolean, matchCase: boolean, wordSeparators: string | null, captureMatches: boolean): FindMatch | null;
    findPreviousMatch(searchString: string, searchStart: IPosition, isRegex: boolean, matchCase: boolean, wordSeparators: string | null, captureMatches: boolean): FindMatch | null;
    getLanguageId(): string;
    setLanguage(languageId: string, source?: string): void;
    setLanguage(languageSelection: ILanguageSelection, source?: string): void;
    getLanguageIdAtPosition(lineNumber: number, column: number): string;
    getWordAtPosition(position: IPosition): IWordAtPosition | null;
    getWordUntilPosition(position: IPosition): IWordAtPosition;
    changeDecorations<T>(callback: (changeAccessor: IModelDecorationsChangeAccessor) => T, ownerId?: number): T | null;
    deltaDecorations(oldDecorations: string[], newDecorations: IModelDeltaDecoration[], ownerId?: number): string[];
    removeAllDecorationsWithOwnerId(ownerId: number): void;
    getDecorationOptions(id: string): IModelDecorationOptions | null;
    getDecorationRange(id: string): Range | null;
    getLineDecorations(lineNumber: number, ownerId?: number, filterOutValidation?: boolean): IModelDecoration[];
    getLinesDecorations(startLineNumber: number, endLineNumber: number, ownerId?: number, filterOutValidation?: boolean): IModelDecoration[];
    getDecorationsInRange(range: IRange, ownerId?: number, filterOutValidation?: boolean, onlyMinimapDecorations?: boolean, onlyMarginDecorations?: boolean): IModelDecoration[];
    getAllDecorations(ownerId?: number, filterOutValidation?: boolean): IModelDecoration[];
    getAllMarginDecorations(ownerId?: number): IModelDecoration[];
    getOverviewRulerDecorations(ownerId?: number, filterOutValidation?: boolean): IModelDecoration[];
    getInjectedTextDecorations(ownerId?: number): IModelDecoration[];
    _getTrackedRange(id: string): Range | null;
    _setTrackedRange(id: string | null, newRange: null, newStickiness: TrackedRangeStickiness): null;
    _setTrackedRange(id: string | null, newRange: Range, newStickiness: TrackedRangeStickiness): string;
    normalizeIndentation(str: string): string;
    updateOptions(newOpts: ITextModelUpdateOptions): void;
    detectIndentation(defaultInsertSpaces: boolean, defaultTabSize: number): void;
    pushStackElement(): void;
    popStackElement(): void;
    pushEditOperations(beforeCursorState: Selection[] | null, editOperations: IIdentifiedSingleEditOperation[], cursorStateComputer: ICursorStateComputer): Selection[] | null;
    pushEditOperations(beforeCursorState: Selection[] | null, editOperations: IIdentifiedSingleEditOperation[], cursorStateComputer: ICursorStateComputer, group?: UndoRedoGroup): Selection[] | null;
    pushEOL(eol: EndOfLineSequence): void;
    applyEdits(operations: IIdentifiedSingleEditOperation[]): void;
    applyEdits(operations: IIdentifiedSingleEditOperation[], computeUndoEdits: false): void;
    applyEdits(operations: IIdentifiedSingleEditOperation[], computeUndoEdits: true): IValidEditOperation[];
    setEOL(eol: EndOfLineSequence): void;
    _applyUndo(changes: TextChange[], eol: EndOfLineSequence, resultingAlternativeVersionId: number, resultingSelection: Selection[] | null): void;
    _applyRedo(changes: TextChange[], eol: EndOfLineSequence, resultingAlternativeVersionId: number, resultingSelection: Selection[] | null): void;
    undo(): void | Promise<void>;
    canUndo(): boolean;
    redo(): void | Promise<void>;
    canRedo(): boolean;
    readonly onDidChangeContentOrInjectedText: Event<InternalModelContentChangeEvent | ModelInjectedTextChangedEvent>;
    onDidChangeContent(listener: (e: IModelContentChangedEvent) => void): IDisposable;
    readonly onDidChangeDecorations: Event<IModelDecorationsChangedEvent>;
    readonly onDidChangeOptions: Event<IModelOptionsChangedEvent>;
    readonly onDidChangeLanguage: Event<IModelLanguageChangedEvent>;
    readonly onDidChangeLanguageConfiguration: Event<IModelLanguageConfigurationChangedEvent>;
    readonly onDidChangeTokens: Event<IModelTokensChangedEvent>;
    readonly onDidChangeAttached: Event<void>;
    readonly onWillDispose: Event<void>;
    dispose(): void;
    onBeforeAttached(): IAttachedView;
    onBeforeDetached(view: IAttachedView): void;
    isAttachedToEditor(): boolean;
    getAttachedEditorCount(): number;
    normalizePosition(position: Position, affinity: PositionAffinity): Position;
    getLineIndentColumn(lineNumber: number): number;
    readonly bracketPairs: IBracketPairsTextModelPart;
    readonly guides: IGuidesTextModelPart;
    readonly tokenization: ITokenizationTextModelPart;
}
export interface IAttachedView {
    setVisibleLines(visibleLines: {
        startLineNumber: number;
        endLineNumber: number;
    }[], stabilized: boolean): void;
}
export declare const enum PositionAffinity {
    Left = 0,
    Right = 1,
    None = 2,
    LeftOfInjectedText = 3,
    RightOfInjectedText = 4
}
export interface ITextBufferBuilder {
    acceptChunk(chunk: string): void;
    finish(): ITextBufferFactory;
}
export interface ITextBufferFactory {
    create(defaultEOL: DefaultEndOfLine): {
        textBuffer: ITextBuffer;
        disposable: IDisposable;
    };
    getFirstLineText(lengthLimit: number): string;
}
export declare const enum ModelConstants {
    FIRST_LINE_DETECTION_LENGTH_LIMIT = 1000
}
export declare class ValidAnnotatedEditOperation implements IIdentifiedSingleEditOperation {
    readonly identifier: ISingleEditOperationIdentifier | null;
    readonly range: Range;
    readonly text: string | null;
    readonly forceMoveMarkers: boolean;
    readonly isAutoWhitespaceEdit: boolean;
    readonly _isTracked: boolean;
    constructor(identifier: ISingleEditOperationIdentifier | null, range: Range, text: string | null, forceMoveMarkers: boolean, isAutoWhitespaceEdit: boolean, _isTracked: boolean);
}
export interface IReadonlyTextBuffer {
    onDidChangeContent: Event<void>;
    equals(other: ITextBuffer): boolean;
    mightContainRTL(): boolean;
    mightContainUnusualLineTerminators(): boolean;
    resetMightContainUnusualLineTerminators(): void;
    mightContainNonBasicASCII(): boolean;
    getBOM(): string;
    getEOL(): string;
    getOffsetAt(lineNumber: number, column: number): number;
    getPositionAt(offset: number): Position;
    getRangeAt(offset: number, length: number): Range;
    getValueInRange(range: Range, eol: EndOfLinePreference): string;
    createSnapshot(preserveBOM: boolean): ITextSnapshot;
    getValueLengthInRange(range: Range, eol: EndOfLinePreference): number;
    getCharacterCountInRange(range: Range, eol: EndOfLinePreference): number;
    getLength(): number;
    getLineCount(): number;
    getLinesContent(): string[];
    getLineContent(lineNumber: number): string;
    getLineCharCode(lineNumber: number, index: number): number;
    getCharCode(offset: number): number;
    getLineLength(lineNumber: number): number;
    getLineMinColumn(lineNumber: number): number;
    getLineMaxColumn(lineNumber: number): number;
    getLineFirstNonWhitespaceColumn(lineNumber: number): number;
    getLineLastNonWhitespaceColumn(lineNumber: number): number;
    findMatchesLineByLine(searchRange: Range, searchData: SearchData, captureMatches: boolean, limitResultCount: number): FindMatch[];
    getNearestChunk(offset: number): string;
}
export declare class SearchData {
    readonly regex: RegExp;
    readonly wordSeparators: WordCharacterClassifier | null;
    readonly simpleSearch: string | null;
    constructor(regex: RegExp, wordSeparators: WordCharacterClassifier | null, simpleSearch: string | null);
}
export interface ITextBuffer extends IReadonlyTextBuffer, IDisposable {
    setEOL(newEOL: '\r\n' | '\n'): void;
    applyEdits(rawOperations: ValidAnnotatedEditOperation[], recordTrimAutoWhitespace: boolean, computeUndoEdits: boolean): ApplyEditsResult;
}
export declare class ApplyEditsResult {
    readonly reverseEdits: IValidEditOperation[] | null;
    readonly changes: IInternalModelContentChange[];
    readonly trimAutoWhitespaceLineNumbers: number[] | null;
    constructor(reverseEdits: IValidEditOperation[] | null, changes: IInternalModelContentChange[], trimAutoWhitespaceLineNumbers: number[] | null);
}
export interface IInternalModelContentChange extends IModelContentChange {
    range: Range;
    forceMoveMarkers: boolean;
}
export declare function shouldSynchronizeModel(model: ITextModel): boolean;
