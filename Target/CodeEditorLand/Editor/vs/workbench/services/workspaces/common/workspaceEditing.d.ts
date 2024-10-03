import { IWorkspaceFolderCreationData } from '../../../../platform/workspaces/common/workspaces.js';
import { URI } from '../../../../base/common/uri.js';
import { IWorkspaceIdentifier } from '../../../../platform/workspace/common/workspace.js';
export declare const IWorkspaceEditingService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkspaceEditingService>;
export interface IWorkspaceEditingService {
    readonly _serviceBrand: undefined;
    addFolders(folders: IWorkspaceFolderCreationData[], donotNotifyError?: boolean): Promise<void>;
    removeFolders(folders: URI[], donotNotifyError?: boolean): Promise<void>;
    updateFolders(index: number, deleteCount?: number, foldersToAdd?: IWorkspaceFolderCreationData[], donotNotifyError?: boolean): Promise<void>;
    enterWorkspace(path: URI): Promise<void>;
    createAndEnterWorkspace(folders: IWorkspaceFolderCreationData[], path?: URI): Promise<void>;
    saveAndEnterWorkspace(path: URI): Promise<void>;
    copyWorkspaceSettings(toWorkspace: IWorkspaceIdentifier): Promise<void>;
    pickNewWorkspacePath(): Promise<URI | undefined>;
}
