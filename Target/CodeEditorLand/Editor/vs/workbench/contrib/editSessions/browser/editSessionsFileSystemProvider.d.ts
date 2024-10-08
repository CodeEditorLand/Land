import { IDisposable } from '../../../../base/common/lifecycle.js';
import { Event } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { FileSystemProviderCapabilities, FileType, IFileDeleteOptions, IFileOverwriteOptions, IFileSystemProviderWithFileReadWriteCapability, IStat, IWatchOptions } from '../../../../platform/files/common/files.js';
import { IEditSessionsStorageService } from '../common/editSessions.js';
export declare class EditSessionsFileSystemProvider implements IFileSystemProviderWithFileReadWriteCapability {
    private editSessionsStorageService;
    static readonly SCHEMA = "vscode-edit-sessions";
    constructor(editSessionsStorageService: IEditSessionsStorageService);
    readonly capabilities: FileSystemProviderCapabilities;
    readFile(resource: URI): Promise<Uint8Array>;
    stat(resource: URI): Promise<IStat>;
    readonly onDidChangeCapabilities: Event<any>;
    readonly onDidChangeFile: Event<any>;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    mkdir(resource: URI): Promise<void>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    writeFile(): Promise<void>;
}
