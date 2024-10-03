import { OffsetRange } from '../core/offsetRange.js';
export declare class TokenArray {
    private readonly _tokenInfo;
    static create(tokenInfo: TokenInfo[]): TokenArray;
    private constructor();
    forEach(cb: (range: OffsetRange, tokenInfo: TokenInfo) => void): void;
    slice(range: OffsetRange): TokenArray;
}
export type TokenMetadata = number;
export declare class TokenInfo {
    readonly length: number;
    readonly metadata: TokenMetadata;
    constructor(length: number, metadata: TokenMetadata);
}
export declare class TokenArrayBuilder {
    private readonly _tokens;
    add(length: number, metadata: TokenMetadata): void;
    build(): TokenArray;
}
