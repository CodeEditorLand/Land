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
import { toDisposable } from '../../../base/common/lifecycle.js';
import { MainContext } from './extHost.protocol.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { FileSearchManager } from '../../services/search/common/fileSearchManager.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { IURITransformerService } from './extHostUriTransformerService.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { URI } from '../../../base/common/uri.js';
import { TextSearchManager } from '../../services/search/common/textSearchManager.js';
import { revive } from '../../../base/common/marshalling.js';
import { OldAITextSearchProviderConverter, OldFileSearchProviderConverter, OldTextSearchProviderConverter } from '../../services/search/common/searchExtConversionTypes.js';
export const IExtHostSearch = createDecorator('IExtHostSearch');
let ExtHostSearch = class ExtHostSearch {
    constructor(extHostRpc, _uriTransformer, _logService) {
        this.extHostRpc = extHostRpc;
        this._uriTransformer = _uriTransformer;
        this._logService = _logService;
        this._proxy = this.extHostRpc.getProxy(MainContext.MainThreadSearch);
        this._handlePool = 0;
        this._textSearchProvider = new Map();
        this._textSearchUsedSchemes = new Set();
        this._aiTextSearchProvider = new Map();
        this._aiTextSearchUsedSchemes = new Set();
        this._fileSearchProvider = new Map();
        this._fileSearchUsedSchemes = new Set();
        this._fileSearchManager = new FileSearchManager();
    }
    _transformScheme(scheme) {
        return this._uriTransformer.transformOutgoingScheme(scheme);
    }
    registerTextSearchProviderOld(scheme, provider) {
        if (this._textSearchUsedSchemes.has(scheme)) {
            throw new Error(`a text search provider for the scheme '${scheme}' is already registered`);
        }
        this._textSearchUsedSchemes.add(scheme);
        const handle = this._handlePool++;
        this._textSearchProvider.set(handle, new OldTextSearchProviderConverter(provider));
        this._proxy.$registerTextSearchProvider(handle, this._transformScheme(scheme));
        return toDisposable(() => {
            this._textSearchUsedSchemes.delete(scheme);
            this._textSearchProvider.delete(handle);
            this._proxy.$unregisterProvider(handle);
        });
    }
    registerTextSearchProvider(scheme, provider) {
        if (this._textSearchUsedSchemes.has(scheme)) {
            throw new Error(`a text search provider for the scheme '${scheme}' is already registered`);
        }
        this._textSearchUsedSchemes.add(scheme);
        const handle = this._handlePool++;
        this._textSearchProvider.set(handle, provider);
        this._proxy.$registerTextSearchProvider(handle, this._transformScheme(scheme));
        return toDisposable(() => {
            this._textSearchUsedSchemes.delete(scheme);
            this._textSearchProvider.delete(handle);
            this._proxy.$unregisterProvider(handle);
        });
    }
    registerAITextSearchProviderOld(scheme, provider) {
        if (this._aiTextSearchUsedSchemes.has(scheme)) {
            throw new Error(`an AI text search provider for the scheme '${scheme}'is already registered`);
        }
        this._aiTextSearchUsedSchemes.add(scheme);
        const handle = this._handlePool++;
        this._aiTextSearchProvider.set(handle, new OldAITextSearchProviderConverter(provider));
        this._proxy.$registerAITextSearchProvider(handle, this._transformScheme(scheme));
        return toDisposable(() => {
            this._aiTextSearchUsedSchemes.delete(scheme);
            this._aiTextSearchProvider.delete(handle);
            this._proxy.$unregisterProvider(handle);
        });
    }
    registerAITextSearchProvider(scheme, provider) {
        if (this._aiTextSearchUsedSchemes.has(scheme)) {
            throw new Error(`an AI text search provider for the scheme '${scheme}'is already registered`);
        }
        this._aiTextSearchUsedSchemes.add(scheme);
        const handle = this._handlePool++;
        this._aiTextSearchProvider.set(handle, provider);
        this._proxy.$registerAITextSearchProvider(handle, this._transformScheme(scheme));
        return toDisposable(() => {
            this._aiTextSearchUsedSchemes.delete(scheme);
            this._aiTextSearchProvider.delete(handle);
            this._proxy.$unregisterProvider(handle);
        });
    }
    registerFileSearchProviderOld(scheme, provider) {
        if (this._fileSearchUsedSchemes.has(scheme)) {
            throw new Error(`a file search provider for the scheme '${scheme}' is already registered`);
        }
        this._fileSearchUsedSchemes.add(scheme);
        const handle = this._handlePool++;
        this._fileSearchProvider.set(handle, new OldFileSearchProviderConverter(provider));
        this._proxy.$registerFileSearchProvider(handle, this._transformScheme(scheme));
        return toDisposable(() => {
            this._fileSearchUsedSchemes.delete(scheme);
            this._fileSearchProvider.delete(handle);
            this._proxy.$unregisterProvider(handle);
        });
    }
    registerFileSearchProvider(scheme, provider) {
        if (this._fileSearchUsedSchemes.has(scheme)) {
            throw new Error(`a file search provider for the scheme '${scheme}' is already registered`);
        }
        this._fileSearchUsedSchemes.add(scheme);
        const handle = this._handlePool++;
        this._fileSearchProvider.set(handle, provider);
        this._proxy.$registerFileSearchProvider(handle, this._transformScheme(scheme));
        return toDisposable(() => {
            this._fileSearchUsedSchemes.delete(scheme);
            this._fileSearchProvider.delete(handle);
            this._proxy.$unregisterProvider(handle);
        });
    }
    $provideFileSearchResults(handle, session, rawQuery, token) {
        const query = reviveQuery(rawQuery);
        const provider = this._fileSearchProvider.get(handle);
        if (provider) {
            return this._fileSearchManager.fileSearch(query, provider, batch => {
                this._proxy.$handleFileMatch(handle, session, batch.map(p => p.resource));
            }, token);
        }
        else {
            throw new Error('unknown provider: ' + handle);
        }
    }
    async doInternalFileSearchWithCustomCallback(query, token, handleFileMatch) {
        return { messages: [] };
    }
    $clearCache(cacheKey) {
        this._fileSearchManager.clearCache(cacheKey);
        return Promise.resolve(undefined);
    }
    $provideTextSearchResults(handle, session, rawQuery, token) {
        const provider = this._textSearchProvider.get(handle);
        if (!provider || !provider.provideTextSearchResults) {
            throw new Error(`Unknown Text Search Provider ${handle}`);
        }
        const query = reviveQuery(rawQuery);
        const engine = this.createTextSearchManager(query, provider);
        return engine.search(progress => this._proxy.$handleTextMatch(handle, session, progress), token);
    }
    $provideAITextSearchResults(handle, session, rawQuery, token) {
        const provider = this._aiTextSearchProvider.get(handle);
        if (!provider || !provider.provideAITextSearchResults) {
            throw new Error(`Unknown AI Text Search Provider ${handle}`);
        }
        const query = reviveQuery(rawQuery);
        const engine = this.createAITextSearchManager(query, provider);
        return engine.search(progress => this._proxy.$handleTextMatch(handle, session, progress), token);
    }
    $enableExtensionHostSearch() { }
    async $getAIName(handle) {
        const provider = this._aiTextSearchProvider.get(handle);
        if (!provider || !provider.provideAITextSearchResults) {
            return undefined;
        }
        // if the provider is defined, but has no name, use default name
        return provider.name ?? 'AI';
    }
    createTextSearchManager(query, provider) {
        return new TextSearchManager({ query, provider }, {
            readdir: resource => Promise.resolve([]),
            toCanonicalName: encoding => encoding
        }, 'textSearchProvider');
    }
    createAITextSearchManager(query, provider) {
        return new TextSearchManager({ query, provider }, {
            readdir: resource => Promise.resolve([]),
            toCanonicalName: encoding => encoding
        }, 'aiTextSearchProvider');
    }
};
ExtHostSearch = __decorate([
    __param(0, IExtHostRpcService),
    __param(1, IURITransformerService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ExtHostSearch);
export { ExtHostSearch };
export function reviveQuery(rawQuery) {
    return {
        ...rawQuery, // TODO@rob ???
        ...{
            folderQueries: rawQuery.folderQueries && rawQuery.folderQueries.map(reviveFolderQuery),
            extraFileResources: rawQuery.extraFileResources && rawQuery.extraFileResources.map(components => URI.revive(components))
        }
    };
}
function reviveFolderQuery(rawFolderQuery) {
    return revive(rawFolderQuery);
}
