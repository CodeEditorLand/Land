export declare function isFalsyOrWhitespace(str: string | undefined): boolean;
export declare function format(value: string, ...args: any[]): string;
export declare function format2(template: string, values: Record<string, unknown>): string;
export declare function htmlAttributeEncodeValue(value: string): string;
export declare function escape(html: string): string;
export declare function escapeRegExpCharacters(value: string): string;
export declare function count(value: string, substr: string): number;
export declare function truncate(value: string, maxLength: number, suffix?: string): string;
export declare function truncateMiddle(value: string, maxLength: number, suffix?: string): string;
export declare function trim(haystack: string, needle?: string): string;
export declare function ltrim(haystack: string, needle: string): string;
export declare function rtrim(haystack: string, needle: string): string;
export declare function convertSimple2RegExpPattern(pattern: string): string;
export declare function stripWildcards(pattern: string): string;
export interface RegExpOptions {
    matchCase?: boolean;
    wholeWord?: boolean;
    multiline?: boolean;
    global?: boolean;
    unicode?: boolean;
}
export declare function createRegExp(searchString: string, isRegex: boolean, options?: RegExpOptions): RegExp;
export declare function regExpLeadsToEndlessLoop(regexp: RegExp): boolean;
export declare function splitLines(str: string): string[];
export declare function splitLinesIncludeSeparators(str: string): string[];
export declare function firstNonWhitespaceIndex(str: string): number;
export declare function getLeadingWhitespace(str: string, start?: number, end?: number): string;
export declare function lastNonWhitespaceIndex(str: string, startIndex?: number): number;
export declare function getIndentationLength(str: string): number;
export declare function replaceAsync(str: string, search: RegExp, replacer: (match: string, ...args: any[]) => Promise<string>): Promise<string>;
export declare function compare(a: string, b: string): number;
export declare function compareSubstring(a: string, b: string, aStart?: number, aEnd?: number, bStart?: number, bEnd?: number): number;
export declare function compareIgnoreCase(a: string, b: string): number;
export declare function compareSubstringIgnoreCase(a: string, b: string, aStart?: number, aEnd?: number, bStart?: number, bEnd?: number): number;
export declare function isAsciiDigit(code: number): boolean;
export declare function isLowerAsciiLetter(code: number): boolean;
export declare function isUpperAsciiLetter(code: number): boolean;
export declare function equalsIgnoreCase(a: string, b: string): boolean;
export declare function startsWithIgnoreCase(str: string, candidate: string): boolean;
export declare function commonPrefixLength(a: string, b: string): number;
export declare function commonSuffixLength(a: string, b: string): number;
export declare function isHighSurrogate(charCode: number): boolean;
export declare function isLowSurrogate(charCode: number): boolean;
export declare function computeCodePoint(highSurrogate: number, lowSurrogate: number): number;
export declare function getNextCodePoint(str: string, len: number, offset: number): number;
export declare class CodePointIterator {
    private readonly _str;
    private readonly _len;
    private _offset;
    get offset(): number;
    constructor(str: string, offset?: number);
    setOffset(offset: number): void;
    prevCodePoint(): number;
    nextCodePoint(): number;
    eol(): boolean;
}
export declare class GraphemeIterator {
    private readonly _iterator;
    get offset(): number;
    constructor(str: string, offset?: number);
    nextGraphemeLength(): number;
    prevGraphemeLength(): number;
    eol(): boolean;
}
export declare function nextCharLength(str: string, initialOffset: number): number;
export declare function prevCharLength(str: string, initialOffset: number): number;
export declare function getCharContainingOffset(str: string, offset: number): [number, number];
export declare function charCount(str: string): number;
export declare function containsRTL(str: string): boolean;
export declare function isBasicASCII(str: string): boolean;
export declare const UNUSUAL_LINE_TERMINATORS: RegExp;
export declare function containsUnusualLineTerminators(str: string): boolean;
export declare function isFullWidthCharacter(charCode: number): boolean;
export declare function isEmojiImprecise(x: number): boolean;
export declare function lcut(text: string, n: number, prefix?: string): string;
export declare function forAnsiStringParts(str: string): Generator<{
    isCode: boolean;
    str: string;
}, void, unknown>;
export declare function removeAnsiEscapeCodes(str: string): string;
export declare function removeAnsiEscapeCodesFromPrompt(str: string): string;
export declare const UTF8_BOM_CHARACTER: string;
export declare function startsWithUTF8BOM(str: string): boolean;
export declare function stripUTF8BOM(str: string): string;
export declare function fuzzyContains(target: string, query: string): boolean;
export declare function containsUppercaseCharacter(target: string, ignoreEscapedChars?: boolean): boolean;
export declare function uppercaseFirstLetter(str: string): string;
export declare function getNLines(str: string, n?: number): string;
export declare function singleLetterHash(n: number): string;
export declare function getGraphemeBreakType(codePoint: number): GraphemeBreakType;
export declare const enum GraphemeBreakType {
    Other = 0,
    Prepend = 1,
    CR = 2,
    LF = 3,
    Control = 4,
    Extend = 5,
    Regional_Indicator = 6,
    SpacingMark = 7,
    L = 8,
    V = 9,
    T = 10,
    LV = 11,
    LVT = 12,
    ZWJ = 13,
    Extended_Pictographic = 14
}
export declare function getLeftDeleteOffset(offset: number, str: string): number;
export declare const noBreakWhitespace = "\u00A0";
export declare class AmbiguousCharacters {
    private readonly confusableDictionary;
    private static readonly ambiguousCharacterData;
    private static readonly cache;
    static getInstance(locales: Set<string>): AmbiguousCharacters;
    private static _locales;
    static getLocales(): string[];
    private constructor();
    isAmbiguous(codePoint: number): boolean;
    containsAmbiguousCharacter(str: string): boolean;
    getPrimaryConfusable(codePoint: number): number | undefined;
    getConfusableCodePoints(): ReadonlySet<number>;
}
export declare class InvisibleCharacters {
    private static getRawData;
    private static _data;
    private static getData;
    static isInvisibleCharacter(codePoint: number): boolean;
    static containsInvisibleCharacter(str: string): boolean;
    static get codePoints(): ReadonlySet<number>;
}
