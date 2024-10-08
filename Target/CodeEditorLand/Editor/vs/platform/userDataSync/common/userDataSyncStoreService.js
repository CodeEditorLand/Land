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
import { createCancelablePromise, timeout } from '../../../base/common/async.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { getErrorMessage, isCancellationError } from '../../../base/common/errors.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { Disposable, DisposableStore, toDisposable } from '../../../base/common/lifecycle.js';
import { Mimes } from '../../../base/common/mime.js';
import { isWeb } from '../../../base/common/platform.js';
import { joinPath, relativePath } from '../../../base/common/resources.js';
import { isObject, isString } from '../../../base/common/types.js';
import { URI } from '../../../base/common/uri.js';
import { generateUuid } from '../../../base/common/uuid.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { IProductService } from '../../product/common/productService.js';
import { asJson, asText, asTextOrError, hasNoContent, IRequestService, isSuccess, isSuccess as isSuccessContext } from '../../request/common/request.js';
import { getServiceMachineId } from '../../externalServices/common/serviceMachineId.js';
import { IStorageService } from '../../storage/common/storage.js';
import { HEADER_EXECUTION_ID, HEADER_OPERATION_ID, IUserDataSyncLogService, IUserDataSyncStoreManagementService, SYNC_SERVICE_URL_TYPE, UserDataSyncStoreError } from './userDataSync.js';
const CONFIGURATION_SYNC_STORE_KEY = 'configurationSync.store';
const SYNC_PREVIOUS_STORE = 'sync.previous.store';
const DONOT_MAKE_REQUESTS_UNTIL_KEY = 'sync.donot-make-requests-until';
const USER_SESSION_ID_KEY = 'sync.user-session-id';
const MACHINE_SESSION_ID_KEY = 'sync.machine-session-id';
const REQUEST_SESSION_LIMIT = 100;
const REQUEST_SESSION_INTERVAL = 1000 * 60 * 5; /* 5 minutes */
let AbstractUserDataSyncStoreManagementService = class AbstractUserDataSyncStoreManagementService extends Disposable {
    get userDataSyncStore() { return this._userDataSyncStore; }
    get userDataSyncStoreType() {
        return this.storageService.get(SYNC_SERVICE_URL_TYPE, -1 /* StorageScope.APPLICATION */);
    }
    set userDataSyncStoreType(type) {
        this.storageService.store(SYNC_SERVICE_URL_TYPE, type, -1 /* StorageScope.APPLICATION */, isWeb ? 0 /* StorageTarget.USER */ : 1 /* StorageTarget.MACHINE */);
    }
    constructor(productService, configurationService, storageService) {
        super();
        this.productService = productService;
        this.configurationService = configurationService;
        this.storageService = storageService;
        this._onDidChangeUserDataSyncStore = this._register(new Emitter());
        this.onDidChangeUserDataSyncStore = this._onDidChangeUserDataSyncStore.event;
        this.updateUserDataSyncStore();
        const disposable = this._register(new DisposableStore());
        this._register(Event.filter(storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, SYNC_SERVICE_URL_TYPE, disposable), () => this.userDataSyncStoreType !== this.userDataSyncStore?.type, disposable)(() => this.updateUserDataSyncStore()));
    }
    updateUserDataSyncStore() {
        this._userDataSyncStore = this.toUserDataSyncStore(this.productService[CONFIGURATION_SYNC_STORE_KEY]);
        this._onDidChangeUserDataSyncStore.fire();
    }
    toUserDataSyncStore(configurationSyncStore) {
        if (!configurationSyncStore) {
            return undefined;
        }
        // Check for web overrides for backward compatibility while reading previous store
        configurationSyncStore = isWeb && configurationSyncStore.web ? { ...configurationSyncStore, ...configurationSyncStore.web } : configurationSyncStore;
        if (isString(configurationSyncStore.url)
            && isObject(configurationSyncStore.authenticationProviders)
            && Object.keys(configurationSyncStore.authenticationProviders).every(authenticationProviderId => Array.isArray(configurationSyncStore.authenticationProviders[authenticationProviderId].scopes))) {
            const syncStore = configurationSyncStore;
            const canSwitch = !!syncStore.canSwitch;
            const defaultType = syncStore.url === syncStore.insidersUrl ? 'insiders' : 'stable';
            const type = (canSwitch ? this.userDataSyncStoreType : undefined) || defaultType;
            const url = type === 'insiders' ? syncStore.insidersUrl
                : type === 'stable' ? syncStore.stableUrl
                    : syncStore.url;
            return {
                url: URI.parse(url),
                type,
                defaultType,
                defaultUrl: URI.parse(syncStore.url),
                stableUrl: URI.parse(syncStore.stableUrl),
                insidersUrl: URI.parse(syncStore.insidersUrl),
                canSwitch,
                authenticationProviders: Object.keys(syncStore.authenticationProviders).reduce((result, id) => {
                    result.push({ id, scopes: syncStore.authenticationProviders[id].scopes });
                    return result;
                }, [])
            };
        }
        return undefined;
    }
};
AbstractUserDataSyncStoreManagementService = __decorate([
    __param(0, IProductService),
    __param(1, IConfigurationService),
    __param(2, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object])
], AbstractUserDataSyncStoreManagementService);
export { AbstractUserDataSyncStoreManagementService };
let UserDataSyncStoreManagementService = class UserDataSyncStoreManagementService extends AbstractUserDataSyncStoreManagementService {
    constructor(productService, configurationService, storageService) {
        super(productService, configurationService, storageService);
        const previousConfigurationSyncStore = this.storageService.get(SYNC_PREVIOUS_STORE, -1 /* StorageScope.APPLICATION */);
        if (previousConfigurationSyncStore) {
            this.previousConfigurationSyncStore = JSON.parse(previousConfigurationSyncStore);
        }
        const syncStore = this.productService[CONFIGURATION_SYNC_STORE_KEY];
        if (syncStore) {
            this.storageService.store(SYNC_PREVIOUS_STORE, JSON.stringify(syncStore), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        else {
            this.storageService.remove(SYNC_PREVIOUS_STORE, -1 /* StorageScope.APPLICATION */);
        }
    }
    async switch(type) {
        if (type !== this.userDataSyncStoreType) {
            this.userDataSyncStoreType = type;
            this.updateUserDataSyncStore();
        }
    }
    async getPreviousUserDataSyncStore() {
        return this.toUserDataSyncStore(this.previousConfigurationSyncStore);
    }
};
UserDataSyncStoreManagementService = __decorate([
    __param(0, IProductService),
    __param(1, IConfigurationService),
    __param(2, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object])
], UserDataSyncStoreManagementService);
export { UserDataSyncStoreManagementService };
let UserDataSyncStoreClient = class UserDataSyncStoreClient extends Disposable {
    get donotMakeRequestsUntil() { return this._donotMakeRequestsUntil; }
    constructor(userDataSyncStoreUrl, productService, requestService, logService, environmentService, fileService, storageService) {
        super();
        this.requestService = requestService;
        this.logService = logService;
        this.storageService = storageService;
        this._onTokenFailed = this._register(new Emitter());
        this.onTokenFailed = this._onTokenFailed.event;
        this._onTokenSucceed = this._register(new Emitter());
        this.onTokenSucceed = this._onTokenSucceed.event;
        this._donotMakeRequestsUntil = undefined;
        this._onDidChangeDonotMakeRequestsUntil = this._register(new Emitter());
        this.onDidChangeDonotMakeRequestsUntil = this._onDidChangeDonotMakeRequestsUntil.event;
        this.resetDonotMakeRequestsUntilPromise = undefined;
        this.updateUserDataSyncStoreUrl(userDataSyncStoreUrl);
        this.commonHeadersPromise = getServiceMachineId(environmentService, fileService, storageService)
            .then(uuid => {
            const headers = {
                'X-Client-Name': `${productService.applicationName}${isWeb ? '-web' : ''}`,
                'X-Client-Version': productService.version,
            };
            if (productService.commit) {
                headers['X-Client-Commit'] = productService.commit;
            }
            return headers;
        });
        /* A requests session that limits requests per sessions */
        this.session = new RequestsSession(REQUEST_SESSION_LIMIT, REQUEST_SESSION_INTERVAL, this.requestService, this.logService);
        this.initDonotMakeRequestsUntil();
        this._register(toDisposable(() => {
            if (this.resetDonotMakeRequestsUntilPromise) {
                this.resetDonotMakeRequestsUntilPromise.cancel();
                this.resetDonotMakeRequestsUntilPromise = undefined;
            }
        }));
    }
    setAuthToken(token, type) {
        this.authToken = { token, type };
    }
    updateUserDataSyncStoreUrl(userDataSyncStoreUrl) {
        this.userDataSyncStoreUrl = userDataSyncStoreUrl ? joinPath(userDataSyncStoreUrl, 'v1') : undefined;
    }
    initDonotMakeRequestsUntil() {
        const donotMakeRequestsUntil = this.storageService.getNumber(DONOT_MAKE_REQUESTS_UNTIL_KEY, -1 /* StorageScope.APPLICATION */);
        if (donotMakeRequestsUntil && Date.now() < donotMakeRequestsUntil) {
            this.setDonotMakeRequestsUntil(new Date(donotMakeRequestsUntil));
        }
    }
    setDonotMakeRequestsUntil(donotMakeRequestsUntil) {
        if (this._donotMakeRequestsUntil?.getTime() !== donotMakeRequestsUntil?.getTime()) {
            this._donotMakeRequestsUntil = donotMakeRequestsUntil;
            if (this.resetDonotMakeRequestsUntilPromise) {
                this.resetDonotMakeRequestsUntilPromise.cancel();
                this.resetDonotMakeRequestsUntilPromise = undefined;
            }
            if (this._donotMakeRequestsUntil) {
                this.storageService.store(DONOT_MAKE_REQUESTS_UNTIL_KEY, this._donotMakeRequestsUntil.getTime(), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
                this.resetDonotMakeRequestsUntilPromise = createCancelablePromise(token => timeout(this._donotMakeRequestsUntil.getTime() - Date.now(), token).then(() => this.setDonotMakeRequestsUntil(undefined)));
                this.resetDonotMakeRequestsUntilPromise.then(null, e => null /* ignore error */);
            }
            else {
                this.storageService.remove(DONOT_MAKE_REQUESTS_UNTIL_KEY, -1 /* StorageScope.APPLICATION */);
            }
            this._onDidChangeDonotMakeRequestsUntil.fire();
        }
    }
    // #region Collection
    async getAllCollections(headers = {}) {
        if (!this.userDataSyncStoreUrl) {
            throw new Error('No settings sync store url configured.');
        }
        const url = joinPath(this.userDataSyncStoreUrl, 'collection').toString();
        headers = { ...headers };
        headers['Content-Type'] = 'application/json';
        const context = await this.request(url, { type: 'GET', headers }, [], CancellationToken.None);
        return (await asJson(context))?.map(({ id }) => id) || [];
    }
    async createCollection(headers = {}) {
        if (!this.userDataSyncStoreUrl) {
            throw new Error('No settings sync store url configured.');
        }
        const url = joinPath(this.userDataSyncStoreUrl, 'collection').toString();
        headers = { ...headers };
        headers['Content-Type'] = Mimes.text;
        const context = await this.request(url, { type: 'POST', headers }, [], CancellationToken.None);
        const collectionId = await asTextOrError(context);
        if (!collectionId) {
            throw new UserDataSyncStoreError('Server did not return the collection id', url, "NoCollection" /* UserDataSyncErrorCode.NoCollection */, context.res.statusCode, context.res.headers[HEADER_OPERATION_ID]);
        }
        return collectionId;
    }
    async deleteCollection(collection, headers = {}) {
        if (!this.userDataSyncStoreUrl) {
            throw new Error('No settings sync store url configured.');
        }
        const url = collection ? joinPath(this.userDataSyncStoreUrl, 'collection', collection).toString() : joinPath(this.userDataSyncStoreUrl, 'collection').toString();
        headers = { ...headers };
        await this.request(url, { type: 'DELETE', headers }, [], CancellationToken.None);
    }
    // #endregion
    // #region Resource
    async getAllResourceRefs(resource, collection) {
        if (!this.userDataSyncStoreUrl) {
            throw new Error('No settings sync store url configured.');
        }
        const uri = this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource);
        const headers = {};
        const context = await this.request(uri.toString(), { type: 'GET', headers }, [], CancellationToken.None);
        const result = await asJson(context) || [];
        return result.map(({ url, created }) => ({ ref: relativePath(uri, uri.with({ path: url })), created: created * 1000 /* Server returns in seconds */ }));
    }
    async resolveResourceContent(resource, ref, collection, headers = {}) {
        if (!this.userDataSyncStoreUrl) {
            throw new Error('No settings sync store url configured.');
        }
        const url = joinPath(this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource), ref).toString();
        headers = { ...headers };
        headers['Cache-Control'] = 'no-cache';
        const context = await this.request(url, { type: 'GET', headers }, [], CancellationToken.None);
        const content = await asTextOrError(context);
        return content;
    }
    async deleteResource(resource, ref, collection) {
        if (!this.userDataSyncStoreUrl) {
            throw new Error('No settings sync store url configured.');
        }
        const url = ref !== null ? joinPath(this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource), ref).toString() : this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource).toString();
        const headers = {};
        await this.request(url, { type: 'DELETE', headers }, [], CancellationToken.None);
    }
    async deleteResources() {
        if (!this.userDataSyncStoreUrl) {
            throw new Error('No settings sync store url configured.');
        }
        const url = joinPath(this.userDataSyncStoreUrl, 'resource').toString();
        const headers = { 'Content-Type': Mimes.text };
        await this.request(url, { type: 'DELETE', headers }, [], CancellationToken.None);
    }
    async readResource(resource, oldValue, collection, headers = {}) {
        if (!this.userDataSyncStoreUrl) {
            throw new Error('No settings sync store url configured.');
        }
        const url = joinPath(this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource), 'latest').toString();
        headers = { ...headers };
        // Disable caching as they are cached by synchronisers
        headers['Cache-Control'] = 'no-cache';
        if (oldValue) {
            headers['If-None-Match'] = oldValue.ref;
        }
        const context = await this.request(url, { type: 'GET', headers }, [304], CancellationToken.None);
        let userData = null;
        if (context.res.statusCode === 304) {
            userData = oldValue;
        }
        if (userData === null) {
            const ref = context.res.headers['etag'];
            if (!ref) {
                throw new UserDataSyncStoreError('Server did not return the ref', url, "NoRef" /* UserDataSyncErrorCode.NoRef */, context.res.statusCode, context.res.headers[HEADER_OPERATION_ID]);
            }
            const content = await asTextOrError(context);
            if (!content && context.res.statusCode === 304) {
                throw new UserDataSyncStoreError('Empty response', url, "EmptyResponse" /* UserDataSyncErrorCode.EmptyResponse */, context.res.statusCode, context.res.headers[HEADER_OPERATION_ID]);
            }
            userData = { ref, content };
        }
        return userData;
    }
    async writeResource(resource, data, ref, collection, headers = {}) {
        if (!this.userDataSyncStoreUrl) {
            throw new Error('No settings sync store url configured.');
        }
        const url = this.getResourceUrl(this.userDataSyncStoreUrl, collection, resource).toString();
        headers = { ...headers };
        headers['Content-Type'] = Mimes.text;
        if (ref) {
            headers['If-Match'] = ref;
        }
        const context = await this.request(url, { type: 'POST', data, headers }, [], CancellationToken.None);
        const newRef = context.res.headers['etag'];
        if (!newRef) {
            throw new UserDataSyncStoreError('Server did not return the ref', url, "NoRef" /* UserDataSyncErrorCode.NoRef */, context.res.statusCode, context.res.headers[HEADER_OPERATION_ID]);
        }
        return newRef;
    }
    // #endregion
    async manifest(oldValue, headers = {}) {
        if (!this.userDataSyncStoreUrl) {
            throw new Error('No settings sync store url configured.');
        }
        const url = joinPath(this.userDataSyncStoreUrl, 'manifest').toString();
        headers = { ...headers };
        headers['Content-Type'] = 'application/json';
        if (oldValue) {
            headers['If-None-Match'] = oldValue.ref;
        }
        const context = await this.request(url, { type: 'GET', headers }, [304], CancellationToken.None);
        let manifest = null;
        if (context.res.statusCode === 304) {
            manifest = oldValue;
        }
        if (!manifest) {
            const ref = context.res.headers['etag'];
            if (!ref) {
                throw new UserDataSyncStoreError('Server did not return the ref', url, "NoRef" /* UserDataSyncErrorCode.NoRef */, context.res.statusCode, context.res.headers[HEADER_OPERATION_ID]);
            }
            const content = await asTextOrError(context);
            if (!content && context.res.statusCode === 304) {
                throw new UserDataSyncStoreError('Empty response', url, "EmptyResponse" /* UserDataSyncErrorCode.EmptyResponse */, context.res.statusCode, context.res.headers[HEADER_OPERATION_ID]);
            }
            if (content) {
                manifest = { ...JSON.parse(content), ref };
            }
        }
        const currentSessionId = this.storageService.get(USER_SESSION_ID_KEY, -1 /* StorageScope.APPLICATION */);
        if (currentSessionId && manifest && currentSessionId !== manifest.session) {
            // Server session is different from client session so clear cached session.
            this.clearSession();
        }
        if (manifest === null && currentSessionId) {
            // server session is cleared so clear cached session.
            this.clearSession();
        }
        if (manifest) {
            // update session
            this.storageService.store(USER_SESSION_ID_KEY, manifest.session, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        return manifest;
    }
    async clear() {
        if (!this.userDataSyncStoreUrl) {
            throw new Error('No settings sync store url configured.');
        }
        await this.deleteCollection();
        await this.deleteResources();
        // clear cached session.
        this.clearSession();
    }
    async getActivityData() {
        if (!this.userDataSyncStoreUrl) {
            throw new Error('No settings sync store url configured.');
        }
        const url = joinPath(this.userDataSyncStoreUrl, 'download').toString();
        const headers = {};
        const context = await this.request(url, { type: 'GET', headers }, [], CancellationToken.None);
        if (!isSuccess(context)) {
            throw new UserDataSyncStoreError('Server returned ' + context.res.statusCode, url, "EmptyResponse" /* UserDataSyncErrorCode.EmptyResponse */, context.res.statusCode, context.res.headers[HEADER_OPERATION_ID]);
        }
        if (hasNoContent(context)) {
            throw new UserDataSyncStoreError('Empty response', url, "EmptyResponse" /* UserDataSyncErrorCode.EmptyResponse */, context.res.statusCode, context.res.headers[HEADER_OPERATION_ID]);
        }
        return context.stream;
    }
    getResourceUrl(userDataSyncStoreUrl, collection, resource) {
        return collection ? joinPath(userDataSyncStoreUrl, 'collection', collection, 'resource', resource) : joinPath(userDataSyncStoreUrl, 'resource', resource);
    }
    clearSession() {
        this.storageService.remove(USER_SESSION_ID_KEY, -1 /* StorageScope.APPLICATION */);
        this.storageService.remove(MACHINE_SESSION_ID_KEY, -1 /* StorageScope.APPLICATION */);
    }
    async request(url, options, successCodes, token) {
        if (!this.authToken) {
            throw new UserDataSyncStoreError('No Auth Token Available', url, "Unauthorized" /* UserDataSyncErrorCode.Unauthorized */, undefined, undefined);
        }
        if (this._donotMakeRequestsUntil && Date.now() < this._donotMakeRequestsUntil.getTime()) {
            throw new UserDataSyncStoreError(`${options.type} request '${url}' failed because of too many requests (429).`, url, "TooManyRequestsAndRetryAfter" /* UserDataSyncErrorCode.TooManyRequestsAndRetryAfter */, undefined, undefined);
        }
        this.setDonotMakeRequestsUntil(undefined);
        const commonHeaders = await this.commonHeadersPromise;
        options.headers = {
            ...(options.headers || {}),
            ...commonHeaders,
            'X-Account-Type': this.authToken.type,
            'authorization': `Bearer ${this.authToken.token}`,
        };
        // Add session headers
        this.addSessionHeaders(options.headers);
        this.logService.trace('Sending request to server', { url, type: options.type, headers: { ...options.headers, ...{ authorization: undefined } } });
        let context;
        try {
            context = await this.session.request(url, options, token);
        }
        catch (e) {
            if (!(e instanceof UserDataSyncStoreError)) {
                let code = "RequestFailed" /* UserDataSyncErrorCode.RequestFailed */;
                const errorMessage = getErrorMessage(e).toLowerCase();
                // Request timed out
                if (errorMessage.includes('xhr timeout')) {
                    code = "RequestTimeout" /* UserDataSyncErrorCode.RequestTimeout */;
                }
                // Request protocol not supported
                else if (errorMessage.includes('protocol') && errorMessage.includes('not supported')) {
                    code = "RequestProtocolNotSupported" /* UserDataSyncErrorCode.RequestProtocolNotSupported */;
                }
                // Request path not escaped
                else if (errorMessage.includes('request path contains unescaped characters')) {
                    code = "RequestPathNotEscaped" /* UserDataSyncErrorCode.RequestPathNotEscaped */;
                }
                // Request header not an object
                else if (errorMessage.includes('headers must be an object')) {
                    code = "RequestHeadersNotObject" /* UserDataSyncErrorCode.RequestHeadersNotObject */;
                }
                // Request canceled
                else if (isCancellationError(e)) {
                    code = "RequestCanceled" /* UserDataSyncErrorCode.RequestCanceled */;
                }
                e = new UserDataSyncStoreError(`Connection refused for the request '${url}'.`, url, code, undefined, undefined);
            }
            this.logService.info('Request failed', url);
            throw e;
        }
        const operationId = context.res.headers[HEADER_OPERATION_ID];
        const requestInfo = { url, status: context.res.statusCode, 'execution-id': options.headers[HEADER_EXECUTION_ID], 'operation-id': operationId };
        const isSuccess = isSuccessContext(context) || (context.res.statusCode && successCodes.includes(context.res.statusCode));
        let failureMessage = '';
        if (isSuccess) {
            this.logService.trace('Request succeeded', requestInfo);
        }
        else {
            failureMessage = await asText(context) || '';
            this.logService.info('Request failed', requestInfo, failureMessage);
        }
        if (context.res.statusCode === 401 || context.res.statusCode === 403) {
            this.authToken = undefined;
            if (context.res.statusCode === 401) {
                this._onTokenFailed.fire("Unauthorized" /* UserDataSyncErrorCode.Unauthorized */);
                throw new UserDataSyncStoreError(`${options.type} request '${url}' failed because of Unauthorized (401).`, url, "Unauthorized" /* UserDataSyncErrorCode.Unauthorized */, context.res.statusCode, operationId);
            }
            if (context.res.statusCode === 403) {
                this._onTokenFailed.fire("Forbidden" /* UserDataSyncErrorCode.Forbidden */);
                throw new UserDataSyncStoreError(`${options.type} request '${url}' failed because the access is forbidden (403).`, url, "Forbidden" /* UserDataSyncErrorCode.Forbidden */, context.res.statusCode, operationId);
            }
        }
        this._onTokenSucceed.fire();
        if (context.res.statusCode === 404) {
            throw new UserDataSyncStoreError(`${options.type} request '${url}' failed because the requested resource is not found (404).`, url, "NotFound" /* UserDataSyncErrorCode.NotFound */, context.res.statusCode, operationId);
        }
        if (context.res.statusCode === 405) {
            throw new UserDataSyncStoreError(`${options.type} request '${url}' failed because the requested endpoint is not found (405). ${failureMessage}`, url, "MethodNotFound" /* UserDataSyncErrorCode.MethodNotFound */, context.res.statusCode, operationId);
        }
        if (context.res.statusCode === 409) {
            throw new UserDataSyncStoreError(`${options.type} request '${url}' failed because of Conflict (409). There is new data for this resource. Make the request again with latest data.`, url, "Conflict" /* UserDataSyncErrorCode.Conflict */, context.res.statusCode, operationId);
        }
        if (context.res.statusCode === 410) {
            throw new UserDataSyncStoreError(`${options.type} request '${url}' failed because the requested resource is not longer available (410).`, url, "Gone" /* UserDataSyncErrorCode.Gone */, context.res.statusCode, operationId);
        }
        if (context.res.statusCode === 412) {
            throw new UserDataSyncStoreError(`${options.type} request '${url}' failed because of Precondition Failed (412). There is new data for this resource. Make the request again with latest data.`, url, "PreconditionFailed" /* UserDataSyncErrorCode.PreconditionFailed */, context.res.statusCode, operationId);
        }
        if (context.res.statusCode === 413) {
            throw new UserDataSyncStoreError(`${options.type} request '${url}' failed because of too large payload (413).`, url, "TooLarge" /* UserDataSyncErrorCode.TooLarge */, context.res.statusCode, operationId);
        }
        if (context.res.statusCode === 426) {
            throw new UserDataSyncStoreError(`${options.type} request '${url}' failed with status Upgrade Required (426). Please upgrade the client and try again.`, url, "UpgradeRequired" /* UserDataSyncErrorCode.UpgradeRequired */, context.res.statusCode, operationId);
        }
        if (context.res.statusCode === 429) {
            const retryAfter = context.res.headers['retry-after'];
            if (retryAfter) {
                this.setDonotMakeRequestsUntil(new Date(Date.now() + (parseInt(retryAfter) * 1000)));
                throw new UserDataSyncStoreError(`${options.type} request '${url}' failed because of too many requests (429).`, url, "TooManyRequestsAndRetryAfter" /* UserDataSyncErrorCode.TooManyRequestsAndRetryAfter */, context.res.statusCode, operationId);
            }
            else {
                throw new UserDataSyncStoreError(`${options.type} request '${url}' failed because of too many requests (429).`, url, "RemoteTooManyRequests" /* UserDataSyncErrorCode.TooManyRequests */, context.res.statusCode, operationId);
            }
        }
        if (!isSuccess) {
            throw new UserDataSyncStoreError('Server returned ' + context.res.statusCode, url, "Unknown" /* UserDataSyncErrorCode.Unknown */, context.res.statusCode, operationId);
        }
        return context;
    }
    addSessionHeaders(headers) {
        let machineSessionId = this.storageService.get(MACHINE_SESSION_ID_KEY, -1 /* StorageScope.APPLICATION */);
        if (machineSessionId === undefined) {
            machineSessionId = generateUuid();
            this.storageService.store(MACHINE_SESSION_ID_KEY, machineSessionId, -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        }
        headers['X-Machine-Session-Id'] = machineSessionId;
        const userSessionId = this.storageService.get(USER_SESSION_ID_KEY, -1 /* StorageScope.APPLICATION */);
        if (userSessionId !== undefined) {
            headers['X-User-Session-Id'] = userSessionId;
        }
    }
};
UserDataSyncStoreClient = __decorate([
    __param(1, IProductService),
    __param(2, IRequestService),
    __param(3, IUserDataSyncLogService),
    __param(4, IEnvironmentService),
    __param(5, IFileService),
    __param(6, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], UserDataSyncStoreClient);
export { UserDataSyncStoreClient };
let UserDataSyncStoreService = class UserDataSyncStoreService extends UserDataSyncStoreClient {
    constructor(userDataSyncStoreManagementService, productService, requestService, logService, environmentService, fileService, storageService) {
        super(userDataSyncStoreManagementService.userDataSyncStore?.url, productService, requestService, logService, environmentService, fileService, storageService);
        this._register(userDataSyncStoreManagementService.onDidChangeUserDataSyncStore(() => this.updateUserDataSyncStoreUrl(userDataSyncStoreManagementService.userDataSyncStore?.url)));
    }
};
UserDataSyncStoreService = __decorate([
    __param(0, IUserDataSyncStoreManagementService),
    __param(1, IProductService),
    __param(2, IRequestService),
    __param(3, IUserDataSyncLogService),
    __param(4, IEnvironmentService),
    __param(5, IFileService),
    __param(6, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], UserDataSyncStoreService);
export { UserDataSyncStoreService };
export class RequestsSession {
    constructor(limit, interval, /* in ms */ requestService, logService) {
        this.limit = limit;
        this.interval = interval;
        this.requestService = requestService;
        this.logService = logService;
        this.requests = [];
        this.startTime = undefined;
    }
    request(url, options, token) {
        if (this.isExpired()) {
            this.reset();
        }
        options.url = url;
        if (this.requests.length >= this.limit) {
            this.logService.info('Too many requests', ...this.requests);
            throw new UserDataSyncStoreError(`Too many requests. Only ${this.limit} requests allowed in ${this.interval / (1000 * 60)} minutes.`, url, "LocalTooManyRequests" /* UserDataSyncErrorCode.LocalTooManyRequests */, undefined, undefined);
        }
        this.startTime = this.startTime || new Date();
        this.requests.push(url);
        return this.requestService.request(options, token);
    }
    isExpired() {
        return this.startTime !== undefined && new Date().getTime() - this.startTime.getTime() > this.interval;
    }
    reset() {
        this.requests = [];
        this.startTime = undefined;
    }
}
