import { Event } from '../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { IStorage, IStorageChangeEvent, StorageValue } from '../../../base/parts/storage/common/storage.js';
import { IUserDataProfile } from '../../userDataProfile/common/userDataProfile.js';
import { IAnyWorkspaceIdentifier } from '../../workspace/common/workspace.js';
export declare const IS_NEW_KEY = "__$__isNewStorageMarker";
export declare const TARGET_KEY = "__$__targetStorageMarker";
export declare const IStorageService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IStorageService>;
export declare enum WillSaveStateReason {
    NONE = 0,
    SHUTDOWN = 1
}
export interface IWillSaveStateEvent {
    readonly reason: WillSaveStateReason;
}
export interface IStorageEntry {
    readonly key: string;
    readonly value: StorageValue;
    readonly scope: StorageScope;
    readonly target: StorageTarget;
}
export interface IWorkspaceStorageValueChangeEvent extends IStorageValueChangeEvent {
    readonly scope: StorageScope.WORKSPACE;
}
export interface IProfileStorageValueChangeEvent extends IStorageValueChangeEvent {
    readonly scope: StorageScope.PROFILE;
}
export interface IApplicationStorageValueChangeEvent extends IStorageValueChangeEvent {
    readonly scope: StorageScope.APPLICATION;
}
export interface IStorageService {
    readonly _serviceBrand: undefined;
    onDidChangeValue(scope: StorageScope.WORKSPACE, key: string | undefined, disposable: DisposableStore): Event<IWorkspaceStorageValueChangeEvent>;
    onDidChangeValue(scope: StorageScope.PROFILE, key: string | undefined, disposable: DisposableStore): Event<IProfileStorageValueChangeEvent>;
    onDidChangeValue(scope: StorageScope.APPLICATION, key: string | undefined, disposable: DisposableStore): Event<IApplicationStorageValueChangeEvent>;
    onDidChangeValue(scope: StorageScope, key: string | undefined, disposable: DisposableStore): Event<IStorageValueChangeEvent>;
    readonly onDidChangeTarget: Event<IStorageTargetChangeEvent>;
    readonly onWillSaveState: Event<IWillSaveStateEvent>;
    get(key: string, scope: StorageScope, fallbackValue: string): string;
    get(key: string, scope: StorageScope, fallbackValue?: string): string | undefined;
    getBoolean(key: string, scope: StorageScope, fallbackValue: boolean): boolean;
    getBoolean(key: string, scope: StorageScope, fallbackValue?: boolean): boolean | undefined;
    getNumber(key: string, scope: StorageScope, fallbackValue: number): number;
    getNumber(key: string, scope: StorageScope, fallbackValue?: number): number | undefined;
    getObject<T extends object>(key: string, scope: StorageScope, fallbackValue: T): T;
    getObject<T extends object>(key: string, scope: StorageScope, fallbackValue?: T): T | undefined;
    store(key: string, value: StorageValue, scope: StorageScope, target: StorageTarget): void;
    storeAll(entries: Array<IStorageEntry>, external: boolean): void;
    remove(key: string, scope: StorageScope): void;
    keys(scope: StorageScope, target: StorageTarget): string[];
    log(): void;
    hasScope(scope: IAnyWorkspaceIdentifier | IUserDataProfile): boolean;
    switch(to: IAnyWorkspaceIdentifier | IUserDataProfile, preserveData: boolean): Promise<void>;
    isNew(scope: StorageScope): boolean;
    optimize(scope: StorageScope): Promise<void>;
    flush(reason?: WillSaveStateReason): Promise<void>;
}
export declare const enum StorageScope {
    APPLICATION = -1,
    PROFILE = 0,
    WORKSPACE = 1
}
export declare const enum StorageTarget {
    USER = 0,
    MACHINE = 1
}
export interface IStorageValueChangeEvent {
    readonly scope: StorageScope;
    readonly key: string;
    readonly target: StorageTarget | undefined;
    readonly external?: boolean;
}
export interface IStorageTargetChangeEvent {
    readonly scope: StorageScope;
}
interface IKeyTargets {
    [key: string]: StorageTarget;
}
export interface IStorageServiceOptions {
    readonly flushInterval: number;
}
export declare function loadKeyTargets(storage: IStorage): IKeyTargets;
export declare abstract class AbstractStorageService extends Disposable implements IStorageService {
    private readonly options;
    readonly _serviceBrand: undefined;
    private static DEFAULT_FLUSH_INTERVAL;
    private readonly _onDidChangeValue;
    private readonly _onDidChangeTarget;
    readonly onDidChangeTarget: Event<IStorageTargetChangeEvent>;
    private readonly _onWillSaveState;
    readonly onWillSaveState: Event<IWillSaveStateEvent>;
    private initializationPromise;
    private readonly flushWhenIdleScheduler;
    private readonly runFlushWhenIdle;
    constructor(options?: IStorageServiceOptions);
    onDidChangeValue(scope: StorageScope.WORKSPACE, key: string | undefined, disposable: DisposableStore): Event<IWorkspaceStorageValueChangeEvent>;
    onDidChangeValue(scope: StorageScope.PROFILE, key: string | undefined, disposable: DisposableStore): Event<IProfileStorageValueChangeEvent>;
    onDidChangeValue(scope: StorageScope.APPLICATION, key: string | undefined, disposable: DisposableStore): Event<IApplicationStorageValueChangeEvent>;
    private doFlushWhenIdle;
    protected shouldFlushWhenIdle(): boolean;
    protected stopFlushWhenIdle(): void;
    initialize(): Promise<void>;
    protected emitDidChangeValue(scope: StorageScope, event: IStorageChangeEvent): void;
    protected emitWillSaveState(reason: WillSaveStateReason): void;
    get(key: string, scope: StorageScope, fallbackValue: string): string;
    get(key: string, scope: StorageScope): string | undefined;
    getBoolean(key: string, scope: StorageScope, fallbackValue: boolean): boolean;
    getBoolean(key: string, scope: StorageScope): boolean | undefined;
    getNumber(key: string, scope: StorageScope, fallbackValue: number): number;
    getNumber(key: string, scope: StorageScope): number | undefined;
    getObject(key: string, scope: StorageScope, fallbackValue: object): object;
    getObject(key: string, scope: StorageScope): object | undefined;
    storeAll(entries: Array<IStorageEntry>, external: boolean): void;
    store(key: string, value: StorageValue, scope: StorageScope, target: StorageTarget, external?: boolean): void;
    remove(key: string, scope: StorageScope, external?: boolean): void;
    private withPausedEmitters;
    keys(scope: StorageScope, target: StorageTarget): string[];
    private updateKeyTarget;
    private _workspaceKeyTargets;
    private get workspaceKeyTargets();
    private _profileKeyTargets;
    private get profileKeyTargets();
    private _applicationKeyTargets;
    private get applicationKeyTargets();
    private getKeyTargets;
    private loadKeyTargets;
    isNew(scope: StorageScope): boolean;
    flush(reason?: WillSaveStateReason): Promise<void>;
    log(): Promise<void>;
    optimize(scope: StorageScope): Promise<void>;
    switch(to: IAnyWorkspaceIdentifier | IUserDataProfile, preserveData: boolean): Promise<void>;
    protected canSwitchProfile(from: IUserDataProfile, to: IUserDataProfile): boolean;
    protected switchData(oldStorage: Map<string, string>, newStorage: IStorage, scope: StorageScope): void;
    abstract hasScope(scope: IAnyWorkspaceIdentifier | IUserDataProfile): boolean;
    protected abstract doInitialize(): Promise<void>;
    protected abstract getStorage(scope: StorageScope): IStorage | undefined;
    protected abstract getLogDetails(scope: StorageScope): string | undefined;
    protected abstract switchToProfile(toProfile: IUserDataProfile, preserveData: boolean): Promise<void>;
    protected abstract switchToWorkspace(toWorkspace: IAnyWorkspaceIdentifier | IUserDataProfile, preserveData: boolean): Promise<void>;
}
export declare function isProfileUsingDefaultStorage(profile: IUserDataProfile): boolean;
export declare class InMemoryStorageService extends AbstractStorageService {
    private readonly applicationStorage;
    private readonly profileStorage;
    private readonly workspaceStorage;
    constructor();
    protected getStorage(scope: StorageScope): IStorage;
    protected getLogDetails(scope: StorageScope): string | undefined;
    protected doInitialize(): Promise<void>;
    protected switchToProfile(): Promise<void>;
    protected switchToWorkspace(): Promise<void>;
    protected shouldFlushWhenIdle(): boolean;
    hasScope(scope: IAnyWorkspaceIdentifier | IUserDataProfile): boolean;
}
export declare function logStorage(application: Map<string, string>, profile: Map<string, string>, workspace: Map<string, string>, applicationPath: string, profilePath: string, workspacePath: string): Promise<void>;
export {};
