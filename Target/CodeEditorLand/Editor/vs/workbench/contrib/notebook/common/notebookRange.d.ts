export interface ICellRange {
    start: number;
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
export declare function cellRangeContains(range: ICellRange, other: ICellRange): boolean;
