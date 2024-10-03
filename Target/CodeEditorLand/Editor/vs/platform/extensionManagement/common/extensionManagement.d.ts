import { CancellationToken } from '../../../base/common/cancellation.js';
import { IStringDictionary } from '../../../base/common/collections.js';
import { Event } from '../../../base/common/event.js';
import { IPager } from '../../../base/common/paging.js';
import { Platform } from '../../../base/common/platform.js';
import { URI } from '../../../base/common/uri.js';
import { ExtensionType, IExtension, IExtensionManifest, TargetPlatform } from '../../extensions/common/extensions.js';
export declare const EXTENSION_IDENTIFIER_PATTERN = "^([a-z0-9A-Z][a-z0-9-A-Z]*)\\.([a-z0-9A-Z][a-z0-9-A-Z]*)$";
export declare const EXTENSION_IDENTIFIER_REGEX: RegExp;
export declare const WEB_EXTENSION_TAG = "__web_extension";
export declare const EXTENSION_INSTALL_SKIP_WALKTHROUGH_CONTEXT = "skipWalkthrough";
export declare const EXTENSION_INSTALL_SOURCE_CONTEXT = "extensionInstallSource";
export declare const EXTENSION_INSTALL_DEP_PACK_CONTEXT = "dependecyOrPackExtensionInstall";
export declare const EXTENSION_INSTALL_CLIENT_TARGET_PLATFORM_CONTEXT = "clientTargetPlatform";
export declare const enum ExtensionInstallSource {
    COMMAND = "command",
    SETTINGS_SYNC = "settingsSync"
}
export interface IProductVersion {
    readonly version: string;
    readonly date?: string;
}
export declare function TargetPlatformToString(targetPlatform: TargetPlatform): "Web" | "Mac" | TargetPlatform.UNIVERSAL | TargetPlatform.UNKNOWN | TargetPlatform.UNDEFINED | "Windows 64 bit" | "Windows ARM" | "Linux 64 bit" | "Linux ARM 64" | "Linux ARM" | "Alpine Linux 64 bit" | "Alpine ARM 64" | "Mac Silicon";
export declare function toTargetPlatform(targetPlatform: string): TargetPlatform;
export declare function getTargetPlatform(platform: Platform | 'alpine', arch: string | undefined): TargetPlatform;
export declare function isNotWebExtensionInWebTargetPlatform(allTargetPlatforms: TargetPlatform[], productTargetPlatform: TargetPlatform): boolean;
export declare function isTargetPlatformCompatible(extensionTargetPlatform: TargetPlatform, allTargetPlatforms: TargetPlatform[], productTargetPlatform: TargetPlatform): boolean;
export interface IGalleryExtensionProperties {
    dependencies?: string[];
    extensionPack?: string[];
    engine?: string;
    enabledApiProposals?: string[];
    localizedLanguages?: string[];
    targetPlatform: TargetPlatform;
    isPreReleaseVersion: boolean;
    executesCode?: boolean;
}
export interface IGalleryExtensionAsset {
    uri: string;
    fallbackUri: string;
}
export interface IGalleryExtensionAssets {
    manifest: IGalleryExtensionAsset | null;
    readme: IGalleryExtensionAsset | null;
    changelog: IGalleryExtensionAsset | null;
    license: IGalleryExtensionAsset | null;
    repository: IGalleryExtensionAsset | null;
    download: IGalleryExtensionAsset;
    icon: IGalleryExtensionAsset | null;
    signature: IGalleryExtensionAsset | null;
    coreTranslations: [string, IGalleryExtensionAsset][];
}
export declare function isIExtensionIdentifier(thing: any): thing is IExtensionIdentifier;
export interface IExtensionIdentifier {
    id: string;
    uuid?: string;
}
export interface IGalleryExtensionIdentifier extends IExtensionIdentifier {
    uuid: string;
}
export interface IGalleryExtensionVersion {
    version: string;
    date: string;
    isPreReleaseVersion: boolean;
}
export interface IGalleryExtension {
    type: 'gallery';
    name: string;
    identifier: IGalleryExtensionIdentifier;
    version: string;
    displayName: string;
    publisherId: string;
    publisher: string;
    publisherDisplayName: string;
    publisherDomain?: {
        link: string;
        verified: boolean;
    };
    publisherSponsorLink?: string;
    description: string;
    installCount: number;
    rating: number;
    ratingCount: number;
    categories: readonly string[];
    tags: readonly string[];
    releaseDate: number;
    lastUpdated: number;
    preview: boolean;
    hasPreReleaseVersion: boolean;
    hasReleaseVersion: boolean;
    isSigned: boolean;
    allTargetPlatforms: TargetPlatform[];
    assets: IGalleryExtensionAssets;
    properties: IGalleryExtensionProperties;
    telemetryData?: any;
    queryContext?: IStringDictionary<any>;
    supportLink?: string;
}
export type InstallSource = 'gallery' | 'vsix' | 'resource';
export interface IGalleryMetadata {
    id: string;
    publisherId: string;
    publisherDisplayName: string;
    isPreReleaseVersion: boolean;
    targetPlatform?: TargetPlatform;
}
export type Metadata = Partial<IGalleryMetadata & {
    isApplicationScoped: boolean;
    isMachineScoped: boolean;
    isBuiltin: boolean;
    isSystem: boolean;
    updated: boolean;
    preRelease: boolean;
    hasPreReleaseVersion: boolean;
    installedTimestamp: number;
    pinned: boolean;
    source: InstallSource;
}>;
export interface ILocalExtension extends IExtension {
    isWorkspaceScoped: boolean;
    isMachineScoped: boolean;
    isApplicationScoped: boolean;
    publisherId: string | null;
    installedTimestamp?: number;
    isPreReleaseVersion: boolean;
    hasPreReleaseVersion: boolean;
    preRelease: boolean;
    updated: boolean;
    pinned: boolean;
    source: InstallSource;
}
export declare const enum SortBy {
    NoneOrRelevance = 0,
    LastUpdatedDate = 1,
    Title = 2,
    PublisherName = 3,
    InstallCount = 4,
    PublishedDate = 10,
    AverageRating = 6,
    WeightedRating = 12
}
export declare const enum SortOrder {
    Default = 0,
    Ascending = 1,
    Descending = 2
}
export interface IQueryOptions {
    text?: string;
    ids?: string[];
    names?: string[];
    pageSize?: number;
    sortBy?: SortBy;
    sortOrder?: SortOrder;
    source?: string;
    includePreRelease?: boolean;
    productVersion?: IProductVersion;
}
export declare const enum StatisticType {
    Install = "install",
    Uninstall = "uninstall"
}
export interface IDeprecationInfo {
    readonly disallowInstall?: boolean;
    readonly extension?: {
        readonly id: string;
        readonly displayName: string;
        readonly autoMigrate?: {
            readonly storage: boolean;
        };
        readonly preRelease?: boolean;
    };
    readonly settings?: readonly string[];
    readonly additionalInfo?: string;
}
export interface ISearchPrefferedResults {
    readonly query?: string;
    readonly preferredResults?: string[];
}
export interface IExtensionsControlManifest {
    readonly malicious: IExtensionIdentifier[];
    readonly deprecated: IStringDictionary<IDeprecationInfo>;
    readonly search: ISearchPrefferedResults[];
    readonly extensionsEnabledWithPreRelease?: string[];
}
export declare const enum InstallOperation {
    None = 1,
    Install = 2,
    Update = 3,
    Migrate = 4
}
export interface ITranslation {
    contents: {
        [key: string]: {};
    };
}
export interface IExtensionInfo extends IExtensionIdentifier {
    version?: string;
    preRelease?: boolean;
    hasPreRelease?: boolean;
}
export interface IExtensionQueryOptions {
    targetPlatform?: TargetPlatform;
    productVersion?: IProductVersion;
    compatible?: boolean;
    queryAllVersions?: boolean;
    source?: string;
}
export declare const IExtensionGalleryService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionGalleryService>;
export interface IExtensionGalleryService {
    readonly _serviceBrand: undefined;
    isEnabled(): boolean;
    query(options: IQueryOptions, token: CancellationToken): Promise<IPager<IGalleryExtension>>;
    getExtensions(extensionInfos: ReadonlyArray<IExtensionInfo>, token: CancellationToken): Promise<IGalleryExtension[]>;
    getExtensions(extensionInfos: ReadonlyArray<IExtensionInfo>, options: IExtensionQueryOptions, token: CancellationToken): Promise<IGalleryExtension[]>;
    isExtensionCompatible(extension: IGalleryExtension, includePreRelease: boolean, targetPlatform: TargetPlatform, productVersion?: IProductVersion): Promise<boolean>;
    getCompatibleExtension(extension: IGalleryExtension, includePreRelease: boolean, targetPlatform: TargetPlatform, productVersion?: IProductVersion): Promise<IGalleryExtension | null>;
    getAllCompatibleVersions(extensionIdentifier: IExtensionIdentifier, includePreRelease: boolean, targetPlatform: TargetPlatform): Promise<IGalleryExtensionVersion[]>;
    download(extension: IGalleryExtension, location: URI, operation: InstallOperation): Promise<void>;
    downloadSignatureArchive(extension: IGalleryExtension, location: URI): Promise<void>;
    reportStatistic(publisher: string, name: string, version: string, type: StatisticType): Promise<void>;
    getReadme(extension: IGalleryExtension, token: CancellationToken): Promise<string>;
    getManifest(extension: IGalleryExtension, token: CancellationToken): Promise<IExtensionManifest | null>;
    getChangelog(extension: IGalleryExtension, token: CancellationToken): Promise<string>;
    getCoreTranslation(extension: IGalleryExtension, languageId: string): Promise<ITranslation | null>;
    getExtensionsControlManifest(): Promise<IExtensionsControlManifest>;
}
export interface InstallExtensionEvent {
    readonly identifier: IExtensionIdentifier;
    readonly source: URI | IGalleryExtension;
    readonly profileLocation: URI;
    readonly applicationScoped?: boolean;
    readonly workspaceScoped?: boolean;
}
export interface InstallExtensionResult {
    readonly identifier: IExtensionIdentifier;
    readonly operation: InstallOperation;
    readonly source?: URI | IGalleryExtension;
    readonly local?: ILocalExtension;
    readonly error?: Error;
    readonly context?: IStringDictionary<any>;
    readonly profileLocation: URI;
    readonly applicationScoped?: boolean;
    readonly workspaceScoped?: boolean;
}
export interface UninstallExtensionEvent {
    readonly identifier: IExtensionIdentifier;
    readonly profileLocation: URI;
    readonly applicationScoped?: boolean;
    readonly workspaceScoped?: boolean;
}
export interface DidUninstallExtensionEvent {
    readonly identifier: IExtensionIdentifier;
    readonly error?: string;
    readonly profileLocation: URI;
    readonly applicationScoped?: boolean;
    readonly workspaceScoped?: boolean;
}
export interface DidUpdateExtensionMetadata {
    readonly profileLocation: URI;
    readonly local: ILocalExtension;
}
export declare const enum ExtensionGalleryErrorCode {
    Timeout = "Timeout",
    Cancelled = "Cancelled",
    Failed = "Failed",
    DownloadFailedWriting = "DownloadFailedWriting",
    Offline = "Offline"
}
export declare class ExtensionGalleryError extends Error {
    readonly code: ExtensionGalleryErrorCode;
    constructor(message: string, code: ExtensionGalleryErrorCode);
}
export declare const enum ExtensionManagementErrorCode {
    Unsupported = "Unsupported",
    Deprecated = "Deprecated",
    Malicious = "Malicious",
    Incompatible = "Incompatible",
    IncompatibleApi = "IncompatibleApi",
    IncompatibleTargetPlatform = "IncompatibleTargetPlatform",
    ReleaseVersionNotFound = "ReleaseVersionNotFound",
    Invalid = "Invalid",
    Download = "Download",
    DownloadSignature = "DownloadSignature",
    DownloadFailedWriting = "DownloadFailedWriting",
    UpdateMetadata = "UpdateMetadata",
    Extract = "Extract",
    Scanning = "Scanning",
    ScanningExtension = "ScanningExtension",
    ReadUninstalled = "ReadUninstalled",
    UnsetUninstalled = "UnsetUninstalled",
    Delete = "Delete",
    Rename = "Rename",
    IntializeDefaultProfile = "IntializeDefaultProfile",
    AddToProfile = "AddToProfile",
    InstalledExtensionNotFound = "InstalledExtensionNotFound",
    PostInstall = "PostInstall",
    CorruptZip = "CorruptZip",
    IncompleteZip = "IncompleteZip",
    PackageNotSigned = "PackageNotSigned",
    SignatureVerificationInternal = "SignatureVerificationInternal",
    SignatureVerificationFailed = "SignatureVerificationFailed",
    NotAllowed = "NotAllowed",
    Gallery = "Gallery",
    Cancelled = "Cancelled",
    Unknown = "Unknown",
    Internal = "Internal"
}
export declare enum ExtensionSignatureVerificationCode {
    'Success' = "Success",
    'RequiredArgumentMissing' = "RequiredArgumentMissing",
    'InvalidArgument' = "InvalidArgument",
    'PackageIsUnreadable' = "PackageIsUnreadable",
    'UnhandledException' = "UnhandledException",
    'SignatureManifestIsMissing' = "SignatureManifestIsMissing",
    'SignatureManifestIsUnreadable' = "SignatureManifestIsUnreadable",
    'SignatureIsMissing' = "SignatureIsMissing",
    'SignatureIsUnreadable' = "SignatureIsUnreadable",
    'CertificateIsUnreadable' = "CertificateIsUnreadable",
    'SignatureArchiveIsUnreadable' = "SignatureArchiveIsUnreadable",
    'FileAlreadyExists' = "FileAlreadyExists",
    'SignatureArchiveIsInvalidZip' = "SignatureArchiveIsInvalidZip",
    'SignatureArchiveHasSameSignatureFile' = "SignatureArchiveHasSameSignatureFile",
    'PackageIntegrityCheckFailed' = "PackageIntegrityCheckFailed",
    'SignatureIsInvalid' = "SignatureIsInvalid",
    'SignatureManifestIsInvalid' = "SignatureManifestIsInvalid",
    'SignatureIntegrityCheckFailed' = "SignatureIntegrityCheckFailed",
    'EntryIsMissing' = "EntryIsMissing",
    'EntryIsTampered' = "EntryIsTampered",
    'Untrusted' = "Untrusted",
    'CertificateRevoked' = "CertificateRevoked",
    'SignatureIsNotValid' = "SignatureIsNotValid",
    'UnknownError' = "UnknownError",
    'PackageIsInvalidZip' = "PackageIsInvalidZip",
    'SignatureArchiveHasTooManyEntries' = "SignatureArchiveHasTooManyEntries"
}
export declare class ExtensionManagementError extends Error {
    readonly code: ExtensionManagementErrorCode;
    constructor(message: string, code: ExtensionManagementErrorCode);
}
export type InstallOptions = {
    isBuiltin?: boolean;
    isWorkspaceScoped?: boolean;
    isMachineScoped?: boolean;
    isApplicationScoped?: boolean;
    pinned?: boolean;
    donotIncludePackAndDependencies?: boolean;
    installGivenVersion?: boolean;
    preRelease?: boolean;
    installPreReleaseVersion?: boolean;
    donotVerifySignature?: boolean;
    operation?: InstallOperation;
    profileLocation?: URI;
    installOnlyNewlyAddedFromExtensionPack?: boolean;
    productVersion?: IProductVersion;
    keepExisting?: boolean;
    context?: IStringDictionary<any>;
};
export type UninstallOptions = {
    readonly profileLocation?: URI;
    readonly donotIncludePack?: boolean;
    readonly donotCheckDependents?: boolean;
    readonly versionOnly?: boolean;
    readonly remove?: boolean;
};
export interface IExtensionManagementParticipant {
    postInstall(local: ILocalExtension, source: URI | IGalleryExtension, options: InstallOptions, token: CancellationToken): Promise<void>;
    postUninstall(local: ILocalExtension, options: UninstallOptions, token: CancellationToken): Promise<void>;
}
export type InstallExtensionInfo = {
    readonly extension: IGalleryExtension;
    readonly options: InstallOptions;
};
export type UninstallExtensionInfo = {
    readonly extension: ILocalExtension;
    readonly options?: UninstallOptions;
};
export declare const IExtensionManagementService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionManagementService>;
export interface IExtensionManagementService {
    readonly _serviceBrand: undefined;
    onInstallExtension: Event<InstallExtensionEvent>;
    onDidInstallExtensions: Event<readonly InstallExtensionResult[]>;
    onUninstallExtension: Event<UninstallExtensionEvent>;
    onDidUninstallExtension: Event<DidUninstallExtensionEvent>;
    onDidUpdateExtensionMetadata: Event<DidUpdateExtensionMetadata>;
    zip(extension: ILocalExtension): Promise<URI>;
    getManifest(vsix: URI): Promise<IExtensionManifest>;
    install(vsix: URI, options?: InstallOptions): Promise<ILocalExtension>;
    canInstall(extension: IGalleryExtension): Promise<boolean>;
    installFromGallery(extension: IGalleryExtension, options?: InstallOptions): Promise<ILocalExtension>;
    installGalleryExtensions(extensions: InstallExtensionInfo[]): Promise<InstallExtensionResult[]>;
    installFromLocation(location: URI, profileLocation: URI): Promise<ILocalExtension>;
    installExtensionsFromProfile(extensions: IExtensionIdentifier[], fromProfileLocation: URI, toProfileLocation: URI): Promise<ILocalExtension[]>;
    uninstall(extension: ILocalExtension, options?: UninstallOptions): Promise<void>;
    uninstallExtensions(extensions: UninstallExtensionInfo[]): Promise<void>;
    toggleAppliationScope(extension: ILocalExtension, fromProfileLocation: URI): Promise<ILocalExtension>;
    reinstallFromGallery(extension: ILocalExtension): Promise<ILocalExtension>;
    getInstalled(type?: ExtensionType, profileLocation?: URI, productVersion?: IProductVersion): Promise<ILocalExtension[]>;
    getExtensionsControlManifest(): Promise<IExtensionsControlManifest>;
    copyExtensions(fromProfileLocation: URI, toProfileLocation: URI): Promise<void>;
    updateMetadata(local: ILocalExtension, metadata: Partial<Metadata>, profileLocation: URI): Promise<ILocalExtension>;
    resetPinnedStateForAllUserExtensions(pinned: boolean): Promise<void>;
    download(extension: IGalleryExtension, operation: InstallOperation, donotVerifySignature: boolean): Promise<URI>;
    registerParticipant(pariticipant: IExtensionManagementParticipant): void;
    getTargetPlatform(): Promise<TargetPlatform>;
    cleanUp(): Promise<void>;
}
export declare const DISABLED_EXTENSIONS_STORAGE_PATH = "extensionsIdentifiers/disabled";
export declare const ENABLED_EXTENSIONS_STORAGE_PATH = "extensionsIdentifiers/enabled";
export declare const IGlobalExtensionEnablementService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IGlobalExtensionEnablementService>;
export interface IGlobalExtensionEnablementService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeEnablement: Event<{
        readonly extensions: IExtensionIdentifier[];
        readonly source?: string;
    }>;
    getDisabledExtensions(): IExtensionIdentifier[];
    enableExtension(extension: IExtensionIdentifier, source?: string): Promise<boolean>;
    disableExtension(extension: IExtensionIdentifier, source?: string): Promise<boolean>;
}
export type IConfigBasedExtensionTip = {
    readonly extensionId: string;
    readonly extensionName: string;
    readonly isExtensionPack: boolean;
    readonly configName: string;
    readonly important: boolean;
    readonly whenNotInstalled?: string[];
};
export type IExecutableBasedExtensionTip = {
    readonly extensionId: string;
    readonly extensionName: string;
    readonly isExtensionPack: boolean;
    readonly exeName: string;
    readonly exeFriendlyName: string;
    readonly windowsPath?: string;
    readonly whenNotInstalled?: string[];
};
export declare const IExtensionTipsService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionTipsService>;
export interface IExtensionTipsService {
    readonly _serviceBrand: undefined;
    getConfigBasedTips(folder: URI): Promise<IConfigBasedExtensionTip[]>;
    getImportantExecutableBasedTips(): Promise<IExecutableBasedExtensionTip[]>;
    getOtherExecutableBasedTips(): Promise<IExecutableBasedExtensionTip[]>;
}
export declare const ExtensionsLocalizedLabel: import("../../../nls.js").ILocalizedString;
export declare const PreferencesLocalizedLabel: import("../../../nls.js").ILocalizedString;
