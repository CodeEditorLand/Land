import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { IFileSystemProviderWithFileReadWriteCapability, IFileChange, IWatchOptions, IStat, IFileOverwriteOptions, FileType, IFileWriteOptions, IFileDeleteOptions, FileSystemProviderCapabilities, IFileSystemProviderWithFileReadStreamCapability, IFileReadStreamOptions, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithOpenReadWriteCloseCapability, IFileOpenOptions, IFileSystemProviderWithFileAtomicWriteCapability, IFileSystemProviderWithFileAtomicDeleteCapability, IFileSystemProviderWithFileFolderCopyCapability, IFileSystemProviderWithFileCloneCapability, IFileAtomicReadOptions, IFileAtomicOptions } from '../../files/common/files.js';
import { URI } from '../../../base/common/uri.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { ReadableStreamEvents } from '../../../base/common/stream.js';
import { ILogService } from '../../log/common/log.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
/**
 * This is a wrapper on top of the local filesystem provider which will
 * 	- Convert the user data resources to file system scheme and vice-versa
 *  - Enforces atomic reads for user data
 */
export declare class FileUserDataProvider extends Disposable implements IFileSystemProviderWithFileReadWriteCapability, IFileSystemProviderWithOpenReadWriteCloseCapability, IFileSystemProviderWithFileReadStreamCapability, IFileSystemProviderWithFileFolderCopyCapability, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileAtomicWriteCapability, IFileSystemProviderWithFileAtomicDeleteCapability, IFileSystemProviderWithFileCloneCapability {
    private readonly fileSystemScheme;
    private readonly fileSystemProvider;
    private readonly userDataScheme;
    private readonly userDataProfilesService;
    private readonly uriIdentityService;
    private readonly logService;
    readonly capabilities: FileSystemProviderCapabilities;
    readonly onDidChangeCapabilities: import("../../../workbench/workbench.web.main.internal.js").Event<void>;
    private readonly _onDidChangeFile;
    readonly onDidChangeFile: import("../../../workbench/workbench.web.main.internal.js").Event<readonly IFileChange[]>;
    private readonly watchResources;
    private readonly atomicReadWriteResources;
    constructor(fileSystemScheme: string, fileSystemProvider: IFileSystemProviderWithFileReadWriteCapability & IFileSystemProviderWithOpenReadWriteCloseCapability & IFileSystemProviderWithFileReadStreamCapability & IFileSystemProviderWithFileAtomicReadCapability & IFileSystemProviderWithFileAtomicWriteCapability & IFileSystemProviderWithFileAtomicDeleteCapability, userDataScheme: string, userDataProfilesService: IUserDataProfilesService, uriIdentityService: IUriIdentityService, logService: ILogService);
    private updateAtomicReadWritesResources;
    open(resource: URI, opts: IFileOpenOptions): Promise<number>;
    close(fd: number): Promise<void>;
    read(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    write(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    stat(resource: URI): Promise<IStat>;
    mkdir(resource: URI): Promise<void>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    readFile(resource: URI, opts?: IFileAtomicReadOptions): Promise<Uint8Array>;
    readFileStream(resource: URI, opts: IFileReadStreamOptions, token: CancellationToken): ReadableStreamEvents<Uint8Array>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    enforceAtomicReadFile(resource: URI): boolean;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    enforceAtomicWriteFile(resource: URI): IFileAtomicOptions | false;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    copy(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    cloneFile(from: URI, to: URI): Promise<void>;
    private handleFileChanges;
    private toFileSystemResource;
    private toUserDataResource;
}
