import { SelectedLines } from './folding.js';
export interface ILineRange {
    startLineNumber: number;
    endLineNumber: number;
}
export declare const enum FoldSource {
    provider = 0,
    userDefined = 1,
    recovered = 2
}
export declare const foldSourceAbbr: {
    0: string;
    1: string;
    2: string;
};
export interface FoldRange {
    startLineNumber: number;
    endLineNumber: number;
    type: string | undefined;
    isCollapsed: boolean;
    source: FoldSource;
}
export declare const MAX_FOLDING_REGIONS = 65535;
export declare const MAX_LINE_NUMBER = 16777215;
export declare class FoldingRegions {
    private readonly _startIndexes;
    private readonly _endIndexes;
    private readonly _collapseStates;
    private readonly _userDefinedStates;
    private readonly _recoveredStates;
    private _parentsComputed;
    private readonly _types;
    constructor(startIndexes: Uint32Array, endIndexes: Uint32Array, types?: Array<string | undefined>);
    private ensureParentIndices;
    get length(): number;
    getStartLineNumber(index: number): number;
    getEndLineNumber(index: number): number;
    getType(index: number): string | undefined;
    hasTypes(): boolean;
    isCollapsed(index: number): boolean;
    setCollapsed(index: number, newState: boolean): void;
    private isUserDefined;
    private setUserDefined;
    private isRecovered;
    private setRecovered;
    getSource(index: number): FoldSource;
    setSource(index: number, source: FoldSource): void;
    setCollapsedAllOfType(type: string, newState: boolean): boolean;
    toRegion(index: number): FoldingRegion;
    getParentIndex(index: number): number;
    contains(index: number, line: number): boolean;
    private findIndex;
    findRange(line: number): number;
    toString(): string;
    toFoldRange(index: number): FoldRange;
    static fromFoldRanges(ranges: FoldRange[]): FoldingRegions;
    /**
     * Two inputs, each a FoldingRegions or a FoldRange[], are merged.
     * Each input must be pre-sorted on startLineNumber.
     * The first list is assumed to always include all regions currently defined by range providers.
     * The second list only contains the previously collapsed and all manual ranges.
     * If the line position matches, the range of the new range is taken, and the range is no longer manual
     * When an entry in one list overlaps an entry in the other, the second list's entry "wins" and
     * overlapping entries in the first list are discarded.
     * Invalid entries are discarded. An entry is invalid if:
     * 		the start and end line numbers aren't a valid range of line numbers,
     * 		it is out of sequence or has the same start line as a preceding entry,
     * 		it overlaps a preceding entry and is not fully contained by that entry.
     */
    static sanitizeAndMerge(rangesA: FoldingRegions | FoldRange[], rangesB: FoldingRegions | FoldRange[], maxLineNumber: number | undefined, selection?: SelectedLines): FoldRange[];
}
export declare class FoldingRegion {
    private readonly ranges;
    private index;
    constructor(ranges: FoldingRegions, index: number);
    get startLineNumber(): number;
    get endLineNumber(): number;
    get regionIndex(): number;
    get parentIndex(): number;
    get isCollapsed(): boolean;
    containedBy(range: ILineRange): boolean;
    containsLine(lineNumber: number): boolean;
    hidesLine(lineNumber: number): boolean;
}
