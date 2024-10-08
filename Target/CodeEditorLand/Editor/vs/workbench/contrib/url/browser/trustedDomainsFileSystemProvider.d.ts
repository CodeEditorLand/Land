import { Event } from '../../../../base/common/event.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IFileDeleteOptions, IFileOverwriteOptions, FileSystemProviderCapabilities, FileType, IFileWriteOptions, IFileService, IStat, IWatchOptions, IFileSystemProviderWithFileReadWriteCapability } from '../../../../platform/files/common/files.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
export declare class TrustedDomainsFileSystemProvider implements IFileSystemProviderWithFileReadWriteCapability, IWorkbenchContribution {
    private readonly fileService;
    private readonly storageService;
    private readonly instantiationService;
    static readonly ID = "workbench.contrib.trustedDomainsFileSystemProvider";
    readonly capabilities = FileSystemProviderCapabilities.FileReadWrite;
    readonly onDidChangeCapabilities: Event<any>;
    readonly onDidChangeFile: Event<any>;
    constructor(fileService: IFileService, storageService: IStorageService, instantiationService: IInstantiationService);
    stat(resource: URI): Promise<IStat>;
    readFile(resource: URI): Promise<Uint8Array>;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    mkdir(resource: URI): Promise<void>;
    readdir(resource: URI): Promise<[string, FileType][]>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
}
