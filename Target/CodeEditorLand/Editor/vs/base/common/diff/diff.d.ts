export declare class StringDiffSequence implements ISequence {
    private source;
    constructor(source: string);
    getElements(): Int32Array | number[] | string[];
}
export declare function stringDiff(original: string, modified: string, pretty: boolean): IDiffChange[];
export interface ISequence {
    getElements(): Int32Array | number[] | string[];
    getStrictElement?(index: number): string;
}
export interface IDiffChange {
    originalStart: number;
    originalLength: number;
    modifiedStart: number;
    modifiedLength: number;
}
export interface IContinueProcessingPredicate {
    (furthestOriginalIndex: number, matchLengthOfLongest: number): boolean;
}
export interface IDiffResult {
    quitEarly: boolean;
    changes: IDiffChange[];
}
export declare class LcsDiff {
    private readonly ContinueProcessingPredicate;
    private readonly _originalSequence;
    private readonly _modifiedSequence;
    private readonly _hasStrings;
    private readonly _originalStringElements;
    private readonly _originalElementsOrHash;
    private readonly _modifiedStringElements;
    private readonly _modifiedElementsOrHash;
    private m_forwardHistory;
    private m_reverseHistory;
    constructor(originalSequence: ISequence, modifiedSequence: ISequence, continueProcessingPredicate?: IContinueProcessingPredicate | null);
    private static _isStringArray;
    private static _getElements;
    private ElementsAreEqual;
    private ElementsAreStrictEqual;
    private static _getStrictElement;
    private OriginalElementsAreEqual;
    private ModifiedElementsAreEqual;
    ComputeDiff(pretty: boolean): IDiffResult;
    private _ComputeDiff;
    private ComputeDiffRecursive;
    private WALKTRACE;
    private ComputeRecursionPoint;
    private PrettifyChanges;
    private _findBetterContiguousSequence;
    private _contiguousSequenceScore;
    private _OriginalIsBoundary;
    private _OriginalRegionIsBoundary;
    private _ModifiedIsBoundary;
    private _ModifiedRegionIsBoundary;
    private _boundaryScore;
    private ConcatenateChanges;
    private ChangesOverlap;
    private ClipDiagonalBound;
}
