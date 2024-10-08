import { IStorage } from '../../../base/parts/storage/common/storage.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IRemoteService } from '../../ipc/common/services.js';
import { AbstractStorageService, StorageScope } from './storage.js';
import { IUserDataProfile } from '../../userDataProfile/common/userDataProfile.js';
import { IAnyWorkspaceIdentifier } from '../../workspace/common/workspace.js';
export declare class RemoteStorageService extends AbstractStorageService {
    private readonly initialWorkspace;
    private readonly initialProfiles;
    private readonly remoteService;
    private readonly environmentService;
    private readonly applicationStorageProfile;
    private readonly applicationStorage;
    private profileStorageProfile;
    private readonly profileStorageDisposables;
    private profileStorage;
    private workspaceStorageId;
    private readonly workspaceStorageDisposables;
    private workspaceStorage;
    constructor(initialWorkspace: IAnyWorkspaceIdentifier | undefined, initialProfiles: {
        defaultProfile: IUserDataProfile;
        currentProfile: IUserDataProfile;
    }, remoteService: IRemoteService, environmentService: IEnvironmentService);
    private createApplicationStorage;
    private createProfileStorage;
    private createWorkspaceStorage;
    protected doInitialize(): Promise<void>;
    protected getStorage(scope: StorageScope): IStorage | undefined;
    protected getLogDetails(scope: StorageScope): string | undefined;
    close(): Promise<void>;
    protected switchToProfile(toProfile: IUserDataProfile): Promise<void>;
    protected switchToWorkspace(toWorkspace: IAnyWorkspaceIdentifier, preserveData: boolean): Promise<void>;
    hasScope(scope: IAnyWorkspaceIdentifier | IUserDataProfile): boolean;
}
