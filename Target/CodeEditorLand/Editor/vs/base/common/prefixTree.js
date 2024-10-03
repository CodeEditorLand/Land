import { Iterable } from './iterator.js';
const unset = Symbol('unset');
export class WellDefinedPrefixTree {
    constructor() {
        this.root = new Node();
        this._size = 0;
    }
    get size() {
        return this._size;
    }
    get nodes() {
        return this.root.children?.values() || Iterable.empty();
    }
    get entries() {
        return this.root.children?.entries() || Iterable.empty();
    }
    insert(key, value, onNode) {
        this.opNode(key, n => n._value = value, onNode);
    }
    mutate(key, mutate) {
        this.opNode(key, n => n._value = mutate(n._value === unset ? undefined : n._value));
    }
    mutatePath(key, mutate) {
        this.opNode(key, () => { }, n => mutate(n));
    }
    delete(key) {
        const path = this.getPathToKey(key);
        if (!path) {
            return;
        }
        let i = path.length - 1;
        const value = path[i].node._value;
        if (value === unset) {
            return;
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
    *deleteRecursive(key) {
        const path = this.getPathToKey(key);
        if (!path) {
            return;
        }
        const subtree = path[path.length - 1].node;
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
                return;
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
