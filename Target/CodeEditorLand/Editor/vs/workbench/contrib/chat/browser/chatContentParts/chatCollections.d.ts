import { IDisposable, Disposable } from '../../../../../base/common/lifecycle.js';
export declare class ResourcePool<T extends IDisposable> extends Disposable {
    private readonly _itemFactory;
    private readonly pool;
    private _inUse;
    get inUse(): ReadonlySet<T>;
    constructor(_itemFactory: () => T);
    get(): T;
    release(item: T): void;
}
export interface IDisposableReference<T> extends IDisposable {
    object: T;
    isStale: () => boolean;
}
