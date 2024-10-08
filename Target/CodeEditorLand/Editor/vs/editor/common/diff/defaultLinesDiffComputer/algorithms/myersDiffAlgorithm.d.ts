import { DiffAlgorithmResult, IDiffAlgorithm, ISequence, ITimeout } from './diffAlgorithm.js';
/**
 * An O(ND) diff algorithm that has a quadratic space worst-case complexity.
*/
export declare class MyersDiffAlgorithm implements IDiffAlgorithm {
    compute(seq1: ISequence, seq2: ISequence, timeout?: ITimeout): DiffAlgorithmResult;
}
