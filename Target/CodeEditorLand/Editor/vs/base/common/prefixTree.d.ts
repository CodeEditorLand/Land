declare const unset: unique symbol;
export interface IPrefixTreeNode<T> {
    /** Possible children of the node. */
    children?: ReadonlyMap<string, Node<T>>;
    /** The value if data exists for this node in the tree. Mutable. */
    value: T | undefined;
}
/**
 * A simple prefix tree implementation where a value is stored based on
 * well-defined prefix segments.
 */
export declare class WellDefinedPrefixTree<V> {
    private readonly root;
    private _size;
    get size(): number;
    /** Gets the top-level nodes of the tree */
    get nodes(): Iterable<IPrefixTreeNode<V>>;
    /** Gets the top-level nodes of the tree */
    get entries(): Iterable<[string, IPrefixTreeNode<V>]>;
    /**
     * Inserts a new value in the prefix tree.
     * @param onNode - called for each node as we descend to the insertion point,
     * including the insertion point itself.
     */
    insert(key: Iterable<string>, value: V, onNode?: (n: IPrefixTreeNode<V>) => void): void;
    /** Mutates a value in the prefix tree. */
    mutate(key: Iterable<string>, mutate: (value?: V) => V): void;
    /** Mutates nodes along the path in the prefix tree. */
    mutatePath(key: Iterable<string>, mutate: (node: IPrefixTreeNode<V>) => void): void;
    /** Deletes a node from the prefix tree, returning the value it contained. */
    delete(key: Iterable<string>): V | undefined;
    /** Deletes a subtree from the prefix tree, returning the values they contained. */
    deleteRecursive(key: Iterable<string>): Iterable<V>;
    /** Gets a value from the tree. */
    find(key: Iterable<string>): V | undefined;
    /** Gets whether the tree has the key, or a parent of the key, already inserted. */
    hasKeyOrParent(key: Iterable<string>): boolean;
    /** Gets whether the tree has the given key or any children. */
    hasKeyOrChildren(key: Iterable<string>): boolean;
    /** Gets whether the tree has the given key. */
    hasKey(key: Iterable<string>): boolean;
    private getPathToKey;
    private opNode;
    /** Returns an iterable of the tree values in no defined order. */
    values(): Generator<V, void, unknown>;
}
declare class Node<T> implements IPrefixTreeNode<T> {
    children?: Map<string, Node<T>>;
    get value(): T | undefined;
    set value(value: T | undefined);
    _value: T | typeof unset;
}
export {};
