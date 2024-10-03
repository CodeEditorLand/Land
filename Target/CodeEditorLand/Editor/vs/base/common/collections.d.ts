export type IStringDictionary<V> = Record<string, V>;
export type INumberDictionary<V> = Record<number, V>;
export declare function groupBy<K extends string | number | symbol, V>(data: V[], groupFn: (element: V) => K): Record<K, V[]>;
export declare function diffSets<T>(before: ReadonlySet<T>, after: ReadonlySet<T>): {
    removed: T[];
    added: T[];
};
export declare function diffMaps<K, V>(before: Map<K, V>, after: Map<K, V>): {
    removed: V[];
    added: V[];
};
export declare function intersection<T>(setA: Set<T>, setB: Iterable<T>): Set<T>;
export declare class SetWithKey<T> implements Set<T> {
    private toKey;
    private _map;
    constructor(values: T[], toKey: (t: T) => unknown);
    get size(): number;
    add(value: T): this;
    delete(value: T): boolean;
    has(value: T): boolean;
    entries(): IterableIterator<[T, T]>;
    keys(): IterableIterator<T>;
    values(): IterableIterator<T>;
    clear(): void;
    forEach(callbackfn: (value: T, value2: T, set: Set<T>) => void, thisArg?: any): void;
    [Symbol.iterator](): IterableIterator<T>;
    [Symbol.toStringTag]: string;
}
