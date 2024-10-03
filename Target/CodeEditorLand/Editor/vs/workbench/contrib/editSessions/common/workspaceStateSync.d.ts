import { CancellationToken } from '../../../../base/common/cancellation.js';
import { URI } from '../../../../base/common/uri.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IUserDataProfile } from '../../../../platform/userDataProfile/common/userDataProfile.js';
import { AbstractSynchroniser, IAcceptResult, IMergeResult, IResourcePreview, ISyncResourcePreview } from '../../../../platform/userDataSync/common/abstractSynchronizer.js';
import { IRemoteUserData, IUserDataSyncConfiguration, IUserDataSyncLogService, IUserDataSyncStoreService, IUserDataSynchroniser } from '../../../../platform/userDataSync/common/userDataSync.js';
import { IEditSessionsStorageService } from './editSessions.js';
import { IWorkspaceIdentityService } from '../../../services/workspaces/common/workspaceIdentityService.js';
export declare class WorkspaceStateSynchroniser extends AbstractSynchroniser implements IUserDataSynchroniser {
    private readonly workspaceIdentityService;
    private readonly editSessionsStorageService;
    protected version: number;
    constructor(profile: IUserDataProfile, collection: string | undefined, userDataSyncStoreService: IUserDataSyncStoreService, logService: IUserDataSyncLogService, fileService: IFileService, environmentService: IEnvironmentService, telemetryService: ITelemetryService, configurationService: IConfigurationService, storageService: IStorageService, uriIdentityService: IUriIdentityService, workspaceIdentityService: IWorkspaceIdentityService, editSessionsStorageService: IEditSessionsStorageService);
    sync(): Promise<void>;
    apply(): Promise<ISyncResourcePreview | null>;
    protected applyResult(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, result: [IResourcePreview, IAcceptResult][], force: boolean): Promise<void>;
    protected generateSyncPreview(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, isRemoteDataFromCurrentMachine: boolean, userDataSyncConfiguration: IUserDataSyncConfiguration, token: CancellationToken): Promise<IResourcePreview[]>;
    protected getMergeResult(resourcePreview: IResourcePreview, token: CancellationToken): Promise<IMergeResult>;
    protected getAcceptResult(resourcePreview: IResourcePreview, resource: URI, content: string | null | undefined, token: CancellationToken): Promise<IAcceptResult>;
    protected hasRemoteChanged(lastSyncUserData: IRemoteUserData): Promise<boolean>;
    hasLocalData(): Promise<boolean>;
    resolveContent(uri: URI): Promise<string | null>;
}
