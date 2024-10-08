import { Readable, ReadableStream } from '../../../../base/common/stream.js';
import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from '../../../../base/common/buffer.js';
export declare const UTF8 = "utf8";
export declare const UTF8_with_bom = "utf8bom";
export declare const UTF16be = "utf16be";
export declare const UTF16le = "utf16le";
export type UTF_ENCODING = typeof UTF8 | typeof UTF8_with_bom | typeof UTF16be | typeof UTF16le;
export declare function isUTFEncoding(encoding: string): encoding is UTF_ENCODING;
export declare const UTF16be_BOM: number[];
export declare const UTF16le_BOM: number[];
export declare const UTF8_BOM: number[];
export interface IDecodeStreamOptions {
    acceptTextOnly: boolean;
    guessEncoding: boolean;
    candidateGuessEncodings: string[];
    minBytesRequiredForDetection?: number;
    overwriteEncoding(detectedEncoding: string | null): Promise<string>;
}
export interface IDecodeStreamResult {
    stream: ReadableStream<string>;
    detected: IDetectedEncodingResult;
}
export declare const enum DecodeStreamErrorKind {
    /**
     * Error indicating that the stream is binary even
     * though `acceptTextOnly` was specified.
     */
    STREAM_IS_BINARY = 1
}
export declare class DecodeStreamError extends Error {
    readonly decodeStreamErrorKind: DecodeStreamErrorKind;
    constructor(message: string, decodeStreamErrorKind: DecodeStreamErrorKind);
}
export interface IDecoderStream {
    write(buffer: Uint8Array): string;
    end(): string | undefined;
}
export declare function toDecodeStream(source: VSBufferReadableStream, options: IDecodeStreamOptions): Promise<IDecodeStreamResult>;
export declare function toEncodeReadable(readable: Readable<string>, encoding: string, options?: {
    addBOM?: boolean;
}): Promise<VSBufferReadable>;
export declare function encodingExists(encoding: string): Promise<boolean>;
export declare function toNodeEncoding(enc: string | null): string;
export declare function detectEncodingByBOMFromBuffer(buffer: VSBuffer | null, bytesRead: number): typeof UTF8_with_bom | typeof UTF16le | typeof UTF16be | null;
/**
 * The encodings that are allowed in a settings file don't match the canonical encoding labels specified by WHATWG.
 * See https://encoding.spec.whatwg.org/#names-and-labels
 * Iconv-lite strips all non-alphanumeric characters, but ripgrep doesn't. For backcompat, allow these labels.
 */
export declare function toCanonicalName(enc: string): string;
export interface IDetectedEncodingResult {
    encoding: string | null;
    seemsBinary: boolean;
}
export interface IReadResult {
    buffer: VSBuffer | null;
    bytesRead: number;
}
export declare function detectEncodingFromBuffer(readResult: IReadResult, autoGuessEncoding?: false, candidateGuessEncodings?: string[]): IDetectedEncodingResult;
export declare function detectEncodingFromBuffer(readResult: IReadResult, autoGuessEncoding?: boolean, candidateGuessEncodings?: string[]): Promise<IDetectedEncodingResult>;
type EncodingsMap = {
    [encoding: string]: {
        labelLong: string;
        labelShort: string;
        order: number;
        encodeOnly?: boolean;
        alias?: string;
        guessableName?: string;
    };
};
export declare const SUPPORTED_ENCODINGS: EncodingsMap;
export declare const GUESSABLE_ENCODINGS: EncodingsMap;
export {};
