import { CancellationToken } from './cancellation.js';
export interface TfIdfDocument {
    readonly key: string;
    readonly textChunks: readonly string[];
}
export interface TfIdfScore {
    readonly key: string;
    readonly score: number;
}
export interface NormalizedTfIdfScore {
    readonly key: string;
    readonly score: number;
}
export declare class TfIdfCalculator {
    calculateScores(query: string, token: CancellationToken): TfIdfScore[];
    private static termFrequencies;
    private static splitTerms;
    private chunkCount;
    private readonly chunkOccurrences;
    private readonly documents;
    updateDocuments(documents: ReadonlyArray<TfIdfDocument>): this;
    deleteDocument(key: string): void;
    private computeSimilarityScore;
    private computeEmbedding;
    private computeIdf;
    private computeTfidf;
}
export declare function normalizeTfIdfScores(scores: TfIdfScore[]): NormalizedTfIdfScore[];
