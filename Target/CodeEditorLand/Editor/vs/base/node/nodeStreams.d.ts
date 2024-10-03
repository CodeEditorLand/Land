import { Transform } from 'stream';
export declare class StreamSplitter extends Transform {
    private buffer;
    private readonly splitter;
    private readonly spitterLen;
    constructor(splitter: string | number | Buffer);
    _transform(chunk: Buffer, _encoding: string, callback: (error?: Error | null, data?: any) => void): void;
    _flush(callback: (error?: Error | null, data?: any) => void): void;
}
