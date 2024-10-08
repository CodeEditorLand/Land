import { LineRange } from '../core/lineRange.js';
import { OffsetRange } from '../core/offsetRange.js';
import { Position } from '../core/position.js';
import { StandardTokenType } from '../encodedTokenAttributes.js';
import { IBackgroundTokenizationStore, IBackgroundTokenizer, ILanguageIdCodec, IState, ITokenizationSupport } from '../languages.js';
import { ITextModel } from '../model.js';
import { IModelContentChange } from '../textModelEvents.js';
import { ITokenizeLineWithEditResult, LineEditWithAdditionalLines } from '../tokenizationTextModelPart.js';
import { ContiguousMultilineTokensBuilder } from '../tokens/contiguousMultilineTokensBuilder.js';
export declare class TokenizerWithStateStore<TState extends IState = IState> {
    readonly tokenizationSupport: ITokenizationSupport;
    private readonly initialState;
    readonly store: TrackingTokenizationStateStore<TState>;
    constructor(lineCount: number, tokenizationSupport: ITokenizationSupport);
    getStartState(lineNumber: number): TState | null;
    getFirstInvalidLine(): {
        lineNumber: number;
        startState: TState;
    } | null;
}
export declare class TokenizerWithStateStoreAndTextModel<TState extends IState = IState> extends TokenizerWithStateStore<TState> {
    readonly _textModel: ITextModel;
    readonly _languageIdCodec: ILanguageIdCodec;
    constructor(lineCount: number, tokenizationSupport: ITokenizationSupport, _textModel: ITextModel, _languageIdCodec: ILanguageIdCodec);
    updateTokensUntilLine(builder: ContiguousMultilineTokensBuilder, lineNumber: number): void;
    /** assumes state is up to date */
    getTokenTypeIfInsertingCharacter(position: Position, character: string): StandardTokenType;
    /** assumes state is up to date */
    tokenizeLineWithEdit(lineNumber: number, edit: LineEditWithAdditionalLines): ITokenizeLineWithEditResult;
    hasAccurateTokensForLine(lineNumber: number): boolean;
    isCheapToTokenize(lineNumber: number): boolean;
    /**
     * The result is not cached.
     */
    tokenizeHeuristically(builder: ContiguousMultilineTokensBuilder, startLineNumber: number, endLineNumber: number): {
        heuristicTokens: boolean;
    };
    private guessStartState;
}
/**
 * **Invariant:**
 * If the text model is retokenized from line 1 to {@link getFirstInvalidEndStateLineNumber}() - 1,
 * then the recomputed end state for line l will be equal to {@link getEndState}(l).
 */
export declare class TrackingTokenizationStateStore<TState extends IState> {
    private lineCount;
    private readonly _tokenizationStateStore;
    private readonly _invalidEndStatesLineNumbers;
    constructor(lineCount: number);
    getEndState(lineNumber: number): TState | null;
    /**
     * @returns if the end state has changed.
     */
    setEndState(lineNumber: number, state: TState): boolean;
    acceptChange(range: LineRange, newLineCount: number): void;
    acceptChanges(changes: IModelContentChange[]): void;
    invalidateEndStateRange(range: LineRange): void;
    getFirstInvalidEndStateLineNumber(): number | null;
    getFirstInvalidEndStateLineNumberOrMax(): number;
    allStatesValid(): boolean;
    getStartState(lineNumber: number, initialState: TState): TState | null;
    getFirstInvalidLine(initialState: TState): {
        lineNumber: number;
        startState: TState;
    } | null;
}
export declare class TokenizationStateStore<TState extends IState> {
    private readonly _lineEndStates;
    getEndState(lineNumber: number): TState | null;
    setEndState(lineNumber: number, state: TState): boolean;
    acceptChange(range: LineRange, newLineCount: number): void;
    acceptChanges(changes: IModelContentChange[]): void;
}
interface RangePriorityQueue {
    get min(): number | null;
    removeMin(): number | null;
    addRange(range: OffsetRange): void;
    addRangeAndResize(range: OffsetRange, newLength: number): void;
}
export declare class RangePriorityQueueImpl implements RangePriorityQueue {
    private readonly _ranges;
    getRanges(): OffsetRange[];
    get min(): number | null;
    removeMin(): number | null;
    delete(value: number): void;
    addRange(range: OffsetRange): void;
    addRangeAndResize(range: OffsetRange, newLength: number): void;
    toString(): string;
}
export declare class DefaultBackgroundTokenizer implements IBackgroundTokenizer {
    private readonly _tokenizerWithStateStore;
    private readonly _backgroundTokenStore;
    private _isDisposed;
    constructor(_tokenizerWithStateStore: TokenizerWithStateStoreAndTextModel, _backgroundTokenStore: IBackgroundTokenizationStore);
    dispose(): void;
    handleChanges(): void;
    private _isScheduled;
    private _beginBackgroundTokenization;
    /**
     * Tokenize until the deadline occurs, but try to yield every 1-2ms.
     */
    private _backgroundTokenizeWithDeadline;
    /**
     * Tokenize for at least 1ms.
     */
    private _backgroundTokenizeForAtLeast1ms;
    private _hasLinesToTokenize;
    private _tokenizeOneInvalidLine;
    checkFinished(): void;
    requestTokens(startLineNumber: number, endLineNumberExclusive: number): void;
}
export {};
