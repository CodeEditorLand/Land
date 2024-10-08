import { VSBuffer } from '../../../base/common/buffer.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { IDataTransformer, IErrorTransformer, WriteableStream } from '../../../base/common/stream.js';
import { URI } from '../../../base/common/uri.js';
import { IFileReadStreamOptions, IFileSystemProviderWithOpenReadWriteCloseCapability } from './files.js';
export interface ICreateReadStreamOptions extends IFileReadStreamOptions {
    /**
     * The size of the buffer to use before sending to the stream.
     */
    readonly bufferSize: number;
    /**
     * Allows to massage any possibly error that happens during reading.
     */
    readonly errorTransformer?: IErrorTransformer;
}
/**
 * A helper to read a file from a provider with open/read/close capability into a stream.
 */
export declare function readFileIntoStream<T>(provider: IFileSystemProviderWithOpenReadWriteCloseCapability, resource: URI, target: WriteableStream<T>, transformer: IDataTransformer<VSBuffer, T>, options: ICreateReadStreamOptions, token: CancellationToken): Promise<void>;
