import * as path from '../../../../base/common/path.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import * as glob from '../../../../base/common/glob.js';
import * as resources from '../../../../base/common/resources.js';
import { StopWatch } from '../../../../base/common/stopwatch.js';
import { QueryGlobTester, resolvePatternsForProvider, hasSiblingFn, excludeToGlobPattern, DEFAULT_MAX_SEARCH_RESULTS } from './search.js';
import { TernarySearchTree } from '../../../../base/common/ternarySearchTree.js';
import { OldFileSearchProviderConverter } from './searchExtConversionTypes.js';
class FileSearchEngine {
    constructor(config, provider, sessionLifecycle) {
        this.config = config;
        this.provider = provider;
        this.sessionLifecycle = sessionLifecycle;
        this.isLimitHit = false;
        this.resultCount = 0;
        this.isCanceled = false;
        this.filePattern = config.filePattern;
        this.includePattern = config.includePattern && glob.parse(config.includePattern);
        this.maxResults = config.maxResults || undefined;
        this.exists = config.exists;
        this.activeCancellationTokens = new Set();
        this.globalExcludePattern = config.excludePattern && glob.parse(config.excludePattern);
    }
    cancel() {
        this.isCanceled = true;
        this.activeCancellationTokens.forEach(t => t.cancel());
        this.activeCancellationTokens = new Set();
    }
    search(_onResult) {
        const folderQueries = this.config.folderQueries || [];
        return new Promise((resolve, reject) => {
            const onResult = (match) => {
                this.resultCount++;
                _onResult(match);
            };
            if (this.isCanceled) {
                return resolve({ limitHit: this.isLimitHit });
            }
            if (this.config.extraFileResources) {
                this.config.extraFileResources
                    .forEach(extraFile => {
                    const extraFileStr = extraFile.toString();
                    const basename = path.basename(extraFileStr);
                    if (this.globalExcludePattern && this.globalExcludePattern(extraFileStr, basename)) {
                        return;
                    }
                    this.matchFile(onResult, { base: extraFile, basename });
                });
            }
            this.doSearch(folderQueries, onResult).then(stats => {
                resolve({
                    limitHit: this.isLimitHit,
                    stats: stats || undefined
                });
            }, (err) => {
                reject(new Error(toErrorMessage(err)));
            });
        });
    }
    async doSearch(fqs, onResult) {
        const cancellation = new CancellationTokenSource();
        const folderOptions = fqs.map(fq => this.getSearchOptionsForFolder(fq));
        const session = this.provider instanceof OldFileSearchProviderConverter ? this.sessionLifecycle?.tokenSource.token : this.sessionLifecycle?.obj;
        const options = {
            folderOptions,
            maxResults: this.config.maxResults ?? DEFAULT_MAX_SEARCH_RESULTS,
            session
        };
        const folderMappings = TernarySearchTree.forUris();
        fqs.forEach(fq => {
            const queryTester = new QueryGlobTester(this.config, fq);
            const noSiblingsClauses = !queryTester.hasSiblingExcludeClauses();
            folderMappings.set(fq.folder, { queryTester, noSiblingsClauses, folder: fq.folder, tree: this.initDirectoryTree() });
        });
        let providerSW;
        try {
            this.activeCancellationTokens.add(cancellation);
            providerSW = StopWatch.create();
            const results = await this.provider.provideFileSearchResults(this.config.filePattern || '', options, cancellation.token);
            const providerTime = providerSW.elapsed();
            const postProcessSW = StopWatch.create();
            if (this.isCanceled && !this.isLimitHit) {
                return null;
            }
            if (results) {
                results.forEach(result => {
                    const fqFolderInfo = folderMappings.findSubstr(result);
                    const relativePath = path.posix.relative(fqFolderInfo.folder.path, result.path);
                    if (fqFolderInfo.noSiblingsClauses) {
                        const basename = path.basename(result.path);
                        this.matchFile(onResult, { base: fqFolderInfo.folder, relativePath, basename });
                        return;
                    }
                    this.addDirectoryEntries(fqFolderInfo.tree, fqFolderInfo.folder, relativePath, onResult);
                });
            }
            if (this.isCanceled && !this.isLimitHit) {
                return null;
            }
            folderMappings.forEach(e => {
                this.matchDirectoryTree(e.tree, e.queryTester, onResult);
            });
            return {
                providerTime,
                postProcessTime: postProcessSW.elapsed()
            };
        }
        finally {
            cancellation.dispose();
            this.activeCancellationTokens.delete(cancellation);
        }
    }
    getSearchOptionsForFolder(fq) {
        const includes = resolvePatternsForProvider(this.config.includePattern, fq.includePattern);
        let excludePattern = fq.excludePattern?.map(e => ({
            folder: e.folder,
            patterns: resolvePatternsForProvider(this.config.excludePattern, e.pattern)
        }));
        if (!excludePattern?.length) {
            excludePattern = [{
                    folder: undefined,
                    patterns: resolvePatternsForProvider(this.config.excludePattern, undefined)
                }];
        }
        const excludes = excludeToGlobPattern(excludePattern);
        return {
            folder: fq.folder,
            excludes,
            includes,
            useIgnoreFiles: {
                local: !fq.disregardIgnoreFiles,
                parent: !fq.disregardParentIgnoreFiles,
                global: !fq.disregardGlobalIgnoreFiles
            },
            followSymlinks: !fq.ignoreSymlinks,
        };
    }
    initDirectoryTree() {
        const tree = {
            rootEntries: [],
            pathToEntries: Object.create(null)
        };
        tree.pathToEntries['.'] = tree.rootEntries;
        return tree;
    }
    addDirectoryEntries({ pathToEntries }, base, relativeFile, onResult) {
        if (relativeFile === this.filePattern) {
            const basename = path.basename(this.filePattern);
            this.matchFile(onResult, { base: base, relativePath: this.filePattern, basename });
        }
        function add(relativePath) {
            const basename = path.basename(relativePath);
            const dirname = path.dirname(relativePath);
            let entries = pathToEntries[dirname];
            if (!entries) {
                entries = pathToEntries[dirname] = [];
                add(dirname);
            }
            entries.push({
                base,
                relativePath,
                basename
            });
        }
        add(relativeFile);
    }
    matchDirectoryTree({ rootEntries, pathToEntries }, queryTester, onResult) {
        const self = this;
        const filePattern = this.filePattern;
        function matchDirectory(entries) {
            const hasSibling = hasSiblingFn(() => entries.map(entry => entry.basename));
            for (let i = 0, n = entries.length; i < n; i++) {
                const entry = entries[i];
                const { relativePath, basename } = entry;
                if (queryTester.matchesExcludesSync(relativePath, basename, filePattern !== basename ? hasSibling : undefined)) {
                    continue;
                }
                const sub = pathToEntries[relativePath];
                if (sub) {
                    matchDirectory(sub);
                }
                else {
                    if (relativePath === filePattern) {
                        continue;
                    }
                    self.matchFile(onResult, entry);
                }
                if (self.isLimitHit) {
                    break;
                }
            }
        }
        matchDirectory(rootEntries);
    }
    matchFile(onResult, candidate) {
        if (!this.includePattern || (candidate.relativePath && this.includePattern(candidate.relativePath, candidate.basename))) {
            if (this.exists || (this.maxResults && this.resultCount >= this.maxResults)) {
                this.isLimitHit = true;
                this.cancel();
            }
            if (!this.isLimitHit) {
                onResult(candidate);
            }
        }
    }
}
class SessionLifecycle {
    constructor() {
        this._obj = new Object();
        this.tokenSource = new CancellationTokenSource();
    }
    get obj() {
        if (this._obj) {
            return this._obj;
        }
        throw new Error('Session object has been dereferenced.');
    }
    cancel() {
        this.tokenSource.cancel();
        this._obj = undefined;
    }
}
export class FileSearchManager {
    constructor() {
        this.sessions = new Map();
    }
    static { this.BATCH_SIZE = 512; }
    fileSearch(config, provider, onBatch, token) {
        const sessionTokenSource = this.getSessionTokenSource(config.cacheKey);
        const engine = new FileSearchEngine(config, provider, sessionTokenSource);
        let resultCount = 0;
        const onInternalResult = (batch) => {
            resultCount += batch.length;
            onBatch(batch.map(m => this.rawMatchToSearchItem(m)));
        };
        return this.doSearch(engine, FileSearchManager.BATCH_SIZE, onInternalResult, token).then(result => {
            return {
                limitHit: result.limitHit,
                stats: result.stats ? {
                    fromCache: false,
                    type: 'fileSearchProvider',
                    resultCount,
                    detailStats: result.stats
                } : undefined,
                messages: []
            };
        });
    }
    clearCache(cacheKey) {
        this.sessions.get(cacheKey)?.cancel();
        this.sessions.delete(cacheKey);
    }
    getSessionTokenSource(cacheKey) {
        if (!cacheKey) {
            return undefined;
        }
        if (!this.sessions.has(cacheKey)) {
            this.sessions.set(cacheKey, new SessionLifecycle());
        }
        return this.sessions.get(cacheKey);
    }
    rawMatchToSearchItem(match) {
        if (match.relativePath) {
            return {
                resource: resources.joinPath(match.base, match.relativePath)
            };
        }
        else {
            return {
                resource: match.base
            };
        }
    }
    doSearch(engine, batchSize, onResultBatch, token) {
        const listener = token.onCancellationRequested(() => {
            engine.cancel();
        });
        const _onResult = (match) => {
            if (match) {
                batch.push(match);
                if (batchSize > 0 && batch.length >= batchSize) {
                    onResultBatch(batch);
                    batch = [];
                }
            }
        };
        let batch = [];
        return engine.search(_onResult).then(result => {
            if (batch.length) {
                onResultBatch(batch);
            }
            listener.dispose();
            return result;
        }, error => {
            if (batch.length) {
                onResultBatch(batch);
            }
            listener.dispose();
            return Promise.reject(error);
        });
    }
}
