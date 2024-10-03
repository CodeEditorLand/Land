import { CancellationToken } from '../../../base/common/cancellation.js';
import { IPager } from '../../../base/common/paging.js';
import { URI } from '../../../base/common/uri.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IExtensionGalleryService, IExtensionIdentifier, IExtensionInfo, IGalleryExtension, IGalleryExtensionVersion, InstallOperation, IQueryOptions, IExtensionsControlManifest, ITranslation, StatisticType, IExtensionQueryOptions, IProductVersion } from './extensionManagement.js';
import { IExtensionManifest, TargetPlatform } from '../../extensions/common/extensions.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { IRequestService } from '../../request/common/request.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
interface IRawGalleryExtensionFile {
    readonly assetType: string;
    readonly source: string;
}
interface IRawGalleryExtensionProperty {
    readonly key: string;
    readonly value: string;
}
export interface IRawGalleryExtensionVersion {
    readonly version: string;
    readonly lastUpdated: string;
    readonly assetUri: string;
    readonly fallbackAssetUri: string;
    readonly files: IRawGalleryExtensionFile[];
    readonly properties?: IRawGalleryExtensionProperty[];
    readonly targetPlatform?: string;
}
export declare function sortExtensionVersions(versions: IRawGalleryExtensionVersion[], preferredTargetPlatform: TargetPlatform): IRawGalleryExtensionVersion[];
declare abstract class AbstractExtensionGalleryService implements IExtensionGalleryService {
    private readonly requestService;
    private readonly logService;
    private readonly environmentService;
    private readonly telemetryService;
    private readonly fileService;
    private readonly productService;
    private readonly configurationService;
    readonly _serviceBrand: undefined;
    private readonly extensionsGalleryUrl;
    private readonly extensionsGallerySearchUrl;
    private readonly extensionsControlUrl;
    private readonly commonHeadersPromise;
    private readonly extensionsEnabledWithApiProposalVersion;
    constructor(storageService: IStorageService | undefined, requestService: IRequestService, logService: ILogService, environmentService: IEnvironmentService, telemetryService: ITelemetryService, fileService: IFileService, productService: IProductService, configurationService: IConfigurationService);
    private api;
    isEnabled(): boolean;
    getExtensions(extensionInfos: ReadonlyArray<IExtensionInfo>, token: CancellationToken): Promise<IGalleryExtension[]>;
    getExtensions(extensionInfos: ReadonlyArray<IExtensionInfo>, options: IExtensionQueryOptions, token: CancellationToken): Promise<IGalleryExtension[]>;
    private doGetExtensions;
    getCompatibleExtension(extension: IGalleryExtension, includePreRelease: boolean, targetPlatform: TargetPlatform, productVersion?: IProductVersion): Promise<IGalleryExtension | null>;
    isExtensionCompatible(extension: IGalleryExtension, includePreRelease: boolean, targetPlatform: TargetPlatform, productVersion?: IProductVersion): Promise<boolean>;
    private areApiProposalsCompatible;
    private isValidVersion;
    query(options: IQueryOptions, token: CancellationToken): Promise<IPager<IGalleryExtension>>;
    private queryGalleryExtensions;
    private toGalleryExtensionWithCriteria;
    private queryRawGalleryExtensions;
    reportStatistic(publisher: string, name: string, version: string, type: StatisticType): Promise<void>;
    download(extension: IGalleryExtension, location: URI, operation: InstallOperation): Promise<void>;
    downloadSignatureArchive(extension: IGalleryExtension, location: URI): Promise<void>;
    getReadme(extension: IGalleryExtension, token: CancellationToken): Promise<string>;
    getManifest(extension: IGalleryExtension, token: CancellationToken): Promise<IExtensionManifest | null>;
    private getManifestFromRawExtensionVersion;
    getCoreTranslation(extension: IGalleryExtension, languageId: string): Promise<ITranslation | null>;
    getChangelog(extension: IGalleryExtension, token: CancellationToken): Promise<string>;
    getAllCompatibleVersions(extensionIdentifier: IExtensionIdentifier, includePreRelease: boolean, targetPlatform: TargetPlatform): Promise<IGalleryExtensionVersion[]>;
    private getAsset;
    private getEngine;
    getExtensionsControlManifest(): Promise<IExtensionsControlManifest>;
}
export declare class ExtensionGalleryService extends AbstractExtensionGalleryService {
    constructor(storageService: IStorageService, requestService: IRequestService, logService: ILogService, environmentService: IEnvironmentService, telemetryService: ITelemetryService, fileService: IFileService, productService: IProductService, configurationService: IConfigurationService);
}
export declare class ExtensionGalleryServiceWithNoStorageService extends AbstractExtensionGalleryService {
    constructor(requestService: IRequestService, logService: ILogService, environmentService: IEnvironmentService, telemetryService: ITelemetryService, fileService: IFileService, productService: IProductService, configurationService: IConfigurationService);
}
export {};
