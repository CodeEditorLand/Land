import { CharacterClassifier } from './characterClassifier.js';
export declare const enum WordCharacterClass {
    Regular = 0,
    Whitespace = 1,
    WordSeparator = 2
}
export declare class WordCharacterClassifier extends CharacterClassifier<WordCharacterClass> {
    readonly intlSegmenterLocales: Intl.UnicodeBCP47LocaleIdentifier[];
    private readonly _segmenter;
    private _cachedLine;
    private _cachedSegments;
    constructor(wordSeparators: string, intlSegmenterLocales: Intl.UnicodeBCP47LocaleIdentifier[]);
    findPrevIntlWordBeforeOrAtOffset(line: string, offset: number): IntlWordSegmentData | null;
    findNextIntlWordAtOrAfterOffset(lineContent: string, offset: number): IntlWordSegmentData | null;
    private _getIntlSegmenterWordsOnLine;
    private _filterWordSegments;
    private _isWordLike;
}
export interface IntlWordSegmentData extends Intl.SegmentData {
    isWordLike: true;
}
export declare function getMapForWordSeparators(wordSeparators: string, intlSegmenterLocales: Intl.UnicodeBCP47LocaleIdentifier[]): WordCharacterClassifier;
