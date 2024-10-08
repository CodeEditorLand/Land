import { CancellationToken } from './cancellation.js';
export interface TfIdfDocument {
    readonly key: string;
    readonly textChunks: readonly string[];
}
export interface TfIdfScore {
    readonly key: string;
    /**
     * An unbounded number.
     */
    readonly score: number;
}
export interface NormalizedTfIdfScore {
    readonly key: string;
    /**
     * A number between 0 and 1.
     */
    readonly score: number;
}
/**
 * Implementation of tf-idf (term frequency-inverse document frequency) for a set of
 * documents where each document contains one or more chunks of text.
 * Each document is identified by a key, and the score for each document is computed
 * by taking the max score over all the chunks in the document.
 */
export declare class TfIdfCalculator {
    calculateScores(query: string, token: CancellationToken): TfIdfScore[];
    /**
     * Count how many times each term (word) appears in a string.
     */
    private static termFrequencies;
    /**
     * Break a string into terms (words).
     */
    private static splitTerms;
    /**
     * Total number of chunks
     */
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
/**
 * Normalize the scores to be between 0 and 1 and sort them decending.
 * @param scores array of scores from {@link TfIdfCalculator.calculateScores}
 * @returns normalized scores
 */
export declare function normalizeTfIdfScores(scores: TfIdfScore[]): NormalizedTfIdfScore[];
