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
import { Emitter, Event } from '../../../base/common/event.js';
import { MainContext } from './extHost.protocol.js';
import { Disposable } from './extHostTypes.js';
import { ExtensionIdentifier } from '../../../platform/extensions/common/extensions.js';
import { INTERNAL_AUTH_PROVIDER_PREFIX } from '../../services/authentication/common/authentication.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { IExtHostRpcService } from './extHostRpcService.js';
export const IExtHostAuthentication = createDecorator('IExtHostAuthentication');
let ExtHostAuthentication = class ExtHostAuthentication {
    constructor(extHostRpc) {
        this._authenticationProviders = new Map();
        this._onDidChangeSessions = new Emitter();
        this._getSessionTaskSingler = new TaskSingler();
        this._proxy = extHostRpc.getProxy(MainContext.MainThreadAuthentication);
    }
    /**
     * This sets up an event that will fire when the auth sessions change with a built-in filter for the extensionId
     * if a session change only affects a specific extension.
     * @param extensionId The extension that is interested in the event.
     * @returns An event with a built-in filter for the extensionId
     */
    getExtensionScopedSessionsEvent(extensionId) {
        const normalizedExtensionId = extensionId.toLowerCase();
        return Event.chain(this._onDidChangeSessions.event, ($) => $
            .filter(e => !e.extensionIdFilter || e.extensionIdFilter.includes(normalizedExtensionId))
            .map(e => ({ provider: e.provider })));
    }
    async getSession(requestingExtension, providerId, scopes, options = {}) {
        const extensionId = ExtensionIdentifier.toKey(requestingExtension.identifier);
        const sortedScopes = [...scopes].sort().join(' ');
        return await this._getSessionTaskSingler.getOrCreate(`${extensionId} ${providerId} ${sortedScopes}`, async () => {
            await this._proxy.$ensureProvider(providerId);
            const extensionName = requestingExtension.displayName || requestingExtension.name;
            return this._proxy.$getSession(providerId, scopes, extensionId, extensionName, options);
        });
    }
    async getAccounts(providerId) {
        await this._proxy.$ensureProvider(providerId);
        return await this._proxy.$getAccounts(providerId);
    }
    async removeSession(providerId, sessionId) {
        const providerData = this._authenticationProviders.get(providerId);
        if (!providerData) {
            return this._proxy.$removeSession(providerId, sessionId);
        }
        return providerData.provider.removeSession(sessionId);
    }
    registerAuthenticationProvider(id, label, provider, options) {
        if (this._authenticationProviders.get(id)) {
            throw new Error(`An authentication provider with id '${id}' is already registered.`);
        }
        this._authenticationProviders.set(id, { label, provider, options: options ?? { supportsMultipleAccounts: false } });
        const listener = provider.onDidChangeSessions(e => this._proxy.$sendDidChangeSessions(id, e));
        this._proxy.$registerAuthenticationProvider(id, label, options?.supportsMultipleAccounts ?? false);
        return new Disposable(() => {
            listener.dispose();
            this._authenticationProviders.delete(id);
            this._proxy.$unregisterAuthenticationProvider(id);
        });
    }
    async $createSession(providerId, scopes, options) {
        const providerData = this._authenticationProviders.get(providerId);
        if (providerData) {
            return await providerData.provider.createSession(scopes, options);
        }
        throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
    }
    async $removeSession(providerId, sessionId) {
        const providerData = this._authenticationProviders.get(providerId);
        if (providerData) {
            return await providerData.provider.removeSession(sessionId);
        }
        throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
    }
    async $getSessions(providerId, scopes, options) {
        const providerData = this._authenticationProviders.get(providerId);
        if (providerData) {
            return await providerData.provider.getSessions(scopes, options);
        }
        throw new Error(`Unable to find authentication provider with handle: ${providerId}`);
    }
    $onDidChangeAuthenticationSessions(id, label, extensionIdFilter) {
        // Don't fire events for the internal auth providers
        if (!id.startsWith(INTERNAL_AUTH_PROVIDER_PREFIX)) {
            this._onDidChangeSessions.fire({ provider: { id, label }, extensionIdFilter });
        }
        return Promise.resolve();
    }
};
ExtHostAuthentication = __decorate([
    __param(0, IExtHostRpcService),
    __metadata("design:paramtypes", [Object])
], ExtHostAuthentication);
export { ExtHostAuthentication };
class TaskSingler {
    constructor() {
        this._inFlightPromises = new Map();
    }
    getOrCreate(key, promiseFactory) {
        const inFlight = this._inFlightPromises.get(key);
        if (inFlight) {
            return inFlight;
        }
        const promise = promiseFactory().finally(() => this._inFlightPromises.delete(key));
        this._inFlightPromises.set(key, promise);
        return promise;
    }
}
