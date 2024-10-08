import { IAutoClosingPair, StandardAutoClosingPairConditional, LanguageConfiguration } from '../languageConfiguration.js';
export declare class CharacterPairSupport {
    static readonly DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED_QUOTES = ";:.,=}])> \n\t";
    static readonly DEFAULT_AUTOCLOSE_BEFORE_LANGUAGE_DEFINED_BRACKETS = "'\"`;:.,=}])> \n\t";
    static readonly DEFAULT_AUTOCLOSE_BEFORE_WHITESPACE = " \n\t";
    private readonly _autoClosingPairs;
    private readonly _surroundingPairs;
    private readonly _autoCloseBeforeForQuotes;
    private readonly _autoCloseBeforeForBrackets;
    constructor(config: LanguageConfiguration);
    getAutoClosingPairs(): StandardAutoClosingPairConditional[];
    getAutoCloseBeforeSet(forQuotes: boolean): string;
    getSurroundingPairs(): IAutoClosingPair[];
}
