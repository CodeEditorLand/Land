import { CancellationToken } from './cancellation.js';
export type ReadableStreamEventPayload<T> = T | Error | 'end';
export interface ReadableStreamEvents<T> {
    on(event: 'data', callback: (data: T) => void): void;
    on(event: 'error', callback: (err: Error) => void): void;
    on(event: 'end', callback: () => void): void;
}
export interface ReadableStream<T> extends ReadableStreamEvents<T> {
    pause(): void;
    resume(): void;
    destroy(): void;
    removeListener(event: string, callback: Function): void;
}
export interface Readable<T> {
    read(): T | null;
}
export declare function isReadable<T>(obj: unknown): obj is Readable<T>;
export interface WriteableStream<T> extends ReadableStream<T> {
    write(data: T): void | Promise<void>;
    error(error: Error): void;
    end(result?: T): void;
}
export interface ReadableBufferedStream<T> {
    stream: ReadableStream<T>;
    buffer: T[];
    ended: boolean;
}
export declare function isReadableStream<T>(obj: unknown): obj is ReadableStream<T>;
export declare function isReadableBufferedStream<T>(obj: unknown): obj is ReadableBufferedStream<T>;
export interface IReducer<T, R = T> {
    (data: T[]): R;
}
export interface IDataTransformer<Original, Transformed> {
    (data: Original): Transformed;
}
export interface IErrorTransformer {
    (error: Error): Error;
}
export interface ITransformer<Original, Transformed> {
    data: IDataTransformer<Original, Transformed>;
    error?: IErrorTransformer;
}
export declare function newWriteableStream<T>(reducer: IReducer<T>, options?: WriteableStreamOptions): WriteableStream<T>;
export interface WriteableStreamOptions {
    highWaterMark?: number;
}
export declare function consumeReadable<T>(readable: Readable<T>, reducer: IReducer<T>): T;
export declare function peekReadable<T>(readable: Readable<T>, reducer: IReducer<T>, maxChunks: number): T | Readable<T>;
export declare function consumeStream<T, R = T>(stream: ReadableStreamEvents<T>, reducer: IReducer<T, R>): Promise<R>;
export declare function consumeStream(stream: ReadableStreamEvents<unknown>): Promise<undefined>;
export interface IStreamListener<T> {
    onData(data: T): void;
    onError(err: Error): void;
    onEnd(): void;
}
export declare function listenStream<T>(stream: ReadableStreamEvents<T>, listener: IStreamListener<T>, token?: CancellationToken): void;
export declare function peekStream<T>(stream: ReadableStream<T>, maxChunks: number): Promise<ReadableBufferedStream<T>>;
export declare function toStream<T>(t: T, reducer: IReducer<T>): ReadableStream<T>;
export declare function emptyStream(): ReadableStream<never>;
export declare function toReadable<T>(t: T): Readable<T>;
export declare function transform<Original, Transformed>(stream: ReadableStreamEvents<Original>, transformer: ITransformer<Original, Transformed>, reducer: IReducer<Transformed>): ReadableStream<Transformed>;
export declare function prefixedReadable<T>(prefix: T, readable: Readable<T>, reducer: IReducer<T>): Readable<T>;
export declare function prefixedStream<T>(prefix: T, stream: ReadableStream<T>, reducer: IReducer<T>): ReadableStream<T>;
