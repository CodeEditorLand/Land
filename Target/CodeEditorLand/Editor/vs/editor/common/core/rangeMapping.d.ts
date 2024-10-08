import { Position } from './position.js';
import { Range } from './range.js';
/**
 * Represents a list of mappings of ranges from one document to another.
 */
export declare class RangeMapping {
    readonly mappings: readonly SingleRangeMapping[];
    constructor(mappings: readonly SingleRangeMapping[]);
    mapPosition(position: Position): PositionOrRange;
    mapRange(range: Range): Range;
    reverse(): RangeMapping;
}
export declare class SingleRangeMapping {
    readonly original: Range;
    readonly modified: Range;
    constructor(original: Range, modified: Range);
    reverse(): SingleRangeMapping;
    toString(): string;
}
export declare class PositionOrRange {
    readonly position: Position | undefined;
    readonly range: Range | undefined;
    static position(position: Position): PositionOrRange;
    static range(range: Range): PositionOrRange;
    private constructor();
}
