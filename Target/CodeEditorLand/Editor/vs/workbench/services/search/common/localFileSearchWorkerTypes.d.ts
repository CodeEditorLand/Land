import { UriComponents } from '../../../../base/common/uri.js';
import { IWorkerClient, IWorkerServer } from '../../../../base/common/worker/simpleWorker.js';
import { IFileMatch, IFileQueryProps, IFolderQuery, ITextQueryProps } from './search.js';
export interface IWorkerTextSearchComplete {
    results: IFileMatch<UriComponents>[];
    limitHit?: boolean;
}
export interface IWorkerFileSearchComplete {
    results: string[];
    limitHit?: boolean;
}
type IWorkerFileSystemHandleKind = 'directory' | 'file';
export interface IWorkerFileSystemHandle {
    readonly kind: IWorkerFileSystemHandleKind;
    readonly name: string;
    isSameEntry(other: IWorkerFileSystemHandle): Promise<boolean>;
}
export interface IWorkerFileSystemDirectoryHandle extends IWorkerFileSystemHandle {
    readonly kind: 'directory';
    getDirectoryHandle(name: string): Promise<IWorkerFileSystemDirectoryHandle>;
    getFileHandle(name: string): Promise<IWorkerFileSystemFileHandle>;
    resolve(possibleDescendant: IWorkerFileSystemHandle): Promise<string[] | null>;
    entries(): AsyncIterableIterator<[string, IWorkerFileSystemDirectoryHandle | IWorkerFileSystemFileHandle]>;
}
export interface IWorkerFileSystemFileHandle extends IWorkerFileSystemHandle {
    readonly kind: 'file';
    getFile(): Promise<{
        arrayBuffer(): Promise<ArrayBuffer>;
    }>;
}
export interface ILocalFileSearchSimpleWorker {
    _requestHandlerBrand: any;
    $cancelQuery(queryId: number): void;
    $listDirectory(handle: IWorkerFileSystemDirectoryHandle, queryProps: IFileQueryProps<UriComponents>, folderQuery: IFolderQuery, ignorePathCasing: boolean, queryId: number): Promise<IWorkerFileSearchComplete>;
    $searchDirectory(handle: IWorkerFileSystemDirectoryHandle, queryProps: ITextQueryProps<UriComponents>, folderQuery: IFolderQuery, ignorePathCasing: boolean, queryId: number): Promise<IWorkerTextSearchComplete>;
}
export declare abstract class LocalFileSearchSimpleWorkerHost {
    static CHANNEL_NAME: string;
    static getChannel(workerServer: IWorkerServer): LocalFileSearchSimpleWorkerHost;
    static setChannel(workerClient: IWorkerClient<any>, obj: LocalFileSearchSimpleWorkerHost): void;
    abstract $sendTextSearchMatch(match: IFileMatch<UriComponents>, queryId: number): void;
}
export {};
