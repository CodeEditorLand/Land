import { Event } from '../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../base/common/lifecycle.js';
import { IStorage, IStorageChangeEvent, StorageValue } from '../../../base/parts/storage/common/storage.js';
import { IUserDataProfile } from '../../userDataProfile/common/userDataProfile.js';
import { IAnyWorkspaceIdentifier } from '../../workspace/common/workspace.js';
export declare const IS_NEW_KEY = "__$__isNewStorageMarker";
export declare const TARGET_KEY = "__$__targetStorageMarker";
export declare const IStorageService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<IStorageService>;
export declare enum WillSaveStateReason {
    /**
     * No specific reason to save state.
     */
    NONE = 0,
    /**
     * A hint that the workbench is about to shutdown.
     */
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
    /**
     * Emitted whenever data is updated or deleted on the given
     * scope and optional key.
     *
     * @param scope the `StorageScope` to listen to changes
     * @param key the optional key to filter for or all keys of
     * the scope if `undefined`
     */
    onDidChangeValue(scope: StorageScope.WORKSPACE, key: string | undefined, disposable: DisposableStore): Event<IWorkspaceStorageValueChangeEvent>;
    onDidChangeValue(scope: StorageScope.PROFILE, key: string | undefined, disposable: DisposableStore): Event<IProfileStorageValueChangeEvent>;
    onDidChangeValue(scope: StorageScope.APPLICATION, key: string | undefined, disposable: DisposableStore): Event<IApplicationStorageValueChangeEvent>;
    onDidChangeValue(scope: StorageScope, key: string | undefined, disposable: DisposableStore): Event<IStorageValueChangeEvent>;
    /**
     * Emitted whenever target of a storage entry changes.
     */
    readonly onDidChangeTarget: Event<IStorageTargetChangeEvent>;
    /**
     * Emitted when the storage is about to persist. This is the right time
     * to persist data to ensure it is stored before the application shuts
     * down.
     *
     * The will save state event allows to optionally ask for the reason of
     * saving the state, e.g. to find out if the state is saved due to a
     * shutdown.
     *
     * Note: this event may be fired many times, not only on shutdown to prevent
     * loss of state in situations where the shutdown is not sufficient to
     * persist the data properly.
     */
    readonly onWillSaveState: Event<IWillSaveStateEvent>;
    /**
     * Retrieve an element stored with the given key from storage. Use
     * the provided `defaultValue` if the element is `null` or `undefined`.
     *
     * @param scope allows to define the scope of the storage operation
     * to either the current workspace only, all workspaces or all profiles.
     */
    get(key: string, scope: StorageScope, fallbackValue: string): string;
    get(key: string, scope: StorageScope, fallbackValue?: string): string | undefined;
    /**
     * Retrieve an element stored with the given key from storage. Use
     * the provided `defaultValue` if the element is `null` or `undefined`.
     * The element will be converted to a `boolean`.
     *
     * @param scope allows to define the scope of the storage operation
     * to either the current workspace only, all workspaces or all profiles.
     */
    getBoolean(key: string, scope: StorageScope, fallbackValue: boolean): boolean;
    getBoolean(key: string, scope: StorageScope, fallbackValue?: boolean): boolean | undefined;
    /**
     * Retrieve an element stored with the given key from storage. Use
     * the provided `defaultValue` if the element is `null` or `undefined`.
     * The element will be converted to a `number` using `parseInt` with a
     * base of `10`.
     *
     * @param scope allows to define the scope of the storage operation
     * to either the current workspace only, all workspaces or all profiles.
     */
    getNumber(key: string, scope: StorageScope, fallbackValue: number): number;
    getNumber(key: string, scope: StorageScope, fallbackValue?: number): number | undefined;
    /**
     * Retrieve an element stored with the given key from storage. Use
     * the provided `defaultValue` if the element is `null` or `undefined`.
     * The element will be converted to a `object` using `JSON.parse`.
     *
     * @param scope allows to define the scope of the storage operation
     * to either the current workspace only, all workspaces or all profiles.
     */
    getObject<T extends object>(key: string, scope: StorageScope, fallbackValue: T): T;
    getObject<T extends object>(key: string, scope: StorageScope, fallbackValue?: T): T | undefined;
    /**
     * Store a value under the given key to storage. The value will be
     * converted to a `string`. Storing either `undefined` or `null` will
     * remove the entry under the key.
     *
     * @param scope allows to define the scope of the storage operation
     * to either the current workspace only, all workspaces or all profiles.
     *
     * @param target allows to define the target of the storage operation
     * to either the current machine or user.
     */
    store(key: string, value: StorageValue, scope: StorageScope, target: StorageTarget): void;
    /**
     * Allows to store multiple values in a bulk operation. Events will only
     * be emitted when all values have been stored.
     *
     * @param external a hint to indicate the source of the operation is external,
     * such as settings sync or profile changes.
     */
    storeAll(entries: Array<IStorageEntry>, external: boolean): void;
    /**
     * Delete an element stored under the provided key from storage.
     *
     * The scope argument allows to define the scope of the storage
     * operation to either the current workspace only, all workspaces
     * or all profiles.
     */
    remove(key: string, scope: StorageScope): void;
    /**
     * Returns all the keys used in the storage for the provided `scope`
     * and `target`.
     *
     * Note: this will NOT return all keys stored in the storage layer.
     * Some keys may not have an associated `StorageTarget` and thus
     * will be excluded from the results.
     *
     * @param scope allows to define the scope for the keys
     * to either the current workspace only, all workspaces or all profiles.
     *
     * @param target allows to define the target for the keys
     * to either the current machine or user.
     */
    keys(scope: StorageScope, target: StorageTarget): string[];
    /**
     * Log the contents of the storage to the console.
     */
    log(): void;
    /**
     * Returns true if the storage service handles the provided scope.
     */
    hasScope(scope: IAnyWorkspaceIdentifier | IUserDataProfile): boolean;
    /**
     * Switch storage to another workspace or profile. Optionally preserve the
     * current data to the new storage.
     */
    switch(to: IAnyWorkspaceIdentifier | IUserDataProfile, preserveData: boolean): Promise<void>;
    /**
     * Whether the storage for the given scope was created during this session or
     * existed before.
     */
    isNew(scope: StorageScope): boolean;
    /**
     * Attempts to reduce the DB size via optimization commands if supported.
     */
    optimize(scope: StorageScope): Promise<void>;
    /**
     * Allows to flush state, e.g. in cases where a shutdown is
     * imminent. This will send out the `onWillSaveState` to ask
     * everyone for latest state.
     *
     * @returns a `Promise` that can be awaited on when all updates
     * to the underlying storage have been flushed.
     */
    flush(reason?: WillSaveStateReason): Promise<void>;
}
export declare const enum StorageScope {
    /**
     * The stored data will be scoped to all workspaces across all profiles.
     */
    APPLICATION = -1,
    /**
     * The stored data will be scoped to all workspaces of the same profile.
     */
    PROFILE = 0,
    /**
     * The stored data will be scoped to the current workspace.
     */
    WORKSPACE = 1
}
export declare const enum StorageTarget {
    /**
     * The stored data is user specific and applies across machines.
     */
    USER = 0,
    /**
     * The stored data is machine specific.
     */
    MACHINE = 1
}
export interface IStorageValueChangeEvent {
    /**
     * The scope for the storage entry that changed
     * or was removed.
     */
    readonly scope: StorageScope;
    /**
     * The `key` of the storage entry that was changed
     * or was removed.
     */
    readonly key: string;
    /**
     * The `target` can be `undefined` if a key is being
     * removed.
     */
    readonly target: StorageTarget | undefined;
    /**
     * A hint how the storage change event was triggered. If
     * `true`, the storage change was triggered by an external
     * source, such as:
     * - another process (for example another window)
     * - operations such as settings sync or profiles change
     */
    readonly external?: boolean;
}
export interface IStorageTargetChangeEvent {
    /**
     * The scope for the target that changed. Listeners
     * should use `keys(scope, target)` to get an updated
     * list of keys for the given `scope` and `target`.
     */
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
