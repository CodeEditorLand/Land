declare const unset: unique symbol;
export interface IPrefixTreeNode<T> {
    children?: ReadonlyMap<string, Node<T>>;
    value: T | undefined;
}
export declare class WellDefinedPrefixTree<V> {
    private readonly root;
    private _size;
    get size(): number;
    get nodes(): Iterable<IPrefixTreeNode<V>>;
    get entries(): Iterable<[string, IPrefixTreeNode<V>]>;
    insert(key: Iterable<string>, value: V, onNode?: (n: IPrefixTreeNode<V>) => void): void;
    mutate(key: Iterable<string>, mutate: (value?: V) => V): void;
    mutatePath(key: Iterable<string>, mutate: (node: IPrefixTreeNode<V>) => void): void;
    delete(key: Iterable<string>): V | undefined;
    deleteRecursive(key: Iterable<string>): Iterable<V>;
    find(key: Iterable<string>): V | undefined;
    hasKeyOrParent(key: Iterable<string>): boolean;
    hasKeyOrChildren(key: Iterable<string>): boolean;
    hasKey(key: Iterable<string>): boolean;
    private getPathToKey;
    private opNode;
    values(): Generator<V, void, unknown>;
}
declare class Node<T> implements IPrefixTreeNode<T> {
    children?: Map<string, Node<T>>;
    get value(): T | undefined;
    set value(value: T | undefined);
    _value: T | typeof unset;
}
export {};
