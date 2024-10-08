/**
 * [start, end]
 */
export interface ICellRange {
    /**
     * zero based index
     */
    start: number;
    /**
     * zero based index
     */
    end: number;
}
export declare function isICellRange(candidate: any): candidate is ICellRange;
export declare function cellIndexesToRanges(indexes: number[]): {
    start: number | undefined;
    end: number | undefined;
}[];
export declare function cellRangesToIndexes(ranges: ICellRange[]): number[];
export declare function reduceCellRanges(ranges: ICellRange[]): ICellRange[];
export declare function cellRangesEqual(a: ICellRange[], b: ICellRange[]): boolean;
/**
 * todo@rebornix test and sort
 * @param range
 * @param other
 * @returns
 */
export declare function cellRangeContains(range: ICellRange, other: ICellRange): boolean;
