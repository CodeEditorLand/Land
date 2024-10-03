import { UriComponents } from '../../../base/common/uri.js';
import { FileSystemProviderCapabilities, IFileService, IStat, FileType, IFileOverwriteOptions, IFileDeleteOptions } from '../../../platform/files/common/files.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { IFileChangeDto, MainThreadFileSystemShape } from '../common/extHost.protocol.js';
import { VSBuffer } from '../../../base/common/buffer.js';
import { IMarkdownString } from '../../../base/common/htmlContent.js';
export declare class MainThreadFileSystem implements MainThreadFileSystemShape {
    private readonly _fileService;
    private readonly _proxy;
    private readonly _fileProvider;
    private readonly _disposables;
    constructor(extHostContext: IExtHostContext, _fileService: IFileService);
    dispose(): void;
    $registerFileSystemProvider(handle: number, scheme: string, capabilities: FileSystemProviderCapabilities, readonlyMessage?: IMarkdownString): Promise<void>;
    $unregisterProvider(handle: number): void;
    $onFileSystemChange(handle: number, changes: IFileChangeDto[]): void;
    $stat(uri: UriComponents): Promise<IStat>;
    $readdir(uri: UriComponents): Promise<[string, FileType][]>;
    private static _asFileType;
    $readFile(uri: UriComponents): Promise<VSBuffer>;
    $writeFile(uri: UriComponents, content: VSBuffer): Promise<void>;
    $rename(source: UriComponents, target: UriComponents, opts: IFileOverwriteOptions): Promise<void>;
    $copy(source: UriComponents, target: UriComponents, opts: IFileOverwriteOptions): Promise<void>;
    $mkdir(uri: UriComponents): Promise<void>;
    $delete(uri: UriComponents, opts: IFileDeleteOptions): Promise<void>;
    private static _handleError;
    $ensureActivation(scheme: string): Promise<void>;
}
