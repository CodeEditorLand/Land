import { CancellationToken } from '../../../base/common/cancellation.js';
import { URI } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfile, IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { AbstractSynchroniser, IAcceptResult, IMergeResult, IResourcePreview } from './abstractSynchronizer.js';
import { IRemoteUserData, IUserDataSyncLocalStoreService, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, ISyncUserDataProfile, ISyncData, IUserDataResourceManifest } from './userDataSync.js';
interface IUserDataProfileManifestResourceMergeResult extends IAcceptResult {
    readonly local: {
        added: ISyncUserDataProfile[];
        removed: IUserDataProfile[];
        updated: ISyncUserDataProfile[];
    };
    readonly remote: {
        added: IUserDataProfile[];
        removed: ISyncUserDataProfile[];
        updated: IUserDataProfile[];
    } | null;
}
interface IUserDataProfilesManifestResourcePreview extends IResourcePreview {
    readonly previewResult: IUserDataProfileManifestResourceMergeResult;
    readonly remoteProfiles: ISyncUserDataProfile[] | null;
}
export declare class UserDataProfilesManifestSynchroniser extends AbstractSynchroniser implements IUserDataSynchroniser {
    private readonly userDataProfilesService;
    protected readonly version: number;
    readonly previewResource: URI;
    readonly baseResource: URI;
    readonly localResource: URI;
    readonly remoteResource: URI;
    readonly acceptedResource: URI;
    constructor(profile: IUserDataProfile, collection: string | undefined, userDataProfilesService: IUserDataProfilesService, fileService: IFileService, environmentService: IEnvironmentService, storageService: IStorageService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncLocalStoreService: IUserDataSyncLocalStoreService, logService: IUserDataSyncLogService, configurationService: IConfigurationService, userDataSyncEnablementService: IUserDataSyncEnablementService, telemetryService: ITelemetryService, uriIdentityService: IUriIdentityService);
    getLastSyncedProfiles(): Promise<ISyncUserDataProfile[] | null>;
    getRemoteSyncedProfiles(manifest: IUserDataResourceManifest | null): Promise<ISyncUserDataProfile[] | null>;
    protected generateSyncPreview(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, isRemoteDataFromCurrentMachine: boolean): Promise<IUserDataProfilesManifestResourcePreview[]>;
    protected hasRemoteChanged(lastSyncUserData: IRemoteUserData): Promise<boolean>;
    protected getMergeResult(resourcePreview: IUserDataProfilesManifestResourcePreview, token: CancellationToken): Promise<IMergeResult>;
    protected getAcceptResult(resourcePreview: IUserDataProfilesManifestResourcePreview, resource: URI, content: string | null | undefined, token: CancellationToken): Promise<IAcceptResult>;
    private acceptLocal;
    private acceptRemote;
    protected applyResult(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, resourcePreviews: [IUserDataProfilesManifestResourcePreview, IUserDataProfileManifestResourceMergeResult][], force: boolean): Promise<void>;
    updateRemoteProfiles(profiles: ISyncUserDataProfile[], ref: string | null): Promise<IRemoteUserData>;
    hasLocalData(): Promise<boolean>;
    resolveContent(uri: URI): Promise<string | null>;
    private getLocalUserDataProfiles;
    private stringifyRemoteProfiles;
}
export declare function stringifyLocalProfiles(profiles: IUserDataProfile[], format: boolean): string;
export declare function parseUserDataProfilesManifest(syncData: ISyncData): ISyncUserDataProfile[];
export {};
