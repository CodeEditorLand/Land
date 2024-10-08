import { Event as CommonEvent } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { IApplicationStorageMainService } from '../../storage/electron-main/storageMainService.js';
import { IRecent, IRecentlyOpened } from '../common/workspaces.js';
import { IWorkspacesManagementMainService } from './workspacesManagementMainService.js';
import { IDialogMainService } from '../../dialogs/electron-main/dialogMainService.js';
export declare const IWorkspacesHistoryMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IWorkspacesHistoryMainService>;
export interface IWorkspacesHistoryMainService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeRecentlyOpened: CommonEvent<void>;
    addRecentlyOpened(recents: IRecent[]): Promise<void>;
    getRecentlyOpened(): Promise<IRecentlyOpened>;
    removeRecentlyOpened(paths: URI[]): Promise<void>;
    clearRecentlyOpened(options?: {
        confirm?: boolean;
    }): Promise<void>;
}
export declare class WorkspacesHistoryMainService extends Disposable implements IWorkspacesHistoryMainService {
    private readonly logService;
    private readonly workspacesManagementMainService;
    private readonly lifecycleMainService;
    private readonly applicationStorageMainService;
    private readonly dialogMainService;
    private static readonly MAX_TOTAL_RECENT_ENTRIES;
    private static readonly RECENTLY_OPENED_STORAGE_KEY;
    readonly _serviceBrand: undefined;
    private readonly _onDidChangeRecentlyOpened;
    readonly onDidChangeRecentlyOpened: CommonEvent<void>;
    constructor(logService: ILogService, workspacesManagementMainService: IWorkspacesManagementMainService, lifecycleMainService: ILifecycleMainService, applicationStorageMainService: IApplicationStorageMainService, dialogMainService: IDialogMainService);
    private registerListeners;
    addRecentlyOpened(recentToAdd: IRecent[]): Promise<void>;
    removeRecentlyOpened(recentToRemove: URI[]): Promise<void>;
    clearRecentlyOpened(options?: {
        confirm?: boolean;
    }): Promise<void>;
    getRecentlyOpened(): Promise<IRecentlyOpened>;
    private mergeEntriesFromStorage;
    private getRecentlyOpenedFromStorage;
    private saveRecentlyOpened;
    private location;
    private containsWorkspace;
    private containsFolder;
    private containsFile;
    private static readonly MAX_MACOS_DOCK_RECENT_WORKSPACES;
    private static readonly MAX_MACOS_DOCK_RECENT_ENTRIES_TOTAL;
    private static readonly MAX_WINDOWS_JUMP_LIST_ENTRIES;
    private static readonly COMMON_FILES_FILTER;
    private readonly macOSRecentDocumentsUpdater;
    private handleWindowsJumpList;
    private updateWindowsJumpList;
    private getWindowsJumpListLabel;
    private renderJumpListPathDescription;
    private updateMacOSRecentDocuments;
}
