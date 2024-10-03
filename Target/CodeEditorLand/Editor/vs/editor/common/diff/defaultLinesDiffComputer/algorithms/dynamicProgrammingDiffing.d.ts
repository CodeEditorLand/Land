import { IDiffAlgorithm, ISequence, ITimeout, DiffAlgorithmResult } from './diffAlgorithm.js';
export declare class DynamicProgrammingDiffing implements IDiffAlgorithm {
    compute(sequence1: ISequence, sequence2: ISequence, timeout?: ITimeout, equalityScore?: (offset1: number, offset2: number) => number): DiffAlgorithmResult;
}
