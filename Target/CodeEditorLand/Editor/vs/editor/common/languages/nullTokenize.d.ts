import { TokenizationResult, EncodedTokenizationResult, IState } from '../languages.js';
import { LanguageId } from '../encodedTokenAttributes.js';
export declare const NullState: IState;
export declare function nullTokenize(languageId: string, state: IState): TokenizationResult;
export declare function nullTokenizeEncoded(languageId: LanguageId, state: IState | null): EncodedTokenizationResult;
