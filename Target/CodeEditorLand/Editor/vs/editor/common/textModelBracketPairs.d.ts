import { CallbackIterable } from '../../base/common/arrays.js';
import { Event } from '../../base/common/event.js';
import { IPosition } from './core/position.js';
import { IRange, Range } from './core/range.js';
import { ClosingBracketKind, OpeningBracketKind } from './languages/supports/languageBracketsConfiguration.js';
import { PairAstNode } from './model/bracketPairsTextModelPart/bracketPairsTree/ast.js';
export interface IBracketPairsTextModelPart {
    onDidChange: Event<void>;
    getBracketPairsInRange(range: IRange): CallbackIterable<BracketPairInfo>;
    getBracketPairsInRangeWithMinIndentation(range: IRange): CallbackIterable<BracketPairWithMinIndentationInfo>;
    getBracketsInRange(range: IRange, onlyColorizedBrackets?: boolean): CallbackIterable<BracketInfo>;
    findMatchingBracketUp(bracket: string, position: IPosition, maxDuration?: number): Range | null;
    findPrevBracket(position: IPosition): IFoundBracket | null;
    findNextBracket(position: IPosition): IFoundBracket | null;
    findEnclosingBrackets(position: IPosition, maxDuration?: number): [Range, Range] | null;
    matchBracket(position: IPosition, maxDuration?: number): [Range, Range] | null;
}
export interface IFoundBracket {
    range: Range;
    bracketInfo: OpeningBracketKind | ClosingBracketKind;
}
export declare class BracketInfo {
    readonly range: Range;
    readonly nestingLevel: number;
    readonly nestingLevelOfEqualBracketType: number;
    readonly isInvalid: boolean;
    constructor(range: Range, nestingLevel: number, nestingLevelOfEqualBracketType: number, isInvalid: boolean);
}
export declare class BracketPairInfo {
    readonly range: Range;
    readonly openingBracketRange: Range;
    readonly closingBracketRange: Range | undefined;
    readonly nestingLevel: number;
    readonly nestingLevelOfEqualBracketType: number;
    private readonly bracketPairNode;
    constructor(range: Range, openingBracketRange: Range, closingBracketRange: Range | undefined, nestingLevel: number, nestingLevelOfEqualBracketType: number, bracketPairNode: PairAstNode);
    get openingBracketInfo(): OpeningBracketKind;
    get closingBracketInfo(): ClosingBracketKind | undefined;
}
export declare class BracketPairWithMinIndentationInfo extends BracketPairInfo {
    readonly minVisibleColumnIndentation: number;
    constructor(range: Range, openingBracketRange: Range, closingBracketRange: Range | undefined, nestingLevel: number, nestingLevelOfEqualBracketType: number, bracketPairNode: PairAstNode, minVisibleColumnIndentation: number);
}
