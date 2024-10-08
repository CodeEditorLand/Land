/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { DisposableStore, toDisposable } from '../../../base/common/lifecycle.js';
import { Schemas } from '../../../base/common/network.js';
import { URI } from '../../../base/common/uri.js';
import * as pfs from '../../../base/node/pfs.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IExtHostConfiguration } from '../common/extHostConfiguration.js';
import { IExtHostInitDataService } from '../common/extHostInitDataService.js';
import { IExtHostRpcService } from '../common/extHostRpcService.js';
import { ExtHostSearch, reviveQuery } from '../common/extHostSearch.js';
import { IURITransformerService } from '../common/extHostUriTransformerService.js';
import { isSerializedFileMatch } from '../../services/search/common/search.js';
import { SearchService } from '../../services/search/node/rawSearchService.js';
import { RipgrepSearchProvider } from '../../services/search/node/ripgrepSearchProvider.js';
import { OutputChannel } from '../../services/search/node/ripgrepSearchUtils.js';
import { NativeTextSearchManager } from '../../services/search/node/textSearchManager.js';
let NativeExtHostSearch = class NativeExtHostSearch extends ExtHostSearch {
    constructor(extHostRpc, initData, _uriTransformer, configurationService, _logService) {
        super(extHostRpc, _uriTransformer, _logService);
        this.configurationService = configurationService;
        this._pfs = pfs; // allow extending for tests
        this._internalFileSearchHandle = -1;
        this._internalFileSearchProvider = null;
        this._registeredEHSearchProvider = false;
        this._disposables = new DisposableStore();
        this.isDisposed = false;
        this.getNumThreads = this.getNumThreads.bind(this);
        this.getNumThreadsCached = this.getNumThreadsCached.bind(this);
        this.handleConfigurationChanged = this.handleConfigurationChanged.bind(this);
        const outputChannel = new OutputChannel('RipgrepSearchUD', this._logService);
        this._disposables.add(this.registerTextSearchProvider(Schemas.vscodeUserData, new RipgrepSearchProvider(outputChannel, this.getNumThreadsCached)));
        if (initData.remote.isRemote && initData.remote.authority) {
            this._registerEHSearchProviders();
        }
        configurationService.getConfigProvider().then(provider => {
            if (this.isDisposed) {
                return;
            }
            this._disposables.add(provider.onDidChangeConfiguration(this.handleConfigurationChanged));
        });
    }
    handleConfigurationChanged(event) {
        if (!event.affectsConfiguration('search')) {
            return;
        }
        this._numThreadsPromise = undefined;
    }
    async getNumThreads() {
        const configProvider = await this.configurationService.getConfigProvider();
        const numThreads = configProvider.getConfiguration('search').get('ripgrep.maxThreads');
        return numThreads;
    }
    async getNumThreadsCached() {
        if (!this._numThreadsPromise) {
            this._numThreadsPromise = this.getNumThreads();
        }
        return this._numThreadsPromise;
    }
    dispose() {
        this.isDisposed = true;
        this._disposables.dispose();
    }
    $enableExtensionHostSearch() {
        this._registerEHSearchProviders();
    }
    _registerEHSearchProviders() {
        if (this._registeredEHSearchProvider) {
            return;
        }
        this._registeredEHSearchProvider = true;
        const outputChannel = new OutputChannel('RipgrepSearchEH', this._logService);
        this._disposables.add(this.registerTextSearchProvider(Schemas.file, new RipgrepSearchProvider(outputChannel, this.getNumThreadsCached)));
        this._disposables.add(this.registerInternalFileSearchProvider(Schemas.file, new SearchService('fileSearchProvider', this.getNumThreadsCached)));
    }
    registerInternalFileSearchProvider(scheme, provider) {
        const handle = this._handlePool++;
        this._internalFileSearchProvider = provider;
        this._internalFileSearchHandle = handle;
        this._proxy.$registerFileSearchProvider(handle, this._transformScheme(scheme));
        return toDisposable(() => {
            this._internalFileSearchProvider = null;
            this._proxy.$unregisterProvider(handle);
        });
    }
    $provideFileSearchResults(handle, session, rawQuery, token) {
        const query = reviveQuery(rawQuery);
        if (handle === this._internalFileSearchHandle) {
            const start = Date.now();
            return this.doInternalFileSearch(handle, session, query, token).then(result => {
                const elapsed = Date.now() - start;
                this._logService.debug(`Ext host file search time: ${elapsed}ms`);
                return result;
            });
        }
        return super.$provideFileSearchResults(handle, session, rawQuery, token);
    }
    async doInternalFileSearchWithCustomCallback(rawQuery, token, handleFileMatch) {
        const onResult = (ev) => {
            if (isSerializedFileMatch(ev)) {
                ev = [ev];
            }
            if (Array.isArray(ev)) {
                handleFileMatch(ev.map(m => URI.file(m.path)));
                return;
            }
            if (ev.message) {
                this._logService.debug('ExtHostSearch', ev.message);
            }
        };
        if (!this._internalFileSearchProvider) {
            throw new Error('No internal file search handler');
        }
        const numThreads = await this.getNumThreadsCached();
        return this._internalFileSearchProvider.doFileSearch(rawQuery, numThreads, onResult, token);
    }
    async doInternalFileSearch(handle, session, rawQuery, token) {
        return this.doInternalFileSearchWithCustomCallback(rawQuery, token, (data) => {
            this._proxy.$handleFileMatch(handle, session, data);
        });
    }
    $clearCache(cacheKey) {
        this._internalFileSearchProvider?.clearCache(cacheKey);
        return super.$clearCache(cacheKey);
    }
    createTextSearchManager(query, provider) {
        return new NativeTextSearchManager(query, provider, undefined, 'textSearchProvider');
    }
};
NativeExtHostSearch = __decorate([
    __param(0, IExtHostRpcService),
    __param(1, IExtHostInitDataService),
    __param(2, IURITransformerService),
    __param(3, IExtHostConfiguration),
    __param(4, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], NativeExtHostSearch);
export { NativeExtHostSearch };
