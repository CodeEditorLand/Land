import { VSBuffer, VSBufferReadable, VSBufferReadableStream } from '../../../../base/common/buffer.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileService, IFileStatWithMetadata, IWriteFileOptions } from '../../../../platform/files/common/files.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { IElevatedFileService } from '../common/elevatedFileService.js';
export declare class NativeElevatedFileService implements IElevatedFileService {
    private readonly nativeHostService;
    private readonly fileService;
    private readonly environmentService;
    readonly _serviceBrand: undefined;
    constructor(nativeHostService: INativeHostService, fileService: IFileService, environmentService: INativeWorkbenchEnvironmentService);
    isSupported(resource: URI): boolean;
    writeFileElevated(resource: URI, value: VSBuffer | VSBufferReadable | VSBufferReadableStream, options?: IWriteFileOptions): Promise<IFileStatWithMetadata>;
}
