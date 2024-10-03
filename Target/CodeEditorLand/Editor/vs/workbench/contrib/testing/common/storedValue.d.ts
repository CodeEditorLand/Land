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
export declare class StoredValue<T> extends Disposable {
    private readonly storage;
    private readonly serialization;
    private readonly key;
    private readonly scope;
    private readonly target;
    private value?;
    readonly onDidChange: Event<IStorageValueChangeEvent>;
    constructor(options: IStoredValueOptions<T>, storage: IStorageService);
    get(): T | undefined;
    get(defaultValue: T): T;
    store(value: T): void;
    delete(): void;
}
export {};
