import { Event } from '../../../base/common/event.js';
import { IExtUri } from '../../../base/common/resources.js';
import { URI } from '../../../base/common/uri.js';
import { IWorkspaceBackupInfo, IFolderBackupInfo } from '../../backup/common/backup.js';
import { ILogService } from '../../log/common/log.js';
import { IBaseWorkspace, IRawFileWorkspaceFolder, IRawUriWorkspaceFolder, IWorkspaceIdentifier, WorkspaceFolder } from '../../workspace/common/workspace.js';
export declare const IWorkspacesService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IWorkspacesService>;
export interface IWorkspacesService {
    readonly _serviceBrand: undefined;
    enterWorkspace(workspaceUri: URI): Promise<IEnterWorkspaceResult | undefined>;
    createUntitledWorkspace(folders?: IWorkspaceFolderCreationData[], remoteAuthority?: string): Promise<IWorkspaceIdentifier>;
    deleteUntitledWorkspace(workspace: IWorkspaceIdentifier): Promise<void>;
    getWorkspaceIdentifier(workspaceUri: URI): Promise<IWorkspaceIdentifier>;
    readonly onDidChangeRecentlyOpened: Event<void>;
    addRecentlyOpened(recents: IRecent[]): Promise<void>;
    removeRecentlyOpened(workspaces: URI[]): Promise<void>;
    clearRecentlyOpened(): Promise<void>;
    getRecentlyOpened(): Promise<IRecentlyOpened>;
    getDirtyWorkspaces(): Promise<Array<IWorkspaceBackupInfo | IFolderBackupInfo>>;
}
export interface IRecentlyOpened {
    workspaces: Array<IRecentWorkspace | IRecentFolder>;
    files: IRecentFile[];
}
export type IRecent = IRecentWorkspace | IRecentFolder | IRecentFile;
export interface IRecentWorkspace {
    readonly workspace: IWorkspaceIdentifier;
    label?: string;
    readonly remoteAuthority?: string;
}
export interface IRecentFolder {
    readonly folderUri: URI;
    label?: string;
    readonly remoteAuthority?: string;
}
export interface IRecentFile {
    readonly fileUri: URI;
    label?: string;
    readonly remoteAuthority?: string;
}
export declare function isRecentWorkspace(curr: IRecent): curr is IRecentWorkspace;
export declare function isRecentFolder(curr: IRecent): curr is IRecentFolder;
export declare function isRecentFile(curr: IRecent): curr is IRecentFile;
export declare function isStoredWorkspaceFolder(obj: unknown): obj is IStoredWorkspaceFolder;
export type IStoredWorkspaceFolder = IRawFileWorkspaceFolder | IRawUriWorkspaceFolder;
export interface IStoredWorkspace extends IBaseWorkspace {
    folders: IStoredWorkspaceFolder[];
}
export interface IWorkspaceFolderCreationData {
    readonly uri: URI;
    readonly name?: string;
}
export interface IUntitledWorkspaceInfo {
    readonly workspace: IWorkspaceIdentifier;
    readonly remoteAuthority?: string;
}
export interface IEnterWorkspaceResult {
    readonly workspace: IWorkspaceIdentifier;
    readonly backupPath?: string;
}
export declare function getStoredWorkspaceFolder(folderURI: URI, forceAbsolute: boolean, folderName: string | undefined, targetConfigFolderURI: URI, extUri: IExtUri): IStoredWorkspaceFolder;
export declare function toWorkspaceFolders(configuredFolders: IStoredWorkspaceFolder[], workspaceConfigFile: URI, extUri: IExtUri): WorkspaceFolder[];
export declare function rewriteWorkspaceFileForNewLocation(rawWorkspaceContents: string, configPathURI: URI, isFromUntitledWorkspace: boolean, targetConfigPathURI: URI, extUri: IExtUri): string;
export type RecentlyOpenedStorageData = object;
export declare function restoreRecentlyOpened(data: RecentlyOpenedStorageData | undefined, logService: ILogService): IRecentlyOpened;
export declare function toStoreData(recents: IRecentlyOpened): RecentlyOpenedStorageData;
