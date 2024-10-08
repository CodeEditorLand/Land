import { CancellationToken } from '../../../base/common/cancellation.js';
import { Event } from '../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { ReadableStreamEvents } from '../../../base/common/stream.js';
import { URI } from '../../../base/common/uri.js';
import { IChannel } from '../../../base/parts/ipc/common/ipc.js';
import { IFileAtomicReadOptions, IFileDeleteOptions, IFileOpenOptions, IFileOverwriteOptions, IFileReadStreamOptions, FileSystemProviderCapabilities, FileType, IFileWriteOptions, IFileChange, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileCloneCapability, IFileSystemProviderWithFileFolderCopyCapability, IFileSystemProviderWithFileReadStreamCapability, IFileSystemProviderWithFileReadWriteCapability, IFileSystemProviderWithOpenReadWriteCloseCapability, IStat, IWatchOptions } from './files.js';
export declare const LOCAL_FILE_SYSTEM_CHANNEL_NAME = "localFilesystem";
/**
 * An implementation of a local disk file system provider
 * that is backed by a `IChannel` and thus implemented via
 * IPC on a different process.
 */
export declare class DiskFileSystemProviderClient extends Disposable implements IFileSystemProviderWithFileReadWriteCapability, IFileSystemProviderWithOpenReadWriteCloseCapability, IFileSystemProviderWithFileReadStreamCapability, IFileSystemProviderWithFileFolderCopyCapability, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileCloneCapability {
    private readonly channel;
    private readonly extraCapabilities;
    constructor(channel: IChannel, extraCapabilities: {
        trash?: boolean;
        pathCaseSensitive?: boolean;
    });
    readonly onDidChangeCapabilities: Event<void>;
    private _capabilities;
    get capabilities(): FileSystemProviderCapabilities;
    stat(resource: URI): Promise<IStat>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    readFile(resource: URI, opts?: IFileAtomicReadOptions): Promise<Uint8Array>;
    readFileStream(resource: URI, opts: IFileReadStreamOptions, token: CancellationToken): ReadableStreamEvents<Uint8Array>;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    open(resource: URI, opts: IFileOpenOptions): Promise<number>;
    close(fd: number): Promise<void>;
    read(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    write(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    mkdir(resource: URI): Promise<void>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    rename(resource: URI, target: URI, opts: IFileOverwriteOptions): Promise<void>;
    copy(resource: URI, target: URI, opts: IFileOverwriteOptions): Promise<void>;
    cloneFile(resource: URI, target: URI): Promise<void>;
    private readonly _onDidChange;
    readonly onDidChangeFile: Event<readonly IFileChange[]>;
    private readonly _onDidWatchError;
    readonly onDidWatchError: Event<string>;
    private readonly sessionId;
    private registerFileChangeListeners;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
}
