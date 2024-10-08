import { Comparator } from '../../../../../base/common/arrays.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { ITextModel } from '../../../../../editor/common/model.js';
export declare class LineRange {
    readonly startLineNumber: number;
    readonly lineCount: number;
    static readonly compareByStart: Comparator<LineRange>;
    static join(ranges: LineRange[]): LineRange | undefined;
    static fromLineNumbers(startLineNumber: number, endExclusiveLineNumber: number): LineRange;
    constructor(startLineNumber: number, lineCount: number);
    join(other: LineRange): LineRange;
    get endLineNumberExclusive(): number;
    get isEmpty(): boolean;
    /**
     * Returns false if there is at least one line between `this` and `other`.
    */
    touches(other: LineRange): boolean;
    isAfter(range: LineRange): boolean;
    isBefore(range: LineRange): boolean;
    delta(lineDelta: number): LineRange;
    toString(): string;
    equals(originalRange: LineRange): boolean;
    contains(lineNumber: number): boolean;
    deltaEnd(delta: number): LineRange;
    deltaStart(lineDelta: number): LineRange;
    getLines(model: ITextModel): string[];
    containsRange(range: LineRange): boolean;
    toRange(): Range;
    toInclusiveRange(): Range | undefined;
    toInclusiveRangeOrEmpty(): Range;
    intersects(lineRange: LineRange): boolean;
}
