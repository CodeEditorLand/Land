import { VSBufferReadableStream } from '../../../base/common/buffer.js';
import { Color } from '../../../base/common/color.js';
import { Event } from '../../../base/common/event.js';
import { IMarkdownString } from '../../../base/common/htmlContent.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { ThemeColor } from '../../../base/common/themables.js';
import { URI } from '../../../base/common/uri.js';
import { IPosition, Position } from '../core/position.js';
import { IRange, Range } from '../core/range.js';
import { Selection } from '../core/selection.js';
import { TextChange } from '../core/textChange.js';
import { IWordAtPosition } from '../core/wordHelper.js';
import { FormattingOptions } from '../languages.js';
import { ILanguageSelection, ILanguageService } from '../languages/language.js';
import { ILanguageConfigurationService } from '../languages/languageConfigurationRegistry.js';
import * as model from '../model.js';
import { IBracketPairsTextModelPart } from '../textModelBracketPairs.js';
import { IModelContentChangedEvent, IModelDecorationsChangedEvent, IModelOptionsChangedEvent, InternalModelContentChangeEvent, ModelInjectedTextChangedEvent } from '../textModelEvents.js';
import { IGuidesTextModelPart } from '../textModelGuides.js';
import { ITokenizationTextModelPart } from '../tokenizationTextModelPart.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { IColorTheme } from '../../../platform/theme/common/themeService.js';
import { IUndoRedoService, ResourceEditStackSnapshot, UndoRedoGroup } from '../../../platform/undoRedo/common/undoRedo.js';
import { TokenArray } from '../tokens/tokenArray.js';
export declare function createTextBufferFactory(text: string): model.ITextBufferFactory;
interface ITextStream {
    on(event: 'data', callback: (data: string) => void): void;
    on(event: 'error', callback: (err: Error) => void): void;
    on(event: 'end', callback: () => void): void;
    on(event: string, callback: any): void;
}
export declare function createTextBufferFactoryFromStream(stream: ITextStream): Promise<model.ITextBufferFactory>;
export declare function createTextBufferFactoryFromStream(stream: VSBufferReadableStream): Promise<model.ITextBufferFactory>;
export declare function createTextBufferFactoryFromSnapshot(snapshot: model.ITextSnapshot): model.ITextBufferFactory;
export declare function createTextBuffer(value: string | model.ITextBufferFactory | model.ITextSnapshot, defaultEOL: model.DefaultEndOfLine): {
    textBuffer: model.ITextBuffer;
    disposable: IDisposable;
};
export declare class TextModel extends Disposable implements model.ITextModel, IDecorationsTreesHost {
    private readonly _undoRedoService;
    private readonly _languageService;
    private readonly _languageConfigurationService;
    private readonly instantiationService;
    static _MODEL_SYNC_LIMIT: number;
    private static readonly LARGE_FILE_SIZE_THRESHOLD;
    private static readonly LARGE_FILE_LINE_COUNT_THRESHOLD;
    private static readonly LARGE_FILE_HEAP_OPERATION_THRESHOLD;
    static DEFAULT_CREATION_OPTIONS: model.ITextModelCreationOptions;
    static resolveOptions(textBuffer: model.ITextBuffer, options: model.ITextModelCreationOptions): model.TextModelResolvedOptions;
    private readonly _onWillDispose;
    readonly onWillDispose: Event<void>;
    private readonly _onDidChangeDecorations;
    readonly onDidChangeDecorations: Event<IModelDecorationsChangedEvent>;
    get onDidChangeLanguage(): Event<import("../textModelEvents.js").IModelLanguageChangedEvent>;
    get onDidChangeLanguageConfiguration(): Event<import("../textModelEvents.js").IModelLanguageConfigurationChangedEvent>;
    get onDidChangeTokens(): Event<import("../textModelEvents.js").IModelTokensChangedEvent>;
    private readonly _onDidChangeOptions;
    readonly onDidChangeOptions: Event<IModelOptionsChangedEvent>;
    private readonly _onDidChangeAttached;
    readonly onDidChangeAttached: Event<void>;
    private readonly _onDidChangeInjectedText;
    private readonly _eventEmitter;
    onDidChangeContent(listener: (e: IModelContentChangedEvent) => void): IDisposable;
    onDidChangeContentOrInjectedText(listener: (e: InternalModelContentChangeEvent | ModelInjectedTextChangedEvent) => void): IDisposable;
    readonly id: string;
    readonly isForSimpleWidget: boolean;
    private readonly _associatedResource;
    private _attachedEditorCount;
    private _buffer;
    private _bufferDisposable;
    private _options;
    private readonly _languageSelectionListener;
    private _isDisposed;
    private __isDisposing;
    _isDisposing(): boolean;
    private _versionId;
    /**
     * Unlike, versionId, this can go down (via undo) or go to previous values (via redo)
     */
    private _alternativeVersionId;
    private _initialUndoRedoSnapshot;
    private readonly _isTooLargeForSyncing;
    private readonly _isTooLargeForTokenization;
    private readonly _isTooLargeForHeapOperation;
    private readonly _commandManager;
    private _isUndoing;
    private _isRedoing;
    private _trimAutoWhitespaceLines;
    /**
     * Used to workaround broken clients that might attempt using a decoration id generated by a different model.
     * It is not globally unique in order to limit it to one character.
     */
    private readonly _instanceId;
    private _deltaDecorationCallCnt;
    private _lastDecorationId;
    private _decorations;
    private _decorationsTree;
    private readonly _decorationProvider;
    private readonly _tokenizationTextModelPart;
    get tokenization(): ITokenizationTextModelPart;
    private readonly _bracketPairs;
    get bracketPairs(): IBracketPairsTextModelPart;
    private readonly _guidesTextModelPart;
    get guides(): IGuidesTextModelPart;
    private readonly _attachedViews;
    constructor(source: string | model.ITextBufferFactory, languageIdOrSelection: string | ILanguageSelection, creationOptions: model.ITextModelCreationOptions, associatedResource: (URI | null) | undefined, _undoRedoService: IUndoRedoService, _languageService: ILanguageService, _languageConfigurationService: ILanguageConfigurationService, instantiationService: IInstantiationService);
    dispose(): void;
    _hasListeners(): boolean;
    private _assertNotDisposed;
    equalsTextBuffer(other: model.ITextBuffer): boolean;
    getTextBuffer(): model.ITextBuffer;
    private _emitContentChangedEvent;
    setValue(value: string | model.ITextSnapshot): void;
    private _createContentChanged2;
    private _setValueFromTextBuffer;
    setEOL(eol: model.EndOfLineSequence): void;
    private _onBeforeEOLChange;
    private _onAfterEOLChange;
    onBeforeAttached(): model.IAttachedView;
    onBeforeDetached(view: model.IAttachedView): void;
    isAttachedToEditor(): boolean;
    getAttachedEditorCount(): number;
    isTooLargeForSyncing(): boolean;
    isTooLargeForTokenization(): boolean;
    isTooLargeForHeapOperation(): boolean;
    isDisposed(): boolean;
    isDominatedByLongLines(): boolean;
    get uri(): URI;
    getOptions(): model.TextModelResolvedOptions;
    getFormattingOptions(): FormattingOptions;
    updateOptions(_newOpts: model.ITextModelUpdateOptions): void;
    detectIndentation(defaultInsertSpaces: boolean, defaultTabSize: number): void;
    normalizeIndentation(str: string): string;
    getVersionId(): number;
    mightContainRTL(): boolean;
    mightContainUnusualLineTerminators(): boolean;
    removeUnusualLineTerminators(selections?: Selection[] | null): void;
    mightContainNonBasicASCII(): boolean;
    getAlternativeVersionId(): number;
    getInitialUndoRedoSnapshot(): ResourceEditStackSnapshot | null;
    getOffsetAt(rawPosition: IPosition): number;
    getPositionAt(rawOffset: number): Position;
    private _increaseVersionId;
    _overwriteVersionId(versionId: number): void;
    _overwriteAlternativeVersionId(newAlternativeVersionId: number): void;
    _overwriteInitialUndoRedoSnapshot(newInitialUndoRedoSnapshot: ResourceEditStackSnapshot | null): void;
    getValue(eol?: model.EndOfLinePreference, preserveBOM?: boolean): string;
    createSnapshot(preserveBOM?: boolean): model.ITextSnapshot;
    getValueLength(eol?: model.EndOfLinePreference, preserveBOM?: boolean): number;
    getValueInRange(rawRange: IRange, eol?: model.EndOfLinePreference): string;
    getValueLengthInRange(rawRange: IRange, eol?: model.EndOfLinePreference): number;
    getCharacterCountInRange(rawRange: IRange, eol?: model.EndOfLinePreference): number;
    getLineCount(): number;
    getLineContent(lineNumber: number): string;
    getLineLength(lineNumber: number): number;
    getLinesContent(): string[];
    getEOL(): string;
    getEndOfLineSequence(): model.EndOfLineSequence;
    getLineMinColumn(lineNumber: number): number;
    getLineMaxColumn(lineNumber: number): number;
    getLineFirstNonWhitespaceColumn(lineNumber: number): number;
    getLineLastNonWhitespaceColumn(lineNumber: number): number;
    /**
     * Validates `range` is within buffer bounds, but allows it to sit in between surrogate pairs, etc.
     * Will try to not allocate if possible.
     */
    _validateRangeRelaxedNoAllocations(range: IRange): Range;
    private _isValidPosition;
    private _validatePosition;
    validatePosition(position: IPosition): Position;
    private _isValidRange;
    validateRange(_range: IRange): Range;
    modifyPosition(rawPosition: IPosition, offset: number): Position;
    getFullModelRange(): Range;
    private findMatchesLineByLine;
    findMatches(searchString: string, rawSearchScope: any, isRegex: boolean, matchCase: boolean, wordSeparators: string | null, captureMatches: boolean, limitResultCount?: number): model.FindMatch[];
    findNextMatch(searchString: string, rawSearchStart: IPosition, isRegex: boolean, matchCase: boolean, wordSeparators: string, captureMatches: boolean): model.FindMatch | null;
    findPreviousMatch(searchString: string, rawSearchStart: IPosition, isRegex: boolean, matchCase: boolean, wordSeparators: string, captureMatches: boolean): model.FindMatch | null;
    pushStackElement(): void;
    popStackElement(): void;
    pushEOL(eol: model.EndOfLineSequence): void;
    private _validateEditOperation;
    private _validateEditOperations;
    pushEditOperations(beforeCursorState: Selection[] | null, editOperations: model.IIdentifiedSingleEditOperation[], cursorStateComputer: model.ICursorStateComputer | null, group?: UndoRedoGroup): Selection[] | null;
    private _pushEditOperations;
    _applyUndo(changes: TextChange[], eol: model.EndOfLineSequence, resultingAlternativeVersionId: number, resultingSelection: Selection[] | null): void;
    _applyRedo(changes: TextChange[], eol: model.EndOfLineSequence, resultingAlternativeVersionId: number, resultingSelection: Selection[] | null): void;
    private _applyUndoRedoEdits;
    applyEdits(operations: readonly model.IIdentifiedSingleEditOperation[]): void;
    applyEdits(operations: readonly model.IIdentifiedSingleEditOperation[], computeUndoEdits: false): void;
    applyEdits(operations: readonly model.IIdentifiedSingleEditOperation[], computeUndoEdits: true): model.IValidEditOperation[];
    private _doApplyEdits;
    undo(): void | Promise<void>;
    canUndo(): boolean;
    redo(): void | Promise<void>;
    canRedo(): boolean;
    private handleBeforeFireDecorationsChangedEvent;
    changeDecorations<T>(callback: (changeAccessor: model.IModelDecorationsChangeAccessor) => T, ownerId?: number): T | null;
    private _changeDecorations;
    deltaDecorations(oldDecorations: string[], newDecorations: model.IModelDeltaDecoration[], ownerId?: number): string[];
    _getTrackedRange(id: string): Range | null;
    _setTrackedRange(id: string | null, newRange: null, newStickiness: model.TrackedRangeStickiness): null;
    _setTrackedRange(id: string | null, newRange: Range, newStickiness: model.TrackedRangeStickiness): string;
    removeAllDecorationsWithOwnerId(ownerId: number): void;
    getDecorationOptions(decorationId: string): model.IModelDecorationOptions | null;
    getDecorationRange(decorationId: string): Range | null;
    getLineDecorations(lineNumber: number, ownerId?: number, filterOutValidation?: boolean): model.IModelDecoration[];
    getLinesDecorations(_startLineNumber: number, _endLineNumber: number, ownerId?: number, filterOutValidation?: boolean, onlyMarginDecorations?: boolean): model.IModelDecoration[];
    getDecorationsInRange(range: IRange, ownerId?: number, filterOutValidation?: boolean, onlyMinimapDecorations?: boolean, onlyMarginDecorations?: boolean): model.IModelDecoration[];
    getOverviewRulerDecorations(ownerId?: number, filterOutValidation?: boolean): model.IModelDecoration[];
    getInjectedTextDecorations(ownerId?: number): model.IModelDecoration[];
    private _getInjectedTextInLine;
    getAllDecorations(ownerId?: number, filterOutValidation?: boolean): model.IModelDecoration[];
    getAllMarginDecorations(ownerId?: number): model.IModelDecoration[];
    private _getDecorationsInRange;
    getRangeAt(start: number, end: number): Range;
    private _changeDecorationImpl;
    private _changeDecorationOptionsImpl;
    private _deltaDecorationsImpl;
    getLanguageId(): string;
    setLanguage(languageIdOrSelection: string | ILanguageSelection, source?: string): void;
    private _setLanguage;
    getLanguageIdAtPosition(lineNumber: number, column: number): string;
    getWordAtPosition(position: IPosition): IWordAtPosition | null;
    getWordUntilPosition(position: IPosition): IWordAtPosition;
    normalizePosition(position: Position, affinity: model.PositionAffinity): Position;
    /**
     * Gets the column at which indentation stops at a given line.
     * @internal
    */
    getLineIndentColumn(lineNumber: number): number;
}
export declare function indentOfLine(line: string): number;
export interface IDecorationsTreesHost {
    getVersionId(): number;
    getRangeAt(start: number, end: number): Range;
}
declare class DecorationOptions implements model.IDecorationOptions {
    readonly color: string | ThemeColor;
    readonly darkColor: string | ThemeColor;
    constructor(options: model.IDecorationOptions);
}
export declare class ModelDecorationOverviewRulerOptions extends DecorationOptions {
    readonly position: model.OverviewRulerLane;
    private _resolvedColor;
    constructor(options: model.IModelDecorationOverviewRulerOptions);
    getColor(theme: IColorTheme): string;
    invalidateCachedColor(): void;
    private _resolveColor;
}
export declare class ModelDecorationGlyphMarginOptions {
    readonly position: model.GlyphMarginLane;
    readonly persistLane: boolean | undefined;
    constructor(options: model.IModelDecorationGlyphMarginOptions | null | undefined);
}
export declare class ModelDecorationMinimapOptions extends DecorationOptions {
    readonly position: model.MinimapPosition;
    readonly sectionHeaderStyle: model.MinimapSectionHeaderStyle | null;
    readonly sectionHeaderText: string | null;
    private _resolvedColor;
    constructor(options: model.IModelDecorationMinimapOptions);
    getColor(theme: IColorTheme): Color | undefined;
    invalidateCachedColor(): void;
    private _resolveColor;
}
export declare class ModelDecorationInjectedTextOptions implements model.InjectedTextOptions {
    static from(options: model.InjectedTextOptions): ModelDecorationInjectedTextOptions;
    readonly content: string;
    readonly tokens: TokenArray | null;
    readonly inlineClassName: string | null;
    readonly inlineClassNameAffectsLetterSpacing: boolean;
    readonly attachedData: unknown | null;
    readonly cursorStops: model.InjectedTextCursorStops | null;
    private constructor();
}
export declare class ModelDecorationOptions implements model.IModelDecorationOptions {
    static EMPTY: ModelDecorationOptions;
    static register(options: model.IModelDecorationOptions): ModelDecorationOptions;
    static createDynamic(options: model.IModelDecorationOptions): ModelDecorationOptions;
    readonly description: string;
    readonly blockClassName: string | null;
    readonly blockIsAfterEnd: boolean | null;
    readonly blockDoesNotCollapse?: boolean | null;
    readonly blockPadding: [top: number, right: number, bottom: number, left: number] | null;
    readonly stickiness: model.TrackedRangeStickiness;
    readonly zIndex: number;
    readonly className: string | null;
    readonly shouldFillLineOnLineBreak: boolean | null;
    readonly hoverMessage: IMarkdownString | IMarkdownString[] | null;
    readonly glyphMarginHoverMessage: IMarkdownString | IMarkdownString[] | null;
    readonly isWholeLine: boolean;
    readonly showIfCollapsed: boolean;
    readonly collapseOnReplaceEdit: boolean;
    readonly overviewRuler: ModelDecorationOverviewRulerOptions | null;
    readonly minimap: ModelDecorationMinimapOptions | null;
    readonly glyphMargin?: model.IModelDecorationGlyphMarginOptions | null | undefined;
    readonly glyphMarginClassName: string | null;
    readonly linesDecorationsClassName: string | null;
    readonly lineNumberClassName: string | null;
    readonly lineNumberHoverMessage: IMarkdownString | IMarkdownString[] | null;
    readonly linesDecorationsTooltip: string | null;
    readonly firstLineDecorationClassName: string | null;
    readonly marginClassName: string | null;
    readonly inlineClassName: string | null;
    readonly inlineClassNameAffectsLetterSpacing: boolean;
    readonly beforeContentClassName: string | null;
    readonly afterContentClassName: string | null;
    readonly after: ModelDecorationInjectedTextOptions | null;
    readonly before: ModelDecorationInjectedTextOptions | null;
    readonly hideInCommentTokens: boolean | null;
    readonly hideInStringTokens: boolean | null;
    private constructor();
}
export {};
