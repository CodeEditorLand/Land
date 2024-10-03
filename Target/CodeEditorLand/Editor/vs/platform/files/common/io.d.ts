import { VSBuffer } from '../../../base/common/buffer.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { IDataTransformer, IErrorTransformer, WriteableStream } from '../../../base/common/stream.js';
import { URI } from '../../../base/common/uri.js';
import { IFileReadStreamOptions, IFileSystemProviderWithOpenReadWriteCloseCapability } from './files.js';
export interface ICreateReadStreamOptions extends IFileReadStreamOptions {
    readonly bufferSize: number;
    readonly errorTransformer?: IErrorTransformer;
}
export declare function readFileIntoStream<T>(provider: IFileSystemProviderWithOpenReadWriteCloseCapability, resource: URI, target: WriteableStream<T>, transformer: IDataTransformer<VSBuffer, T>, options: ICreateReadStreamOptions, token: CancellationToken): Promise<void>;
