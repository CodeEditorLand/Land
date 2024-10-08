import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IStorageService, IStorageValueChangeEvent, StorageScope, StorageTarget } from '../../../../platform/storage/common/storage.js';
export interface IStoredValueSerialization<T> {
    deserialize(data: string): T;
    serialize(data: T): string;
}
interface IStoredValueOptions<T> {
    key: string;
    scope: StorageScope;
    target: StorageTarget;
    serialization?: IStoredValueSerialization<T>;
}
/**
 * todo@connor4312: is this worthy to be in common?
 */
export declare class StoredValue<T> extends Disposable {
    private readonly storage;
    private readonly serialization;
    private readonly key;
    private readonly scope;
    private readonly target;
    private value?;
    /**
     * Emitted whenever the value is updated or deleted.
     */
    readonly onDidChange: Event<IStorageValueChangeEvent>;
    constructor(options: IStoredValueOptions<T>, storage: IStorageService);
    /**
     * Reads the value, returning the undefined if it's not set.
     */
    get(): T | undefined;
    /**
     * Reads the value, returning the default value if it's not set.
     */
    get(defaultValue: T): T;
    /**
     * Persists changes to the value.
     * @param value
     */
    store(value: T): void;
    /**
     * Delete an element stored under the provided key from storage.
     */
    delete(): void;
}
export {};
