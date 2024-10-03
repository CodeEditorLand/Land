function countMapFrom(values) {
    const map = new Map();
    for (const value of values) {
        map.set(value, (map.get(value) ?? 0) + 1);
    }
    return map;
}
export class TfIdfCalculator {
    constructor() {
        this.chunkCount = 0;
        this.chunkOccurrences = new Map();
        this.documents = new Map();
    }
    calculateScores(query, token) {
        const embedding = this.computeEmbedding(query);
        const idfCache = new Map();
        const scores = [];
        for (const [key, doc] of this.documents) {
            if (token.isCancellationRequested) {
                return [];
            }
            for (const chunk of doc.chunks) {
                const score = this.computeSimilarityScore(chunk, embedding, idfCache);
                if (score > 0) {
                    scores.push({ key, score });
                }
            }
        }
        return scores;
    }
    static termFrequencies(input) {
        return countMapFrom(TfIdfCalculator.splitTerms(input));
    }
    static *splitTerms(input) {
        const normalize = (word) => word.toLowerCase();
        for (const [word] of input.matchAll(/\b\p{Letter}[\p{Letter}\d]{2,}\b/gu)) {
            yield normalize(word);
            const camelParts = word.replace(/([a-z])([A-Z])/g, '$1 $2').split(/\s+/g);
            if (camelParts.length > 1) {
                for (const part of camelParts) {
                    if (part.length > 2 && /\p{Letter}{3,}/gu.test(part)) {
                        yield normalize(part);
                    }
                }
            }
        }
    }
    updateDocuments(documents) {
        for (const { key } of documents) {
            this.deleteDocument(key);
        }
        for (const doc of documents) {
            const chunks = [];
            for (const text of doc.textChunks) {
                const tf = TfIdfCalculator.termFrequencies(text);
                for (const term of tf.keys()) {
                    this.chunkOccurrences.set(term, (this.chunkOccurrences.get(term) ?? 0) + 1);
                }
                chunks.push({ text, tf });
            }
            this.chunkCount += chunks.length;
            this.documents.set(doc.key, { chunks });
        }
        return this;
    }
    deleteDocument(key) {
        const doc = this.documents.get(key);
        if (!doc) {
            return;
        }
        this.documents.delete(key);
        this.chunkCount -= doc.chunks.length;
        for (const chunk of doc.chunks) {
            for (const term of chunk.tf.keys()) {
                const currentOccurrences = this.chunkOccurrences.get(term);
                if (typeof currentOccurrences === 'number') {
                    const newOccurrences = currentOccurrences - 1;
                    if (newOccurrences <= 0) {
                        this.chunkOccurrences.delete(term);
                    }
                    else {
                        this.chunkOccurrences.set(term, newOccurrences);
                    }
                }
            }
        }
    }
    computeSimilarityScore(chunk, queryEmbedding, idfCache) {
        let sum = 0;
        for (const [term, termTfidf] of Object.entries(queryEmbedding)) {
            const chunkTf = chunk.tf.get(term);
            if (!chunkTf) {
                continue;
            }
            let chunkIdf = idfCache.get(term);
            if (typeof chunkIdf !== 'number') {
                chunkIdf = this.computeIdf(term);
                idfCache.set(term, chunkIdf);
            }
            const chunkTfidf = chunkTf * chunkIdf;
            sum += chunkTfidf * termTfidf;
        }
        return sum;
    }
    computeEmbedding(input) {
        const tf = TfIdfCalculator.termFrequencies(input);
        return this.computeTfidf(tf);
    }
    computeIdf(term) {
        const chunkOccurrences = this.chunkOccurrences.get(term) ?? 0;
        return chunkOccurrences > 0
            ? Math.log((this.chunkCount + 1) / chunkOccurrences)
            : 0;
    }
    computeTfidf(termFrequencies) {
        const embedding = Object.create(null);
        for (const [word, occurrences] of termFrequencies) {
            const idf = this.computeIdf(word);
            if (idf > 0) {
                embedding[word] = occurrences * idf;
            }
        }
        return embedding;
    }
}
export function normalizeTfIdfScores(scores) {
    const result = scores.slice(0);
    result.sort((a, b) => b.score - a.score);
    const max = result[0]?.score ?? 0;
    if (max > 0) {
        for (const score of result) {
            score.score /= max;
        }
    }
    return result;
}
