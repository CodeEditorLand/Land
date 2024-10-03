import { RegExpOptions } from '../../../../base/common/strings.js';
import { LanguageConfiguration } from '../languageConfiguration.js';
export declare class LanguageBracketsConfiguration {
    readonly languageId: string;
    private readonly _openingBrackets;
    private readonly _closingBrackets;
    constructor(languageId: string, config: LanguageConfiguration);
    get openingBrackets(): readonly OpeningBracketKind[];
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
    readonly openingBrackets: ReadonlySet<OpeningBracketKind>;
    private readonly openingColorizedBrackets;
    readonly isOpeningBracket = false;
    constructor(config: LanguageBracketsConfiguration, bracketText: string, openingBrackets: ReadonlySet<OpeningBracketKind>, openingColorizedBrackets: ReadonlySet<OpeningBracketKind>);
    closes(other: OpeningBracketKind): boolean;
    closesColorized(other: OpeningBracketKind): boolean;
    getOpeningBrackets(): readonly OpeningBracketKind[];
}
