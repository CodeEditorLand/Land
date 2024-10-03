import * as glob from '../../../../base/common/glob.js';
import { URI } from '../../../../base/common/uri.js';
import { LocalFileSearchSimpleWorkerHost } from '../common/localFileSearchWorkerTypes.js';
import * as paths from '../../../../base/common/path.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { getFileResults } from '../common/getFileResults.js';
import { IgnoreFile } from '../common/ignoreFile.js';
import { createRegExp } from '../../../../base/common/strings.js';
import { Promises } from '../../../../base/common/async.js';
import { ExtUri } from '../../../../base/common/resources.js';
import { revive } from '../../../../base/common/marshalling.js';
const PERF = false;
const globalStart = +new Date();
const itrcount = {};
const time = async (name, task) => {
    if (!PERF) {
        return task();
    }
    const start = Date.now();
    const itr = (itrcount[name] ?? 0) + 1;
    console.info(name, itr, 'starting', Math.round((start - globalStart) * 10) / 10000);
    itrcount[name] = itr;
    const r = await task();
    const end = Date.now();
    console.info(name, itr, 'took', end - start);
    return r;
};
export function create(workerServer) {
    return new LocalFileSearchSimpleWorker(workerServer);
}
export class LocalFileSearchSimpleWorker {
    constructor(workerServer) {
        this.cancellationTokens = new Map();
        this.host = LocalFileSearchSimpleWorkerHost.getChannel(workerServer);
    }
    $cancelQuery(queryId) {
        this.cancellationTokens.get(queryId)?.cancel();
    }
    registerCancellationToken(queryId) {
        const source = new CancellationTokenSource();
        this.cancellationTokens.set(queryId, source);
        return source;
    }
    async $listDirectory(handle, query, folderQuery, ignorePathCasing, queryId) {
        const revivedFolderQuery = reviveFolderQuery(folderQuery);
        const extUri = new ExtUri(() => ignorePathCasing);
        const token = this.registerCancellationToken(queryId);
        const entries = [];
        let limitHit = false;
        let count = 0;
        const max = query.maxResults || 512;
        const filePatternMatcher = query.filePattern
            ? (name) => query.filePattern.split('').every(c => name.includes(c))
            : (name) => true;
        await time('listDirectory', () => this.walkFolderQuery(handle, reviveQueryProps(query), revivedFolderQuery, extUri, file => {
            if (!filePatternMatcher(file.name)) {
                return;
            }
            count++;
            if (max && count > max) {
                limitHit = true;
                token.cancel();
            }
            return entries.push(file.path);
        }, token.token));
        return {
            results: entries,
            limitHit
        };
    }
    async $searchDirectory(handle, query, folderQuery, ignorePathCasing, queryId) {
        const revivedQuery = reviveFolderQuery(folderQuery);
        const extUri = new ExtUri(() => ignorePathCasing);
        return time('searchInFiles', async () => {
            const token = this.registerCancellationToken(queryId);
            const results = [];
            const pattern = createSearchRegExp(query.contentPattern);
            const onGoingProcesses = [];
            let fileCount = 0;
            let resultCount = 0;
            const limitHit = false;
            const processFile = async (file) => {
                if (token.token.isCancellationRequested) {
                    return;
                }
                fileCount++;
                const contents = await file.resolve();
                if (token.token.isCancellationRequested) {
                    return;
                }
                const bytes = new Uint8Array(contents);
                const fileResults = getFileResults(bytes, pattern, {
                    surroundingContext: query.surroundingContext ?? 0,
                    previewOptions: query.previewOptions,
                    remainingResultQuota: query.maxResults ? (query.maxResults - resultCount) : 10000,
                });
                if (fileResults.length) {
                    resultCount += fileResults.length;
                    if (query.maxResults && resultCount > query.maxResults) {
                        token.cancel();
                    }
                    const match = {
                        resource: URI.joinPath(revivedQuery.folder, file.path),
                        results: fileResults,
                    };
                    this.host.$sendTextSearchMatch(match, queryId);
                    results.push(match);
                }
            };
            await time('walkFolderToResolve', () => this.walkFolderQuery(handle, reviveQueryProps(query), revivedQuery, extUri, async (file) => onGoingProcesses.push(processFile(file)), token.token));
            await time('resolveOngoingProcesses', () => Promise.all(onGoingProcesses));
            if (PERF) {
                console.log('Searched in', fileCount, 'files');
            }
            return {
                results,
                limitHit,
            };
        });
    }
    async walkFolderQuery(handle, queryProps, folderQuery, extUri, onFile, token) {
        const folderExcludes = folderQuery.excludePattern?.map(excludePattern => glob.parse(excludePattern.pattern ?? {}, { trimForExclusions: true }));
        const evalFolderExcludes = (path, basename, hasSibling) => {
            return folderExcludes?.some(folderExclude => {
                return folderExclude(path, basename, hasSibling);
            });
        };
        const isFolderExcluded = (path, basename, hasSibling) => {
            path = path.slice(1);
            if (evalFolderExcludes(path, basename, hasSibling)) {
                return true;
            }
            if (pathExcludedInQuery(queryProps, path)) {
                return true;
            }
            return false;
        };
        const isFileIncluded = (path, basename, hasSibling) => {
            path = path.slice(1);
            if (evalFolderExcludes(path, basename, hasSibling)) {
                return false;
            }
            if (!pathIncludedInQuery(queryProps, path, extUri)) {
                return false;
            }
            return true;
        };
        const processFile = (file, prior) => {
            const resolved = {
                type: 'file',
                name: file.name,
                path: prior,
                resolve: () => file.getFile().then(r => r.arrayBuffer())
            };
            return resolved;
        };
        const isFileSystemDirectoryHandle = (handle) => {
            return handle.kind === 'directory';
        };
        const isFileSystemFileHandle = (handle) => {
            return handle.kind === 'file';
        };
        const processDirectory = async (directory, prior, ignoreFile) => {
            if (!folderQuery.disregardIgnoreFiles) {
                const ignoreFiles = await Promise.all([
                    directory.getFileHandle('.gitignore').catch(e => undefined),
                    directory.getFileHandle('.ignore').catch(e => undefined),
                ]);
                await Promise.all(ignoreFiles.map(async (file) => {
                    if (!file) {
                        return;
                    }
                    const ignoreContents = new TextDecoder('utf8').decode(new Uint8Array(await (await file.getFile()).arrayBuffer()));
                    ignoreFile = new IgnoreFile(ignoreContents, prior, ignoreFile);
                }));
            }
            const entries = Promises.withAsyncBody(async (c) => {
                const files = [];
                const dirs = [];
                const entries = [];
                const sibilings = new Set();
                for await (const entry of directory.entries()) {
                    entries.push(entry);
                    sibilings.add(entry[0]);
                }
                for (const [basename, handle] of entries) {
                    if (token.isCancellationRequested) {
                        break;
                    }
                    const path = prior + basename;
                    if (ignoreFile && !ignoreFile.isPathIncludedInTraversal(path, handle.kind === 'directory')) {
                        continue;
                    }
                    const hasSibling = (query) => sibilings.has(query);
                    if (isFileSystemDirectoryHandle(handle) && !isFolderExcluded(path, basename, hasSibling)) {
                        dirs.push(processDirectory(handle, path + '/', ignoreFile));
                    }
                    else if (isFileSystemFileHandle(handle) && isFileIncluded(path, basename, hasSibling)) {
                        files.push(processFile(handle, path));
                    }
                }
                c([...await Promise.all(dirs), ...files]);
            });
            return {
                type: 'dir',
                name: directory.name,
                entries
            };
        };
        const resolveDirectory = async (directory, onFile) => {
            if (token.isCancellationRequested) {
                return;
            }
            await Promise.all((await directory.entries)
                .sort((a, b) => -(a.type === 'dir' ? 0 : 1) + (b.type === 'dir' ? 0 : 1))
                .map(async (entry) => {
                if (entry.type === 'dir') {
                    return resolveDirectory(entry, onFile);
                }
                else {
                    return onFile(entry);
                }
            }));
        };
        const processed = await time('process', () => processDirectory(handle, '/'));
        await time('resolve', () => resolveDirectory(processed, onFile));
    }
}
function createSearchRegExp(options) {
    return createRegExp(options.pattern, !!options.isRegExp, {
        wholeWord: options.isWordMatch,
        global: true,
        matchCase: options.isCaseSensitive,
        multiline: true,
        unicode: true,
    });
}
function reviveFolderQuery(folderQuery) {
    return revive({
        ...revive(folderQuery),
        excludePattern: folderQuery.excludePattern?.map(ep => ({ folder: URI.revive(ep.folder), pattern: ep.pattern })),
        folder: URI.revive(folderQuery.folder),
    });
}
function reviveQueryProps(queryProps) {
    return {
        ...queryProps,
        extraFileResources: queryProps.extraFileResources?.map(r => URI.revive(r)),
        folderQueries: queryProps.folderQueries.map(fq => reviveFolderQuery(fq)),
    };
}
function pathExcludedInQuery(queryProps, fsPath) {
    if (queryProps.excludePattern && glob.match(queryProps.excludePattern, fsPath)) {
        return true;
    }
    return false;
}
function pathIncludedInQuery(queryProps, path, extUri) {
    if (queryProps.excludePattern && glob.match(queryProps.excludePattern, path)) {
        return false;
    }
    if (queryProps.includePattern || queryProps.usingSearchPaths) {
        if (queryProps.includePattern && glob.match(queryProps.includePattern, path)) {
            return true;
        }
        if (queryProps.usingSearchPaths) {
            return !!queryProps.folderQueries && queryProps.folderQueries.some(fq => {
                const searchPath = fq.folder;
                const uri = URI.file(path);
                if (extUri.isEqualOrParent(uri, searchPath)) {
                    const relPath = paths.relative(searchPath.path, uri.path);
                    return !fq.includePattern || !!glob.match(fq.includePattern, relPath);
                }
                else {
                    return false;
                }
            });
        }
        return false;
    }
    return true;
}
