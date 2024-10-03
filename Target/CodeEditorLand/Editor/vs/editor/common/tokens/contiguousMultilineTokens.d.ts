import { IRange } from '../core/range.js';
import { LineRange } from '../core/lineRange.js';
export declare class ContiguousMultilineTokens {
    static deserialize(buff: Uint8Array, offset: number, result: ContiguousMultilineTokens[]): number;
    private _startLineNumber;
    private _tokens;
    get startLineNumber(): number;
    get endLineNumber(): number;
    constructor(startLineNumber: number, tokens: Uint32Array[]);
    getLineRange(): LineRange;
    getLineTokens(lineNumber: number): Uint32Array | ArrayBuffer | null;
    appendLineTokens(lineTokens: Uint32Array): void;
    serializeSize(): number;
    serialize(destination: Uint8Array, offset: number): number;
    applyEdit(range: IRange, text: string): void;
    private _acceptDeleteRange;
    private _acceptInsertText;
    private _insertLines;
}
