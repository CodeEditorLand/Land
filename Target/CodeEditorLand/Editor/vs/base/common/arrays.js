import { findFirstIdxMonotonousOrArrLen } from './arraysFind.js';
import { CancellationError } from './errors.js';
export function tail(array, n = 0) {
    return array[array.length - (1 + n)];
}
export function tail2(arr) {
    if (arr.length === 0) {
        throw new Error('Invalid tail call');
    }
    return [arr.slice(0, arr.length - 1), arr[arr.length - 1]];
}
export function equals(one, other, itemEquals = (a, b) => a === b) {
    if (one === other) {
        return true;
    }
    if (!one || !other) {
        return false;
    }
    if (one.length !== other.length) {
        return false;
    }
    for (let i = 0, len = one.length; i < len; i++) {
        if (!itemEquals(one[i], other[i])) {
            return false;
        }
    }
    return true;
}
export function removeFastWithoutKeepingOrder(array, index) {
    const last = array.length - 1;
    if (index < last) {
        array[index] = array[last];
    }
    array.pop();
}
export function binarySearch(array, key, comparator) {
    return binarySearch2(array.length, i => comparator(array[i], key));
}
export function binarySearch2(length, compareToKey) {
    let low = 0, high = length - 1;
    while (low <= high) {
        const mid = ((low + high) / 2) | 0;
        const comp = compareToKey(mid);
        if (comp < 0) {
            low = mid + 1;
        }
        else if (comp > 0) {
            high = mid - 1;
        }
        else {
            return mid;
        }
    }
    return -(low + 1);
}
export function quickSelect(nth, data, compare) {
    nth = nth | 0;
    if (nth >= data.length) {
        throw new TypeError('invalid index');
    }
    const pivotValue = data[Math.floor(data.length * Math.random())];
    const lower = [];
    const higher = [];
    const pivots = [];
    for (const value of data) {
        const val = compare(value, pivotValue);
        if (val < 0) {
            lower.push(value);
        }
        else if (val > 0) {
            higher.push(value);
        }
        else {
            pivots.push(value);
        }
    }
    if (nth < lower.length) {
        return quickSelect(nth, lower, compare);
    }
    else if (nth < lower.length + pivots.length) {
        return pivots[0];
    }
    else {
        return quickSelect(nth - (lower.length + pivots.length), higher, compare);
    }
}
export function groupBy(data, compare) {
    const result = [];
    let currentGroup = undefined;
    for (const element of data.slice(0).sort(compare)) {
        if (!currentGroup || compare(currentGroup[0], element) !== 0) {
            currentGroup = [element];
            result.push(currentGroup);
        }
        else {
            currentGroup.push(element);
        }
    }
    return result;
}
export function* groupAdjacentBy(items, shouldBeGrouped) {
    let currentGroup;
    let last;
    for (const item of items) {
        if (last !== undefined && shouldBeGrouped(last, item)) {
            currentGroup.push(item);
        }
        else {
            if (currentGroup) {
                yield currentGroup;
            }
            currentGroup = [item];
        }
        last = item;
    }
    if (currentGroup) {
        yield currentGroup;
    }
}
export function forEachAdjacent(arr, f) {
    for (let i = 0; i <= arr.length; i++) {
        f(i === 0 ? undefined : arr[i - 1], i === arr.length ? undefined : arr[i]);
    }
}
export function forEachWithNeighbors(arr, f) {
    for (let i = 0; i < arr.length; i++) {
        f(i === 0 ? undefined : arr[i - 1], arr[i], i + 1 === arr.length ? undefined : arr[i + 1]);
    }
}
export function sortedDiff(before, after, compare) {
    const result = [];
    function pushSplice(start, deleteCount, toInsert) {
        if (deleteCount === 0 && toInsert.length === 0) {
            return;
        }
        const latest = result[result.length - 1];
        if (latest && latest.start + latest.deleteCount === start) {
            latest.deleteCount += deleteCount;
            latest.toInsert.push(...toInsert);
        }
        else {
            result.push({ start, deleteCount, toInsert });
        }
    }
    let beforeIdx = 0;
    let afterIdx = 0;
    while (true) {
        if (beforeIdx === before.length) {
            pushSplice(beforeIdx, 0, after.slice(afterIdx));
            break;
        }
        if (afterIdx === after.length) {
            pushSplice(beforeIdx, before.length - beforeIdx, []);
            break;
        }
        const beforeElement = before[beforeIdx];
        const afterElement = after[afterIdx];
        const n = compare(beforeElement, afterElement);
        if (n === 0) {
            beforeIdx += 1;
            afterIdx += 1;
        }
        else if (n < 0) {
            pushSplice(beforeIdx, 1, []);
            beforeIdx += 1;
        }
        else if (n > 0) {
            pushSplice(beforeIdx, 0, [afterElement]);
            afterIdx += 1;
        }
    }
    return result;
}
export function delta(before, after, compare) {
    const splices = sortedDiff(before, after, compare);
    const removed = [];
    const added = [];
    for (const splice of splices) {
        removed.push(...before.slice(splice.start, splice.start + splice.deleteCount));
        added.push(...splice.toInsert);
    }
    return { removed, added };
}
export function top(array, compare, n) {
    if (n === 0) {
        return [];
    }
    const result = array.slice(0, n).sort(compare);
    topStep(array, compare, result, n, array.length);
    return result;
}
export function topAsync(array, compare, n, batch, token) {
    if (n === 0) {
        return Promise.resolve([]);
    }
    return new Promise((resolve, reject) => {
        (async () => {
            const o = array.length;
            const result = array.slice(0, n).sort(compare);
            for (let i = n, m = Math.min(n + batch, o); i < o; i = m, m = Math.min(m + batch, o)) {
                if (i > n) {
                    await new Promise(resolve => setTimeout(resolve));
                }
                if (token && token.isCancellationRequested) {
                    throw new CancellationError();
                }
                topStep(array, compare, result, i, m);
            }
            return result;
        })()
            .then(resolve, reject);
    });
}
function topStep(array, compare, result, i, m) {
    for (const n = result.length; i < m; i++) {
        const element = array[i];
        if (compare(element, result[n - 1]) < 0) {
            result.pop();
            const j = findFirstIdxMonotonousOrArrLen(result, e => compare(element, e) < 0);
            result.splice(j, 0, element);
        }
    }
}
export function coalesce(array) {
    return array.filter((e) => !!e);
}
export function coalesceInPlace(array) {
    let to = 0;
    for (let i = 0; i < array.length; i++) {
        if (!!array[i]) {
            array[to] = array[i];
            to += 1;
        }
    }
    array.length = to;
}
export function move(array, from, to) {
    array.splice(to, 0, array.splice(from, 1)[0]);
}
export function isFalsyOrEmpty(obj) {
    return !Array.isArray(obj) || obj.length === 0;
}
export function isNonEmptyArray(obj) {
    return Array.isArray(obj) && obj.length > 0;
}
export function distinct(array, keyFn = value => value) {
    const seen = new Set();
    return array.filter(element => {
        const key = keyFn(element);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    });
}
export function uniqueFilter(keyFn) {
    const seen = new Set();
    return element => {
        const key = keyFn(element);
        if (seen.has(key)) {
            return false;
        }
        seen.add(key);
        return true;
    };
}
export function commonPrefixLength(one, other, equals = (a, b) => a === b) {
    let result = 0;
    for (let i = 0, len = Math.min(one.length, other.length); i < len && equals(one[i], other[i]); i++) {
        result++;
    }
    return result;
}
export function range(arg, to) {
    let from = typeof to === 'number' ? arg : 0;
    if (typeof to === 'number') {
        from = arg;
    }
    else {
        from = 0;
        to = arg;
    }
    const result = [];
    if (from <= to) {
        for (let i = from; i < to; i++) {
            result.push(i);
        }
    }
    else {
        for (let i = from; i > to; i--) {
            result.push(i);
        }
    }
    return result;
}
export function index(array, indexer, mapper) {
    return array.reduce((r, t) => {
        r[indexer(t)] = mapper ? mapper(t) : t;
        return r;
    }, Object.create(null));
}
export function insert(array, element) {
    array.push(element);
    return () => remove(array, element);
}
export function remove(array, element) {
    const index = array.indexOf(element);
    if (index > -1) {
        array.splice(index, 1);
        return element;
    }
    return undefined;
}
export function arrayInsert(target, insertIndex, insertArr) {
    const before = target.slice(0, insertIndex);
    const after = target.slice(insertIndex);
    return before.concat(insertArr, after);
}
export function shuffle(array, _seed) {
    let rand;
    if (typeof _seed === 'number') {
        let seed = _seed;
        rand = () => {
            const x = Math.sin(seed++) * 179426549;
            return x - Math.floor(x);
        };
    }
    else {
        rand = Math.random;
    }
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(rand() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
}
export function pushToStart(arr, value) {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
        arr.unshift(value);
    }
}
export function pushToEnd(arr, value) {
    const index = arr.indexOf(value);
    if (index > -1) {
        arr.splice(index, 1);
        arr.push(value);
    }
}
export function pushMany(arr, items) {
    for (const item of items) {
        arr.push(item);
    }
}
export function mapArrayOrNot(items, fn) {
    return Array.isArray(items) ?
        items.map(fn) :
        fn(items);
}
export function asArray(x) {
    return Array.isArray(x) ? x : [x];
}
export function getRandomElement(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
export function insertInto(array, start, newItems) {
    const startIdx = getActualStartIndex(array, start);
    const originalLength = array.length;
    const newItemsLength = newItems.length;
    array.length = originalLength + newItemsLength;
    for (let i = originalLength - 1; i >= startIdx; i--) {
        array[i + newItemsLength] = array[i];
    }
    for (let i = 0; i < newItemsLength; i++) {
        array[i + startIdx] = newItems[i];
    }
}
export function splice(array, start, deleteCount, newItems) {
    const index = getActualStartIndex(array, start);
    let result = array.splice(index, deleteCount);
    if (result === undefined) {
        result = [];
    }
    insertInto(array, index, newItems);
    return result;
}
function getActualStartIndex(array, start) {
    return start < 0 ? Math.max(start + array.length, 0) : Math.min(start, array.length);
}
export var CompareResult;
(function (CompareResult) {
    function isLessThan(result) {
        return result < 0;
    }
    CompareResult.isLessThan = isLessThan;
    function isLessThanOrEqual(result) {
        return result <= 0;
    }
    CompareResult.isLessThanOrEqual = isLessThanOrEqual;
    function isGreaterThan(result) {
        return result > 0;
    }
    CompareResult.isGreaterThan = isGreaterThan;
    function isNeitherLessOrGreaterThan(result) {
        return result === 0;
    }
    CompareResult.isNeitherLessOrGreaterThan = isNeitherLessOrGreaterThan;
    CompareResult.greaterThan = 1;
    CompareResult.lessThan = -1;
    CompareResult.neitherLessOrGreaterThan = 0;
})(CompareResult || (CompareResult = {}));
export function compareBy(selector, comparator) {
    return (a, b) => comparator(selector(a), selector(b));
}
export function tieBreakComparators(...comparators) {
    return (item1, item2) => {
        for (const comparator of comparators) {
            const result = comparator(item1, item2);
            if (!CompareResult.isNeitherLessOrGreaterThan(result)) {
                return result;
            }
        }
        return CompareResult.neitherLessOrGreaterThan;
    };
}
export const numberComparator = (a, b) => a - b;
export const booleanComparator = (a, b) => numberComparator(a ? 1 : 0, b ? 1 : 0);
export function reverseOrder(comparator) {
    return (a, b) => -comparator(a, b);
}
export class ArrayQueue {
    constructor(items) {
        this.items = items;
        this.firstIdx = 0;
        this.lastIdx = this.items.length - 1;
    }
    get length() {
        return this.lastIdx - this.firstIdx + 1;
    }
    takeWhile(predicate) {
        let startIdx = this.firstIdx;
        while (startIdx < this.items.length && predicate(this.items[startIdx])) {
            startIdx++;
        }
        const result = startIdx === this.firstIdx ? null : this.items.slice(this.firstIdx, startIdx);
        this.firstIdx = startIdx;
        return result;
    }
    takeFromEndWhile(predicate) {
        let endIdx = this.lastIdx;
        while (endIdx >= 0 && predicate(this.items[endIdx])) {
            endIdx--;
        }
        const result = endIdx === this.lastIdx ? null : this.items.slice(endIdx + 1, this.lastIdx + 1);
        this.lastIdx = endIdx;
        return result;
    }
    peek() {
        if (this.length === 0) {
            return undefined;
        }
        return this.items[this.firstIdx];
    }
    peekLast() {
        if (this.length === 0) {
            return undefined;
        }
        return this.items[this.lastIdx];
    }
    dequeue() {
        const result = this.items[this.firstIdx];
        this.firstIdx++;
        return result;
    }
    removeLast() {
        const result = this.items[this.lastIdx];
        this.lastIdx--;
        return result;
    }
    takeCount(count) {
        const result = this.items.slice(this.firstIdx, this.firstIdx + count);
        this.firstIdx += count;
        return result;
    }
}
export class CallbackIterable {
    static { this.empty = new CallbackIterable(_callback => { }); }
    constructor(iterate) {
        this.iterate = iterate;
    }
    forEach(handler) {
        this.iterate(item => { handler(item); return true; });
    }
    toArray() {
        const result = [];
        this.iterate(item => { result.push(item); return true; });
        return result;
    }
    filter(predicate) {
        return new CallbackIterable(cb => this.iterate(item => predicate(item) ? cb(item) : true));
    }
    map(mapFn) {
        return new CallbackIterable(cb => this.iterate(item => cb(mapFn(item))));
    }
    some(predicate) {
        let result = false;
        this.iterate(item => { result = predicate(item); return !result; });
        return result;
    }
    findFirst(predicate) {
        let result;
        this.iterate(item => {
            if (predicate(item)) {
                result = item;
                return false;
            }
            return true;
        });
        return result;
    }
    findLast(predicate) {
        let result;
        this.iterate(item => {
            if (predicate(item)) {
                result = item;
            }
            return true;
        });
        return result;
    }
    findLastMaxBy(comparator) {
        let result;
        let first = true;
        this.iterate(item => {
            if (first || CompareResult.isGreaterThan(comparator(item, result))) {
                first = false;
                result = item;
            }
            return true;
        });
        return result;
    }
}
export class Permutation {
    constructor(_indexMap) {
        this._indexMap = _indexMap;
    }
    static createSortPermutation(arr, compareFn) {
        const sortIndices = Array.from(arr.keys()).sort((index1, index2) => compareFn(arr[index1], arr[index2]));
        return new Permutation(sortIndices);
    }
    apply(arr) {
        return arr.map((_, index) => arr[this._indexMap[index]]);
    }
    inverse() {
        const inverseIndexMap = this._indexMap.slice();
        for (let i = 0; i < this._indexMap.length; i++) {
            inverseIndexMap[this._indexMap[i]] = i;
        }
        return new Permutation(inverseIndexMap);
    }
}
export async function findAsync(array, predicate) {
    const results = await Promise.all(array.map(async (element, index) => ({ element, ok: await predicate(element, index) })));
    return results.find(r => r.ok)?.element;
}
