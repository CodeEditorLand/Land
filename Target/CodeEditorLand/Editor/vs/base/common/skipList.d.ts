export declare class SkipList<K, V> implements Map<K, V> {
    readonly comparator: (a: K, b: K) => number;
    readonly [Symbol.toStringTag] = "SkipList";
    private _maxLevel;
    private _level;
    private _header;
    private _size;
    /**
     *
     * @param capacity Capacity at which the list performs best
     */
    constructor(comparator: (a: K, b: K) => number, capacity?: number);
    get size(): number;
    clear(): void;
    has(key: K): boolean;
    get(key: K): V | undefined;
    set(key: K, value: V): this;
    delete(key: K): boolean;
    forEach(callbackfn: (value: V, key: K, map: Map<K, V>) => void, thisArg?: any): void;
    [Symbol.iterator](): IterableIterator<[K, V]>;
    entries(): IterableIterator<[K, V]>;
    keys(): IterableIterator<K>;
    values(): IterableIterator<V>;
    toString(): string;
    private static _search;
    private static _insert;
    private static _randomLevel;
    private static _delete;
}
