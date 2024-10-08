import { Transform } from 'stream';
/**
 * A Transform stream that splits the input on the "splitter" substring.
 * The resulting chunks will contain (and trail with) the splitter match.
 * The last chunk when the stream ends will be emitted even if a splitter
 * is not encountered.
 */
export declare class StreamSplitter extends Transform {
    private buffer;
    private readonly splitter;
    private readonly spitterLen;
    constructor(splitter: string | number | Buffer);
    _transform(chunk: Buffer, _encoding: string, callback: (error?: Error | null, data?: any) => void): void;
    _flush(callback: (error?: Error | null, data?: any) => void): void;
}
