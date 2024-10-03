import { DiffAlgorithmResult, IDiffAlgorithm, ISequence, ITimeout } from './diffAlgorithm.js';
export declare class MyersDiffAlgorithm implements IDiffAlgorithm {
    compute(seq1: ISequence, seq2: ISequence, timeout?: ITimeout): DiffAlgorithmResult;
}
