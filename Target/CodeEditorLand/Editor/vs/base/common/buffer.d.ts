import * as streams from './stream.js';
export declare class VSBuffer {
    static alloc(byteLength: number): VSBuffer;
    static wrap(actual: Uint8Array): VSBuffer;
    static fromString(source: string, options?: {
        dontUseNodeBuffer?: boolean;
    }): VSBuffer;
    static fromByteArray(source: number[]): VSBuffer;
    static concat(buffers: VSBuffer[], totalLength?: number): VSBuffer;
    readonly buffer: Uint8Array;
    readonly byteLength: number;
    private constructor();
    clone(): VSBuffer;
    toString(): string;
    slice(start?: number, end?: number): VSBuffer;
    set(array: VSBuffer, offset?: number): void;
    set(array: Uint8Array, offset?: number): void;
    set(array: ArrayBuffer, offset?: number): void;
    set(array: ArrayBufferView, offset?: number): void;
    set(array: VSBuffer | Uint8Array | ArrayBuffer | ArrayBufferView, offset?: number): void;
    readUInt32BE(offset: number): number;
    writeUInt32BE(value: number, offset: number): void;
    readUInt32LE(offset: number): number;
    writeUInt32LE(value: number, offset: number): void;
    readUInt8(offset: number): number;
    writeUInt8(value: number, offset: number): void;
    indexOf(subarray: VSBuffer | Uint8Array, offset?: number): number;
}
export declare function binaryIndexOf(haystack: Uint8Array, needle: Uint8Array, offset?: number): number;
export declare function readUInt16LE(source: Uint8Array, offset: number): number;
export declare function writeUInt16LE(destination: Uint8Array, value: number, offset: number): void;
export declare function readUInt32BE(source: Uint8Array, offset: number): number;
export declare function writeUInt32BE(destination: Uint8Array, value: number, offset: number): void;
export declare function readUInt32LE(source: Uint8Array, offset: number): number;
export declare function writeUInt32LE(destination: Uint8Array, value: number, offset: number): void;
export declare function readUInt8(source: Uint8Array, offset: number): number;
export declare function writeUInt8(destination: Uint8Array, value: number, offset: number): void;
export interface VSBufferReadable extends streams.Readable<VSBuffer> {
}
export interface VSBufferReadableStream extends streams.ReadableStream<VSBuffer> {
}
export interface VSBufferWriteableStream extends streams.WriteableStream<VSBuffer> {
}
export interface VSBufferReadableBufferedStream extends streams.ReadableBufferedStream<VSBuffer> {
}
export declare function readableToBuffer(readable: VSBufferReadable): VSBuffer;
export declare function bufferToReadable(buffer: VSBuffer): VSBufferReadable;
export declare function streamToBuffer(stream: streams.ReadableStream<VSBuffer>): Promise<VSBuffer>;
export declare function bufferedStreamToBuffer(bufferedStream: streams.ReadableBufferedStream<VSBuffer>): Promise<VSBuffer>;
export declare function bufferToStream(buffer: VSBuffer): streams.ReadableStream<VSBuffer>;
export declare function streamToBufferReadableStream(stream: streams.ReadableStreamEvents<Uint8Array | string>): streams.ReadableStream<VSBuffer>;
export declare function newWriteableBufferStream(options?: streams.WriteableStreamOptions): streams.WriteableStream<VSBuffer>;
export declare function prefixedBufferReadable(prefix: VSBuffer, readable: VSBufferReadable): VSBufferReadable;
export declare function prefixedBufferStream(prefix: VSBuffer, stream: VSBufferReadableStream): VSBufferReadableStream;
export declare function decodeBase64(encoded: string): VSBuffer;
export declare function encodeBase64({ buffer }: VSBuffer, padded?: boolean, urlSafe?: boolean): string;
