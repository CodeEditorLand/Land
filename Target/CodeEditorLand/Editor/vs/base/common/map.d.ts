import { URI } from './uri.js';
export declare function getOrSet<K, V>(map: Map<K, V>, key: K, value: V): V;
export declare function mapToString<K, V>(map: Map<K, V>): string;
export declare function setToString<K>(set: Set<K>): string;
interface ResourceMapKeyFn {
    (resource: URI): string;
}
export declare class ResourceMap<T> implements Map<URI, T> {
    private static readonly defaultToKey;
    readonly [Symbol.toStringTag] = "ResourceMap";
    private readonly map;
    private readonly toKey;
    /**
     *
     * @param toKey Custom uri identity function, e.g use an existing `IExtUri#getComparison`-util
     */
    constructor(toKey?: ResourceMapKeyFn);
    /**
     *
     * @param other Another resource which this maps is created from
     * @param toKey Custom uri identity function, e.g use an existing `IExtUri#getComparison`-util
     */
    constructor(other?: ResourceMap<T>, toKey?: ResourceMapKeyFn);
    /**
     *
     * @param other Another resource which this maps is created from
     * @param toKey Custom uri identity function, e.g use an existing `IExtUri#getComparison`-util
     */
    constructor(entries?: readonly (readonly [URI, T])[], toKey?: ResourceMapKeyFn);
    set(resource: URI, value: T): this;
    get(resource: URI): T | undefined;
    has(resource: URI): boolean;
    get size(): number;
    clear(): void;
    delete(resource: URI): boolean;
    forEach(clb: (value: T, key: URI, map: Map<URI, T>) => void, thisArg?: any): void;
    values(): IterableIterator<T>;
    keys(): IterableIterator<URI>;
    entries(): IterableIterator<[URI, T]>;
    [Symbol.iterator](): IterableIterator<[URI, T]>;
}
export declare class ResourceSet implements Set<URI> {
    readonly [Symbol.toStringTag]: string;
    private readonly _map;
    constructor(toKey?: ResourceMapKeyFn);
    constructor(entries: readonly URI[], toKey?: ResourceMapKeyFn);
    get size(): number;
    add(value: URI): this;
    clear(): void;
    delete(value: URI): boolean;
    forEach(callbackfn: (value: URI, value2: URI, set: Set<URI>) => void, thisArg?: any): void;
    has(value: URI): boolean;
    entries(): IterableIterator<[URI, URI]>;
    keys(): IterableIterator<URI>;
    values(): IterableIterator<URI>;
    [Symbol.iterator](): IterableIterator<URI>;
}
export declare const enum Touch {
    None = 0,
    AsOld = 1,
    AsNew = 2
}
export declare class LinkedMap<K, V> implements Map<K, V> {
    readonly [Symbol.toStringTag] = "LinkedMap";
    private _map;
    private _head;
    private _tail;
    private _size;
    private _state;
    constructor();
    clear(): void;
    isEmpty(): boolean;
    get size(): number;
    get first(): V | undefined;
    get last(): V | undefined;
    has(key: K): boolean;
    get(key: K, touch?: Touch): V | undefined;
    set(key: K, value: V, touch?: Touch): this;
    delete(key: K): boolean;
    remove(key: K): V | undefined;
    shift(): V | undefined;
    forEach(callbackfn: (value: V, key: K, map: LinkedMap<K, V>) => void, thisArg?: any): void;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    entries(): IterableIterator<[K, V]>;
    [Symbol.iterator](): IterableIterator<[K, V]>;
    protected trimOld(newSize: number): void;
    protected trimNew(newSize: number): void;
    private addItemFirst;
    private addItemLast;
    private removeItem;
    private touch;
    toJSON(): [K, V][];
    fromJSON(data: [K, V][]): void;
}
declare abstract class Cache<K, V> extends LinkedMap<K, V> {
    protected _limit: number;
    protected _ratio: number;
    constructor(limit: number, ratio?: number);
    get limit(): number;
    set limit(limit: number);
    get ratio(): number;
    set ratio(ratio: number);
    get(key: K, touch?: Touch): V | undefined;
    peek(key: K): V | undefined;
    set(key: K, value: V): this;
    protected checkTrim(): void;
    protected abstract trim(newSize: number): void;
}
export declare class LRUCache<K, V> extends Cache<K, V> {
    constructor(limit: number, ratio?: number);
    protected trim(newSize: number): void;
    set(key: K, value: V): this;
}
export declare class MRUCache<K, V> extends Cache<K, V> {
    constructor(limit: number, ratio?: number);
    protected trim(newSize: number): void;
    set(key: K, value: V): this;
}
export declare class CounterSet<T> {
    private map;
    add(value: T): CounterSet<T>;
    delete(value: T): boolean;
    has(value: T): boolean;
}
/**
 * A map that allows access both by keys and values.
 * **NOTE**: values need to be unique.
 */
export declare class BidirectionalMap<K, V> {
    private readonly _m1;
    private readonly _m2;
    constructor(entries?: readonly (readonly [K, V])[]);
    clear(): void;
    set(key: K, value: V): void;
    get(key: K): V | undefined;
    getKey(value: V): K | undefined;
    delete(key: K): boolean;
    forEach(callbackfn: (value: V, key: K, map: BidirectionalMap<K, V>) => void, thisArg?: any): void;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
}
export declare class SetMap<K, V> {
    private map;
    add(key: K, value: V): void;
    delete(key: K, value: V): void;
    forEach(key: K, fn: (value: V) => void): void;
    get(key: K): ReadonlySet<V>;
}
export declare function mapsStrictEqualIgnoreOrder(a: Map<unknown, unknown>, b: Map<unknown, unknown>): boolean;
/**
 * A map that is addressable with 2 separate keys. This is useful in high performance scenarios
 * where creating a composite key whenever the data is accessed is too expensive.
 */
export declare class TwoKeyMap<TFirst extends string | number, TSecond extends string | number, TValue> {
    private _data;
    set(first: TFirst, second: TSecond, value: TValue): void;
    get(first: TFirst, second: TSecond): TValue | undefined;
    clear(): void;
    values(): IterableIterator<TValue>;
}
/**
 * A map that is addressable with 3 separate keys. This is useful in high performance scenarios
 * where creating a composite key whenever the data is accessed is too expensive.
 */
export declare class ThreeKeyMap<TFirst extends string | number, TSecond extends string | number, TThird extends string | number, TValue> {
    private _data;
    set(first: TFirst, second: TSecond, third: TThird, value: TValue): void;
    get(first: TFirst, second: TSecond, third: TThird): TValue | undefined;
    clear(): void;
    values(): IterableIterator<TValue>;
}
/**
 * A map that is addressable with 4 separate keys. This is useful in high performance scenarios
 * where creating a composite key whenever the data is accessed is too expensive.
 */
export declare class FourKeyMap<TFirst extends string | number, TSecond extends string | number, TThird extends string | number, TFourth extends string | number, TValue> {
    private _data;
    set(first: TFirst, second: TSecond, third: TThird, fourth: TFourth, value: TValue): void;
    get(first: TFirst, second: TSecond, third: TThird, fourth: TFourth): TValue | undefined;
    clear(): void;
}
export {};
