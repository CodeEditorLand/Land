import { DetailedLineRangeMapping, LineRangeMapping } from './rangeMapping.js';
export interface ILinesDiffComputer {
    computeDiff(originalLines: string[], modifiedLines: string[], options: ILinesDiffComputerOptions): LinesDiff;
}
export interface ILinesDiffComputerOptions {
    readonly ignoreTrimWhitespace: boolean;
    readonly maxComputationTimeMs: number;
    readonly computeMoves: boolean;
}
export declare class LinesDiff {
    readonly changes: readonly DetailedLineRangeMapping[];
    readonly moves: readonly MovedText[];
    readonly hitTimeout: boolean;
    constructor(changes: readonly DetailedLineRangeMapping[], moves: readonly MovedText[], hitTimeout: boolean);
}
export declare class MovedText {
    readonly lineRangeMapping: LineRangeMapping;
    readonly changes: readonly DetailedLineRangeMapping[];
    constructor(lineRangeMapping: LineRangeMapping, changes: readonly DetailedLineRangeMapping[]);
    flip(): MovedText;
}
