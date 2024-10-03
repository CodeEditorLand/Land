import { Event } from '../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { ReadableStreamEvents } from '../../../base/common/stream.js';
import { URI } from '../../../base/common/uri.js';
import { IFileDeleteOptions, IFileOverwriteOptions, FileSystemProviderCapabilities, FileType, IFileWriteOptions, IFileChange, IFileSystemProviderWithFileReadWriteCapability, IStat, IWatchOptions, IFileSystemProviderWithOpenReadWriteCloseCapability, IFileOpenOptions, IFileSystemProviderWithFileAtomicDeleteCapability, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileAtomicWriteCapability, IFileSystemProviderWithFileReadStreamCapability } from './files.js';
declare class File implements IStat {
    readonly type: FileType.File;
    readonly ctime: number;
    mtime: number;
    size: number;
    name: string;
    data?: Uint8Array;
    constructor(name: string);
}
declare class Directory implements IStat {
    readonly type: FileType.Directory;
    readonly ctime: number;
    mtime: number;
    size: number;
    name: string;
    readonly entries: Map<string, File | Directory>;
    constructor(name: string);
}
export declare class InMemoryFileSystemProvider extends Disposable implements IFileSystemProviderWithFileReadWriteCapability, IFileSystemProviderWithOpenReadWriteCloseCapability, IFileSystemProviderWithFileReadStreamCapability, IFileSystemProviderWithFileAtomicReadCapability, IFileSystemProviderWithFileAtomicWriteCapability, IFileSystemProviderWithFileAtomicDeleteCapability {
    private memoryFdCounter;
    private readonly fdMemory;
    private _onDidChangeCapabilities;
    readonly onDidChangeCapabilities: Event<void>;
    private _capabilities;
    get capabilities(): FileSystemProviderCapabilities;
    setReadOnly(readonly: boolean): void;
    root: Directory;
    stat(resource: URI): Promise<IStat>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    readFile(resource: URI): Promise<Uint8Array>;
    readFileStream(resource: URI): ReadableStreamEvents<Uint8Array>;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    open(resource: URI, opts: IFileOpenOptions): Promise<number>;
    close(fd: number): Promise<void>;
    read(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    write(fd: number, pos: number, data: Uint8Array, offset: number, length: number): Promise<number>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    mkdir(resource: URI): Promise<void>;
    private _lookup;
    private _lookupAsDirectory;
    private _lookupAsFile;
    private _lookupParentDirectory;
    private readonly _onDidChangeFile;
    readonly onDidChangeFile: Event<readonly IFileChange[]>;
    private _bufferedChanges;
    private _fireSoonHandle?;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    private _fireSoon;
    dispose(): void;
}
export {};
