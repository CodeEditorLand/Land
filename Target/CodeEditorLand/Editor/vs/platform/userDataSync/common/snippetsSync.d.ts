import { CancellationToken } from '../../../base/common/cancellation.js';
import { IStringDictionary } from '../../../base/common/collections.js';
import { URI } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfile, IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { AbstractInitializer, AbstractSynchroniser, IAcceptResult, IFileResourcePreview, IMergeResult } from './abstractSynchronizer.js';
import { IRemoteUserData, ISyncData, IUserDataSyncLocalStoreService, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService } from './userDataSync.js';
interface ISnippetsResourcePreview extends IFileResourcePreview {
    previewResult: IMergeResult;
}
export declare function parseSnippets(syncData: ISyncData): IStringDictionary<string>;
export declare class SnippetsSynchroniser extends AbstractSynchroniser implements IUserDataSynchroniser {
    protected readonly version: number;
    private readonly snippetsFolder;
    constructor(profile: IUserDataProfile, collection: string | undefined, environmentService: IEnvironmentService, fileService: IFileService, storageService: IStorageService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncLocalStoreService: IUserDataSyncLocalStoreService, logService: IUserDataSyncLogService, configurationService: IConfigurationService, userDataSyncEnablementService: IUserDataSyncEnablementService, telemetryService: ITelemetryService, uriIdentityService: IUriIdentityService);
    protected generateSyncPreview(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, isRemoteDataFromCurrentMachine: boolean): Promise<ISnippetsResourcePreview[]>;
    protected hasRemoteChanged(lastSyncUserData: IRemoteUserData): Promise<boolean>;
    protected getMergeResult(resourcePreview: ISnippetsResourcePreview, token: CancellationToken): Promise<IMergeResult>;
    protected getAcceptResult(resourcePreview: ISnippetsResourcePreview, resource: URI, content: string | null | undefined, token: CancellationToken): Promise<IAcceptResult>;
    protected applyResult(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, resourcePreviews: [ISnippetsResourcePreview, IAcceptResult][], force: boolean): Promise<void>;
    private getResourcePreviews;
    resolveContent(uri: URI): Promise<string | null>;
    hasLocalData(): Promise<boolean>;
    private updateLocalBackup;
    private updateLocalSnippets;
    private updateRemoteSnippets;
    private parseSnippets;
    private toSnippetsContents;
    private getSnippetsFileContents;
}
export declare class SnippetsInitializer extends AbstractInitializer {
    constructor(fileService: IFileService, userDataProfilesService: IUserDataProfilesService, environmentService: IEnvironmentService, logService: IUserDataSyncLogService, storageService: IStorageService, uriIdentityService: IUriIdentityService);
    protected doInitialize(remoteUserData: IRemoteUserData): Promise<void>;
    private isEmpty;
}
export {};
