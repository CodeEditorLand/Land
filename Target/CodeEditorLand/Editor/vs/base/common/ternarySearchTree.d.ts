import { URI } from './uri.js';
export interface IKeyIterator<K> {
    reset(key: K): this;
    next(): this;
    hasNext(): boolean;
    cmp(a: string): number;
    value(): string;
}
export declare class StringIterator implements IKeyIterator<string> {
    private _value;
    private _pos;
    reset(key: string): this;
    next(): this;
    hasNext(): boolean;
    cmp(a: string): number;
    value(): string;
}
export declare class ConfigKeysIterator implements IKeyIterator<string> {
    private readonly _caseSensitive;
    private _value;
    private _from;
    private _to;
    constructor(_caseSensitive?: boolean);
    reset(key: string): this;
    hasNext(): boolean;
    next(): this;
    cmp(a: string): number;
    value(): string;
}
export declare class PathIterator implements IKeyIterator<string> {
    private readonly _splitOnBackslash;
    private readonly _caseSensitive;
    private _value;
    private _valueLen;
    private _from;
    private _to;
    constructor(_splitOnBackslash?: boolean, _caseSensitive?: boolean);
    reset(key: string): this;
    hasNext(): boolean;
    next(): this;
    cmp(a: string): number;
    value(): string;
}
export declare class UriIterator implements IKeyIterator<URI> {
    private readonly _ignorePathCasing;
    private readonly _ignoreQueryAndFragment;
    private _pathIterator;
    private _value;
    private _states;
    private _stateIdx;
    constructor(_ignorePathCasing: (uri: URI) => boolean, _ignoreQueryAndFragment: (uri: URI) => boolean);
    reset(key: URI): this;
    next(): this;
    hasNext(): boolean;
    cmp(a: string): number;
    value(): string;
}
export declare class TernarySearchTree<K, V> {
    static forUris<E>(ignorePathCasing?: (key: URI) => boolean, ignoreQueryAndFragment?: (key: URI) => boolean): TernarySearchTree<URI, E>;
    static forPaths<E>(ignorePathCasing?: boolean): TernarySearchTree<string, E>;
    static forStrings<E>(): TernarySearchTree<string, E>;
    static forConfigKeys<E>(): TernarySearchTree<string, E>;
    private _iter;
    private _root;
    constructor(segments: IKeyIterator<K>);
    clear(): void;
    /**
     * Fill the tree with the same value of the given keys
     */
    fill(element: V, keys: readonly K[]): void;
    /**
     * Fill the tree with given [key,value]-tuples
     */
    fill(values: readonly [K, V][]): void;
    set(key: K, element: V): V | undefined;
    get(key: K): V | undefined;
    private _getNode;
    has(key: K): boolean;
    delete(key: K): void;
    deleteSuperstr(key: K): void;
    private _delete;
    private _min;
    findSubstr(key: K): V | undefined;
    findSuperstr(key: K): IterableIterator<[K, V]> | undefined;
    private _findSuperstrOrElement;
    hasElementOrSubtree(key: K): boolean;
    forEach(callback: (value: V, index: K) => unknown): void;
    [Symbol.iterator](): IterableIterator<[K, V]>;
    private _entries;
    private _dfsEntries;
    _isBalanced(): boolean;
}
