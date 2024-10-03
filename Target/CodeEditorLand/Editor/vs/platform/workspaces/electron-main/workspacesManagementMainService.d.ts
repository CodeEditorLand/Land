import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { IBackupMainService } from '../../backup/electron-main/backup.js';
import { IDialogMainService } from '../../dialogs/electron-main/dialogMainService.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILogService } from '../../log/common/log.js';
import { IUserDataProfilesMainService } from '../../userDataProfile/electron-main/userDataProfile.js';
import { ICodeWindow } from '../../window/electron-main/window.js';
import { IWorkspaceIdentifier, IResolvedWorkspace } from '../../workspace/common/workspace.js';
import { IEnterWorkspaceResult, IUntitledWorkspaceInfo, IWorkspaceFolderCreationData } from '../common/workspaces.js';
export declare const IWorkspacesManagementMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IWorkspacesManagementMainService>;
export interface IWorkspaceEnteredEvent {
    readonly window: ICodeWindow;
    readonly workspace: IWorkspaceIdentifier;
}
export interface IWorkspacesManagementMainService {
    readonly _serviceBrand: undefined;
    readonly onDidDeleteUntitledWorkspace: Event<IWorkspaceIdentifier>;
    readonly onDidEnterWorkspace: Event<IWorkspaceEnteredEvent>;
    enterWorkspace(intoWindow: ICodeWindow, openedWindows: ICodeWindow[], path: URI): Promise<IEnterWorkspaceResult | undefined>;
    createUntitledWorkspace(folders?: IWorkspaceFolderCreationData[], remoteAuthority?: string): Promise<IWorkspaceIdentifier>;
    deleteUntitledWorkspace(workspace: IWorkspaceIdentifier): Promise<void>;
    getUntitledWorkspaces(): IUntitledWorkspaceInfo[];
    isUntitledWorkspace(workspace: IWorkspaceIdentifier): boolean;
    resolveLocalWorkspace(path: URI): Promise<IResolvedWorkspace | undefined>;
    getWorkspaceIdentifier(workspacePath: URI): Promise<IWorkspaceIdentifier>;
}
export declare class WorkspacesManagementMainService extends Disposable implements IWorkspacesManagementMainService {
    private readonly environmentMainService;
    private readonly logService;
    private readonly userDataProfilesMainService;
    private readonly backupMainService;
    private readonly dialogMainService;
    readonly _serviceBrand: undefined;
    private readonly _onDidDeleteUntitledWorkspace;
    readonly onDidDeleteUntitledWorkspace: Event<IWorkspaceIdentifier>;
    private readonly _onDidEnterWorkspace;
    readonly onDidEnterWorkspace: Event<IWorkspaceEnteredEvent>;
    private readonly untitledWorkspacesHome;
    private untitledWorkspaces;
    constructor(environmentMainService: IEnvironmentMainService, logService: ILogService, userDataProfilesMainService: IUserDataProfilesMainService, backupMainService: IBackupMainService, dialogMainService: IDialogMainService);
    initialize(): Promise<void>;
    resolveLocalWorkspace(uri: URI): Promise<IResolvedWorkspace | undefined>;
    private doResolveLocalWorkspace;
    private isWorkspacePath;
    private doResolveWorkspace;
    private doParseStoredWorkspace;
    createUntitledWorkspace(folders?: IWorkspaceFolderCreationData[], remoteAuthority?: string): Promise<IWorkspaceIdentifier>;
    private newUntitledWorkspace;
    getWorkspaceIdentifier(configPath: URI): Promise<IWorkspaceIdentifier>;
    isUntitledWorkspace(workspace: IWorkspaceIdentifier): boolean;
    deleteUntitledWorkspace(workspace: IWorkspaceIdentifier): Promise<void>;
    private doDeleteUntitledWorkspace;
    getUntitledWorkspaces(): IUntitledWorkspaceInfo[];
    enterWorkspace(window: ICodeWindow, windows: ICodeWindow[], path: URI): Promise<IEnterWorkspaceResult | undefined>;
    private isValidTargetWorkspacePath;
    private doEnterWorkspace;
}
