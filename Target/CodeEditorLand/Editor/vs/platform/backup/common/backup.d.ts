import { URI } from '../../../base/common/uri.js';
import { IWorkspaceIdentifier } from '../../workspace/common/workspace.js';
export interface IBaseBackupInfo {
    remoteAuthority?: string;
}
export interface IWorkspaceBackupInfo extends IBaseBackupInfo {
    readonly workspace: IWorkspaceIdentifier;
}
export interface IFolderBackupInfo extends IBaseBackupInfo {
    readonly folderUri: URI;
}
export declare function isFolderBackupInfo(curr: IWorkspaceBackupInfo | IFolderBackupInfo): curr is IFolderBackupInfo;
export declare function isWorkspaceBackupInfo(curr: IWorkspaceBackupInfo | IFolderBackupInfo): curr is IWorkspaceBackupInfo;
