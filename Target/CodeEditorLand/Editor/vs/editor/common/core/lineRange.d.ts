import { OffsetRange } from './offsetRange.js';
import { Range } from './range.js';
/**
 * A range of lines (1-based).
 */
export declare class LineRange {
    static fromRange(range: Range): LineRange;
    static fromRangeInclusive(range: Range): LineRange;
    static subtract(a: LineRange, b: LineRange | undefined): LineRange[];
    /**
     * @param lineRanges An array of sorted line ranges.
     */
    static joinMany(lineRanges: readonly (readonly LineRange[])[]): readonly LineRange[];
    static join(lineRanges: LineRange[]): LineRange;
    static ofLength(startLineNumber: number, length: number): LineRange;
    /**
     * @internal
     */
    static deserialize(lineRange: ISerializedLineRange): LineRange;
    /**
     * The start line number.
     */
    readonly startLineNumber: number;
    /**
     * The end line number (exclusive).
     */
    readonly endLineNumberExclusive: number;
    constructor(startLineNumber: number, endLineNumberExclusive: number);
    /**
     * Indicates if this line range contains the given line number.
     */
    contains(lineNumber: number): boolean;
    /**
     * Indicates if this line range is empty.
     */
    get isEmpty(): boolean;
    /**
     * Moves this line range by the given offset of line numbers.
     */
    delta(offset: number): LineRange;
    deltaLength(offset: number): LineRange;
    /**
     * The number of lines this line range spans.
     */
    get length(): number;
    /**
     * Creates a line range that combines this and the given line range.
     */
    join(other: LineRange): LineRange;
    toString(): string;
    /**
     * The resulting range is empty if the ranges do not intersect, but touch.
     * If the ranges don't even touch, the result is undefined.
     */
    intersect(other: LineRange): LineRange | undefined;
    intersectsStrict(other: LineRange): boolean;
    overlapOrTouch(other: LineRange): boolean;
    equals(b: LineRange): boolean;
    toInclusiveRange(): Range | null;
    /**
     * @deprecated Using this function is discouraged because it might lead to bugs: The end position is not guaranteed to be a valid position!
    */
    toExclusiveRange(): Range;
    mapToLineArray<T>(f: (lineNumber: number) => T): T[];
    forEach(f: (lineNumber: number) => void): void;
    /**
     * @internal
     */
    serialize(): ISerializedLineRange;
    includes(lineNumber: number): boolean;
    /**
     * Converts this 1-based line range to a 0-based offset range (subtracts 1!).
     * @internal
     */
    toOffsetRange(): OffsetRange;
}
export type ISerializedLineRange = [startLineNumber: number, endLineNumberExclusive: number];
export declare class LineRangeSet {
    /**
     * Sorted by start line number.
     * No two line ranges are touching or intersecting.
     */
    private readonly _normalizedRanges;
    constructor(
    /**
     * Sorted by start line number.
     * No two line ranges are touching or intersecting.
     */
    _normalizedRanges?: LineRange[]);
    get ranges(): readonly LineRange[];
    addRange(range: LineRange): void;
    contains(lineNumber: number): boolean;
    intersects(range: LineRange): boolean;
    getUnion(other: LineRangeSet): LineRangeSet;
    /**
     * Subtracts all ranges in this set from `range` and returns the result.
     */
    subtractFrom(range: LineRange): LineRangeSet;
    toString(): string;
    getIntersection(other: LineRangeSet): LineRangeSet;
    getWithDelta(value: number): LineRangeSet;
}
