import * as strings from '../../../../base/common/strings.js';
import { Range } from '../../core/range.js';
import { CharacterPair } from '../languageConfiguration.js';
export declare class RichEditBracket {
    _richEditBracketBrand: void;
    readonly languageId: string;
    readonly index: number;
    readonly open: string[];
    readonly close: string[];
    readonly forwardRegex: RegExp;
    readonly reversedRegex: RegExp;
    private readonly _openSet;
    private readonly _closeSet;
    constructor(languageId: string, index: number, open: string[], close: string[], forwardRegex: RegExp, reversedRegex: RegExp);
    isOpen(text: string): boolean;
    isClose(text: string): boolean;
    private static _toSet;
}
export declare class RichEditBrackets {
    _richEditBracketsBrand: void;
    readonly brackets: RichEditBracket[];
    readonly forwardRegex: RegExp;
    readonly reversedRegex: RegExp;
    readonly maxBracketLength: number;
    readonly textIsBracket: {
        [text: string]: RichEditBracket;
    };
    readonly textIsOpenBracket: {
        [text: string]: boolean;
    };
    constructor(languageId: string, _brackets: readonly CharacterPair[]);
}
export declare function createBracketOrRegExp(pieces: string[], options?: strings.RegExpOptions): RegExp;
export declare class BracketsUtils {
    private static _findPrevBracketInText;
    static findPrevBracketInRange(reversedBracketRegex: RegExp, lineNumber: number, lineText: string, startOffset: number, endOffset: number): Range | null;
    static findNextBracketInText(bracketRegex: RegExp, lineNumber: number, text: string, offset: number): Range | null;
    static findNextBracketInRange(bracketRegex: RegExp, lineNumber: number, lineText: string, startOffset: number, endOffset: number): Range | null;
}
