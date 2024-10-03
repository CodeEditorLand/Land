export interface IOffsetRange {
    readonly start: number;
    readonly endExclusive: number;
}
export declare class OffsetRange implements IOffsetRange {
    readonly start: number;
    readonly endExclusive: number;
    static addRange(range: OffsetRange, sortedRanges: OffsetRange[]): void;
    static tryCreate(start: number, endExclusive: number): OffsetRange | undefined;
    static ofLength(length: number): OffsetRange;
    static ofStartAndLength(start: number, length: number): OffsetRange;
    static emptyAt(offset: number): OffsetRange;
    constructor(start: number, endExclusive: number);
    get isEmpty(): boolean;
    delta(offset: number): OffsetRange;
    deltaStart(offset: number): OffsetRange;
    deltaEnd(offset: number): OffsetRange;
    get length(): number;
    toString(): string;
    equals(other: OffsetRange): boolean;
    containsRange(other: OffsetRange): boolean;
    contains(offset: number): boolean;
    join(other: OffsetRange): OffsetRange;
    intersect(other: OffsetRange): OffsetRange | undefined;
    intersectionLength(range: OffsetRange): number;
    intersects(other: OffsetRange): boolean;
    intersectsOrTouches(other: OffsetRange): boolean;
    isBefore(other: OffsetRange): boolean;
    isAfter(other: OffsetRange): boolean;
    slice<T>(arr: T[]): T[];
    substring(str: string): string;
    clip(value: number): number;
    clipCyclic(value: number): number;
    map<T>(f: (offset: number) => T): T[];
    forEach(f: (offset: number) => void): void;
}
export declare class OffsetRangeSet {
    private readonly _sortedRanges;
    addRange(range: OffsetRange): void;
    toString(): string;
    intersectsStrict(other: OffsetRange): boolean;
    intersectWithRange(other: OffsetRange): OffsetRangeSet;
    intersectWithRangeLength(other: OffsetRange): number;
    get length(): number;
}
