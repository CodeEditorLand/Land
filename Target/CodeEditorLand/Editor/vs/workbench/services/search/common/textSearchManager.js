import { isThenable } from '../../../../base/common/async.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { Schemas } from '../../../../base/common/network.js';
import * as path from '../../../../base/common/path.js';
import * as resources from '../../../../base/common/resources.js';
import { TernarySearchTree } from '../../../../base/common/ternarySearchTree.js';
import { URI } from '../../../../base/common/uri.js';
import { DEFAULT_MAX_SEARCH_RESULTS, hasSiblingPromiseFn, excludeToGlobPattern, QueryGlobTester, resolvePatternsForProvider, DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS } from './search.js';
import { TextSearchMatchNew } from './searchExtTypes.js';
export class TextSearchManager {
    constructor(queryProviderPair, fileUtils, processType) {
        this.queryProviderPair = queryProviderPair;
        this.fileUtils = fileUtils;
        this.processType = processType;
        this.collector = null;
        this.isLimitHit = false;
        this.resultCount = 0;
    }
    get query() {
        return this.queryProviderPair.query;
    }
    search(onProgress, token) {
        const folderQueries = this.query.folderQueries || [];
        const tokenSource = new CancellationTokenSource(token);
        return new Promise((resolve, reject) => {
            this.collector = new TextSearchResultsCollector(onProgress);
            let isCanceled = false;
            const onResult = (result, folderIdx) => {
                if (isCanceled) {
                    return;
                }
                if (!this.isLimitHit) {
                    const resultSize = this.resultSize(result);
                    if (result instanceof TextSearchMatchNew && typeof this.query.maxResults === 'number' && this.resultCount + resultSize > this.query.maxResults) {
                        this.isLimitHit = true;
                        isCanceled = true;
                        tokenSource.cancel();
                        result = this.trimResultToSize(result, this.query.maxResults - this.resultCount);
                    }
                    const newResultSize = this.resultSize(result);
                    this.resultCount += newResultSize;
                    const a = result instanceof TextSearchMatchNew;
                    if (newResultSize > 0 || !a) {
                        this.collector.add(result, folderIdx);
                    }
                }
            };
            this.doSearch(folderQueries, onResult, tokenSource.token).then(result => {
                tokenSource.dispose();
                this.collector.flush();
                resolve({
                    limitHit: this.isLimitHit || result?.limitHit,
                    messages: this.getMessagesFromResults(result),
                    stats: {
                        type: this.processType
                    }
                });
            }, (err) => {
                tokenSource.dispose();
                const errMsg = toErrorMessage(err);
                reject(new Error(errMsg));
            });
        });
    }
    getMessagesFromResults(result) {
        if (!result?.message) {
            return [];
        }
        if (Array.isArray(result.message)) {
            return result.message;
        }
        return [result.message];
    }
    resultSize(result) {
        if (result instanceof TextSearchMatchNew) {
            return Array.isArray(result.ranges) ?
                result.ranges.length :
                1;
        }
        else {
            return 0;
        }
    }
    trimResultToSize(result, size) {
        return new TextSearchMatchNew(result.uri, result.ranges.slice(0, size), result.previewText);
    }
    async doSearch(folderQueries, onResult, token) {
        const folderMappings = TernarySearchTree.forUris(() => true);
        folderQueries.forEach((fq, i) => {
            const queryTester = new QueryGlobTester(this.query, fq);
            folderMappings.set(fq.folder, { queryTester, folder: fq.folder, folderIdx: i });
        });
        const testingPs = [];
        const progress = {
            report: (result) => {
                if (result.uri === undefined) {
                    throw Error('Text search result URI is undefined. Please check provider implementation.');
                }
                const folderQuery = folderMappings.findSubstr(result.uri);
                const hasSibling = folderQuery.folder.scheme === Schemas.file ?
                    hasSiblingPromiseFn(() => {
                        return this.fileUtils.readdir(resources.dirname(result.uri));
                    }) :
                    undefined;
                const relativePath = resources.relativePath(folderQuery.folder, result.uri);
                if (relativePath) {
                    const included = folderQuery.queryTester.includedInQuery(relativePath, path.basename(relativePath), hasSibling);
                    if (isThenable(included)) {
                        testingPs.push(included.then(isIncluded => {
                            if (isIncluded) {
                                onResult(result, folderQuery.folderIdx);
                            }
                        }));
                    }
                    else if (included) {
                        onResult(result, folderQuery.folderIdx);
                    }
                }
            }
        };
        const folderOptions = folderQueries.map(fq => this.getSearchOptionsForFolder(fq));
        const searchOptions = {
            folderOptions,
            maxFileSize: this.query.maxFileSize,
            maxResults: this.query.maxResults ?? DEFAULT_MAX_SEARCH_RESULTS,
            previewOptions: this.query.previewOptions ?? DEFAULT_TEXT_SEARCH_PREVIEW_OPTIONS,
            surroundingContext: this.query.surroundingContext ?? 0,
        };
        if ('usePCRE2' in this.query) {
            searchOptions.usePCRE2 = this.query.usePCRE2;
        }
        let result;
        if (this.queryProviderPair.query.type === 3) {
            result = await this.queryProviderPair.provider.provideAITextSearchResults(this.queryProviderPair.query.contentPattern, searchOptions, progress, token);
        }
        else {
            result = await this.queryProviderPair.provider.provideTextSearchResults(patternInfoToQuery(this.queryProviderPair.query.contentPattern), searchOptions, progress, token);
        }
        if (testingPs.length) {
            await Promise.all(testingPs);
        }
        return result;
    }
    getSearchOptionsForFolder(fq) {
        const includes = resolvePatternsForProvider(this.query.includePattern, fq.includePattern);
        let excludePattern = fq.excludePattern?.map(e => ({
            folder: e.folder,
            patterns: resolvePatternsForProvider(this.query.excludePattern, e.pattern)
        }));
        if (!excludePattern || excludePattern.length === 0) {
            excludePattern = [{
                    folder: undefined,
                    patterns: resolvePatternsForProvider(this.query.excludePattern, undefined)
                }];
        }
        const excludes = excludeToGlobPattern(excludePattern);
        const options = {
            folder: URI.from(fq.folder),
            excludes,
            includes,
            useIgnoreFiles: {
                local: !fq.disregardIgnoreFiles,
                parent: !fq.disregardParentIgnoreFiles,
                global: !fq.disregardGlobalIgnoreFiles
            },
            followSymlinks: !fq.ignoreSymlinks,
            encoding: (fq.fileEncoding && this.fileUtils.toCanonicalName(fq.fileEncoding)) ?? '',
        };
        return options;
    }
}
function patternInfoToQuery(patternInfo) {
    return {
        isCaseSensitive: patternInfo.isCaseSensitive || false,
        isRegExp: patternInfo.isRegExp || false,
        isWordMatch: patternInfo.isWordMatch || false,
        isMultiline: patternInfo.isMultiline || false,
        pattern: patternInfo.pattern
    };
}
export class TextSearchResultsCollector {
    constructor(_onResult) {
        this._onResult = _onResult;
        this._currentFolderIdx = -1;
        this._currentFileMatch = null;
        this._batchedCollector = new BatchedCollector(512, items => this.sendItems(items));
    }
    add(data, folderIdx) {
        if (this._currentFileMatch && (this._currentFolderIdx !== folderIdx || !resources.isEqual(this._currentUri, data.uri))) {
            this.pushToCollector();
            this._currentFileMatch = null;
        }
        if (!this._currentFileMatch) {
            this._currentFolderIdx = folderIdx;
            this._currentFileMatch = {
                resource: data.uri,
                results: []
            };
        }
        this._currentFileMatch.results.push(extensionResultToFrontendResult(data));
    }
    pushToCollector() {
        const size = this._currentFileMatch && this._currentFileMatch.results ?
            this._currentFileMatch.results.length :
            0;
        this._batchedCollector.addItem(this._currentFileMatch, size);
    }
    flush() {
        this.pushToCollector();
        this._batchedCollector.flush();
    }
    sendItems(items) {
        this._onResult(items);
    }
}
function extensionResultToFrontendResult(data) {
    if (data instanceof TextSearchMatchNew) {
        return {
            previewText: data.previewText,
            rangeLocations: data.ranges.map(r => ({
                preview: {
                    startLineNumber: r.previewRange.start.line,
                    startColumn: r.previewRange.start.character,
                    endLineNumber: r.previewRange.end.line,
                    endColumn: r.previewRange.end.character
                },
                source: {
                    startLineNumber: r.sourceRange.start.line,
                    startColumn: r.sourceRange.start.character,
                    endLineNumber: r.sourceRange.end.line,
                    endColumn: r.sourceRange.end.character
                },
            })),
        };
    }
    else {
        return {
            text: data.text,
            lineNumber: data.lineNumber
        };
    }
}
export class BatchedCollector {
    static { this.TIMEOUT = 4000; }
    static { this.START_BATCH_AFTER_COUNT = 50; }
    constructor(maxBatchSize, cb) {
        this.maxBatchSize = maxBatchSize;
        this.cb = cb;
        this.totalNumberCompleted = 0;
        this.batch = [];
        this.batchSize = 0;
    }
    addItem(item, size) {
        if (!item) {
            return;
        }
        this.addItemToBatch(item, size);
    }
    addItems(items, size) {
        if (!items) {
            return;
        }
        this.addItemsToBatch(items, size);
    }
    addItemToBatch(item, size) {
        this.batch.push(item);
        this.batchSize += size;
        this.onUpdate();
    }
    addItemsToBatch(item, size) {
        this.batch = this.batch.concat(item);
        this.batchSize += size;
        this.onUpdate();
    }
    onUpdate() {
        if (this.totalNumberCompleted < BatchedCollector.START_BATCH_AFTER_COUNT) {
            this.flush();
        }
        else if (this.batchSize >= this.maxBatchSize) {
            this.flush();
        }
        else if (!this.timeoutHandle) {
            this.timeoutHandle = setTimeout(() => {
                this.flush();
            }, BatchedCollector.TIMEOUT);
        }
    }
    flush() {
        if (this.batchSize) {
            this.totalNumberCompleted += this.batchSize;
            this.cb(this.batch);
            this.batch = [];
            this.batchSize = 0;
            if (this.timeoutHandle) {
                clearTimeout(this.timeoutHandle);
                this.timeoutHandle = 0;
            }
        }
    }
}
