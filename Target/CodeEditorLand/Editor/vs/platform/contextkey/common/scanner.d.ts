export declare const enum TokenType {
    LParen = 0,
    RParen = 1,
    Neg = 2,
    Eq = 3,
    NotEq = 4,
    Lt = 5,
    LtEq = 6,
    Gt = 7,
    GtEq = 8,
    RegexOp = 9,
    RegexStr = 10,
    True = 11,
    False = 12,
    In = 13,
    Not = 14,
    And = 15,
    Or = 16,
    Str = 17,
    QuotedStr = 18,
    Error = 19,
    EOF = 20
}
export type Token = {
    type: TokenType.LParen;
    offset: number;
} | {
    type: TokenType.RParen;
    offset: number;
} | {
    type: TokenType.Neg;
    offset: number;
} | {
    type: TokenType.Eq;
    offset: number;
    isTripleEq: boolean;
} | {
    type: TokenType.NotEq;
    offset: number;
    isTripleEq: boolean;
} | {
    type: TokenType.Lt;
    offset: number;
} | {
    type: TokenType.LtEq;
    offset: number;
} | {
    type: TokenType.Gt;
    offset: number;
} | {
    type: TokenType.GtEq;
    offset: number;
} | {
    type: TokenType.RegexOp;
    offset: number;
} | {
    type: TokenType.RegexStr;
    offset: number;
    lexeme: string;
} | {
    type: TokenType.True;
    offset: number;
} | {
    type: TokenType.False;
    offset: number;
} | {
    type: TokenType.In;
    offset: number;
} | {
    type: TokenType.Not;
    offset: number;
} | {
    type: TokenType.And;
    offset: number;
} | {
    type: TokenType.Or;
    offset: number;
} | {
    type: TokenType.Str;
    offset: number;
    lexeme: string;
} | {
    type: TokenType.QuotedStr;
    offset: number;
    lexeme: string;
} | {
    type: TokenType.Error;
    offset: number;
    lexeme: string;
} | {
    type: TokenType.EOF;
    offset: number;
};
export type LexingError = {
    offset: number;
    lexeme: string;
    additionalInfo?: string;
};
export declare class Scanner {
    static getLexeme(token: Token): string;
    private static _regexFlags;
    private static _keywords;
    private _input;
    private _start;
    private _current;
    private _tokens;
    private _errors;
    get errors(): Readonly<LexingError[]>;
    reset(value: string): this;
    scan(): Token[];
    private _match;
    private _advance;
    private _peek;
    private _addToken;
    private _error;
    private stringRe;
    private _string;
    private _quotedString;
    private _regex;
    private _isAtEnd;
}
