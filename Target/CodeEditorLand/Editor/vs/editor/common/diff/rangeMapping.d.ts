import { LineRange } from '../core/lineRange.js';
import { Range } from '../core/range.js';
import { AbstractText, SingleTextEdit, TextEdit } from '../core/textEdit.js';
export declare class LineRangeMapping {
    static inverse(mapping: readonly LineRangeMapping[], originalLineCount: number, modifiedLineCount: number): LineRangeMapping[];
    static clip(mapping: readonly LineRangeMapping[], originalRange: LineRange, modifiedRange: LineRange): LineRangeMapping[];
    readonly original: LineRange;
    readonly modified: LineRange;
    constructor(originalRange: LineRange, modifiedRange: LineRange);
    toString(): string;
    flip(): LineRangeMapping;
    join(other: LineRangeMapping): LineRangeMapping;
    get changedLineCount(): number;
    toRangeMapping(): RangeMapping;
    toRangeMapping2(original: string[], modified: string[]): RangeMapping;
}
export declare class DetailedLineRangeMapping extends LineRangeMapping {
    static fromRangeMappings(rangeMappings: RangeMapping[]): DetailedLineRangeMapping;
    readonly innerChanges: RangeMapping[] | undefined;
    constructor(originalRange: LineRange, modifiedRange: LineRange, innerChanges: RangeMapping[] | undefined);
    flip(): DetailedLineRangeMapping;
    withInnerChangesFromLineRanges(): DetailedLineRangeMapping;
}
export declare class RangeMapping {
    static fromEdit(edit: TextEdit): RangeMapping[];
    static fromEditJoin(edit: TextEdit): RangeMapping;
    static join(rangeMappings: RangeMapping[]): RangeMapping;
    static assertSorted(rangeMappings: RangeMapping[]): void;
    readonly originalRange: Range;
    readonly modifiedRange: Range;
    constructor(originalRange: Range, modifiedRange: Range);
    toString(): string;
    flip(): RangeMapping;
    toTextEdit(modified: AbstractText): SingleTextEdit;
    join(other: RangeMapping): RangeMapping;
}
export declare function lineRangeMappingFromRangeMappings(alignments: readonly RangeMapping[], originalLines: AbstractText, modifiedLines: AbstractText, dontAssertStartLine?: boolean): DetailedLineRangeMapping[];
export declare function getLineRangeMapping(rangeMapping: RangeMapping, originalLines: AbstractText, modifiedLines: AbstractText): DetailedLineRangeMapping;
