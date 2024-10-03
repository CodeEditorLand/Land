import { AddFirstParameterToFunctions } from '../../../base/common/types.js';
import { URI } from '../../../base/common/uri.js';
import { IBackupMainService } from '../../backup/electron-main/backup.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
import { IEnterWorkspaceResult, IRecent, IRecentlyOpened, IWorkspaceFolderCreationData, IWorkspacesService } from '../common/workspaces.js';
import { IWorkspaceIdentifier } from '../../workspace/common/workspace.js';
import { IWorkspacesHistoryMainService } from './workspacesHistoryMainService.js';
import { IWorkspacesManagementMainService } from './workspacesManagementMainService.js';
import { IWorkspaceBackupInfo, IFolderBackupInfo } from '../../backup/common/backup.js';
export declare class WorkspacesMainService implements AddFirstParameterToFunctions<IWorkspacesService, Promise<unknown>, number> {
    private readonly workspacesManagementMainService;
    private readonly windowsMainService;
    private readonly workspacesHistoryMainService;
    private readonly backupMainService;
    readonly _serviceBrand: undefined;
    constructor(workspacesManagementMainService: IWorkspacesManagementMainService, windowsMainService: IWindowsMainService, workspacesHistoryMainService: IWorkspacesHistoryMainService, backupMainService: IBackupMainService);
    enterWorkspace(windowId: number, path: URI): Promise<IEnterWorkspaceResult | undefined>;
    createUntitledWorkspace(windowId: number, folders?: IWorkspaceFolderCreationData[], remoteAuthority?: string): Promise<IWorkspaceIdentifier>;
    deleteUntitledWorkspace(windowId: number, workspace: IWorkspaceIdentifier): Promise<void>;
    getWorkspaceIdentifier(windowId: number, workspacePath: URI): Promise<IWorkspaceIdentifier>;
    readonly onDidChangeRecentlyOpened: import("../../../workbench/workbench.web.main.internal.js").Event<void>;
    getRecentlyOpened(windowId: number): Promise<IRecentlyOpened>;
    addRecentlyOpened(windowId: number, recents: IRecent[]): Promise<void>;
    removeRecentlyOpened(windowId: number, paths: URI[]): Promise<void>;
    clearRecentlyOpened(windowId: number): Promise<void>;
    getDirtyWorkspaces(): Promise<Array<IWorkspaceBackupInfo | IFolderBackupInfo>>;
}
