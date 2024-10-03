import { CancellationToken } from '../../../base/common/cancellation.js';
import { IStringDictionary } from '../../../base/common/collections.js';
import { URI } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { AbstractInitializer, AbstractSynchroniser, IAcceptResult, IMergeResult, IResourcePreview } from './abstractSynchronizer.js';
import { IGlobalState, IRemoteUserData, IStorageValue, IUserData, IUserDataSyncLocalStoreService, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, UserDataSyncStoreType } from './userDataSync.js';
import { UserDataSyncStoreClient } from './userDataSyncStoreService.js';
import { IUserDataProfile, IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { IUserDataProfileStorageService } from '../../userDataProfile/common/userDataProfileStorageService.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
type StorageKeys = {
    machine: string[];
    user: string[];
    unregistered: string[];
};
interface IGlobalStateResourceMergeResult extends IAcceptResult {
    readonly local: {
        added: IStringDictionary<IStorageValue>;
        removed: string[];
        updated: IStringDictionary<IStorageValue>;
    };
    readonly remote: {
        added: string[];
        removed: string[];
        updated: string[];
        all: IStringDictionary<IStorageValue> | null;
    };
}
interface IGlobalStateResourcePreview extends IResourcePreview {
    readonly localUserData: IGlobalState;
    readonly previewResult: IGlobalStateResourceMergeResult;
    readonly storageKeys: StorageKeys;
}
export declare function stringify(globalState: IGlobalState, format: boolean): string;
export declare class GlobalStateSynchroniser extends AbstractSynchroniser implements IUserDataSynchroniser {
    private readonly userDataProfileStorageService;
    protected readonly version: number;
    private readonly previewResource;
    private readonly baseResource;
    private readonly localResource;
    private readonly remoteResource;
    private readonly acceptedResource;
    private readonly localGlobalStateProvider;
    constructor(profile: IUserDataProfile, collection: string | undefined, userDataProfileStorageService: IUserDataProfileStorageService, fileService: IFileService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncLocalStoreService: IUserDataSyncLocalStoreService, logService: IUserDataSyncLogService, environmentService: IEnvironmentService, userDataSyncEnablementService: IUserDataSyncEnablementService, telemetryService: ITelemetryService, configurationService: IConfigurationService, storageService: IStorageService, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    protected generateSyncPreview(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, isRemoteDataFromCurrentMachine: boolean): Promise<IGlobalStateResourcePreview[]>;
    protected hasRemoteChanged(lastSyncUserData: IRemoteUserData): Promise<boolean>;
    protected getMergeResult(resourcePreview: IGlobalStateResourcePreview, token: CancellationToken): Promise<IMergeResult>;
    protected getAcceptResult(resourcePreview: IGlobalStateResourcePreview, resource: URI, content: string | null | undefined, token: CancellationToken): Promise<IGlobalStateResourceMergeResult>;
    private acceptLocal;
    private acceptRemote;
    protected applyResult(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, resourcePreviews: [IGlobalStateResourcePreview, IGlobalStateResourceMergeResult][], force: boolean): Promise<void>;
    resolveContent(uri: URI): Promise<string | null>;
    hasLocalData(): Promise<boolean>;
    private getStorageKeys;
}
export declare class LocalGlobalStateProvider {
    private readonly fileService;
    private readonly environmentService;
    private readonly userDataProfileStorageService;
    private readonly logService;
    constructor(fileService: IFileService, environmentService: IEnvironmentService, userDataProfileStorageService: IUserDataProfileStorageService, logService: IUserDataSyncLogService);
    getLocalGlobalState(profile: IUserDataProfile): Promise<IGlobalState>;
    private getLocalArgvContent;
    writeLocalGlobalState({ added, removed, updated }: {
        added: IStringDictionary<IStorageValue>;
        updated: IStringDictionary<IStorageValue>;
        removed: string[];
    }, profile: IUserDataProfile): Promise<void>;
}
export declare class GlobalStateInitializer extends AbstractInitializer {
    constructor(storageService: IStorageService, fileService: IFileService, userDataProfilesService: IUserDataProfilesService, environmentService: IEnvironmentService, logService: IUserDataSyncLogService, uriIdentityService: IUriIdentityService);
    protected doInitialize(remoteUserData: IRemoteUserData): Promise<void>;
}
export declare class UserDataSyncStoreTypeSynchronizer {
    private readonly userDataSyncStoreClient;
    private readonly storageService;
    private readonly environmentService;
    private readonly fileService;
    private readonly logService;
    constructor(userDataSyncStoreClient: UserDataSyncStoreClient, storageService: IStorageService, environmentService: IEnvironmentService, fileService: IFileService, logService: ILogService);
    getSyncStoreType(userData: IUserData): UserDataSyncStoreType | undefined;
    sync(userDataSyncStoreType: UserDataSyncStoreType): Promise<void>;
    private doSync;
    private parseGlobalState;
}
export {};
