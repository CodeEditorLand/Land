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
/**
 * Example:
 * `foo == bar'` - note how single quote doesn't have a corresponding closing quote,
 * so it's reported as unexpected
 */
export type LexingError = {
    offset: number; /** note that this doesn't take into account escape characters from the original encoding of the string, e.g., within an extension manifest file's JSON encoding  */
    lexeme: string;
    additionalInfo?: string;
};
/**
 * A simple scanner for context keys.
 *
 * Example:
 *
 * ```ts
 * const scanner = new Scanner().reset('resourceFileName =~ /docker/ && !config.docker.enabled');
 * const tokens = [...scanner];
 * if (scanner.errorTokens.length > 0) {
 *     scanner.errorTokens.forEach(err => console.error(`Unexpected token at ${err.offset}: ${err.lexeme}\nHint: ${err.additional}`));
 * } else {
 *     // process tokens
 * }
 * ```
 */
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
