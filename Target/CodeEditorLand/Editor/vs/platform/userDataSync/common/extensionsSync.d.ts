import { CancellationToken } from '../../../base/common/cancellation.js';
import { URI } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IExtensionGalleryService, IExtensionManagementService, ILocalExtension } from '../../extensionManagement/common/extensionManagement.js';
import { IExtensionStorageService } from '../../extensionManagement/common/extensionStorage.js';
import { IExtensionIdentifier } from '../../extensions/common/extensions.js';
import { IFileService } from '../../files/common/files.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { ILogService } from '../../log/common/log.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfile, IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { AbstractInitializer, AbstractSynchroniser, IAcceptResult, IMergeResult, IResourcePreview } from './abstractSynchronizer.js';
import { IMergeResult as IExtensionMergeResult } from './extensionsMerge.js';
import { IIgnoredExtensionsManagementService } from './ignoredExtensions.js';
import { IRemoteUserData, ISyncData, ISyncExtension, IUserDataSyncLocalStoreService, IUserDataSynchroniser, IUserDataSyncLogService, IUserDataSyncEnablementService, IUserDataSyncStoreService, ILocalSyncExtension } from './userDataSync.js';
import { IUserDataProfileStorageService } from '../../userDataProfile/common/userDataProfileStorageService.js';
type IExtensionResourceMergeResult = IAcceptResult & IExtensionMergeResult;
interface IExtensionResourcePreview extends IResourcePreview {
    readonly localExtensions: ILocalSyncExtension[];
    readonly remoteExtensions: ISyncExtension[] | null;
    readonly skippedExtensions: ISyncExtension[];
    readonly builtinExtensions: IExtensionIdentifier[] | null;
    readonly previewResult: IExtensionResourceMergeResult;
}
interface ILastSyncUserData extends IRemoteUserData {
    skippedExtensions: ISyncExtension[] | undefined;
    builtinExtensions: IExtensionIdentifier[] | undefined;
}
export declare function parseExtensions(syncData: ISyncData): ISyncExtension[];
export declare function stringify(extensions: ISyncExtension[], format: boolean): string;
export declare class ExtensionsSynchroniser extends AbstractSynchroniser implements IUserDataSynchroniser {
    private readonly extensionManagementService;
    private readonly ignoredExtensionsManagementService;
    private readonly instantiationService;
    protected readonly version: number;
    private readonly previewResource;
    private readonly baseResource;
    private readonly localResource;
    private readonly remoteResource;
    private readonly acceptedResource;
    private readonly localExtensionsProvider;
    constructor(profile: IUserDataProfile, collection: string | undefined, environmentService: IEnvironmentService, fileService: IFileService, storageService: IStorageService, userDataSyncStoreService: IUserDataSyncStoreService, userDataSyncLocalStoreService: IUserDataSyncLocalStoreService, extensionManagementService: IExtensionManagementService, ignoredExtensionsManagementService: IIgnoredExtensionsManagementService, logService: IUserDataSyncLogService, configurationService: IConfigurationService, userDataSyncEnablementService: IUserDataSyncEnablementService, telemetryService: ITelemetryService, extensionStorageService: IExtensionStorageService, uriIdentityService: IUriIdentityService, userDataProfileStorageService: IUserDataProfileStorageService, instantiationService: IInstantiationService);
    protected generateSyncPreview(remoteUserData: IRemoteUserData, lastSyncUserData: ILastSyncUserData | null): Promise<IExtensionResourcePreview[]>;
    protected hasRemoteChanged(lastSyncUserData: ILastSyncUserData): Promise<boolean>;
    private getPreviewContent;
    protected getMergeResult(resourcePreview: IExtensionResourcePreview, token: CancellationToken): Promise<IMergeResult>;
    protected getAcceptResult(resourcePreview: IExtensionResourcePreview, resource: URI, content: string | null | undefined, token: CancellationToken): Promise<IExtensionResourceMergeResult>;
    private acceptLocal;
    private acceptRemote;
    protected applyResult(remoteUserData: IRemoteUserData, lastSyncUserData: IRemoteUserData | null, resourcePreviews: [IExtensionResourcePreview, IExtensionResourceMergeResult][], force: boolean): Promise<void>;
    private computeBuiltinExtensions;
    resolveContent(uri: URI): Promise<string | null>;
    private stringify;
    hasLocalData(): Promise<boolean>;
}
export declare class LocalExtensionsProvider {
    private readonly extensionManagementService;
    private readonly userDataProfileStorageService;
    private readonly extensionGalleryService;
    private readonly ignoredExtensionsManagementService;
    private readonly instantiationService;
    private readonly logService;
    constructor(extensionManagementService: IExtensionManagementService, userDataProfileStorageService: IUserDataProfileStorageService, extensionGalleryService: IExtensionGalleryService, ignoredExtensionsManagementService: IIgnoredExtensionsManagementService, instantiationService: IInstantiationService, logService: IUserDataSyncLogService);
    getLocalExtensions(profile: IUserDataProfile): Promise<{
        localExtensions: ILocalSyncExtension[];
        ignoredExtensions: string[];
    }>;
    updateLocalExtensions(added: ISyncExtension[], removed: IExtensionIdentifier[], updated: ISyncExtension[], skippedExtensions: ISyncExtension[], profile: IUserDataProfile): Promise<ISyncExtension[]>;
    private updateExtensionState;
    private withProfileScopedServices;
}
export interface IExtensionsInitializerPreviewResult {
    readonly installedExtensions: ILocalExtension[];
    readonly disabledExtensions: IExtensionIdentifier[];
    readonly newExtensions: (IExtensionIdentifier & {
        preRelease: boolean;
    })[];
    readonly remoteExtensions: ISyncExtension[];
}
export declare abstract class AbstractExtensionsInitializer extends AbstractInitializer {
    protected readonly extensionManagementService: IExtensionManagementService;
    private readonly ignoredExtensionsManagementService;
    constructor(extensionManagementService: IExtensionManagementService, ignoredExtensionsManagementService: IIgnoredExtensionsManagementService, fileService: IFileService, userDataProfilesService: IUserDataProfilesService, environmentService: IEnvironmentService, logService: ILogService, storageService: IStorageService, uriIdentityService: IUriIdentityService);
    protected parseExtensions(remoteUserData: IRemoteUserData): Promise<ISyncExtension[] | null>;
    protected generatePreview(remoteExtensions: ISyncExtension[], localExtensions: ILocalExtension[]): IExtensionsInitializerPreviewResult;
}
export {};
