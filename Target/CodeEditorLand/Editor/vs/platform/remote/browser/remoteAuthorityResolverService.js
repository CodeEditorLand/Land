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
import { mainWindow } from '../../../base/browser/window.js';
import { DeferredPromise } from '../../../base/common/async.js';
import * as errors from '../../../base/common/errors.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { RemoteAuthorities } from '../../../base/common/network.js';
import * as performance from '../../../base/common/performance.js';
import { StopWatch } from '../../../base/common/stopwatch.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { WebSocketRemoteConnection, getRemoteAuthorityPrefix } from '../common/remoteAuthorityResolver.js';
import { parseAuthorityWithOptionalPort } from '../common/remoteHosts.js';
let RemoteAuthorityResolverService = class RemoteAuthorityResolverService extends Disposable {
    constructor(isWorkbenchOptionsBasedResolution, connectionToken, resourceUriProvider, serverBasePath, productService, _logService) {
        super();
        this._logService = _logService;
        this._onDidChangeConnectionData = this._register(new Emitter());
        this.onDidChangeConnectionData = this._onDidChangeConnectionData.event;
        this._resolveAuthorityRequests = new Map();
        this._cache = new Map();
        this._connectionToken = connectionToken;
        this._connectionTokens = new Map();
        this._isWorkbenchOptionsBasedResolution = isWorkbenchOptionsBasedResolution;
        if (resourceUriProvider) {
            RemoteAuthorities.setDelegate(resourceUriProvider);
        }
        RemoteAuthorities.setServerRootPath(productService, serverBasePath);
    }
    async resolveAuthority(authority) {
        let result = this._resolveAuthorityRequests.get(authority);
        if (!result) {
            result = new DeferredPromise();
            this._resolveAuthorityRequests.set(authority, result);
            if (this._isWorkbenchOptionsBasedResolution) {
                this._doResolveAuthority(authority).then(v => result.complete(v), (err) => result.error(err));
            }
        }
        return result.p;
    }
    async getCanonicalURI(uri) {
        // todo@connor4312 make this work for web
        return uri;
    }
    getConnectionData(authority) {
        if (!this._cache.has(authority)) {
            return null;
        }
        const resolverResult = this._cache.get(authority);
        const connectionToken = this._connectionTokens.get(authority) || resolverResult.authority.connectionToken;
        return {
            connectTo: resolverResult.authority.connectTo,
            connectionToken: connectionToken
        };
    }
    async _doResolveAuthority(authority) {
        const authorityPrefix = getRemoteAuthorityPrefix(authority);
        const sw = StopWatch.create(false);
        this._logService.info(`Resolving connection token (${authorityPrefix})...`);
        performance.mark(`code/willResolveConnectionToken/${authorityPrefix}`);
        const connectionToken = await Promise.resolve(this._connectionTokens.get(authority) || this._connectionToken);
        performance.mark(`code/didResolveConnectionToken/${authorityPrefix}`);
        this._logService.info(`Resolved connection token (${authorityPrefix}) after ${sw.elapsed()} ms`);
        const defaultPort = (/^https:/.test(mainWindow.location.href) ? 443 : 80);
        const { host, port } = parseAuthorityWithOptionalPort(authority, defaultPort);
        const result = { authority: { authority, connectTo: new WebSocketRemoteConnection(host, port), connectionToken } };
        RemoteAuthorities.set(authority, host, port);
        this._cache.set(authority, result);
        this._onDidChangeConnectionData.fire();
        return result;
    }
    _clearResolvedAuthority(authority) {
        if (this._resolveAuthorityRequests.has(authority)) {
            this._resolveAuthorityRequests.get(authority).cancel();
            this._resolveAuthorityRequests.delete(authority);
        }
    }
    _setResolvedAuthority(resolvedAuthority, options) {
        if (this._resolveAuthorityRequests.has(resolvedAuthority.authority)) {
            const request = this._resolveAuthorityRequests.get(resolvedAuthority.authority);
            // For non-websocket types, it's expected the embedder passes a `remoteResourceProvider`
            // which is wrapped to a `IResourceUriProvider` and is not handled here.
            if (resolvedAuthority.connectTo.type === 0 /* RemoteConnectionType.WebSocket */) {
                RemoteAuthorities.set(resolvedAuthority.authority, resolvedAuthority.connectTo.host, resolvedAuthority.connectTo.port);
            }
            if (resolvedAuthority.connectionToken) {
                RemoteAuthorities.setConnectionToken(resolvedAuthority.authority, resolvedAuthority.connectionToken);
            }
            request.complete({ authority: resolvedAuthority, options });
            this._onDidChangeConnectionData.fire();
        }
    }
    _setResolvedAuthorityError(authority, err) {
        if (this._resolveAuthorityRequests.has(authority)) {
            const request = this._resolveAuthorityRequests.get(authority);
            // Avoid that this error makes it to telemetry
            request.error(errors.ErrorNoTelemetry.fromError(err));
        }
    }
    _setAuthorityConnectionToken(authority, connectionToken) {
        this._connectionTokens.set(authority, connectionToken);
        RemoteAuthorities.setConnectionToken(authority, connectionToken);
        this._onDidChangeConnectionData.fire();
    }
    _setCanonicalURIProvider(provider) {
    }
};
RemoteAuthorityResolverService = __decorate([
    __param(4, IProductService),
    __param(5, ILogService),
    __metadata("design:paramtypes", [Boolean, Object, Object, Object, Object, Object])
], RemoteAuthorityResolverService);
export { RemoteAuthorityResolverService };
