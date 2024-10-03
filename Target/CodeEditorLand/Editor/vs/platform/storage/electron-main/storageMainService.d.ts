import { Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IStorage } from '../../../base/parts/storage/common/storage.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { AbstractStorageService, IStorageService, StorageScope, StorageTarget } from '../common/storage.js';
import { IStorageMain, IStorageMainOptions, IStorageChangeEvent } from './storageMain.js';
import { IUserDataProfile, IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
import { IUserDataProfilesMainService } from '../../userDataProfile/electron-main/userDataProfile.js';
import { IAnyWorkspaceIdentifier } from '../../workspace/common/workspace.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
export declare const IStorageMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IStorageMainService>;
export interface IProfileStorageChangeEvent extends IStorageChangeEvent {
    readonly storage: IStorageMain;
    readonly profile: IUserDataProfile;
}
export interface IStorageMainService {
    readonly _serviceBrand: undefined;
    readonly applicationStorage: IStorageMain;
    readonly onDidChangeProfileStorage: Event<IProfileStorageChangeEvent>;
    profileStorage(profile: IUserDataProfile): IStorageMain;
    workspaceStorage(workspace: IAnyWorkspaceIdentifier): IStorageMain;
    isUsed(path: string): boolean;
}
export declare class StorageMainService extends Disposable implements IStorageMainService {
    private readonly logService;
    private readonly environmentService;
    private readonly userDataProfilesService;
    private readonly lifecycleMainService;
    private readonly fileService;
    private readonly uriIdentityService;
    readonly _serviceBrand: undefined;
    private shutdownReason;
    private readonly _onDidChangeProfileStorage;
    readonly onDidChangeProfileStorage: Event<IProfileStorageChangeEvent>;
    constructor(logService: ILogService, environmentService: IEnvironmentService, userDataProfilesService: IUserDataProfilesMainService, lifecycleMainService: ILifecycleMainService, fileService: IFileService, uriIdentityService: IUriIdentityService);
    protected getStorageOptions(): IStorageMainOptions;
    private registerListeners;
    readonly applicationStorage: IStorageMain;
    private createApplicationStorage;
    private readonly mapProfileToStorage;
    profileStorage(profile: IUserDataProfile): IStorageMain;
    private createProfileStorage;
    private readonly mapWorkspaceToStorage;
    workspaceStorage(workspace: IAnyWorkspaceIdentifier): IStorageMain;
    private createWorkspaceStorage;
    isUsed(path: string): boolean;
}
export declare const IApplicationStorageMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IStorageMainService>;
export interface IApplicationStorageMainService extends IStorageService {
    readonly whenReady: Promise<void>;
    get(key: string, scope: StorageScope.APPLICATION, fallbackValue: string): string;
    get(key: string, scope: StorageScope.APPLICATION, fallbackValue?: string): string | undefined;
    getBoolean(key: string, scope: StorageScope.APPLICATION, fallbackValue: boolean): boolean;
    getBoolean(key: string, scope: StorageScope.APPLICATION, fallbackValue?: boolean): boolean | undefined;
    getNumber(key: string, scope: StorageScope.APPLICATION, fallbackValue: number): number;
    getNumber(key: string, scope: StorageScope.APPLICATION, fallbackValue?: number): number | undefined;
    store(key: string, value: string | boolean | number | undefined | null, scope: StorageScope.APPLICATION, target: StorageTarget): void;
    remove(key: string, scope: StorageScope.APPLICATION): void;
    keys(scope: StorageScope.APPLICATION, target: StorageTarget): string[];
    switch(): never;
    isNew(scope: StorageScope.APPLICATION): boolean;
}
export declare class ApplicationStorageMainService extends AbstractStorageService implements IApplicationStorageMainService {
    private readonly userDataProfilesService;
    private readonly storageMainService;
    readonly _serviceBrand: undefined;
    readonly whenReady: Promise<void>;
    constructor(userDataProfilesService: IUserDataProfilesService, storageMainService: IStorageMainService);
    protected doInitialize(): Promise<void>;
    protected getStorage(scope: StorageScope): IStorage | undefined;
    protected getLogDetails(scope: StorageScope): string | undefined;
    protected shouldFlushWhenIdle(): boolean;
    switch(): never;
    protected switchToProfile(): never;
    protected switchToWorkspace(): never;
    hasScope(): never;
}
