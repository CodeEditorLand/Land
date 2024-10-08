import { IViewLineTokens, LineTokens } from '../tokens/lineTokens.js';
import { StandardTokenType } from '../encodedTokenAttributes.js';
import { ILanguageIdCodec } from '../languages.js';
export declare function createScopedLineTokens(context: LineTokens, offset: number): ScopedLineTokens;
export declare class ScopedLineTokens {
    _scopedLineTokensBrand: void;
    readonly languageIdCodec: ILanguageIdCodec;
    readonly languageId: string;
    private readonly _actual;
    private readonly _firstTokenIndex;
    private readonly _lastTokenIndex;
    readonly firstCharOffset: number;
    private readonly _lastCharOffset;
    constructor(actual: LineTokens, languageId: string, firstTokenIndex: number, lastTokenIndex: number, firstCharOffset: number, lastCharOffset: number);
    getLineContent(): string;
    getLineLength(): number;
    getActualLineContentBefore(offset: number): string;
    getTokenCount(): number;
    findTokenIndexAtOffset(offset: number): number;
    getStandardTokenType(tokenIndex: number): StandardTokenType;
    toIViewLineTokens(): IViewLineTokens;
}
export declare function ignoreBracketsInToken(standardTokenType: StandardTokenType): boolean;
