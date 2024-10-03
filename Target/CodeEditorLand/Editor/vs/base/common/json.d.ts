export declare const enum ScanError {
    None = 0,
    UnexpectedEndOfComment = 1,
    UnexpectedEndOfString = 2,
    UnexpectedEndOfNumber = 3,
    InvalidUnicode = 4,
    InvalidEscapeCharacter = 5,
    InvalidCharacter = 6
}
export declare const enum SyntaxKind {
    OpenBraceToken = 1,
    CloseBraceToken = 2,
    OpenBracketToken = 3,
    CloseBracketToken = 4,
    CommaToken = 5,
    ColonToken = 6,
    NullKeyword = 7,
    TrueKeyword = 8,
    FalseKeyword = 9,
    StringLiteral = 10,
    NumericLiteral = 11,
    LineCommentTrivia = 12,
    BlockCommentTrivia = 13,
    LineBreakTrivia = 14,
    Trivia = 15,
    Unknown = 16,
    EOF = 17
}
export interface JSONScanner {
    setPosition(pos: number): void;
    scan(): SyntaxKind;
    getPosition(): number;
    getToken(): SyntaxKind;
    getTokenValue(): string;
    getTokenOffset(): number;
    getTokenLength(): number;
    getTokenError(): ScanError;
}
export interface ParseError {
    error: ParseErrorCode;
    offset: number;
    length: number;
}
export declare const enum ParseErrorCode {
    InvalidSymbol = 1,
    InvalidNumberFormat = 2,
    PropertyNameExpected = 3,
    ValueExpected = 4,
    ColonExpected = 5,
    CommaExpected = 6,
    CloseBraceExpected = 7,
    CloseBracketExpected = 8,
    EndOfFileExpected = 9,
    InvalidCommentToken = 10,
    UnexpectedEndOfComment = 11,
    UnexpectedEndOfString = 12,
    UnexpectedEndOfNumber = 13,
    InvalidUnicode = 14,
    InvalidEscapeCharacter = 15,
    InvalidCharacter = 16
}
export type NodeType = 'object' | 'array' | 'property' | 'string' | 'number' | 'boolean' | 'null';
export interface Node {
    readonly type: NodeType;
    readonly value?: any;
    readonly offset: number;
    readonly length: number;
    readonly colonOffset?: number;
    readonly parent?: Node;
    readonly children?: Node[];
}
export type Segment = string | number;
export type JSONPath = Segment[];
export interface Location {
    previousNode?: Node;
    path: JSONPath;
    matches: (patterns: JSONPath) => boolean;
    isAtPropertyKey: boolean;
}
export interface ParseOptions {
    disallowComments?: boolean;
    allowTrailingComma?: boolean;
    allowEmptyContent?: boolean;
}
export declare namespace ParseOptions {
    const DEFAULT: {
        allowTrailingComma: boolean;
    };
}
export interface JSONVisitor {
    onObjectBegin?: (offset: number, length: number) => void;
    onObjectProperty?: (property: string, offset: number, length: number) => void;
    onObjectEnd?: (offset: number, length: number) => void;
    onArrayBegin?: (offset: number, length: number) => void;
    onArrayEnd?: (offset: number, length: number) => void;
    onLiteralValue?: (value: any, offset: number, length: number) => void;
    onSeparator?: (character: string, offset: number, length: number) => void;
    onComment?: (offset: number, length: number) => void;
    onError?: (error: ParseErrorCode, offset: number, length: number) => void;
}
export declare function createScanner(text: string, ignoreTrivia?: boolean): JSONScanner;
export declare function getLocation(text: string, position: number): Location;
export declare function parse(text: string, errors?: ParseError[], options?: ParseOptions): any;
export declare function parseTree(text: string, errors?: ParseError[], options?: ParseOptions): Node;
export declare function findNodeAtLocation(root: Node, path: JSONPath): Node | undefined;
export declare function getNodePath(node: Node): JSONPath;
export declare function getNodeValue(node: Node): any;
export declare function contains(node: Node, offset: number, includeRightBound?: boolean): boolean;
export declare function findNodeAtOffset(node: Node, offset: number, includeRightBound?: boolean): Node | undefined;
export declare function visit(text: string, visitor: JSONVisitor, options?: ParseOptions): any;
export declare function getNodeType(value: any): NodeType;
