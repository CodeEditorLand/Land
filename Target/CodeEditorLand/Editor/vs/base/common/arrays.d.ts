import { CancellationToken } from './cancellation.js';
import { ISplice } from './sequence.js';
export declare function tail<T>(array: ArrayLike<T>, n?: number): T | undefined;
export declare function tail2<T>(arr: T[]): [T[], T];
export declare function equals<T>(one: ReadonlyArray<T> | undefined, other: ReadonlyArray<T> | undefined, itemEquals?: (a: T, b: T) => boolean): boolean;
export declare function removeFastWithoutKeepingOrder<T>(array: T[], index: number): void;
export declare function binarySearch<T>(array: ReadonlyArray<T>, key: T, comparator: (op1: T, op2: T) => number): number;
export declare function binarySearch2(length: number, compareToKey: (index: number) => number): number;
type Compare<T> = (a: T, b: T) => number;
export declare function quickSelect<T>(nth: number, data: T[], compare: Compare<T>): T;
export declare function groupBy<T>(data: ReadonlyArray<T>, compare: (a: T, b: T) => number): T[][];
export declare function groupAdjacentBy<T>(items: Iterable<T>, shouldBeGrouped: (item1: T, item2: T) => boolean): Iterable<T[]>;
export declare function forEachAdjacent<T>(arr: T[], f: (item1: T | undefined, item2: T | undefined) => void): void;
export declare function forEachWithNeighbors<T>(arr: T[], f: (before: T | undefined, element: T, after: T | undefined) => void): void;
export declare function sortedDiff<T>(before: ReadonlyArray<T>, after: ReadonlyArray<T>, compare: (a: T, b: T) => number): ISplice<T>[];
export declare function delta<T>(before: ReadonlyArray<T>, after: ReadonlyArray<T>, compare: (a: T, b: T) => number): {
    removed: T[];
    added: T[];
};
export declare function top<T>(array: ReadonlyArray<T>, compare: (a: T, b: T) => number, n: number): T[];
export declare function topAsync<T>(array: T[], compare: (a: T, b: T) => number, n: number, batch: number, token?: CancellationToken): Promise<T[]>;
export declare function coalesce<T>(array: ReadonlyArray<T | undefined | null>): T[];
export declare function coalesceInPlace<T>(array: Array<T | undefined | null>): asserts array is Array<T>;
export declare function move(array: unknown[], from: number, to: number): void;
export declare function isFalsyOrEmpty(obj: any): boolean;
export declare function isNonEmptyArray<T>(obj: T[] | undefined | null): obj is T[];
export declare function isNonEmptyArray<T>(obj: readonly T[] | undefined | null): obj is readonly T[];
export declare function distinct<T>(array: ReadonlyArray<T>, keyFn?: (value: T) => unknown): T[];
export declare function uniqueFilter<T, R>(keyFn: (t: T) => R): (t: T) => boolean;
export declare function commonPrefixLength<T>(one: ReadonlyArray<T>, other: ReadonlyArray<T>, equals?: (a: T, b: T) => boolean): number;
export declare function range(to: number): number[];
export declare function range(from: number, to: number): number[];
export declare function index<T>(array: ReadonlyArray<T>, indexer: (t: T) => string): {
    [key: string]: T;
};
export declare function index<T, R>(array: ReadonlyArray<T>, indexer: (t: T) => string, mapper: (t: T) => R): {
    [key: string]: R;
};
export declare function insert<T>(array: T[], element: T): () => void;
export declare function remove<T>(array: T[], element: T): T | undefined;
export declare function arrayInsert<T>(target: T[], insertIndex: number, insertArr: T[]): T[];
export declare function shuffle<T>(array: T[], _seed?: number): void;
export declare function pushToStart<T>(arr: T[], value: T): void;
export declare function pushToEnd<T>(arr: T[], value: T): void;
export declare function pushMany<T>(arr: T[], items: ReadonlyArray<T>): void;
export declare function mapArrayOrNot<T, U>(items: T | T[], fn: (_: T) => U): U | U[];
export declare function asArray<T>(x: T | T[]): T[];
export declare function asArray<T>(x: T | readonly T[]): readonly T[];
export declare function getRandomElement<T>(arr: T[]): T | undefined;
export declare function insertInto<T>(array: T[], start: number, newItems: T[]): void;
export declare function splice<T>(array: T[], start: number, deleteCount: number, newItems: T[]): T[];
export type CompareResult = number;
export declare namespace CompareResult {
    function isLessThan(result: CompareResult): boolean;
    function isLessThanOrEqual(result: CompareResult): boolean;
    function isGreaterThan(result: CompareResult): boolean;
    function isNeitherLessOrGreaterThan(result: CompareResult): boolean;
    const greaterThan = 1;
    const lessThan = -1;
    const neitherLessOrGreaterThan = 0;
}
export type Comparator<T> = (a: T, b: T) => CompareResult;
export declare function compareBy<TItem, TCompareBy>(selector: (item: TItem) => TCompareBy, comparator: Comparator<TCompareBy>): Comparator<TItem>;
export declare function tieBreakComparators<TItem>(...comparators: Comparator<TItem>[]): Comparator<TItem>;
export declare const numberComparator: Comparator<number>;
export declare const booleanComparator: Comparator<boolean>;
export declare function reverseOrder<TItem>(comparator: Comparator<TItem>): Comparator<TItem>;
export declare class ArrayQueue<T> {
    private readonly items;
    private firstIdx;
    private lastIdx;
    constructor(items: readonly T[]);
    get length(): number;
    takeWhile(predicate: (value: T) => boolean): T[] | null;
    takeFromEndWhile(predicate: (value: T) => boolean): T[] | null;
    peek(): T | undefined;
    peekLast(): T | undefined;
    dequeue(): T | undefined;
    removeLast(): T | undefined;
    takeCount(count: number): T[];
}
export declare class CallbackIterable<T> {
    readonly iterate: (callback: (item: T) => boolean) => void;
    static readonly empty: CallbackIterable<never>;
    constructor(iterate: (callback: (item: T) => boolean) => void);
    forEach(handler: (item: T) => void): void;
    toArray(): T[];
    filter(predicate: (item: T) => boolean): CallbackIterable<T>;
    map<TResult>(mapFn: (item: T) => TResult): CallbackIterable<TResult>;
    some(predicate: (item: T) => boolean): boolean;
    findFirst(predicate: (item: T) => boolean): T | undefined;
    findLast(predicate: (item: T) => boolean): T | undefined;
    findLastMaxBy(comparator: Comparator<T>): T | undefined;
}
export declare class Permutation {
    private readonly _indexMap;
    constructor(_indexMap: readonly number[]);
    static createSortPermutation<T>(arr: readonly T[], compareFn: (a: T, b: T) => number): Permutation;
    apply<T>(arr: readonly T[]): T[];
    inverse(): Permutation;
}
export declare function findAsync<T>(array: readonly T[], predicate: (element: T, index: number) => Promise<boolean>): Promise<T | undefined>;
export {};
