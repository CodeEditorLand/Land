import { Comparator } from './arrays.js';
export declare function findLast<T>(array: readonly T[], predicate: (item: T) => boolean): T | undefined;
export declare function findLastIdx<T>(array: readonly T[], predicate: (item: T) => boolean, fromIndex?: number): number;
export declare function findLastMonotonous<T>(array: readonly T[], predicate: (item: T) => boolean): T | undefined;
export declare function findLastIdxMonotonous<T>(array: readonly T[], predicate: (item: T) => boolean, startIdx?: number, endIdxEx?: number): number;
export declare function findFirstMonotonous<T>(array: readonly T[], predicate: (item: T) => boolean): T | undefined;
export declare function findFirstIdxMonotonousOrArrLen<T>(array: readonly T[], predicate: (item: T) => boolean, startIdx?: number, endIdxEx?: number): number;
export declare function findFirstIdxMonotonous<T>(array: readonly T[], predicate: (item: T) => boolean, startIdx?: number, endIdxEx?: number): number;
export declare class MonotonousArray<T> {
    private readonly _array;
    static assertInvariants: boolean;
    private _findLastMonotonousLastIdx;
    private _prevFindLastPredicate;
    constructor(_array: readonly T[]);
    findLastMonotonous(predicate: (item: T) => boolean): T | undefined;
}
export declare function findFirstMax<T>(array: readonly T[], comparator: Comparator<T>): T | undefined;
export declare function findLastMax<T>(array: readonly T[], comparator: Comparator<T>): T | undefined;
export declare function findFirstMin<T>(array: readonly T[], comparator: Comparator<T>): T | undefined;
export declare function findMaxIdx<T>(array: readonly T[], comparator: Comparator<T>): number;
export declare function mapFindFirst<T, R>(items: Iterable<T>, mapFn: (value: T) => R | undefined): R | undefined;
