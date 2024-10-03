import { Position } from '../../../../../editor/common/core/position.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import { LineRangeEdit } from './editing.js';
import { LineRange } from './lineRange.js';
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
export declare class DocumentLineRangeMap {
    readonly lineRangeMappings: LineRangeMapping[];
    readonly inputLineCount: number;
    static betweenOutputs(inputToOutput1: readonly LineRangeMapping[], inputToOutput2: readonly LineRangeMapping[], inputLineCount: number): DocumentLineRangeMap;
    constructor(lineRangeMappings: LineRangeMapping[], inputLineCount: number);
    project(lineNumber: number): LineRangeMapping;
    get outputLineCount(): number;
    reverse(): DocumentLineRangeMap;
}
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
export declare class RangeMapping {
    readonly inputRange: Range;
    readonly outputRange: Range;
    constructor(inputRange: Range, outputRange: Range);
    toString(): string;
    addOutputLineDelta(deltaLines: number): RangeMapping;
    addInputLineDelta(deltaLines: number): RangeMapping;
    reverse(): RangeMapping;
}
export declare class DocumentRangeMap {
    readonly rangeMappings: RangeMapping[];
    readonly inputLineCount: number;
    constructor(rangeMappings: RangeMapping[], inputLineCount: number);
    project(position: Position): RangeMapping;
    projectRange(range: Range): RangeMapping;
    get outputLineCount(): number;
    reverse(): DocumentRangeMap;
}
