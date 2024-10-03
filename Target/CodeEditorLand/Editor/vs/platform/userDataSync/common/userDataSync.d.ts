import { VSBufferReadableStream } from '../../../base/common/buffer.js';
import { IStringDictionary } from '../../../base/common/collections.js';
import { Event } from '../../../base/common/event.js';
import { FormattingOptions } from '../../../base/common/jsonFormatter.js';
import { IDisposable } from '../../../base/common/lifecycle.js';
import { IExtUri } from '../../../base/common/resources.js';
import { URI } from '../../../base/common/uri.js';
import { IHeaders } from '../../../base/parts/request/common/request.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IExtensionIdentifier } from '../../extensionManagement/common/extensionManagement.js';
import { IExtensionManifest } from '../../extensions/common/extensions.js';
import { ILogService } from '../../log/common/log.js';
import { IUserDataProfile, UseDefaultProfileFlags } from '../../userDataProfile/common/userDataProfile.js';
import { IUserDataSyncMachine } from './userDataSyncMachines.js';
export declare function getDisallowedIgnoredSettings(): string[];
export declare function getDefaultIgnoredSettings(excludeExtensions?: boolean): string[];
export declare function getIgnoredSettingsForExtension(manifest: IExtensionManifest): string[];
export declare const USER_DATA_SYNC_CONFIGURATION_SCOPE = "settingsSync";
export interface IUserDataSyncConfiguration {
    keybindingsPerPlatform?: boolean;
    ignoredExtensions?: string[];
    ignoredSettings?: string[];
}
export declare const CONFIG_SYNC_KEYBINDINGS_PER_PLATFORM = "settingsSync.keybindingsPerPlatform";
export declare function registerConfiguration(): IDisposable;
export interface IUserData {
    ref: string;
    content: string | null;
}
export type IAuthenticationProvider = {
    id: string;
    scopes: string[];
};
export interface IUserDataSyncStore {
    readonly url: URI;
    readonly type: UserDataSyncStoreType;
    readonly defaultUrl: URI;
    readonly stableUrl: URI;
    readonly insidersUrl: URI;
    readonly canSwitch: boolean;
    readonly authenticationProviders: IAuthenticationProvider[];
}
export declare function isAuthenticationProvider(thing: any): thing is IAuthenticationProvider;
export declare const enum SyncResource {
    Settings = "settings",
    Keybindings = "keybindings",
    Snippets = "snippets",
    Tasks = "tasks",
    Extensions = "extensions",
    GlobalState = "globalState",
    Profiles = "profiles",
    WorkspaceState = "workspaceState"
}
export declare const ALL_SYNC_RESOURCES: SyncResource[];
export declare function getPathSegments(collection: string | undefined, ...paths: string[]): string[];
export declare function getLastSyncResourceUri(collection: string | undefined, syncResource: SyncResource, environmentService: IEnvironmentService, extUri: IExtUri): URI;
export type IUserDataResourceManifest = Record<ServerResource, string>;
export interface IUserDataCollectionManifest {
    [collectionId: string]: {
        readonly latest?: IUserDataResourceManifest;
    };
}
export interface IUserDataManifest {
    readonly latest?: IUserDataResourceManifest;
    readonly session: string;
    readonly ref: string;
    readonly collections?: IUserDataCollectionManifest;
}
export interface IUserDataActivityData {
    resources?: {
        [resourceId: string]: {
            created: number;
            content: string;
        }[];
    };
    collections?: {
        [collectionId: string]: {
            resources?: {
                [resourceId: string]: {
                    created: number;
                    content: string;
                }[];
            } | undefined;
        };
    };
}
export interface IResourceRefHandle {
    ref: string;
    created: number;
}
export type ServerResource = SyncResource | 'machines' | 'editSessions' | 'workspaceState';
export type UserDataSyncStoreType = 'insiders' | 'stable';
export declare const IUserDataSyncStoreManagementService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncStoreManagementService>;
export interface IUserDataSyncStoreManagementService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeUserDataSyncStore: Event<void>;
    readonly userDataSyncStore: IUserDataSyncStore | undefined;
    switch(type: UserDataSyncStoreType): Promise<void>;
    getPreviousUserDataSyncStore(): Promise<IUserDataSyncStore | undefined>;
}
export declare const IUserDataSyncStoreService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncStoreService>;
export interface IUserDataSyncStoreService {
    readonly _serviceBrand: undefined;
    readonly onDidChangeDonotMakeRequestsUntil: Event<void>;
    readonly donotMakeRequestsUntil: Date | undefined;
    readonly onTokenFailed: Event<UserDataSyncErrorCode>;
    readonly onTokenSucceed: Event<void>;
    setAuthToken(token: string, type: string): void;
    manifest(oldValue: IUserDataManifest | null, headers?: IHeaders): Promise<IUserDataManifest | null>;
    readResource(resource: ServerResource, oldValue: IUserData | null, collection?: string, headers?: IHeaders): Promise<IUserData>;
    writeResource(resource: ServerResource, content: string, ref: string | null, collection?: string, headers?: IHeaders): Promise<string>;
    deleteResource(resource: ServerResource, ref: string | null, collection?: string): Promise<void>;
    getAllResourceRefs(resource: ServerResource, collection?: string): Promise<IResourceRefHandle[]>;
    resolveResourceContent(resource: ServerResource, ref: string, collection?: string, headers?: IHeaders): Promise<string | null>;
    getAllCollections(headers?: IHeaders): Promise<string[]>;
    createCollection(headers?: IHeaders): Promise<string>;
    deleteCollection(collection?: string, headers?: IHeaders): Promise<void>;
    getActivityData(): Promise<VSBufferReadableStream>;
    clear(): Promise<void>;
}
export declare const IUserDataSyncLocalStoreService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncLocalStoreService>;
export interface IUserDataSyncLocalStoreService {
    readonly _serviceBrand: undefined;
    writeResource(resource: ServerResource, content: string, cTime: Date, collection?: string, root?: URI): Promise<void>;
    getAllResourceRefs(resource: ServerResource, collection?: string, root?: URI): Promise<IResourceRefHandle[]>;
    resolveResourceContent(resource: ServerResource, ref: string, collection?: string, root?: URI): Promise<string | null>;
}
export declare const HEADER_OPERATION_ID = "x-operation-id";
export declare const HEADER_EXECUTION_ID = "X-Execution-Id";
export declare function createSyncHeaders(executionId: string): IHeaders;
export declare const enum UserDataSyncErrorCode {
    Unauthorized = "Unauthorized",
    Forbidden = "Forbidden",
    NotFound = "NotFound",
    MethodNotFound = "MethodNotFound",
    Conflict = "Conflict",
    Gone = "Gone",
    PreconditionFailed = "PreconditionFailed",
    TooLarge = "TooLarge",
    UpgradeRequired = "UpgradeRequired",
    PreconditionRequired = "PreconditionRequired",
    TooManyRequests = "RemoteTooManyRequests",
    TooManyRequestsAndRetryAfter = "TooManyRequestsAndRetryAfter",
    RequestFailed = "RequestFailed",
    RequestCanceled = "RequestCanceled",
    RequestTimeout = "RequestTimeout",
    RequestProtocolNotSupported = "RequestProtocolNotSupported",
    RequestPathNotEscaped = "RequestPathNotEscaped",
    RequestHeadersNotObject = "RequestHeadersNotObject",
    NoCollection = "NoCollection",
    NoRef = "NoRef",
    EmptyResponse = "EmptyResponse",
    TurnedOff = "TurnedOff",
    SessionExpired = "SessionExpired",
    ServiceChanged = "ServiceChanged",
    DefaultServiceChanged = "DefaultServiceChanged",
    LocalTooManyProfiles = "LocalTooManyProfiles",
    LocalTooManyRequests = "LocalTooManyRequests",
    LocalPreconditionFailed = "LocalPreconditionFailed",
    LocalInvalidContent = "LocalInvalidContent",
    LocalError = "LocalError",
    IncompatibleLocalContent = "IncompatibleLocalContent",
    IncompatibleRemoteContent = "IncompatibleRemoteContent",
    Unknown = "Unknown"
}
export declare class UserDataSyncError extends Error {
    readonly code: UserDataSyncErrorCode;
    readonly resource?: SyncResource | undefined;
    readonly operationId?: string | undefined;
    constructor(message: string, code: UserDataSyncErrorCode, resource?: SyncResource | undefined, operationId?: string | undefined);
}
export declare class UserDataSyncStoreError extends UserDataSyncError {
    readonly url: string;
    readonly serverCode: number | undefined;
    constructor(message: string, url: string, code: UserDataSyncErrorCode, serverCode: number | undefined, operationId: string | undefined);
}
export declare class UserDataAutoSyncError extends UserDataSyncError {
    constructor(message: string, code: UserDataSyncErrorCode);
}
export declare namespace UserDataSyncError {
    function toUserDataSyncError(error: Error): UserDataSyncError;
}
export interface ISyncUserDataProfile {
    readonly id: string;
    readonly collection: string;
    readonly name: string;
    readonly shortName?: string;
    readonly icon?: string;
    readonly useDefaultFlags?: UseDefaultProfileFlags;
}
export type ISyncExtension = ILocalSyncExtension | IRemoteSyncExtension;
export interface ILocalSyncExtension {
    identifier: IExtensionIdentifier;
    pinned: boolean;
    version: string;
    preRelease: boolean;
    disabled?: boolean;
    installed?: boolean;
    isApplicationScoped?: boolean;
    state?: IStringDictionary<any>;
}
export interface IRemoteSyncExtension {
    identifier: IExtensionIdentifier;
    version: string;
    pinned?: boolean;
    preRelease?: boolean;
    disabled?: boolean;
    installed?: boolean;
    isApplicationScoped?: boolean;
    state?: IStringDictionary<any>;
}
export interface IStorageValue {
    version: number;
    value: string;
}
export interface IGlobalState {
    storage: IStringDictionary<IStorageValue>;
}
export interface IWorkspaceState {
    folders: IWorkspaceStateFolder[];
    storage: IStringDictionary<string>;
    version: number;
}
export interface IWorkspaceStateFolder {
    resourceUri: string;
    workspaceFolderIdentity: string;
}
export declare const enum SyncStatus {
    Uninitialized = "uninitialized",
    Idle = "idle",
    Syncing = "syncing",
    HasConflicts = "hasConflicts"
}
export interface ISyncResourceHandle {
    created: number;
    uri: URI;
}
export interface IRemoteUserData {
    ref: string;
    syncData: ISyncData | null;
}
export interface ISyncData {
    version: number;
    machineId?: string;
    content: string;
}
export declare const enum Change {
    None = 0,
    Added = 1,
    Modified = 2,
    Deleted = 3
}
export declare const enum MergeState {
    Preview = "preview",
    Conflict = "conflict",
    Accepted = "accepted"
}
export interface IResourcePreview {
    readonly baseResource: URI;
    readonly remoteResource: URI;
    readonly localResource: URI;
    readonly previewResource: URI;
    readonly acceptedResource: URI;
    readonly localChange: Change;
    readonly remoteChange: Change;
    readonly mergeState: MergeState;
}
export interface IUserDataSyncResource {
    readonly syncResource: SyncResource;
    readonly profile: IUserDataProfile;
}
export interface IUserDataSyncResourceConflicts extends IUserDataSyncResource {
    readonly conflicts: IResourcePreview[];
}
export interface IUserDataSyncResourcePreview extends IUserDataSyncResource {
    readonly isLastSyncFromCurrentMachine: boolean;
    readonly resourcePreviews: IResourcePreview[];
}
export interface IUserDataSyncResourceError extends IUserDataSyncResource {
    readonly error: UserDataSyncError;
}
export interface IUserDataSyncResourceInitializer {
    initialize(userData: IUserData): Promise<void>;
}
export interface IUserDataSynchroniser {
    readonly resource: SyncResource;
    readonly status: SyncStatus;
    readonly onDidChangeStatus: Event<SyncStatus>;
    readonly conflicts: IUserDataSyncResourceConflicts;
    readonly onDidChangeConflicts: Event<IUserDataSyncResourceConflicts>;
    readonly onDidChangeLocal: Event<void>;
    sync(manifest: IUserDataResourceManifest | null, headers: IHeaders): Promise<void>;
    stop(): Promise<void>;
    preview(manifest: IUserDataResourceManifest | null, userDataSyncConfiguration: IUserDataSyncConfiguration, headers: IHeaders): Promise<IUserDataSyncResourcePreview | null>;
    accept(resource: URI, content?: string | null): Promise<IUserDataSyncResourcePreview | null>;
    merge(resource: URI): Promise<IUserDataSyncResourcePreview | null>;
    discard(resource: URI): Promise<IUserDataSyncResourcePreview | null>;
    apply(force: boolean, headers: IHeaders): Promise<IUserDataSyncResourcePreview | null>;
    hasPreviouslySynced(): Promise<boolean>;
    hasLocalData(): Promise<boolean>;
    resetLocal(): Promise<void>;
    resolveContent(resource: URI): Promise<string | null>;
    replace(content: string): Promise<boolean>;
}
export declare const SYNC_SERVICE_URL_TYPE = "sync.store.url.type";
export declare function getEnablementKey(resource: SyncResource): string;
export declare const IUserDataSyncEnablementService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncEnablementService>;
export interface IUserDataSyncEnablementService {
    _serviceBrand: any;
    readonly onDidChangeEnablement: Event<boolean>;
    isEnabled(): boolean;
    canToggleEnablement(): boolean;
    setEnablement(enabled: boolean): void;
    readonly onDidChangeResourceEnablement: Event<[SyncResource, boolean]>;
    isResourceEnabled(resource: SyncResource): boolean;
    setResourceEnablement(resource: SyncResource, enabled: boolean): void;
    getResourceSyncStateVersion(resource: SyncResource): string | undefined;
}
export interface IUserDataSyncTask {
    readonly manifest: IUserDataManifest | null;
    run(): Promise<void>;
    stop(): Promise<void>;
}
export interface IUserDataManualSyncTask {
    readonly id: string;
    merge(): Promise<void>;
    apply(): Promise<void>;
    stop(): Promise<void>;
}
export declare const IUserDataSyncService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncService>;
export interface IUserDataSyncService {
    _serviceBrand: any;
    readonly status: SyncStatus;
    readonly onDidChangeStatus: Event<SyncStatus>;
    readonly conflicts: IUserDataSyncResourceConflicts[];
    readonly onDidChangeConflicts: Event<IUserDataSyncResourceConflicts[]>;
    readonly onDidChangeLocal: Event<SyncResource>;
    readonly onSyncErrors: Event<IUserDataSyncResourceError[]>;
    readonly lastSyncTime: number | undefined;
    readonly onDidChangeLastSyncTime: Event<number>;
    readonly onDidResetRemote: Event<void>;
    readonly onDidResetLocal: Event<void>;
    createSyncTask(manifest: IUserDataManifest | null, disableCache?: boolean): Promise<IUserDataSyncTask>;
    createManualSyncTask(): Promise<IUserDataManualSyncTask>;
    resolveContent(resource: URI): Promise<string | null>;
    accept(syncResource: IUserDataSyncResource, resource: URI, content: string | null | undefined, apply: boolean | {
        force: boolean;
    }): Promise<void>;
    reset(): Promise<void>;
    resetRemote(): Promise<void>;
    cleanUpRemoteData(): Promise<void>;
    resetLocal(): Promise<void>;
    hasLocalData(): Promise<boolean>;
    hasPreviouslySynced(): Promise<boolean>;
    replace(syncResourceHandle: ISyncResourceHandle): Promise<void>;
    saveRemoteActivityData(location: URI): Promise<void>;
    extractActivityData(activityDataResource: URI, location: URI): Promise<void>;
}
export declare const IUserDataSyncResourceProviderService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncResourceProviderService>;
export interface IUserDataSyncResourceProviderService {
    _serviceBrand: any;
    getRemoteSyncedProfiles(): Promise<ISyncUserDataProfile[]>;
    getLocalSyncedProfiles(location?: URI): Promise<ISyncUserDataProfile[]>;
    getRemoteSyncResourceHandles(syncResource: SyncResource, profile?: ISyncUserDataProfile): Promise<ISyncResourceHandle[]>;
    getLocalSyncResourceHandles(syncResource: SyncResource, profile?: ISyncUserDataProfile, location?: URI): Promise<ISyncResourceHandle[]>;
    getAssociatedResources(syncResourceHandle: ISyncResourceHandle): Promise<{
        resource: URI;
        comparableResource: URI;
    }[]>;
    getMachineId(syncResourceHandle: ISyncResourceHandle): Promise<string | undefined>;
    getLocalSyncedMachines(location?: URI): Promise<IUserDataSyncMachine[]>;
    resolveContent(resource: URI): Promise<string | null>;
    resolveUserDataSyncResource(syncResourceHandle: ISyncResourceHandle): IUserDataSyncResource | undefined;
}
export declare const IUserDataAutoSyncService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataAutoSyncService>;
export interface IUserDataAutoSyncService {
    _serviceBrand: any;
    readonly onError: Event<UserDataSyncError>;
    turnOn(): Promise<void>;
    turnOff(everywhere: boolean): Promise<void>;
    triggerSync(sources: string[], hasToLimitSync: boolean, disableCache: boolean): Promise<void>;
}
export declare const IUserDataSyncUtilService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncUtilService>;
export interface IUserDataSyncUtilService {
    readonly _serviceBrand: undefined;
    resolveUserBindings(userbindings: string[]): Promise<IStringDictionary<string>>;
    resolveFormattingOptions(resource: URI): Promise<FormattingOptions>;
    resolveDefaultCoreIgnoredSettings(): Promise<string[]>;
}
export declare const IUserDataSyncLogService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IUserDataSyncLogService>;
export interface IUserDataSyncLogService extends ILogService {
}
export interface IConflictSetting {
    key: string;
    localValue: any | undefined;
    remoteValue: any | undefined;
}
export declare const USER_DATA_SYNC_LOG_ID = "userDataSync";
export declare const USER_DATA_SYNC_SCHEME = "vscode-userdata-sync";
export declare const PREVIEW_DIR_NAME = "preview";
