export declare const enum MonarchBracket {
    None = 0,
    Open = 1,
    Close = -1
}
export interface ILexerMin {
    languageId: string;
    includeLF: boolean;
    noThrow: boolean;
    ignoreCase: boolean;
    unicode: boolean;
    usesEmbedded: boolean;
    defaultToken: string;
    stateNames: {
        [stateName: string]: any;
    };
    [attr: string]: any;
}
export interface ILexer extends ILexerMin {
    maxStack: number;
    start: string | null;
    ignoreCase: boolean;
    unicode: boolean;
    tokenPostfix: string;
    tokenizer: {
        [stateName: string]: IRule[];
    };
    brackets: IBracket[];
}
export interface IBracket {
    token: string;
    open: string;
    close: string;
}
export type FuzzyAction = IAction | string;
export declare function isFuzzyActionArr(what: FuzzyAction | FuzzyAction[]): what is FuzzyAction[];
export declare function isFuzzyAction(what: FuzzyAction | FuzzyAction[]): what is FuzzyAction;
export declare function isString(what: FuzzyAction): what is string;
export declare function isIAction(what: FuzzyAction): what is IAction;
export interface IRule {
    action: FuzzyAction;
    matchOnlyAtLineStart: boolean;
    name: string;
    resolveRegex(state: string): RegExp;
}
export interface IAction {
    group?: FuzzyAction[];
    test?: (id: string, matches: string[], state: string, eos: boolean) => FuzzyAction;
    token?: string;
    tokenSubst?: boolean;
    next?: string;
    nextEmbedded?: string;
    bracket?: MonarchBracket;
    log?: string;
    switchTo?: string;
    goBack?: number;
    transform?: (states: string[]) => string[];
}
export interface IBranch {
    name: string;
    value: FuzzyAction;
    test?: (id: string, matches: string[], state: string, eos: boolean) => boolean;
}
export declare function empty(s: string): boolean;
export declare function fixCase(lexer: ILexerMin, str: string): string;
export declare function sanitize(s: string): string;
export declare function log(lexer: ILexerMin, msg: string): void;
export declare function createError(lexer: ILexerMin, msg: string): Error;
export declare function substituteMatches(lexer: ILexerMin, str: string, id: string, matches: string[], state: string): string;
export declare function substituteMatchesRe(lexer: ILexerMin, str: string, state: string): string;
export declare function findRules(lexer: ILexer, inState: string): IRule[] | null;
export declare function stateExists(lexer: ILexerMin, inState: string): boolean;
