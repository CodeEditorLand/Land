import { LineRange } from '../../core/lineRange.js';
import { DetailedLineRangeMapping } from '../rangeMapping.js';
export declare class Array2D<T> {
    readonly width: number;
    readonly height: number;
    private readonly array;
    constructor(width: number, height: number);
    get(x: number, y: number): T;
    set(x: number, y: number, value: T): void;
}
export declare function isSpace(charCode: number): boolean;
export declare class LineRangeFragment {
    readonly range: LineRange;
    readonly lines: string[];
    readonly source: DetailedLineRangeMapping;
    private static chrKeys;
    private static getKey;
    private readonly totalCount;
    private readonly histogram;
    constructor(range: LineRange, lines: string[], source: DetailedLineRangeMapping);
    computeSimilarity(other: LineRangeFragment): number;
}
