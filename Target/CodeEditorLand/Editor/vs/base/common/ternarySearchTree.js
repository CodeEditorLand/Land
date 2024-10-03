import { shuffle } from './arrays.js';
import { compare, compareIgnoreCase, compareSubstring, compareSubstringIgnoreCase } from './strings.js';
export class StringIterator {
    constructor() {
        this._value = '';
        this._pos = 0;
    }
    reset(key) {
        this._value = key;
        this._pos = 0;
        return this;
    }
    next() {
        this._pos += 1;
        return this;
    }
    hasNext() {
        return this._pos < this._value.length - 1;
    }
    cmp(a) {
        const aCode = a.charCodeAt(0);
        const thisCode = this._value.charCodeAt(this._pos);
        return aCode - thisCode;
    }
    value() {
        return this._value[this._pos];
    }
}
export class ConfigKeysIterator {
    constructor(_caseSensitive = true) {
        this._caseSensitive = _caseSensitive;
    }
    reset(key) {
        this._value = key;
        this._from = 0;
        this._to = 0;
        return this.next();
    }
    hasNext() {
        return this._to < this._value.length;
    }
    next() {
        this._from = this._to;
        let justSeps = true;
        for (; this._to < this._value.length; this._to++) {
            const ch = this._value.charCodeAt(this._to);
            if (ch === 46) {
                if (justSeps) {
                    this._from++;
                }
                else {
                    break;
                }
            }
            else {
                justSeps = false;
            }
        }
        return this;
    }
    cmp(a) {
        return this._caseSensitive
            ? compareSubstring(a, this._value, 0, a.length, this._from, this._to)
            : compareSubstringIgnoreCase(a, this._value, 0, a.length, this._from, this._to);
    }
    value() {
        return this._value.substring(this._from, this._to);
    }
}
export class PathIterator {
    constructor(_splitOnBackslash = true, _caseSensitive = true) {
        this._splitOnBackslash = _splitOnBackslash;
        this._caseSensitive = _caseSensitive;
    }
    reset(key) {
        this._from = 0;
        this._to = 0;
        this._value = key;
        this._valueLen = key.length;
        for (let pos = key.length - 1; pos >= 0; pos--, this._valueLen--) {
            const ch = this._value.charCodeAt(pos);
            if (!(ch === 47 || this._splitOnBackslash && ch === 92)) {
                break;
            }
        }
        return this.next();
    }
    hasNext() {
        return this._to < this._valueLen;
    }
    next() {
        this._from = this._to;
        let justSeps = true;
        for (; this._to < this._valueLen; this._to++) {
            const ch = this._value.charCodeAt(this._to);
            if (ch === 47 || this._splitOnBackslash && ch === 92) {
                if (justSeps) {
                    this._from++;
                }
                else {
                    break;
                }
            }
            else {
                justSeps = false;
            }
        }
        return this;
    }
    cmp(a) {
        return this._caseSensitive
            ? compareSubstring(a, this._value, 0, a.length, this._from, this._to)
            : compareSubstringIgnoreCase(a, this._value, 0, a.length, this._from, this._to);
    }
    value() {
        return this._value.substring(this._from, this._to);
    }
}
export class UriIterator {
    constructor(_ignorePathCasing, _ignoreQueryAndFragment) {
        this._ignorePathCasing = _ignorePathCasing;
        this._ignoreQueryAndFragment = _ignoreQueryAndFragment;
        this._states = [];
        this._stateIdx = 0;
    }
    reset(key) {
        this._value = key;
        this._states = [];
        if (this._value.scheme) {
            this._states.push(1);
        }
        if (this._value.authority) {
            this._states.push(2);
        }
        if (this._value.path) {
            this._pathIterator = new PathIterator(false, !this._ignorePathCasing(key));
            this._pathIterator.reset(key.path);
            if (this._pathIterator.value()) {
                this._states.push(3);
            }
        }
        if (!this._ignoreQueryAndFragment(key)) {
            if (this._value.query) {
                this._states.push(4);
            }
            if (this._value.fragment) {
                this._states.push(5);
            }
        }
        this._stateIdx = 0;
        return this;
    }
    next() {
        if (this._states[this._stateIdx] === 3 && this._pathIterator.hasNext()) {
            this._pathIterator.next();
        }
        else {
            this._stateIdx += 1;
        }
        return this;
    }
    hasNext() {
        return (this._states[this._stateIdx] === 3 && this._pathIterator.hasNext())
            || this._stateIdx < this._states.length - 1;
    }
    cmp(a) {
        if (this._states[this._stateIdx] === 1) {
            return compareIgnoreCase(a, this._value.scheme);
        }
        else if (this._states[this._stateIdx] === 2) {
            return compareIgnoreCase(a, this._value.authority);
        }
        else if (this._states[this._stateIdx] === 3) {
            return this._pathIterator.cmp(a);
        }
        else if (this._states[this._stateIdx] === 4) {
            return compare(a, this._value.query);
        }
        else if (this._states[this._stateIdx] === 5) {
            return compare(a, this._value.fragment);
        }
        throw new Error();
    }
    value() {
        if (this._states[this._stateIdx] === 1) {
            return this._value.scheme;
        }
        else if (this._states[this._stateIdx] === 2) {
            return this._value.authority;
        }
        else if (this._states[this._stateIdx] === 3) {
            return this._pathIterator.value();
        }
        else if (this._states[this._stateIdx] === 4) {
            return this._value.query;
        }
        else if (this._states[this._stateIdx] === 5) {
            return this._value.fragment;
        }
        throw new Error();
    }
}
class TernarySearchTreeNode {
    constructor() {
        this.height = 1;
    }
    isEmpty() {
        return !this.left && !this.mid && !this.right && !this.value;
    }
    rotateLeft() {
        const tmp = this.right;
        this.right = tmp.left;
        tmp.left = this;
        this.updateHeight();
        tmp.updateHeight();
        return tmp;
    }
    rotateRight() {
        const tmp = this.left;
        this.left = tmp.right;
        tmp.right = this;
        this.updateHeight();
        tmp.updateHeight();
        return tmp;
    }
    updateHeight() {
        this.height = 1 + Math.max(this.heightLeft, this.heightRight);
    }
    balanceFactor() {
        return this.heightRight - this.heightLeft;
    }
    get heightLeft() {
        return this.left?.height ?? 0;
    }
    get heightRight() {
        return this.right?.height ?? 0;
    }
}
export class TernarySearchTree {
    static forUris(ignorePathCasing = () => false, ignoreQueryAndFragment = () => false) {
        return new TernarySearchTree(new UriIterator(ignorePathCasing, ignoreQueryAndFragment));
    }
    static forPaths(ignorePathCasing = false) {
        return new TernarySearchTree(new PathIterator(undefined, !ignorePathCasing));
    }
    static forStrings() {
        return new TernarySearchTree(new StringIterator());
    }
    static forConfigKeys() {
        return new TernarySearchTree(new ConfigKeysIterator());
    }
    constructor(segments) {
        this._iter = segments;
    }
    clear() {
        this._root = undefined;
    }
    fill(values, keys) {
        if (keys) {
            const arr = keys.slice(0);
            shuffle(arr);
            for (const k of arr) {
                this.set(k, values);
            }
        }
        else {
            const arr = values.slice(0);
            shuffle(arr);
            for (const entry of arr) {
                this.set(entry[0], entry[1]);
            }
        }
    }
    set(key, element) {
        const iter = this._iter.reset(key);
        let node;
        if (!this._root) {
            this._root = new TernarySearchTreeNode();
            this._root.segment = iter.value();
        }
        const stack = [];
        node = this._root;
        while (true) {
            const val = iter.cmp(node.segment);
            if (val > 0) {
                if (!node.left) {
                    node.left = new TernarySearchTreeNode();
                    node.left.segment = iter.value();
                }
                stack.push([-1, node]);
                node = node.left;
            }
            else if (val < 0) {
                if (!node.right) {
                    node.right = new TernarySearchTreeNode();
                    node.right.segment = iter.value();
                }
                stack.push([1, node]);
                node = node.right;
            }
            else if (iter.hasNext()) {
                iter.next();
                if (!node.mid) {
                    node.mid = new TernarySearchTreeNode();
                    node.mid.segment = iter.value();
                }
                stack.push([0, node]);
                node = node.mid;
            }
            else {
                break;
            }
        }
        const oldElement = node.value;
        node.value = element;
        node.key = key;
        for (let i = stack.length - 1; i >= 0; i--) {
            const node = stack[i][1];
            node.updateHeight();
            const bf = node.balanceFactor();
            if (bf < -1 || bf > 1) {
                const d1 = stack[i][0];
                const d2 = stack[i + 1][0];
                if (d1 === 1 && d2 === 1) {
                    stack[i][1] = node.rotateLeft();
                }
                else if (d1 === -1 && d2 === -1) {
                    stack[i][1] = node.rotateRight();
                }
                else if (d1 === 1 && d2 === -1) {
                    node.right = stack[i + 1][1] = stack[i + 1][1].rotateRight();
                    stack[i][1] = node.rotateLeft();
                }
                else if (d1 === -1 && d2 === 1) {
                    node.left = stack[i + 1][1] = stack[i + 1][1].rotateLeft();
                    stack[i][1] = node.rotateRight();
                }
                else {
                    throw new Error();
                }
                if (i > 0) {
                    switch (stack[i - 1][0]) {
                        case -1:
                            stack[i - 1][1].left = stack[i][1];
                            break;
                        case 1:
                            stack[i - 1][1].right = stack[i][1];
                            break;
                        case 0:
                            stack[i - 1][1].mid = stack[i][1];
                            break;
                    }
                }
                else {
                    this._root = stack[0][1];
                }
            }
        }
        return oldElement;
    }
    get(key) {
        return this._getNode(key)?.value;
    }
    _getNode(key) {
        const iter = this._iter.reset(key);
        let node = this._root;
        while (node) {
            const val = iter.cmp(node.segment);
            if (val > 0) {
                node = node.left;
            }
            else if (val < 0) {
                node = node.right;
            }
            else if (iter.hasNext()) {
                iter.next();
                node = node.mid;
            }
            else {
                break;
            }
        }
        return node;
    }
    has(key) {
        const node = this._getNode(key);
        return !(node?.value === undefined && node?.mid === undefined);
    }
    delete(key) {
        return this._delete(key, false);
    }
    deleteSuperstr(key) {
        return this._delete(key, true);
    }
    _delete(key, superStr) {
        const iter = this._iter.reset(key);
        const stack = [];
        let node = this._root;
        while (node) {
            const val = iter.cmp(node.segment);
            if (val > 0) {
                stack.push([-1, node]);
                node = node.left;
            }
            else if (val < 0) {
                stack.push([1, node]);
                node = node.right;
            }
            else if (iter.hasNext()) {
                iter.next();
                stack.push([0, node]);
                node = node.mid;
            }
            else {
                break;
            }
        }
        if (!node) {
            return;
        }
        if (superStr) {
            node.left = undefined;
            node.mid = undefined;
            node.right = undefined;
            node.height = 1;
        }
        else {
            node.key = undefined;
            node.value = undefined;
        }
        if (!node.mid && !node.value) {
            if (node.left && node.right) {
                const min = this._min(node.right);
                if (min.key) {
                    const { key, value, segment } = min;
                    this._delete(min.key, false);
                    node.key = key;
                    node.value = value;
                    node.segment = segment;
                }
            }
            else {
                const newChild = node.left ?? node.right;
                if (stack.length > 0) {
                    const [dir, parent] = stack[stack.length - 1];
                    switch (dir) {
                        case -1:
                            parent.left = newChild;
                            break;
                        case 0:
                            parent.mid = newChild;
                            break;
                        case 1:
                            parent.right = newChild;
                            break;
                    }
                }
                else {
                    this._root = newChild;
                }
            }
        }
        for (let i = stack.length - 1; i >= 0; i--) {
            const node = stack[i][1];
            node.updateHeight();
            const bf = node.balanceFactor();
            if (bf > 1) {
                if (node.right.balanceFactor() >= 0) {
                    stack[i][1] = node.rotateLeft();
                }
                else {
                    node.right = node.right.rotateRight();
                    stack[i][1] = node.rotateLeft();
                }
            }
            else if (bf < -1) {
                if (node.left.balanceFactor() <= 0) {
                    stack[i][1] = node.rotateRight();
                }
                else {
                    node.left = node.left.rotateLeft();
                    stack[i][1] = node.rotateRight();
                }
            }
            if (i > 0) {
                switch (stack[i - 1][0]) {
                    case -1:
                        stack[i - 1][1].left = stack[i][1];
                        break;
                    case 1:
                        stack[i - 1][1].right = stack[i][1];
                        break;
                    case 0:
                        stack[i - 1][1].mid = stack[i][1];
                        break;
                }
            }
            else {
                this._root = stack[0][1];
            }
        }
    }
    _min(node) {
        while (node.left) {
            node = node.left;
        }
        return node;
    }
    findSubstr(key) {
        const iter = this._iter.reset(key);
        let node = this._root;
        let candidate = undefined;
        while (node) {
            const val = iter.cmp(node.segment);
            if (val > 0) {
                node = node.left;
            }
            else if (val < 0) {
                node = node.right;
            }
            else if (iter.hasNext()) {
                iter.next();
                candidate = node.value || candidate;
                node = node.mid;
            }
            else {
                break;
            }
        }
        return node && node.value || candidate;
    }
    findSuperstr(key) {
        return this._findSuperstrOrElement(key, false);
    }
    _findSuperstrOrElement(key, allowValue) {
        const iter = this._iter.reset(key);
        let node = this._root;
        while (node) {
            const val = iter.cmp(node.segment);
            if (val > 0) {
                node = node.left;
            }
            else if (val < 0) {
                node = node.right;
            }
            else if (iter.hasNext()) {
                iter.next();
                node = node.mid;
            }
            else {
                if (!node.mid) {
                    if (allowValue) {
                        return node.value;
                    }
                    else {
                        return undefined;
                    }
                }
                else {
                    return this._entries(node.mid);
                }
            }
        }
        return undefined;
    }
    hasElementOrSubtree(key) {
        return this._findSuperstrOrElement(key, true) !== undefined;
    }
    forEach(callback) {
        for (const [key, value] of this) {
            callback(value, key);
        }
    }
    *[Symbol.iterator]() {
        yield* this._entries(this._root);
    }
    _entries(node) {
        const result = [];
        this._dfsEntries(node, result);
        return result[Symbol.iterator]();
    }
    _dfsEntries(node, bucket) {
        if (!node) {
            return;
        }
        if (node.left) {
            this._dfsEntries(node.left, bucket);
        }
        if (node.value) {
            bucket.push([node.key, node.value]);
        }
        if (node.mid) {
            this._dfsEntries(node.mid, bucket);
        }
        if (node.right) {
            this._dfsEntries(node.right, bucket);
        }
    }
    _isBalanced() {
        const nodeIsBalanced = (node) => {
            if (!node) {
                return true;
            }
            const bf = node.balanceFactor();
            if (bf < -1 || bf > 1) {
                return false;
            }
            return nodeIsBalanced(node.left) && nodeIsBalanced(node.right);
        };
        return nodeIsBalanced(this._root);
    }
}
