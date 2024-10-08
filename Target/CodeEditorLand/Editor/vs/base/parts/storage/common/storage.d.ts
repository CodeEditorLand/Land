import { Event } from '../../../common/event.js';
import { Disposable, IDisposable } from '../../../common/lifecycle.js';
export declare enum StorageHint {
    STORAGE_DOES_NOT_EXIST = 0,
    STORAGE_IN_MEMORY = 1
}
export interface IStorageOptions {
    readonly hint?: StorageHint;
}
export interface IUpdateRequest {
    readonly insert?: Map<string, string>;
    readonly delete?: Set<string>;
}
export interface IStorageItemsChangeEvent {
    readonly changed?: Map<string, string>;
    readonly deleted?: Set<string>;
}
export declare function isStorageItemsChangeEvent(thing: unknown): thing is IStorageItemsChangeEvent;
export interface IStorageDatabase {
    readonly onDidChangeItemsExternal: Event<IStorageItemsChangeEvent>;
    getItems(): Promise<Map<string, string>>;
    updateItems(request: IUpdateRequest): Promise<void>;
    optimize(): Promise<void>;
    close(recovery?: () => Map<string, string>): Promise<void>;
}
export interface IStorageChangeEvent {
    /**
     * The `key` of the storage entry that was changed
     * or was removed.
     */
    readonly key: string;
    /**
     * A hint how the storage change event was triggered. If
     * `true`, the storage change was triggered by an external
     * source, such as:
     * - another process (for example another window)
     * - operations such as settings sync or profiles change
     */
    readonly external?: boolean;
}
export type StorageValue = string | boolean | number | undefined | null | object;
export interface IStorage extends IDisposable {
    readonly onDidChangeStorage: Event<IStorageChangeEvent>;
    readonly items: Map<string, string>;
    readonly size: number;
    init(): Promise<void>;
    get(key: string, fallbackValue: string): string;
    get(key: string, fallbackValue?: string): string | undefined;
    getBoolean(key: string, fallbackValue: boolean): boolean;
    getBoolean(key: string, fallbackValue?: boolean): boolean | undefined;
    getNumber(key: string, fallbackValue: number): number;
    getNumber(key: string, fallbackValue?: number): number | undefined;
    getObject<T extends object>(key: string, fallbackValue: T): T;
    getObject<T extends object>(key: string, fallbackValue?: T): T | undefined;
    set(key: string, value: StorageValue, external?: boolean): Promise<void>;
    delete(key: string, external?: boolean): Promise<void>;
    flush(delay?: number): Promise<void>;
    whenFlushed(): Promise<void>;
    optimize(): Promise<void>;
    close(): Promise<void>;
}
export declare enum StorageState {
    None = 0,
    Initialized = 1,
    Closed = 2
}
export declare class Storage extends Disposable implements IStorage {
    protected readonly database: IStorageDatabase;
    private readonly options;
    private static readonly DEFAULT_FLUSH_DELAY;
    private readonly _onDidChangeStorage;
    readonly onDidChangeStorage: Event<IStorageChangeEvent>;
    private state;
    private cache;
    private readonly flushDelayer;
    private pendingDeletes;
    private pendingInserts;
    private pendingClose;
    private readonly whenFlushedCallbacks;
    constructor(database: IStorageDatabase, options?: IStorageOptions);
    private registerListeners;
    private onDidChangeItemsExternal;
    private acceptExternal;
    get items(): Map<string, string>;
    get size(): number;
    init(): Promise<void>;
    get(key: string, fallbackValue: string): string;
    get(key: string, fallbackValue?: string): string | undefined;
    getBoolean(key: string, fallbackValue: boolean): boolean;
    getBoolean(key: string, fallbackValue?: boolean): boolean | undefined;
    getNumber(key: string, fallbackValue: number): number;
    getNumber(key: string, fallbackValue?: number): number | undefined;
    getObject(key: string, fallbackValue: object): object;
    getObject(key: string, fallbackValue?: object | undefined): object | undefined;
    set(key: string, value: string | boolean | number | null | undefined | object, external?: boolean): Promise<void>;
    delete(key: string, external?: boolean): Promise<void>;
    optimize(): Promise<void>;
    close(): Promise<void>;
    private doClose;
    private get hasPending();
    private flushPending;
    flush(delay?: number): Promise<void>;
    private doFlush;
    whenFlushed(): Promise<void>;
    isInMemory(): boolean;
}
export declare class InMemoryStorageDatabase implements IStorageDatabase {
    readonly onDidChangeItemsExternal: Event<any>;
    private readonly items;
    getItems(): Promise<Map<string, string>>;
    updateItems(request: IUpdateRequest): Promise<void>;
    optimize(): Promise<void>;
    close(): Promise<void>;
}
