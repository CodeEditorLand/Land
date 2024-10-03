import { Disposable } from '../../../base/common/lifecycle.js';
import { Event } from '../../../base/common/event.js';
import { URI } from '../../../base/common/uri.js';
import { Metadata } from './extensionManagement.js';
import { IExtension, IExtensionIdentifier } from '../../extensions/common/extensions.js';
import { IFileService } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
export declare const enum ExtensionsProfileScanningErrorCode {
    ERROR_PROFILE_NOT_FOUND = "ERROR_PROFILE_NOT_FOUND",
    ERROR_INVALID_CONTENT = "ERROR_INVALID_CONTENT"
}
export declare class ExtensionsProfileScanningError extends Error {
    code: ExtensionsProfileScanningErrorCode;
    constructor(message: string, code: ExtensionsProfileScanningErrorCode);
}
export interface IScannedProfileExtension {
    readonly identifier: IExtensionIdentifier;
    readonly version: string;
    readonly location: URI;
    readonly metadata?: Metadata;
}
export interface ProfileExtensionsEvent {
    readonly extensions: readonly IScannedProfileExtension[];
    readonly profileLocation: URI;
}
export interface DidAddProfileExtensionsEvent extends ProfileExtensionsEvent {
    readonly error?: Error;
}
export interface DidRemoveProfileExtensionsEvent extends ProfileExtensionsEvent {
    readonly error?: Error;
}
export interface IProfileExtensionsScanOptions {
    readonly bailOutWhenFileNotFound?: boolean;
}
export declare const IExtensionsProfileScannerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IExtensionsProfileScannerService>;
export interface IExtensionsProfileScannerService {
    readonly _serviceBrand: undefined;
    readonly onAddExtensions: Event<ProfileExtensionsEvent>;
    readonly onDidAddExtensions: Event<DidAddProfileExtensionsEvent>;
    readonly onRemoveExtensions: Event<ProfileExtensionsEvent>;
    readonly onDidRemoveExtensions: Event<DidRemoveProfileExtensionsEvent>;
    scanProfileExtensions(profileLocation: URI, options?: IProfileExtensionsScanOptions): Promise<IScannedProfileExtension[]>;
    addExtensionsToProfile(extensions: [IExtension, Metadata | undefined][], profileLocation: URI, keepExistingVersions?: boolean): Promise<IScannedProfileExtension[]>;
    updateMetadata(extensions: [IExtension, Metadata | undefined][], profileLocation: URI): Promise<IScannedProfileExtension[]>;
    removeExtensionFromProfile(extension: IExtension, profileLocation: URI): Promise<void>;
}
export declare abstract class AbstractExtensionsProfileScannerService extends Disposable implements IExtensionsProfileScannerService {
    private readonly extensionsLocation;
    private readonly fileService;
    private readonly userDataProfilesService;
    private readonly uriIdentityService;
    private readonly telemetryService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly _onAddExtensions;
    readonly onAddExtensions: Event<ProfileExtensionsEvent>;
    private readonly _onDidAddExtensions;
    readonly onDidAddExtensions: Event<DidAddProfileExtensionsEvent>;
    private readonly _onRemoveExtensions;
    readonly onRemoveExtensions: Event<ProfileExtensionsEvent>;
    private readonly _onDidRemoveExtensions;
    readonly onDidRemoveExtensions: Event<DidRemoveProfileExtensionsEvent>;
    private readonly resourcesAccessQueueMap;
    constructor(extensionsLocation: URI, fileService: IFileService, userDataProfilesService: IUserDataProfilesService, uriIdentityService: IUriIdentityService, telemetryService: ITelemetryService, logService: ILogService);
    scanProfileExtensions(profileLocation: URI, options?: IProfileExtensionsScanOptions): Promise<IScannedProfileExtension[]>;
    addExtensionsToProfile(extensions: [IExtension, Metadata | undefined][], profileLocation: URI, keepExistingVersions?: boolean): Promise<IScannedProfileExtension[]>;
    updateMetadata(extensions: [IExtension, Metadata][], profileLocation: URI): Promise<IScannedProfileExtension[]>;
    removeExtensionFromProfile(extension: IExtension, profileLocation: URI): Promise<void>;
    private withProfileExtensions;
    private reportAndThrowInvalidConentError;
    private toRelativePath;
    private resolveExtensionLocation;
    private _migrationPromise;
    private migrateFromOldDefaultProfileExtensionsLocation;
    private getResourceAccessQueue;
}
