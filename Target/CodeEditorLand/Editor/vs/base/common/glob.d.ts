export interface IRelativePattern {
    readonly base: string;
    readonly pattern: string;
}
export interface IExpression {
    [pattern: string]: boolean | SiblingClause;
}
export declare function getEmptyExpression(): IExpression;
interface SiblingClause {
    when: string;
}
export declare const GLOBSTAR = "**";
export declare const GLOB_SPLIT = "/";
export declare function splitGlobAware(pattern: string, splitChar: string): string[];
export type ParsedPattern = (path: string, basename?: string) => boolean;
export type ParsedExpression = (path: string, basename?: string, hasSibling?: (name: string) => boolean | Promise<boolean>) => string | null | Promise<string | null>;
interface IGlobOptions {
    trimForExclusions?: boolean;
}
export declare function match(pattern: string | IRelativePattern, path: string): boolean;
export declare function match(expression: IExpression, path: string, hasSibling?: (name: string) => boolean): string;
export declare function parse(pattern: string | IRelativePattern, options?: IGlobOptions): ParsedPattern;
export declare function parse(expression: IExpression, options?: IGlobOptions): ParsedExpression;
export declare function parse(arg1: string | IExpression | IRelativePattern, options?: IGlobOptions): ParsedPattern | ParsedExpression;
export declare function isRelativePattern(obj: unknown): obj is IRelativePattern;
export declare function getBasenameTerms(patternOrExpression: ParsedPattern | ParsedExpression): string[];
export declare function getPathTerms(patternOrExpression: ParsedPattern | ParsedExpression): string[];
export declare function patternsEquals(patternsA: Array<string | IRelativePattern> | undefined, patternsB: Array<string | IRelativePattern> | undefined): boolean;
export {};
