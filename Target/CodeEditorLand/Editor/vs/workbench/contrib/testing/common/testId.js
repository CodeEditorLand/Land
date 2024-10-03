export class TestId {
    static fromExtHostTestItem(item, rootId, parent = item.parent) {
        if (item._isRoot) {
            return new TestId([rootId]);
        }
        const path = [item.id];
        for (let i = parent; i && i.id !== rootId; i = i.parent) {
            path.push(i.id);
        }
        path.push(rootId);
        return new TestId(path.reverse());
    }
    static isRoot(idString) {
        return !idString.includes("\0");
    }
    static root(idString) {
        const idx = idString.indexOf("\0");
        return idx === -1 ? idString : idString.slice(0, idx);
    }
    static fromString(idString) {
        return new TestId(idString.split("\0"));
    }
    static join(base, b) {
        return new TestId([...base.path, b]);
    }
    static joinToString(base, b) {
        return base.toString() + "\0" + b;
    }
    static parentId(idString) {
        const idx = idString.lastIndexOf("\0");
        return idx === -1 ? undefined : idString.slice(0, idx);
    }
    static localId(idString) {
        const idx = idString.lastIndexOf("\0");
        return idx === -1 ? idString : idString.slice(idx + "\0".length);
    }
    static isChild(maybeParent, maybeChild) {
        return maybeChild[maybeParent.length] === "\0" && maybeChild.startsWith(maybeParent);
    }
    static compare(a, b) {
        if (a === b) {
            return 0;
        }
        if (TestId.isChild(a, b)) {
            return 2;
        }
        if (TestId.isChild(b, a)) {
            return 3;
        }
        return 1;
    }
    static getLengthOfCommonPrefix(length, getId) {
        if (length === 0) {
            return 0;
        }
        let commonPrefix = 0;
        while (commonPrefix < length - 1) {
            for (let i = 1; i < length; i++) {
                const a = getId(i - 1);
                const b = getId(i);
                if (a.path[commonPrefix] !== b.path[commonPrefix]) {
                    return commonPrefix;
                }
            }
            commonPrefix++;
        }
        return commonPrefix;
    }
    constructor(path, viewEnd = path.length) {
        this.path = path;
        this.viewEnd = viewEnd;
        if (path.length === 0 || viewEnd < 1) {
            throw new Error('cannot create test with empty path');
        }
    }
    get rootId() {
        return new TestId(this.path, 1);
    }
    get parentId() {
        return this.viewEnd > 1 ? new TestId(this.path, this.viewEnd - 1) : undefined;
    }
    get localId() {
        return this.path[this.viewEnd - 1];
    }
    get controllerId() {
        return this.path[0];
    }
    get isRoot() {
        return this.viewEnd === 1;
    }
    *idsFromRoot() {
        for (let i = 1; i <= this.viewEnd; i++) {
            yield new TestId(this.path, i);
        }
    }
    *idsToRoot() {
        for (let i = this.viewEnd; i > 0; i--) {
            yield new TestId(this.path, i);
        }
    }
    compare(other) {
        if (typeof other === 'string') {
            return TestId.compare(this.toString(), other);
        }
        for (let i = 0; i < other.viewEnd && i < this.viewEnd; i++) {
            if (other.path[i] !== this.path[i]) {
                return 1;
            }
        }
        if (other.viewEnd > this.viewEnd) {
            return 2;
        }
        if (other.viewEnd < this.viewEnd) {
            return 3;
        }
        return 0;
    }
    toJSON() {
        return this.toString();
    }
    toString() {
        if (!this.stringifed) {
            this.stringifed = this.path[0];
            for (let i = 1; i < this.viewEnd; i++) {
                this.stringifed += "\0";
                this.stringifed += this.path[i];
            }
        }
        return this.stringifed;
    }
}
