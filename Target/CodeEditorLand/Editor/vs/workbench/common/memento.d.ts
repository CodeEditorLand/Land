import { IStorageService, IStorageValueChangeEvent, StorageScope, StorageTarget } from '../../platform/storage/common/storage.js';
import { DisposableStore } from '../../base/common/lifecycle.js';
import { Event } from '../../base/common/event.js';
export type MementoObject = {
    [key: string]: any;
};
export declare class Memento {
    private storageService;
    private static readonly applicationMementos;
    private static readonly profileMementos;
    private static readonly workspaceMementos;
    private static readonly COMMON_PREFIX;
    private readonly id;
    constructor(id: string, storageService: IStorageService);
    getMemento(scope: StorageScope, target: StorageTarget): MementoObject;
    onDidChangeValue(scope: StorageScope, disposables: DisposableStore): Event<IStorageValueChangeEvent>;
    saveMemento(): void;
    reloadMemento(scope: StorageScope): void;
    static clear(scope: StorageScope): void;
}
