export declare function getPlatformTextDecoder(): TextDecoder;
export declare function decodeUTF16LE(source: Uint8Array, offset: number, len: number): string;
export declare class StringBuilder {
    private readonly _capacity;
    private readonly _buffer;
    private _completedStrings;
    private _bufferLength;
    constructor(capacity: number);
    reset(): void;
    build(): string;
    private _buildBuffer;
    private _flushBuffer;
    /**
     * Append a char code (<2^16)
     */
    appendCharCode(charCode: number): void;
    /**
     * Append an ASCII char code (<2^8)
     */
    appendASCIICharCode(charCode: number): void;
    appendString(str: string): void;
}
