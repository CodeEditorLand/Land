import { IEmptyWindowBackupInfo } from '../node/backup.js';
import { IFolderBackupInfo, IWorkspaceBackupInfo } from '../common/backup.js';
export declare const IBackupMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IBackupMainService>;
export interface IBackupMainService {
    readonly _serviceBrand: undefined;
    isHotExitEnabled(): boolean;
    getEmptyWindowBackups(): IEmptyWindowBackupInfo[];
    registerWorkspaceBackup(workspaceInfo: IWorkspaceBackupInfo): string;
    registerWorkspaceBackup(workspaceInfo: IWorkspaceBackupInfo, migrateFrom: string): Promise<string>;
    registerFolderBackup(folderInfo: IFolderBackupInfo): string;
    registerEmptyWindowBackup(emptyWindowInfo: IEmptyWindowBackupInfo): string;
    /**
     * All folders or workspaces that are known to have
     * backups stored. This call is long running because
     * it checks for each backup location if any backups
     * are stored.
     */
    getDirtyWorkspaces(): Promise<Array<IWorkspaceBackupInfo | IFolderBackupInfo>>;
}
