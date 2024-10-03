export declare class PrefixSumComputer {
    private values;
    private prefixSum;
    private readonly prefixSumValidIndex;
    constructor(values: Uint32Array);
    getCount(): number;
    insertValues(insertIndex: number, insertValues: Uint32Array): boolean;
    setValue(index: number, value: number): boolean;
    removeValues(startIndex: number, count: number): boolean;
    getTotalSum(): number;
    getPrefixSum(index: number): number;
    private _getPrefixSum;
    getIndexOf(sum: number): PrefixSumIndexOfResult;
}
export declare class ConstantTimePrefixSumComputer {
    private _values;
    private _isValid;
    private _validEndIndex;
    private _prefixSum;
    private _indexBySum;
    constructor(values: number[]);
    getTotalSum(): number;
    getPrefixSum(count: number): number;
    getIndexOf(sum: number): PrefixSumIndexOfResult;
    removeValues(start: number, deleteCount: number): void;
    insertValues(insertIndex: number, insertArr: number[]): void;
    private _invalidate;
    private _ensureValid;
    setValue(index: number, value: number): void;
}
export declare class PrefixSumIndexOfResult {
    readonly index: number;
    readonly remainder: number;
    _prefixSumIndexOfResultBrand: void;
    constructor(index: number, remainder: number);
}
