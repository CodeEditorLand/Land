import { OffsetEdit } from './core/offsetEdit.js';
import { OffsetRange } from './core/offsetRange.js';
import { Range } from './core/range.js';
import { StandardTokenType } from './encodedTokenAttributes.js';
import { LineTokens } from './tokens/lineTokens.js';
import { SparseMultilineTokens } from './tokens/sparseMultilineTokens.js';
export interface ITokenizationTextModelPart {
    readonly hasTokens: boolean;
    setSemanticTokens(tokens: SparseMultilineTokens[] | null, isComplete: boolean): void;
    setPartialSemanticTokens(range: Range, tokens: SparseMultilineTokens[] | null): void;
    hasCompleteSemanticTokens(): boolean;
    hasSomeSemanticTokens(): boolean;
    resetTokenization(): void;
    forceTokenization(lineNumber: number): void;
    tokenizeIfCheap(lineNumber: number): void;
    hasAccurateTokensForLine(lineNumber: number): boolean;
    isCheapToTokenize(lineNumber: number): boolean;
    getLineTokens(lineNumber: number): LineTokens;
    getTokenTypeIfInsertingCharacter(lineNumber: number, column: number, character: string): StandardTokenType;
    tokenizeLineWithEdit(lineNumber: number, edit: LineEditWithAdditionalLines): ITokenizeLineWithEditResult;
    getLanguageId(): string;
    getLanguageIdAtPosition(lineNumber: number, column: number): string;
    setLanguageId(languageId: string, source?: string): void;
    readonly backgroundTokenizationState: BackgroundTokenizationState;
}
export declare class LineEditWithAdditionalLines {
    readonly lineEdit: OffsetEdit;
    readonly additionalLines: string[] | null;
    static replace(range: OffsetRange, text: string): LineEditWithAdditionalLines;
    constructor(lineEdit: OffsetEdit, additionalLines: string[] | null);
}
export interface ITokenizeLineWithEditResult {
    readonly mainLineTokens: LineTokens | null;
    readonly additionalLines: LineTokens[] | null;
}
export declare const enum BackgroundTokenizationState {
    InProgress = 1,
    Completed = 2
}
