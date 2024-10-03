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
    appendCharCode(charCode: number): void;
    appendASCIICharCode(charCode: number): void;
    appendString(str: string): void;
}
