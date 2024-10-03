import { ContiguousMultilineTokens } from './contiguousMultilineTokens.js';
export declare class ContiguousMultilineTokensBuilder {
    static deserialize(buff: Uint8Array): ContiguousMultilineTokens[];
    private readonly _tokens;
    constructor();
    add(lineNumber: number, lineTokens: Uint32Array): void;
    finalize(): ContiguousMultilineTokens[];
    serialize(): Uint8Array;
    private _serializeSize;
    private _serialize;
}
