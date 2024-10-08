import { CancellationToken } from '../../../base/common/cancellation.js';
import { URI } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IExtensionManagementService } from '../../extensionManagement/common/extensionManagement.js';
import { IFileService } from '../../files/common/files.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfile, IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { AbstractInitializer, AbstractJsonFileSynchroniser, IAcceptResult, IFileResourcePreview, IMergeResult } from './abstractSynchronizer.js';
import { IRemoteUserData, IUserDataSyncLocalStoreService, IUserDataSyncConfiguration, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, IUserDataSyncUtilService, IUserDataResourceManifest } from './userDataSync.js';
interface ISettingsResourcePreview extends IFileResourcePreview {
    previewResult: IMergeResult;
}
export interface ISettingsSyncContent {
    settings: string;
}
export declare function parseSettingsSyncContent(syncContent: string): ISettingsSyncContent;
export declare class SettingsSynchroniser extends AbstractJsonFileSynchroniser implements IUserDataSynchroniser {
    private readonly profile;
    private readonly extensionManagementService;
    protected readonly version: number;
    readonly previewResource: URI;
    readonly baseResource: URI;
    readonly localResource: URI;
    readonly remoteResource: URI;
    readonly acceptedResource: URI;
    constructor(profile: IUserDataProfile, collection: string | undefined, fileService: IFileService, environmentService: IEnvironmentService, storageService: IStorageService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncLocalStoreService: IUserDataSyncLocalStoreService, logService: IUserDataSyncLogService, userDataSyncUtilService: IUserDataSyncUtilService, configurationService: IConfigurationService, userDataSyncEnablementService: IUserDataSyncEnablementService, telemetryService: ITelemetryService, extensionManagementService: IExtensionManagementService, uriIdentityService: IUriIdentityService);
    getRemoteUserDataSyncConfiguration(manifest: IUserDataResourceManifest | null): Promise<IUserDataSyncConfiguration>;
    protected generateSyncPreview(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, isRemoteDataFromCurrentMachine: boolean): Promise<ISettingsResourcePreview[]>;
    protected hasRemoteChanged(lastSyncUserData: IRemoteUserData): Promise<boolean>;
    protected getMergeResult(resourcePreview: ISettingsResourcePreview, token: CancellationToken): Promise<IMergeResult>;
    protected getAcceptResult(resourcePreview: ISettingsResourcePreview, resource: URI, content: string | null | undefined, token: CancellationToken): Promise<IAcceptResult>;
    protected applyResult(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, resourcePreviews: [ISettingsResourcePreview, IAcceptResult][], force: boolean): Promise<void>;
    hasLocalData(): Promise<boolean>;
    resolveContent(uri: URI): Promise<string | null>;
    protected resolvePreviewContent(resource: URI): Promise<string | null>;
    private getSettingsSyncContent;
    private parseSettingsSyncContent;
    private toSettingsSyncContent;
    private coreIgnoredSettings;
    private systemExtensionsIgnoredSettings;
    private userExtensionsIgnoredSettings;
    private getIgnoredSettings;
    private getIgnoredSettingForSystemExtensions;
    private getIgnoredSettingForUserExtensions;
    private validateContent;
}
export declare class SettingsInitializer extends AbstractInitializer {
    constructor(fileService: IFileService, userDataProfilesService: IUserDataProfilesService, environmentService: IEnvironmentService, logService: IUserDataSyncLogService, storageService: IStorageService, uriIdentityService: IUriIdentityService);
    protected doInitialize(remoteUserData: IRemoteUserData): Promise<void>;
    private isEmpty;
    private parseSettingsSyncContent;
}
export {};
