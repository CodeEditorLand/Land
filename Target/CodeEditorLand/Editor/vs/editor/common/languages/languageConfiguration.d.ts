import { StandardTokenType } from '../encodedTokenAttributes.js';
import { ScopedLineTokens } from './supports.js';
export interface CommentRule {
    lineComment?: string | null;
    blockComment?: CharacterPair | null;
}
export interface LanguageConfiguration {
    comments?: CommentRule;
    brackets?: CharacterPair[];
    wordPattern?: RegExp;
    indentationRules?: IndentationRule;
    onEnterRules?: OnEnterRule[];
    autoClosingPairs?: IAutoClosingPairConditional[];
    surroundingPairs?: IAutoClosingPair[];
    colorizedBracketPairs?: CharacterPair[];
    autoCloseBefore?: string;
    folding?: FoldingRules;
    __electricCharacterSupport?: {
        docComment?: IDocComment;
    };
}
type OrUndefined<T> = {
    [P in keyof T]: T[P] | undefined;
};
export type ExplicitLanguageConfiguration = OrUndefined<Required<LanguageConfiguration>>;
export interface IndentationRule {
    decreaseIndentPattern: RegExp;
    increaseIndentPattern: RegExp;
    indentNextLinePattern?: RegExp | null;
    unIndentedLinePattern?: RegExp | null;
}
export interface FoldingMarkers {
    start: RegExp;
    end: RegExp;
}
export interface FoldingRules {
    offSide?: boolean;
    markers?: FoldingMarkers;
}
export interface OnEnterRule {
    beforeText: RegExp;
    afterText?: RegExp;
    previousLineText?: RegExp;
    action: EnterAction;
}
export interface IDocComment {
    open: string;
    close?: string;
}
export type CharacterPair = [string, string];
export interface IAutoClosingPair {
    open: string;
    close: string;
}
export interface IAutoClosingPairConditional extends IAutoClosingPair {
    notIn?: string[];
}
export declare enum IndentAction {
    None = 0,
    Indent = 1,
    IndentOutdent = 2,
    Outdent = 3
}
export interface EnterAction {
    indentAction: IndentAction;
    appendText?: string;
    removeText?: number;
}
export interface CompleteEnterAction {
    indentAction: IndentAction;
    appendText: string;
    removeText: number;
    indentation: string;
}
export declare class StandardAutoClosingPairConditional {
    readonly open: string;
    readonly close: string;
    private readonly _inString;
    private readonly _inComment;
    private readonly _inRegEx;
    private _neutralCharacter;
    private _neutralCharacterSearched;
    constructor(source: IAutoClosingPairConditional);
    isOK(standardToken: StandardTokenType): boolean;
    shouldAutoClose(context: ScopedLineTokens, column: number): boolean;
    private _findNeutralCharacterInRange;
    findNeutralCharacter(): string | null;
}
export declare class AutoClosingPairs {
    readonly autoClosingPairsOpenByStart: Map<string, StandardAutoClosingPairConditional[]>;
    readonly autoClosingPairsOpenByEnd: Map<string, StandardAutoClosingPairConditional[]>;
    readonly autoClosingPairsCloseByStart: Map<string, StandardAutoClosingPairConditional[]>;
    readonly autoClosingPairsCloseByEnd: Map<string, StandardAutoClosingPairConditional[]>;
    readonly autoClosingPairsCloseSingleChar: Map<string, StandardAutoClosingPairConditional[]>;
    constructor(autoClosingPairs: StandardAutoClosingPairConditional[]);
}
export {};
