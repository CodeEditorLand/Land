import { OffsetRange } from '../../../core/offsetRange.js';
export interface IDiffAlgorithm {
    compute(sequence1: ISequence, sequence2: ISequence, timeout?: ITimeout): DiffAlgorithmResult;
}
export declare class DiffAlgorithmResult {
    readonly diffs: SequenceDiff[];
    readonly hitTimeout: boolean;
    static trivial(seq1: ISequence, seq2: ISequence): DiffAlgorithmResult;
    static trivialTimedOut(seq1: ISequence, seq2: ISequence): DiffAlgorithmResult;
    constructor(diffs: SequenceDiff[], hitTimeout: boolean);
}
export declare class SequenceDiff {
    readonly seq1Range: OffsetRange;
    readonly seq2Range: OffsetRange;
    static invert(sequenceDiffs: SequenceDiff[], doc1Length: number): SequenceDiff[];
    static fromOffsetPairs(start: OffsetPair, endExclusive: OffsetPair): SequenceDiff;
    static assertSorted(sequenceDiffs: SequenceDiff[]): void;
    constructor(seq1Range: OffsetRange, seq2Range: OffsetRange);
    swap(): SequenceDiff;
    toString(): string;
    join(other: SequenceDiff): SequenceDiff;
    delta(offset: number): SequenceDiff;
    deltaStart(offset: number): SequenceDiff;
    deltaEnd(offset: number): SequenceDiff;
    intersectsOrTouches(other: SequenceDiff): boolean;
    intersect(other: SequenceDiff): SequenceDiff | undefined;
    getStarts(): OffsetPair;
    getEndExclusives(): OffsetPair;
}
export declare class OffsetPair {
    readonly offset1: number;
    readonly offset2: number;
    static readonly zero: OffsetPair;
    static readonly max: OffsetPair;
    constructor(offset1: number, offset2: number);
    toString(): string;
    delta(offset: number): OffsetPair;
    equals(other: OffsetPair): boolean;
}
export interface ISequence {
    getElement(offset: number): number;
    get length(): number;
    getBoundaryScore?(length: number): number;
    isStronglyEqual(offset1: number, offset2: number): boolean;
}
export interface ITimeout {
    isValid(): boolean;
}
export declare class InfiniteTimeout implements ITimeout {
    static instance: InfiniteTimeout;
    isValid(): boolean;
}
export declare class DateTimeout implements ITimeout {
    private timeout;
    private readonly startTime;
    private valid;
    constructor(timeout: number);
    isValid(): boolean;
    disable(): void;
}
