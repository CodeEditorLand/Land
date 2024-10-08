import { Position } from '../../../../../editor/common/core/position.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { LineRangeEdit } from './editing.js';
import { LineRange } from './lineRange.js';
/**
 * Represents a mapping of an input line range to an output line range.
*/
export declare class LineRangeMapping {
    readonly inputRange: LineRange;
    readonly outputRange: LineRange;
    static join(mappings: readonly LineRangeMapping[]): LineRangeMapping | undefined;
    constructor(inputRange: LineRange, outputRange: LineRange);
    extendInputRange(extendedInputRange: LineRange): LineRangeMapping;
    join(other: LineRangeMapping): LineRangeMapping;
    get resultingDeltaFromOriginalToModified(): number;
    toString(): string;
    addOutputLineDelta(delta: number): LineRangeMapping;
    addInputLineDelta(delta: number): LineRangeMapping;
    reverse(): LineRangeMapping;
}
/**
* Represents a total monotonous mapping of line ranges in one document to another document.
*/
export declare class DocumentLineRangeMap {
    /**
     * The line range mappings that define this document mapping.
     * The space between two input ranges must equal the space between two output ranges.
     * These holes act as dense sequence of 1:1 line mappings.
    */
    readonly lineRangeMappings: LineRangeMapping[];
    readonly inputLineCount: number;
    static betweenOutputs(inputToOutput1: readonly LineRangeMapping[], inputToOutput2: readonly LineRangeMapping[], inputLineCount: number): DocumentLineRangeMap;
    constructor(
    /**
     * The line range mappings that define this document mapping.
     * The space between two input ranges must equal the space between two output ranges.
     * These holes act as dense sequence of 1:1 line mappings.
    */
    lineRangeMappings: LineRangeMapping[], inputLineCount: number);
    project(lineNumber: number): LineRangeMapping;
    get outputLineCount(): number;
    reverse(): DocumentLineRangeMap;
}
/**
 * Aligns two mappings with a common input range.
 */
export declare class MappingAlignment<T extends LineRangeMapping> {
    readonly inputRange: LineRange;
    readonly output1Range: LineRange;
    readonly output1LineMappings: T[];
    readonly output2Range: LineRange;
    readonly output2LineMappings: T[];
    static compute<T extends LineRangeMapping>(fromInputToOutput1: readonly T[], fromInputToOutput2: readonly T[]): MappingAlignment<T>[];
    constructor(inputRange: LineRange, output1Range: LineRange, output1LineMappings: T[], output2Range: LineRange, output2LineMappings: T[]);
    toString(): string;
}
/**
 * A line range mapping with inner range mappings.
*/
export declare class DetailedLineRangeMapping extends LineRangeMapping {
    readonly inputTextModel: ITextModel;
    readonly outputTextModel: ITextModel;
    static join(mappings: readonly DetailedLineRangeMapping[]): DetailedLineRangeMapping | undefined;
    readonly rangeMappings: readonly RangeMapping[];
    constructor(inputRange: LineRange, inputTextModel: ITextModel, outputRange: LineRange, outputTextModel: ITextModel, rangeMappings?: readonly RangeMapping[]);
    addOutputLineDelta(delta: number): DetailedLineRangeMapping;
    addInputLineDelta(delta: number): DetailedLineRangeMapping;
    join(other: DetailedLineRangeMapping): DetailedLineRangeMapping;
    getLineEdit(): LineRangeEdit;
    getReverseLineEdit(): LineRangeEdit;
    private getOutputLines;
    private getInputLines;
}
/**
 * Represents a mapping of an input range to an output range.
*/
export declare class RangeMapping {
    readonly inputRange: Range;
    readonly outputRange: Range;
    constructor(inputRange: Range, outputRange: Range);
    toString(): string;
    addOutputLineDelta(deltaLines: number): RangeMapping;
    addInputLineDelta(deltaLines: number): RangeMapping;
    reverse(): RangeMapping;
}
/**
* Represents a total monotonous mapping of ranges in one document to another document.
*/
export declare class DocumentRangeMap {
    /**
     * The line range mappings that define this document mapping.
     * Can have holes.
    */
    readonly rangeMappings: RangeMapping[];
    readonly inputLineCount: number;
    constructor(
    /**
     * The line range mappings that define this document mapping.
     * Can have holes.
    */
    rangeMappings: RangeMapping[], inputLineCount: number);
    project(position: Position): RangeMapping;
    projectRange(range: Range): RangeMapping;
    get outputLineCount(): number;
    reverse(): DocumentRangeMap;
}
