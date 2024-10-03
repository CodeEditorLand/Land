import { Disposable } from '../../../base/common/lifecycle.js';
import Severity from '../../../base/common/severity.js';
import { URI } from '../../../base/common/uri.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IProductVersion, Metadata } from './extensionManagement.js';
import { ExtensionType, IExtensionManifest, TargetPlatform, IExtensionIdentifier, IRelaxedExtensionManifest, IExtensionDescription } from '../../extensions/common/extensions.js';
import { IFileService } from '../../files/common/files.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { Event } from '../../../base/common/event.js';
import { IExtensionsProfileScannerService, IProfileExtensionsScanOptions } from './extensionsProfileScannerService.js';
import { IUserDataProfile, IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
export type IScannedExtensionManifest = IRelaxedExtensionManifest & {
    __metadata?: Metadata;
};
interface IRelaxedScannedExtension {
    type: ExtensionType;
    isBuiltin: boolean;
    identifier: IExtensionIdentifier;
    manifest: IRelaxedExtensionManifest;
    location: URI;
    targetPlatform: TargetPlatform;
    publisherDisplayName?: string;
    metadata: Metadata | undefined;
    isValid: boolean;
    validations: readonly [Severity, string][];
}
export type IScannedExtension = Readonly<IRelaxedScannedExtension> & {
    manifest: IExtensionManifest;
};
export interface Translations {
    [id: string]: string;
}
export declare namespace Translations {
    function equals(a: Translations, b: Translations): boolean;
}
export type ScanOptions = {
    readonly profileLocation?: URI;
    readonly includeInvalid?: boolean;
    readonly includeAllVersions?: boolean;
    readonly includeUninstalled?: boolean;
    readonly checkControlFile?: boolean;
    readonly language?: string;
    readonly useCache?: boolean;
    readonly productVersion?: IProductVersion;
};
export declare const IExtensionsScannerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionsScannerService>;
export interface IExtensionsScannerService {
    readonly _serviceBrand: undefined;
    readonly systemExtensionsLocation: URI;
    readonly userExtensionsLocation: URI;
    readonly onDidChangeCache: Event<ExtensionType>;
    getTargetPlatform(): Promise<TargetPlatform>;
    scanAllExtensions(systemScanOptions: ScanOptions, userScanOptions: ScanOptions, includeExtensionsUnderDev: boolean): Promise<IScannedExtension[]>;
    scanSystemExtensions(scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanUserExtensions(scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanExtensionsUnderDevelopment(scanOptions: ScanOptions, existingExtensions: IScannedExtension[]): Promise<IScannedExtension[]>;
    scanExistingExtension(extensionLocation: URI, extensionType: ExtensionType, scanOptions: ScanOptions): Promise<IScannedExtension | null>;
    scanOneOrMultipleExtensions(extensionLocation: URI, extensionType: ExtensionType, scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanMultipleExtensions(extensionLocations: URI[], extensionType: ExtensionType, scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanMetadata(extensionLocation: URI): Promise<Metadata | undefined>;
    updateMetadata(extensionLocation: URI, metadata: Partial<Metadata>): Promise<void>;
    initializeDefaultProfileExtensions(): Promise<void>;
}
export declare abstract class AbstractExtensionsScannerService extends Disposable implements IExtensionsScannerService {
    readonly systemExtensionsLocation: URI;
    readonly userExtensionsLocation: URI;
    private readonly extensionsControlLocation;
    private readonly currentProfile;
    private readonly userDataProfilesService;
    protected readonly extensionsProfileScannerService: IExtensionsProfileScannerService;
    protected readonly fileService: IFileService;
    protected readonly logService: ILogService;
    private readonly environmentService;
    private readonly productService;
    private readonly uriIdentityService;
    private readonly instantiationService;
    readonly _serviceBrand: undefined;
    protected abstract getTranslations(language: string): Promise<Translations>;
    private readonly _onDidChangeCache;
    readonly onDidChangeCache: Event<ExtensionType>;
    private readonly obsoleteFile;
    private readonly systemExtensionsCachedScanner;
    private readonly userExtensionsCachedScanner;
    private readonly extensionsScanner;
    constructor(systemExtensionsLocation: URI, userExtensionsLocation: URI, extensionsControlLocation: URI, currentProfile: IUserDataProfile, userDataProfilesService: IUserDataProfilesService, extensionsProfileScannerService: IExtensionsProfileScannerService, fileService: IFileService, logService: ILogService, environmentService: IEnvironmentService, productService: IProductService, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    private _targetPlatformPromise;
    getTargetPlatform(): Promise<TargetPlatform>;
    scanAllExtensions(systemScanOptions: ScanOptions, userScanOptions: ScanOptions, includeExtensionsUnderDev: boolean): Promise<IScannedExtension[]>;
    scanSystemExtensions(scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanUserExtensions(scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanExtensionsUnderDevelopment(scanOptions: ScanOptions, existingExtensions: IScannedExtension[]): Promise<IScannedExtension[]>;
    scanExistingExtension(extensionLocation: URI, extensionType: ExtensionType, scanOptions: ScanOptions): Promise<IScannedExtension | null>;
    scanOneOrMultipleExtensions(extensionLocation: URI, extensionType: ExtensionType, scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanMultipleExtensions(extensionLocations: URI[], extensionType: ExtensionType, scanOptions: ScanOptions): Promise<IScannedExtension[]>;
    scanMetadata(extensionLocation: URI): Promise<Metadata | undefined>;
    updateMetadata(extensionLocation: URI, metaData: Partial<Metadata>): Promise<void>;
    initializeDefaultProfileExtensions(): Promise<void>;
    private initializeDefaultProfileExtensionsPromise;
    private doInitializeDefaultProfileExtensions;
    private applyScanOptions;
    private dedupExtensions;
    private scanDefaultSystemExtensions;
    private scanDevSystemExtensions;
    private getBuiltInExtensionControl;
    private createExtensionScannerInput;
    private getMtime;
    private getProductVersion;
}
export declare class ExtensionScannerInput {
    readonly location: URI;
    readonly mtime: number | undefined;
    readonly applicationExtensionslocation: URI | undefined;
    readonly applicationExtensionslocationMtime: number | undefined;
    readonly profile: boolean;
    readonly profileScanOptions: IProfileExtensionsScanOptions | undefined;
    readonly type: ExtensionType;
    readonly excludeObsolete: boolean;
    readonly validate: boolean;
    readonly productVersion: string;
    readonly productDate: string | undefined;
    readonly productCommit: string | undefined;
    readonly devMode: boolean;
    readonly language: string | undefined;
    readonly translations: Translations;
    constructor(location: URI, mtime: number | undefined, applicationExtensionslocation: URI | undefined, applicationExtensionslocationMtime: number | undefined, profile: boolean, profileScanOptions: IProfileExtensionsScanOptions | undefined, type: ExtensionType, excludeObsolete: boolean, validate: boolean, productVersion: string, productDate: string | undefined, productCommit: string | undefined, devMode: boolean, language: string | undefined, translations: Translations);
    static createNlsConfiguration(input: ExtensionScannerInput): NlsConfiguration;
    static equals(a: ExtensionScannerInput, b: ExtensionScannerInput): boolean;
}
type NlsConfiguration = {
    language: string | undefined;
    pseudo: boolean;
    devMode: boolean;
    translations: Translations;
};
export declare function toExtensionDescription(extension: IScannedExtension, isUnderDevelopment: boolean): IExtensionDescription;
export declare class NativeExtensionsScannerService extends AbstractExtensionsScannerService implements IExtensionsScannerService {
    private readonly translationsPromise;
    constructor(systemExtensionsLocation: URI, userExtensionsLocation: URI, userHome: URI, currentProfile: IUserDataProfile, userDataProfilesService: IUserDataProfilesService, extensionsProfileScannerService: IExtensionsProfileScannerService, fileService: IFileService, logService: ILogService, environmentService: IEnvironmentService, productService: IProductService, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    protected getTranslations(language: string): Promise<Translations>;
}
export {};
