import { IDisposable, IReference } from '../../../../base/common/lifecycle.js';
export declare class ObjectPool<TData extends IObjectData, T extends IPooledObject<TData>> implements IDisposable {
    private readonly _create;
    private readonly _unused;
    private readonly _used;
    private readonly _itemData;
    constructor(_create: (data: TData) => T);
    getUnusedObj(data: TData): IReference<T>;
    dispose(): void;
}
export interface IObjectData {
    getId(): unknown;
}
export interface IPooledObject<TData> extends IDisposable {
    setData(data: TData): void;
}
