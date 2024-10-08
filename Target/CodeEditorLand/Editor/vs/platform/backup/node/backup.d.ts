import { IBaseBackupInfo, IFolderBackupInfo, IWorkspaceBackupInfo } from '../common/backup.js';
export interface IEmptyWindowBackupInfo extends IBaseBackupInfo {
    readonly backupFolder: string;
}
export declare function isEmptyWindowBackupInfo(obj: unknown): obj is IEmptyWindowBackupInfo;
export interface ISerializedWorkspaceBackupInfo {
    readonly id: string;
    readonly configURIPath: string;
    remoteAuthority?: string;
}
export declare function deserializeWorkspaceInfos(serializedBackupWorkspaces: ISerializedBackupWorkspaces): IWorkspaceBackupInfo[];
export interface ISerializedFolderBackupInfo {
    readonly folderUri: string;
    remoteAuthority?: string;
}
export declare function deserializeFolderInfos(serializedBackupWorkspaces: ISerializedBackupWorkspaces): IFolderBackupInfo[];
export interface ISerializedEmptyWindowBackupInfo extends IEmptyWindowBackupInfo {
}
export interface ILegacySerializedBackupWorkspaces {
    readonly rootURIWorkspaces: ISerializedWorkspaceBackupInfo[];
    readonly folderWorkspaceInfos: ISerializedFolderBackupInfo[];
    readonly emptyWorkspaceInfos: ISerializedEmptyWindowBackupInfo[];
}
export interface ISerializedBackupWorkspaces {
    readonly workspaces: ISerializedWorkspaceBackupInfo[];
    readonly folders: ISerializedFolderBackupInfo[];
    readonly emptyWindows: ISerializedEmptyWindowBackupInfo[];
}
