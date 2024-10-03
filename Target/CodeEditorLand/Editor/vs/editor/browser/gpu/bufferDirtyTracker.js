export class BufferDirtyTracker {
    get dataOffset() {
        return this._startIndex;
    }
    get dirtySize() {
        if (this._startIndex === undefined || this._endIndex === undefined) {
            return undefined;
        }
        return this._endIndex - this._startIndex + 1;
    }
    get isDirty() { return this._startIndex !== undefined; }
    flag(index, length = 1) {
        this._flag(index);
        if (length > 1) {
            this._flag(index + length - 1);
        }
        return index;
    }
    _flag(index) {
        if (this._startIndex === undefined || index < this._startIndex) {
            this._startIndex = index;
        }
        if (this._endIndex === undefined || index > this._endIndex) {
            this._endIndex = index;
        }
    }
    clear() {
        this._startIndex = undefined;
        this._endIndex = undefined;
    }
}
