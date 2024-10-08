import { URI } from '../../../../base/common/uri.js';
import { LanguageId, StandardTokenType } from '../../../../editor/common/encodedTokenAttributes.js';
export interface IValidGrammarDefinition {
    location: URI;
    language?: string;
    scopeName: string;
    embeddedLanguages: IValidEmbeddedLanguagesMap;
    tokenTypes: IValidTokenTypeMap;
    injectTo?: string[];
    balancedBracketSelectors: string[];
    unbalancedBracketSelectors: string[];
    sourceExtensionId?: string;
}
export interface IValidTokenTypeMap {
    [selector: string]: StandardTokenType;
}
export interface IValidEmbeddedLanguagesMap {
    [scopeName: string]: LanguageId;
}
export declare class TMScopeRegistry {
    private _scopeNameToLanguageRegistration;
    constructor();
    reset(): void;
    register(def: IValidGrammarDefinition): void;
    getGrammarDefinition(scopeName: string): IValidGrammarDefinition | null;
}
