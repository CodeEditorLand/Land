import { OffsetRange } from '../../core/offsetRange.js';
import { Position } from '../../core/position.js';
import { Range } from '../../core/range.js';
import { ISequence } from './algorithms/diffAlgorithm.js';
export declare class LinesSliceCharSequence implements ISequence {
    readonly lines: string[];
    private readonly range;
    readonly considerWhitespaceChanges: boolean;
    private readonly elements;
    private readonly firstElementOffsetByLineIdx;
    private readonly lineStartOffsets;
    private readonly trimmedWsLengthsByLineIdx;
    constructor(lines: string[], range: Range, considerWhitespaceChanges: boolean);
    toString(): string;
    get text(): string;
    getText(range: OffsetRange): string;
    getElement(offset: number): number;
    get length(): number;
    getBoundaryScore(length: number): number;
    translateOffset(offset: number, preference?: 'left' | 'right'): Position;
    translateRange(range: OffsetRange): Range;
    /**
     * Finds the word that contains the character at the given offset
     */
    findWordContaining(offset: number): OffsetRange | undefined;
    countLinesIn(range: OffsetRange): number;
    isStronglyEqual(offset1: number, offset2: number): boolean;
    extendToFullLines(range: OffsetRange): OffsetRange;
}
