import { Range } from '../../../common/range.js';
export function groupIntersect(range, groups) {
    const result = [];
    for (const r of groups) {
        if (range.start >= r.range.end) {
            continue;
        }
        if (range.end < r.range.start) {
            break;
        }
        const intersection = Range.intersect(range, r.range);
        if (Range.isEmpty(intersection)) {
            continue;
        }
        result.push({
            range: intersection,
            size: r.size
        });
    }
    return result;
}
export function shift({ start, end }, much) {
    return { start: start + much, end: end + much };
}
export function consolidate(groups) {
    const result = [];
    let previousGroup = null;
    for (const group of groups) {
        const start = group.range.start;
        const end = group.range.end;
        const size = group.size;
        if (previousGroup && size === previousGroup.size) {
            previousGroup.range.end = end;
            continue;
        }
        previousGroup = { range: { start, end }, size };
        result.push(previousGroup);
    }
    return result;
}
function concat(...groups) {
    return consolidate(groups.reduce((r, g) => r.concat(g), []));
}
export class RangeMap {
    get paddingTop() {
        return this._paddingTop;
    }
    set paddingTop(paddingTop) {
        this._size = this._size + paddingTop - this._paddingTop;
        this._paddingTop = paddingTop;
    }
    constructor(topPadding) {
        this.groups = [];
        this._size = 0;
        this._paddingTop = 0;
        this._paddingTop = topPadding ?? 0;
        this._size = this._paddingTop;
    }
    splice(index, deleteCount, items = []) {
        const diff = items.length - deleteCount;
        const before = groupIntersect({ start: 0, end: index }, this.groups);
        const after = groupIntersect({ start: index + deleteCount, end: Number.POSITIVE_INFINITY }, this.groups)
            .map(g => ({ range: shift(g.range, diff), size: g.size }));
        const middle = items.map((item, i) => ({
            range: { start: index + i, end: index + i + 1 },
            size: item.size
        }));
        this.groups = concat(before, middle, after);
        this._size = this._paddingTop + this.groups.reduce((t, g) => t + (g.size * (g.range.end - g.range.start)), 0);
    }
    get count() {
        const len = this.groups.length;
        if (!len) {
            return 0;
        }
        return this.groups[len - 1].range.end;
    }
    get size() {
        return this._size;
    }
    indexAt(position) {
        if (position < 0) {
            return -1;
        }
        if (position < this._paddingTop) {
            return 0;
        }
        let index = 0;
        let size = this._paddingTop;
        for (const group of this.groups) {
            const count = group.range.end - group.range.start;
            const newSize = size + (count * group.size);
            if (position < newSize) {
                return index + Math.floor((position - size) / group.size);
            }
            index += count;
            size = newSize;
        }
        return index;
    }
    indexAfter(position) {
        return Math.min(this.indexAt(position) + 1, this.count);
    }
    positionAt(index) {
        if (index < 0) {
            return -1;
        }
        let position = 0;
        let count = 0;
        for (const group of this.groups) {
            const groupCount = group.range.end - group.range.start;
            const newCount = count + groupCount;
            if (index < newCount) {
                return this._paddingTop + position + ((index - count) * group.size);
            }
            position += groupCount * group.size;
            count = newCount;
        }
        return -1;
    }
}
