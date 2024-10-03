import { CancellationToken } from './cancellation.js';
import { IDisposable } from './lifecycle.js';
export interface CacheResult<T> extends IDisposable {
    promise: Promise<T>;
}
export declare class Cache<T> {
    private task;
    private result;
    constructor(task: (ct: CancellationToken) => Promise<T>);
    get(): CacheResult<T>;
}
export declare function identity<T>(t: T): T;
interface ICacheOptions<TArg> {
    getCacheKey: (arg: TArg) => unknown;
}
export declare class LRUCachedFunction<TArg, TComputed> {
    private lastCache;
    private lastArgKey;
    private readonly _fn;
    private readonly _computeKey;
    constructor(fn: (arg: TArg) => TComputed);
    constructor(options: ICacheOptions<TArg>, fn: (arg: TArg) => TComputed);
    get(arg: TArg): TComputed;
}
export declare class CachedFunction<TArg, TComputed> {
    private readonly _map;
    private readonly _map2;
    get cachedValues(): ReadonlyMap<TArg, TComputed>;
    private readonly _fn;
    private readonly _computeKey;
    constructor(fn: (arg: TArg) => TComputed);
    constructor(options: ICacheOptions<TArg>, fn: (arg: TArg) => TComputed);
    get(arg: TArg): TComputed;
}
export {};
