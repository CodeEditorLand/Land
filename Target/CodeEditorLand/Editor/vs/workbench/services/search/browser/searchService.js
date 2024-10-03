var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { IModelService } from '../../../../editor/common/services/model.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { ISearchService, TextSearchCompleteMessageType } from '../common/search.js';
import { SearchService } from '../common/searchService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { logOnceWebWorkerWarning } from '../../../../base/common/worker/simpleWorker.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { createWebWorker } from '../../../../base/browser/defaultWorkerFactory.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { LocalFileSearchSimpleWorkerHost } from '../common/localFileSearchWorkerTypes.js';
import { memoize } from '../../../../base/common/decorators.js';
import { HTMLFileSystemProvider } from '../../../../platform/files/browser/htmlFileSystemProvider.js';
import { Schemas } from '../../../../base/common/network.js';
import { URI } from '../../../../base/common/uri.js';
import { Emitter } from '../../../../base/common/event.js';
import { localize } from '../../../../nls.js';
import { WebFileSystemAccess } from '../../../../platform/files/browser/webFileSystemAccess.js';
import { revive } from '../../../../base/common/marshalling.js';
let RemoteSearchService = class RemoteSearchService extends SearchService {
    constructor(modelService, editorService, telemetryService, logService, extensionService, fileService, instantiationService, uriIdentityService) {
        super(modelService, editorService, telemetryService, logService, extensionService, fileService, uriIdentityService);
        this.instantiationService = instantiationService;
        const searchProvider = this.instantiationService.createInstance(LocalFileSearchWorkerClient);
        this.registerSearchResultProvider(Schemas.file, 0, searchProvider);
        this.registerSearchResultProvider(Schemas.file, 1, searchProvider);
    }
};
RemoteSearchService = __decorate([
    __param(0, IModelService),
    __param(1, IEditorService),
    __param(2, ITelemetryService),
    __param(3, ILogService),
    __param(4, IExtensionService),
    __param(5, IFileService),
    __param(6, IInstantiationService),
    __param(7, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], RemoteSearchService);
export { RemoteSearchService };
let LocalFileSearchWorkerClient = class LocalFileSearchWorkerClient extends Disposable {
    constructor(fileService, uriIdentityService) {
        super();
        this.fileService = fileService;
        this.uriIdentityService = uriIdentityService;
        this._onDidReceiveTextSearchMatch = new Emitter();
        this.onDidReceiveTextSearchMatch = this._onDidReceiveTextSearchMatch.event;
        this.queryId = 0;
        this._worker = null;
    }
    async getAIName() {
        return undefined;
    }
    sendTextSearchMatch(match, queryId) {
        this._onDidReceiveTextSearchMatch.fire({ match, queryId });
    }
    get fileSystemProvider() {
        return this.fileService.getProvider(Schemas.file);
    }
    async cancelQuery(queryId) {
        const proxy = this._getOrCreateWorker().proxy;
        proxy.$cancelQuery(queryId);
    }
    async textSearch(query, onProgress, token) {
        try {
            const queryDisposables = new DisposableStore();
            const proxy = this._getOrCreateWorker().proxy;
            const results = [];
            let limitHit = false;
            await Promise.all(query.folderQueries.map(async (fq) => {
                const queryId = this.queryId++;
                queryDisposables.add(token?.onCancellationRequested(e => this.cancelQuery(queryId)) || Disposable.None);
                const handle = await this.fileSystemProvider.getHandle(fq.folder);
                if (!handle || !WebFileSystemAccess.isFileSystemDirectoryHandle(handle)) {
                    console.error('Could not get directory handle for ', fq);
                    return;
                }
                const reviveMatch = (result) => ({
                    resource: URI.revive(result.resource),
                    results: revive(result.results)
                });
                queryDisposables.add(this.onDidReceiveTextSearchMatch(e => {
                    if (e.queryId === queryId) {
                        onProgress?.(reviveMatch(e.match));
                    }
                }));
                const ignorePathCasing = this.uriIdentityService.extUri.ignorePathCasing(fq.folder);
                const folderResults = await proxy.$searchDirectory(handle, query, fq, ignorePathCasing, queryId);
                for (const folderResult of folderResults.results) {
                    results.push(revive(folderResult));
                }
                if (folderResults.limitHit) {
                    limitHit = true;
                }
            }));
            queryDisposables.dispose();
            const result = { messages: [], results, limitHit };
            return result;
        }
        catch (e) {
            console.error('Error performing web worker text search', e);
            return {
                results: [],
                messages: [{
                        text: localize('errorSearchText', "Unable to search with Web Worker text searcher"), type: TextSearchCompleteMessageType.Warning
                    }],
            };
        }
    }
    async fileSearch(query, token) {
        try {
            const queryDisposables = new DisposableStore();
            let limitHit = false;
            const proxy = this._getOrCreateWorker().proxy;
            const results = [];
            await Promise.all(query.folderQueries.map(async (fq) => {
                const queryId = this.queryId++;
                queryDisposables.add(token?.onCancellationRequested(e => this.cancelQuery(queryId)) || Disposable.None);
                const handle = await this.fileSystemProvider.getHandle(fq.folder);
                if (!handle || !WebFileSystemAccess.isFileSystemDirectoryHandle(handle)) {
                    console.error('Could not get directory handle for ', fq);
                    return;
                }
                const caseSensitive = this.uriIdentityService.extUri.ignorePathCasing(fq.folder);
                const folderResults = await proxy.$listDirectory(handle, query, fq, caseSensitive, queryId);
                for (const folderResult of folderResults.results) {
                    results.push({ resource: URI.joinPath(fq.folder, folderResult) });
                }
                if (folderResults.limitHit) {
                    limitHit = true;
                }
            }));
            queryDisposables.dispose();
            const result = { messages: [], results, limitHit };
            return result;
        }
        catch (e) {
            console.error('Error performing web worker file search', e);
            return {
                results: [],
                messages: [{
                        text: localize('errorSearchFile', "Unable to search with Web Worker file searcher"), type: TextSearchCompleteMessageType.Warning
                    }],
            };
        }
    }
    async clearCache(cacheKey) {
        if (this.cache?.key === cacheKey) {
            this.cache = undefined;
        }
    }
    _getOrCreateWorker() {
        if (!this._worker) {
            try {
                this._worker = this._register(createWebWorker('vs/workbench/services/search/worker/localFileSearch', 'LocalFileSearchWorker'));
                LocalFileSearchSimpleWorkerHost.setChannel(this._worker, {
                    $sendTextSearchMatch: (match, queryId) => {
                        return this.sendTextSearchMatch(match, queryId);
                    }
                });
            }
            catch (err) {
                logOnceWebWorkerWarning(err);
                throw err;
            }
        }
        return this._worker;
    }
};
__decorate([
    memoize,
    __metadata("design:type", HTMLFileSystemProvider),
    __metadata("design:paramtypes", [])
], LocalFileSearchWorkerClient.prototype, "fileSystemProvider", null);
LocalFileSearchWorkerClient = __decorate([
    __param(0, IFileService),
    __param(1, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object])
], LocalFileSearchWorkerClient);
export { LocalFileSearchWorkerClient };
registerSingleton(ISearchService, RemoteSearchService, 1);
