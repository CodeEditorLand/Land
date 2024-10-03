export function findLast(array, predicate) {
    const idx = findLastIdx(array, predicate);
    if (idx === -1) {
        return undefined;
    }
    return array[idx];
}
export function findLastIdx(array, predicate, fromIndex = array.length - 1) {
    for (let i = fromIndex; i >= 0; i--) {
        const element = array[i];
        if (predicate(element)) {
            return i;
        }
    }
    return -1;
}
export function findLastMonotonous(array, predicate) {
    const idx = findLastIdxMonotonous(array, predicate);
    return idx === -1 ? undefined : array[idx];
}
export function findLastIdxMonotonous(array, predicate, startIdx = 0, endIdxEx = array.length) {
    let i = startIdx;
    let j = endIdxEx;
    while (i < j) {
        const k = Math.floor((i + j) / 2);
        if (predicate(array[k])) {
            i = k + 1;
        }
        else {
            j = k;
        }
    }
    return i - 1;
}
export function findFirstMonotonous(array, predicate) {
    const idx = findFirstIdxMonotonousOrArrLen(array, predicate);
    return idx === array.length ? undefined : array[idx];
}
export function findFirstIdxMonotonousOrArrLen(array, predicate, startIdx = 0, endIdxEx = array.length) {
    let i = startIdx;
    let j = endIdxEx;
    while (i < j) {
        const k = Math.floor((i + j) / 2);
        if (predicate(array[k])) {
            j = k;
        }
        else {
            i = k + 1;
        }
    }
    return i;
}
export function findFirstIdxMonotonous(array, predicate, startIdx = 0, endIdxEx = array.length) {
    const idx = findFirstIdxMonotonousOrArrLen(array, predicate, startIdx, endIdxEx);
    return idx === array.length ? -1 : idx;
}
export class MonotonousArray {
    static { this.assertInvariants = false; }
    constructor(_array) {
        this._array = _array;
        this._findLastMonotonousLastIdx = 0;
    }
    findLastMonotonous(predicate) {
        if (MonotonousArray.assertInvariants) {
            if (this._prevFindLastPredicate) {
                for (const item of this._array) {
                    if (this._prevFindLastPredicate(item) && !predicate(item)) {
                        throw new Error('MonotonousArray: current predicate must be weaker than (or equal to) the previous predicate.');
                    }
                }
            }
            this._prevFindLastPredicate = predicate;
        }
        const idx = findLastIdxMonotonous(this._array, predicate, this._findLastMonotonousLastIdx);
        this._findLastMonotonousLastIdx = idx + 1;
        return idx === -1 ? undefined : this._array[idx];
    }
}
export function findFirstMax(array, comparator) {
    if (array.length === 0) {
        return undefined;
    }
    let max = array[0];
    for (let i = 1; i < array.length; i++) {
        const item = array[i];
        if (comparator(item, max) > 0) {
            max = item;
        }
    }
    return max;
}
export function findLastMax(array, comparator) {
    if (array.length === 0) {
        return undefined;
    }
    let max = array[0];
    for (let i = 1; i < array.length; i++) {
        const item = array[i];
        if (comparator(item, max) >= 0) {
            max = item;
        }
    }
    return max;
}
export function findFirstMin(array, comparator) {
    return findFirstMax(array, (a, b) => -comparator(a, b));
}
export function findMaxIdx(array, comparator) {
    if (array.length === 0) {
        return -1;
    }
    let maxIdx = 0;
    for (let i = 1; i < array.length; i++) {
        const item = array[i];
        if (comparator(item, array[maxIdx]) > 0) {
            maxIdx = i;
        }
    }
    return maxIdx;
}
export function mapFindFirst(items, mapFn) {
    for (const value of items) {
        const mapped = mapFn(value);
        if (mapped !== undefined) {
            return mapped;
        }
    }
    return undefined;
}
