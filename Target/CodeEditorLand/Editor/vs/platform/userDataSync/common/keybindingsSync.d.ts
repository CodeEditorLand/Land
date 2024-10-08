import { CancellationToken } from '../../../base/common/cancellation.js';
import { URI } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfile, IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { AbstractInitializer, AbstractJsonFileSynchroniser, IAcceptResult, IFileResourcePreview, IMergeResult } from './abstractSynchronizer.js';
import { IRemoteUserData, IUserDataSyncLocalStoreService, IUserDataSyncConfiguration, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, IUserDataSyncUtilService } from './userDataSync.js';
interface IKeybindingsResourcePreview extends IFileResourcePreview {
    previewResult: IMergeResult;
}
interface ILastSyncUserData extends IRemoteUserData {
    platformSpecific?: boolean;
}
export declare function getKeybindingsContentFromSyncContent(syncContent: string, platformSpecific: boolean, logService: ILogService): string | null;
export declare class KeybindingsSynchroniser extends AbstractJsonFileSynchroniser implements IUserDataSynchroniser {
    protected readonly version: number;
    private readonly previewResource;
    private readonly baseResource;
    private readonly localResource;
    private readonly remoteResource;
    private readonly acceptedResource;
    constructor(profile: IUserDataProfile, collection: string | undefined, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncLocalStoreService: IUserDataSyncLocalStoreService, logService: IUserDataSyncLogService, configurationService: IConfigurationService, userDataSyncEnablementService: IUserDataSyncEnablementService, fileService: IFileService, environmentService: IEnvironmentService, storageService: IStorageService, userDataSyncUtilService: IUserDataSyncUtilService, telemetryService: ITelemetryService, uriIdentityService: IUriIdentityService);
    protected generateSyncPreview(remoteUserData: IRemoteUserData, lastSyncUserData: ILastSyncUserData | null, isRemoteDataFromCurrentMachine: boolean, userDataSyncConfiguration: IUserDataSyncConfiguration): Promise<IKeybindingsResourcePreview[]>;
    protected hasRemoteChanged(lastSyncUserData: IRemoteUserData): Promise<boolean>;
    protected getMergeResult(resourcePreview: IKeybindingsResourcePreview, token: CancellationToken): Promise<IMergeResult>;
    protected getAcceptResult(resourcePreview: IKeybindingsResourcePreview, resource: URI, content: string | null | undefined, token: CancellationToken): Promise<IAcceptResult>;
    protected applyResult(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, resourcePreviews: [IKeybindingsResourcePreview, IAcceptResult][], force: boolean): Promise<void>;
    hasLocalData(): Promise<boolean>;
    resolveContent(uri: URI): Promise<string | null>;
    private getKeybindingsContentFromLastSyncUserData;
    private toSyncContent;
    private syncKeybindingsPerPlatform;
}
export declare class KeybindingsInitializer extends AbstractInitializer {
    constructor(fileService: IFileService, userDataProfilesService: IUserDataProfilesService, environmentService: IEnvironmentService, logService: IUserDataSyncLogService, storageService: IStorageService, uriIdentityService: IUriIdentityService);
    protected doInitialize(remoteUserData: IRemoteUserData): Promise<void>;
    private isEmpty;
    private getKeybindingsContentFromSyncContent;
}
export {};
