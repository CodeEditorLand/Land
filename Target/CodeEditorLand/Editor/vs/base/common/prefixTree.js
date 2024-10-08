/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Iterable } from './iterator.js';
const unset = Symbol('unset');
/**
 * A simple prefix tree implementation where a value is stored based on
 * well-defined prefix segments.
 */
export class WellDefinedPrefixTree {
    constructor() {
        this.root = new Node();
        this._size = 0;
    }
    get size() {
        return this._size;
    }
    /** Gets the top-level nodes of the tree */
    get nodes() {
        return this.root.children?.values() || Iterable.empty();
    }
    /** Gets the top-level nodes of the tree */
    get entries() {
        return this.root.children?.entries() || Iterable.empty();
    }
    /**
     * Inserts a new value in the prefix tree.
     * @param onNode - called for each node as we descend to the insertion point,
     * including the insertion point itself.
     */
    insert(key, value, onNode) {
        this.opNode(key, n => n._value = value, onNode);
    }
    /** Mutates a value in the prefix tree. */
    mutate(key, mutate) {
        this.opNode(key, n => n._value = mutate(n._value === unset ? undefined : n._value));
    }
    /** Mutates nodes along the path in the prefix tree. */
    mutatePath(key, mutate) {
        this.opNode(key, () => { }, n => mutate(n));
    }
    /** Deletes a node from the prefix tree, returning the value it contained. */
    delete(key) {
        const path = this.getPathToKey(key);
        if (!path) {
            return;
        }
        let i = path.length - 1;
        const value = path[i].node._value;
        if (value === unset) {
            return; // not actually a real node
        }
        this._size--;
        path[i].node._value = unset;
        for (; i > 0; i--) {
            const { node, part } = path[i];
            if (node.children?.size || node._value !== unset) {
                break;
            }
            path[i - 1].node.children.delete(part);
        }
        return value;
    }
    /** Deletes a subtree from the prefix tree, returning the values they contained. */
    *deleteRecursive(key) {
        const path = this.getPathToKey(key);
        if (!path) {
            return;
        }
        const subtree = path[path.length - 1].node;
        // important: run the deletion before we start to yield results, so that
        // it still runs even if the caller doesn't consumer the iterator
        for (let i = path.length - 1; i > 0; i--) {
            const parent = path[i - 1];
            parent.node.children.delete(path[i].part);
            if (parent.node.children.size > 0 || parent.node._value !== unset) {
                break;
            }
        }
        for (const node of bfsIterate(subtree)) {
            if (node._value !== unset) {
                this._size--;
                yield node._value;
            }
        }
    }
    /** Gets a value from the tree. */
    find(key) {
        let node = this.root;
        for (const segment of key) {
            const next = node.children?.get(segment);
            if (!next) {
                return undefined;
            }
            node = next;
        }
        return node._value === unset ? undefined : node._value;
    }
    /** Gets whether the tree has the key, or a parent of the key, already inserted. */
    hasKeyOrParent(key) {
        let node = this.root;
        for (const segment of key) {
            const next = node.children?.get(segment);
            if (!next) {
                return false;
            }
            if (next._value !== unset) {
                return true;
            }
            node = next;
        }
        return false;
    }
    /** Gets whether the tree has the given key or any children. */
    hasKeyOrChildren(key) {
        let node = this.root;
        for (const segment of key) {
            const next = node.children?.get(segment);
            if (!next) {
                return false;
            }
            node = next;
        }
        return true;
    }
    /** Gets whether the tree has the given key. */
    hasKey(key) {
        let node = this.root;
        for (const segment of key) {
            const next = node.children?.get(segment);
            if (!next) {
                return false;
            }
            node = next;
        }
        return node._value !== unset;
    }
    getPathToKey(key) {
        const path = [{ part: '', node: this.root }];
        let i = 0;
        for (const part of key) {
            const node = path[i].node.children?.get(part);
            if (!node) {
                return; // node not in tree
            }
            path.push({ part, node });
            i++;
        }
        return path;
    }
    opNode(key, fn, onDescend) {
        let node = this.root;
        for (const part of key) {
            if (!node.children) {
                const next = new Node();
                node.children = new Map([[part, next]]);
                node = next;
            }
            else if (!node.children.has(part)) {
                const next = new Node();
                node.children.set(part, next);
                node = next;
            }
            else {
                node = node.children.get(part);
            }
            onDescend?.(node);
        }
        const sizeBefore = node._value === unset ? 0 : 1;
        fn(node);
        const sizeAfter = node._value === unset ? 0 : 1;
        this._size += sizeAfter - sizeBefore;
    }
    /** Returns an iterable of the tree values in no defined order. */
    *values() {
        for (const { _value } of bfsIterate(this.root)) {
            if (_value !== unset) {
                yield _value;
            }
        }
    }
}
function* bfsIterate(root) {
    const stack = [root];
    while (stack.length > 0) {
        const node = stack.pop();
        yield node;
        if (node.children) {
            for (const child of node.children.values()) {
                stack.push(child);
            }
        }
    }
}
class Node {
    constructor() {
        this._value = unset;
    }
    get value() {
        return this._value === unset ? undefined : this._value;
    }
    set value(value) {
        this._value = value === undefined ? unset : value;
    }
}
