import { OffsetRange } from './offsetRange.js';
import { Range } from './range.js';
export declare class LineRange {
    static fromRange(range: Range): LineRange;
    static fromRangeInclusive(range: Range): LineRange;
    static subtract(a: LineRange, b: LineRange | undefined): LineRange[];
    static joinMany(lineRanges: readonly (readonly LineRange[])[]): readonly LineRange[];
    static join(lineRanges: LineRange[]): LineRange;
    static ofLength(startLineNumber: number, length: number): LineRange;
    static deserialize(lineRange: ISerializedLineRange): LineRange;
    readonly startLineNumber: number;
    readonly endLineNumberExclusive: number;
    constructor(startLineNumber: number, endLineNumberExclusive: number);
    contains(lineNumber: number): boolean;
    get isEmpty(): boolean;
    delta(offset: number): LineRange;
    deltaLength(offset: number): LineRange;
    get length(): number;
    join(other: LineRange): LineRange;
    toString(): string;
    intersect(other: LineRange): LineRange | undefined;
    intersectsStrict(other: LineRange): boolean;
    overlapOrTouch(other: LineRange): boolean;
    equals(b: LineRange): boolean;
    toInclusiveRange(): Range | null;
    toExclusiveRange(): Range;
    mapToLineArray<T>(f: (lineNumber: number) => T): T[];
    forEach(f: (lineNumber: number) => void): void;
    serialize(): ISerializedLineRange;
    includes(lineNumber: number): boolean;
    toOffsetRange(): OffsetRange;
}
export type ISerializedLineRange = [startLineNumber: number, endLineNumberExclusive: number];
export declare class LineRangeSet {
    private readonly _normalizedRanges;
    constructor(_normalizedRanges?: LineRange[]);
    get ranges(): readonly LineRange[];
    addRange(range: LineRange): void;
    contains(lineNumber: number): boolean;
    intersects(range: LineRange): boolean;
    getUnion(other: LineRangeSet): LineRangeSet;
    subtractFrom(range: LineRange): LineRangeSet;
    toString(): string;
    getIntersection(other: LineRangeSet): LineRangeSet;
    getWithDelta(value: number): LineRangeSet;
}
