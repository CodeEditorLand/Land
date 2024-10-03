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
