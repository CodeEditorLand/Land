import { OffsetRange } from './offsetRange.js';
import { Position } from './position.js';
import { Range } from './range.js';
import { TextLength } from './textLength.js';
export declare class PositionOffsetTransformer {
    readonly text: string;
    private readonly lineStartOffsetByLineIdx;
    constructor(text: string);
    getOffset(position: Position): number;
    getOffsetRange(range: Range): OffsetRange;
    getPosition(offset: number): Position;
    getRange(offsetRange: OffsetRange): Range;
    getTextLength(offsetRange: OffsetRange): TextLength;
    get textLength(): TextLength;
}
