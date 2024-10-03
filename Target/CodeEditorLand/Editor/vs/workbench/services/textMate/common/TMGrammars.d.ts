import { IExtensionPoint } from '../../extensions/common/extensionsRegistry.js';
export interface IEmbeddedLanguagesMap {
    [scopeName: string]: string;
}
export interface TokenTypesContribution {
    [scopeName: string]: string;
}
export interface ITMSyntaxExtensionPoint {
    language?: string;
    scopeName: string;
    path: string;
    embeddedLanguages: IEmbeddedLanguagesMap;
    tokenTypes: TokenTypesContribution;
    injectTo: string[];
    balancedBracketScopes: string[];
    unbalancedBracketScopes: string[];
}
export declare const grammarsExtPoint: IExtensionPoint<ITMSyntaxExtensionPoint[]>;
