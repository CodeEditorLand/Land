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
import { IUriIdentityService } from './uriIdentity.js';
import { registerSingleton } from '../../instantiation/common/extensions.js';
import { IFileService } from '../../files/common/files.js';
import { ExtUri, normalizePath } from '../../../base/common/resources.js';
import { SkipList } from '../../../base/common/skipList.js';
import { Event } from '../../../base/common/event.js';
import { DisposableStore } from '../../../base/common/lifecycle.js';
class Entry {
    static { this._clock = 0; }
    constructor(uri) {
        this.uri = uri;
        this.time = Entry._clock++;
    }
    touch() {
        this.time = Entry._clock++;
        return this;
    }
}
let UriIdentityService = class UriIdentityService {
    constructor(_fileService) {
        this._fileService = _fileService;
        this._dispooables = new DisposableStore();
        this._limit = 2 ** 16;
        const schemeIgnoresPathCasingCache = new Map();
        // assume path casing matters unless the file system provider spec'ed the opposite.
        // for all other cases path casing matters, e.g for
        // * virtual documents
        // * in-memory uris
        // * all kind of "private" schemes
        const ignorePathCasing = (uri) => {
            let ignorePathCasing = schemeIgnoresPathCasingCache.get(uri.scheme);
            if (ignorePathCasing === undefined) {
                // retrieve once and then case per scheme until a change happens
                ignorePathCasing = _fileService.hasProvider(uri) && !this._fileService.hasCapability(uri, 1024 /* FileSystemProviderCapabilities.PathCaseSensitive */);
                schemeIgnoresPathCasingCache.set(uri.scheme, ignorePathCasing);
            }
            return ignorePathCasing;
        };
        this._dispooables.add(Event.any(_fileService.onDidChangeFileSystemProviderRegistrations, _fileService.onDidChangeFileSystemProviderCapabilities)(e => {
            // remove from cache
            schemeIgnoresPathCasingCache.delete(e.scheme);
        }));
        this.extUri = new ExtUri(ignorePathCasing);
        this._canonicalUris = new SkipList((a, b) => this.extUri.compare(a, b, true), this._limit);
    }
    dispose() {
        this._dispooables.dispose();
        this._canonicalUris.clear();
    }
    asCanonicalUri(uri) {
        // (1) normalize URI
        if (this._fileService.hasProvider(uri)) {
            uri = normalizePath(uri);
        }
        // (2) find the uri in its canonical form or use this uri to define it
        const item = this._canonicalUris.get(uri);
        if (item) {
            return item.touch().uri.with({ fragment: uri.fragment });
        }
        // this uri is first and defines the canonical form
        this._canonicalUris.set(uri, new Entry(uri));
        this._checkTrim();
        return uri;
    }
    _checkTrim() {
        if (this._canonicalUris.size < this._limit) {
            return;
        }
        // get all entries, sort by time (MRU) and re-initalize
        // the uri cache and the entry clock. this is an expensive
        // operation and should happen rarely
        const entries = [...this._canonicalUris.entries()].sort((a, b) => {
            if (a[1].time < b[1].time) {
                return 1;
            }
            else if (a[1].time > b[1].time) {
                return -1;
            }
            else {
                return 0;
            }
        });
        Entry._clock = 0;
        this._canonicalUris.clear();
        const newSize = this._limit * 0.5;
        for (let i = 0; i < newSize; i++) {
            this._canonicalUris.set(entries[i][0], entries[i][1].touch());
        }
    }
};
UriIdentityService = __decorate([
    __param(0, IFileService),
    __metadata("design:paramtypes", [Object])
], UriIdentityService);
export { UriIdentityService };
registerSingleton(IUriIdentityService, UriIdentityService, 1 /* InstantiationType.Delayed */);
