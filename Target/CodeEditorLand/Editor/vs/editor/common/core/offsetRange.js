import { BugIndicatingError } from '../../../base/common/errors.js';
export class OffsetRange {
    static addRange(range, sortedRanges) {
        let i = 0;
        while (i < sortedRanges.length && sortedRanges[i].endExclusive < range.start) {
            i++;
        }
        let j = i;
        while (j < sortedRanges.length && sortedRanges[j].start <= range.endExclusive) {
            j++;
        }
        if (i === j) {
            sortedRanges.splice(i, 0, range);
        }
        else {
            const start = Math.min(range.start, sortedRanges[i].start);
            const end = Math.max(range.endExclusive, sortedRanges[j - 1].endExclusive);
            sortedRanges.splice(i, j - i, new OffsetRange(start, end));
        }
    }
    static tryCreate(start, endExclusive) {
        if (start > endExclusive) {
            return undefined;
        }
        return new OffsetRange(start, endExclusive);
    }
    static ofLength(length) {
        return new OffsetRange(0, length);
    }
    static ofStartAndLength(start, length) {
        return new OffsetRange(start, start + length);
    }
    static emptyAt(offset) {
        return new OffsetRange(offset, offset);
    }
    constructor(start, endExclusive) {
        this.start = start;
        this.endExclusive = endExclusive;
        if (start > endExclusive) {
            throw new BugIndicatingError(`Invalid range: ${this.toString()}`);
        }
    }
    get isEmpty() {
        return this.start === this.endExclusive;
    }
    delta(offset) {
        return new OffsetRange(this.start + offset, this.endExclusive + offset);
    }
    deltaStart(offset) {
        return new OffsetRange(this.start + offset, this.endExclusive);
    }
    deltaEnd(offset) {
        return new OffsetRange(this.start, this.endExclusive + offset);
    }
    get length() {
        return this.endExclusive - this.start;
    }
    toString() {
        return `[${this.start}, ${this.endExclusive})`;
    }
    equals(other) {
        return this.start === other.start && this.endExclusive === other.endExclusive;
    }
    containsRange(other) {
        return this.start <= other.start && other.endExclusive <= this.endExclusive;
    }
    contains(offset) {
        return this.start <= offset && offset < this.endExclusive;
    }
    join(other) {
        return new OffsetRange(Math.min(this.start, other.start), Math.max(this.endExclusive, other.endExclusive));
    }
    intersect(other) {
        const start = Math.max(this.start, other.start);
        const end = Math.min(this.endExclusive, other.endExclusive);
        if (start <= end) {
            return new OffsetRange(start, end);
        }
        return undefined;
    }
    intersectionLength(range) {
        const start = Math.max(this.start, range.start);
        const end = Math.min(this.endExclusive, range.endExclusive);
        return Math.max(0, end - start);
    }
    intersects(other) {
        const start = Math.max(this.start, other.start);
        const end = Math.min(this.endExclusive, other.endExclusive);
        return start < end;
    }
    intersectsOrTouches(other) {
        const start = Math.max(this.start, other.start);
        const end = Math.min(this.endExclusive, other.endExclusive);
        return start <= end;
    }
    isBefore(other) {
        return this.endExclusive <= other.start;
    }
    isAfter(other) {
        return this.start >= other.endExclusive;
    }
    slice(arr) {
        return arr.slice(this.start, this.endExclusive);
    }
    substring(str) {
        return str.substring(this.start, this.endExclusive);
    }
    clip(value) {
        if (this.isEmpty) {
            throw new BugIndicatingError(`Invalid clipping range: ${this.toString()}`);
        }
        return Math.max(this.start, Math.min(this.endExclusive - 1, value));
    }
    clipCyclic(value) {
        if (this.isEmpty) {
            throw new BugIndicatingError(`Invalid clipping range: ${this.toString()}`);
        }
        if (value < this.start) {
            return this.endExclusive - ((this.start - value) % this.length);
        }
        if (value >= this.endExclusive) {
            return this.start + ((value - this.start) % this.length);
        }
        return value;
    }
    map(f) {
        const result = [];
        for (let i = this.start; i < this.endExclusive; i++) {
            result.push(f(i));
        }
        return result;
    }
    forEach(f) {
        for (let i = this.start; i < this.endExclusive; i++) {
            f(i);
        }
    }
}
export class OffsetRangeSet {
    constructor() {
        this._sortedRanges = [];
    }
    addRange(range) {
        let i = 0;
        while (i < this._sortedRanges.length && this._sortedRanges[i].endExclusive < range.start) {
            i++;
        }
        let j = i;
        while (j < this._sortedRanges.length && this._sortedRanges[j].start <= range.endExclusive) {
            j++;
        }
        if (i === j) {
            this._sortedRanges.splice(i, 0, range);
        }
        else {
            const start = Math.min(range.start, this._sortedRanges[i].start);
            const end = Math.max(range.endExclusive, this._sortedRanges[j - 1].endExclusive);
            this._sortedRanges.splice(i, j - i, new OffsetRange(start, end));
        }
    }
    toString() {
        return this._sortedRanges.map(r => r.toString()).join(', ');
    }
    intersectsStrict(other) {
        let i = 0;
        while (i < this._sortedRanges.length && this._sortedRanges[i].endExclusive <= other.start) {
            i++;
        }
        return i < this._sortedRanges.length && this._sortedRanges[i].start < other.endExclusive;
    }
    intersectWithRange(other) {
        const result = new OffsetRangeSet();
        for (const range of this._sortedRanges) {
            const intersection = range.intersect(other);
            if (intersection) {
                result.addRange(intersection);
            }
        }
        return result;
    }
    intersectWithRangeLength(other) {
        return this.intersectWithRange(other).length;
    }
    get length() {
        return this._sortedRanges.reduce((prev, cur) => prev + cur.length, 0);
    }
}
