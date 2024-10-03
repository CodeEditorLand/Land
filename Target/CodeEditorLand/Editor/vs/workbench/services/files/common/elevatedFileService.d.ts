import { URI } from '../../../../base/common/uri.js';
import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from '../../../../base/common/buffer.js';
import { IFileStatWithMetadata, IWriteFileOptions } from '../../../../platform/files/common/files.js';
export declare const IElevatedFileService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IElevatedFileService>;
export interface IElevatedFileService {
    readonly _serviceBrand: undefined;
    isSupported(resource: URI): boolean;
    writeFileElevated(resource: URI, value: VSBuffer | VSBufferReadable | VSBufferReadableStream, options?: IWriteFileOptions): Promise<IFileStatWithMetadata>;
}
