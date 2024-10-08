import { Event } from '../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IFileDeleteOptions, IFileOverwriteOptions, FileSystemProviderCapabilities, FileType, IFileWriteOptions, IFileChange, IFileSystemProviderWithFileReadWriteCapability, IStat, IWatchOptions } from '../common/files.js';
import { IndexedDB } from '../../../base/browser/indexedDB.js';
export type IndexedDBFileSystemProviderErrorDataClassification = {
    owner: 'sandy081';
    comment: 'Information about errors that occur in the IndexedDB file system provider';
    readonly scheme: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'IndexedDB file system provider scheme for which this error occurred';
    };
    readonly operation: {
        classification: 'SystemMetaData';
        purpose: 'FeatureInsight';
        comment: 'operation during which this error occurred';
    };
    readonly code: {
        classification: 'SystemMetaData';
        purpose: 'PerformanceAndHealth';
        comment: 'error code';
    };
};
export type IndexedDBFileSystemProviderErrorData = {
    readonly scheme: string;
    readonly operation: string;
    readonly code: string;
};
type DirEntry = [string, FileType];
export declare class IndexedDBFileSystemProvider extends Disposable implements IFileSystemProviderWithFileReadWriteCapability {
    readonly scheme: string;
    private indexedDB;
    private readonly store;
    readonly capabilities: FileSystemProviderCapabilities;
    readonly onDidChangeCapabilities: Event<void>;
    private readonly extUri;
    private readonly changesBroadcastChannel;
    private readonly _onDidChangeFile;
    readonly onDidChangeFile: Event<readonly IFileChange[]>;
    private readonly _onReportError;
    readonly onReportError: Event<IndexedDBFileSystemProviderErrorData>;
    private readonly mtimes;
    private cachedFiletree;
    private writeManyThrottler;
    constructor(scheme: string, indexedDB: IndexedDB, store: string, watchCrossWindowChanges: boolean);
    watch(resource: URI, opts: IWatchOptions): IDisposable;
    mkdir(resource: URI): Promise<void>;
    stat(resource: URI): Promise<IStat>;
    readdir(resource: URI): Promise<DirEntry[]>;
    readFile(resource: URI): Promise<Uint8Array>;
    writeFile(resource: URI, content: Uint8Array, opts: IFileWriteOptions): Promise<void>;
    rename(from: URI, to: URI, opts: IFileOverwriteOptions): Promise<void>;
    delete(resource: URI, opts: IFileDeleteOptions): Promise<void>;
    private tree;
    private triggerChanges;
    private getFiletree;
    private bulkWrite;
    private fileWriteBatch;
    private writeMany;
    private deleteKeys;
    reset(): Promise<void>;
    private reportError;
}
export {};
