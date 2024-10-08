import { RegExpOptions } from '../../../../base/common/strings.js';
import { LanguageConfiguration } from '../languageConfiguration.js';
/**
 * Captures all bracket related configurations for a single language.
 * Immutable.
*/
export declare class LanguageBracketsConfiguration {
    readonly languageId: string;
    private readonly _openingBrackets;
    private readonly _closingBrackets;
    constructor(languageId: string, config: LanguageConfiguration);
    /**
     * No two brackets have the same bracket text.
    */
    get openingBrackets(): readonly OpeningBracketKind[];
    /**
     * No two brackets have the same bracket text.
    */
    get closingBrackets(): readonly ClosingBracketKind[];
    getOpeningBracketInfo(bracketText: string): OpeningBracketKind | undefined;
    getClosingBracketInfo(bracketText: string): ClosingBracketKind | undefined;
    getBracketInfo(bracketText: string): BracketKind | undefined;
    getBracketRegExp(options?: RegExpOptions): RegExp;
}
export type BracketKind = OpeningBracketKind | ClosingBracketKind;
export declare class BracketKindBase {
    protected readonly config: LanguageBracketsConfiguration;
    readonly bracketText: string;
    constructor(config: LanguageBracketsConfiguration, bracketText: string);
    get languageId(): string;
}
export declare class OpeningBracketKind extends BracketKindBase {
    readonly openedBrackets: ReadonlySet<ClosingBracketKind>;
    readonly isOpeningBracket = true;
    constructor(config: LanguageBracketsConfiguration, bracketText: string, openedBrackets: ReadonlySet<ClosingBracketKind>);
}
export declare class ClosingBracketKind extends BracketKindBase {
    /**
     * Non empty array of all opening brackets this bracket closes.
    */
    readonly openingBrackets: ReadonlySet<OpeningBracketKind>;
    private readonly openingColorizedBrackets;
    readonly isOpeningBracket = false;
    constructor(config: LanguageBracketsConfiguration, bracketText: string, 
    /**
     * Non empty array of all opening brackets this bracket closes.
    */
    openingBrackets: ReadonlySet<OpeningBracketKind>, openingColorizedBrackets: ReadonlySet<OpeningBracketKind>);
    /**
     * Checks if this bracket closes the given other bracket.
     * If the bracket infos come from different configurations, this method will return false.
    */
    closes(other: OpeningBracketKind): boolean;
    closesColorized(other: OpeningBracketKind): boolean;
    getOpeningBrackets(): readonly OpeningBracketKind[];
}
