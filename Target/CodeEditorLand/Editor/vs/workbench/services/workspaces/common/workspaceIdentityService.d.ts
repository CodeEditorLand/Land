import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IWorkspaceStateFolder } from '../../../../platform/userDataSync/common/userDataSync.js';
import { IEditSessionIdentityService } from '../../../../platform/workspace/common/editSessions.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
export declare const IWorkspaceIdentityService: import("../../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IWorkspaceIdentityService>;
export interface IWorkspaceIdentityService {
    _serviceBrand: undefined;
    matches(folders: IWorkspaceStateFolder[], cancellationToken: CancellationToken): Promise<((obj: any) => unknown) | false>;
    getWorkspaceStateFolders(cancellationToken: CancellationToken): Promise<IWorkspaceStateFolder[]>;
}
export declare class WorkspaceIdentityService implements IWorkspaceIdentityService {
    private readonly workspaceContextService;
    private readonly editSessionIdentityService;
    _serviceBrand: undefined;
    constructor(workspaceContextService: IWorkspaceContextService, editSessionIdentityService: IEditSessionIdentityService);
    getWorkspaceStateFolders(cancellationToken: CancellationToken): Promise<IWorkspaceStateFolder[]>;
    matches(incomingWorkspaceFolders: IWorkspaceStateFolder[], cancellationToken: CancellationToken): Promise<((value: any) => unknown) | false>;
}
