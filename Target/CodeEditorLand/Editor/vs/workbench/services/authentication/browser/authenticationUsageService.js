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
import { Queue } from '../../../../base/common/async.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IAuthenticationService } from '../common/authentication.js';
export const IAuthenticationUsageService = createDecorator('IAuthenticationUsageService');
let AuthenticationUsageService = class AuthenticationUsageService extends Disposable {
    constructor(_storageService, _authenticationService, _logService, productService) {
        super();
        this._storageService = _storageService;
        this._authenticationService = _authenticationService;
        this._logService = _logService;
        this._queue = new Queue();
        this._extensionsUsingAuth = new Set();
        // If an extension is listed in `trustedExtensionAuthAccess` we should consider it as using auth
        const trustedExtensionAuthAccess = productService.trustedExtensionAuthAccess;
        if (Array.isArray(trustedExtensionAuthAccess)) {
            for (const extensionId of trustedExtensionAuthAccess) {
                this._extensionsUsingAuth.add(extensionId);
            }
        }
        else if (trustedExtensionAuthAccess) {
            for (const extensions of Object.values(trustedExtensionAuthAccess)) {
                for (const extensionId of extensions) {
                    this._extensionsUsingAuth.add(extensionId);
                }
            }
        }
        this._authenticationService.onDidRegisterAuthenticationProvider(provider => this._queue.queue(() => this._addExtensionsToCache(provider.id)));
    }
    async initializeExtensionUsageCache() {
        await this._queue.queue(() => Promise.all(this._authenticationService.getProviderIds().map(providerId => this._addExtensionsToCache(providerId))));
    }
    async extensionUsesAuth(extensionId) {
        await this._queue.whenIdle();
        return this._extensionsUsingAuth.has(extensionId);
    }
    readAccountUsages(providerId, accountName) {
        const accountKey = `${providerId}-${accountName}-usages`;
        const storedUsages = this._storageService.get(accountKey, -1 /* StorageScope.APPLICATION */);
        let usages = [];
        if (storedUsages) {
            try {
                usages = JSON.parse(storedUsages);
            }
            catch (e) {
                // ignore
            }
        }
        return usages;
    }
    removeAccountUsage(providerId, accountName) {
        const accountKey = `${providerId}-${accountName}-usages`;
        this._storageService.remove(accountKey, -1 /* StorageScope.APPLICATION */);
    }
    addAccountUsage(providerId, accountName, scopes, extensionId, extensionName) {
        const accountKey = `${providerId}-${accountName}-usages`;
        const usages = this.readAccountUsages(providerId, accountName);
        const existingUsageIndex = usages.findIndex(usage => usage.extensionId === extensionId);
        if (existingUsageIndex > -1) {
            usages.splice(existingUsageIndex, 1, {
                extensionId,
                extensionName,
                scopes,
                lastUsed: Date.now()
            });
        }
        else {
            usages.push({
                extensionId,
                extensionName,
                scopes,
                lastUsed: Date.now()
            });
        }
        this._storageService.store(accountKey, JSON.stringify(usages), -1 /* StorageScope.APPLICATION */, 1 /* StorageTarget.MACHINE */);
        this._extensionsUsingAuth.add(extensionId);
    }
    async _addExtensionsToCache(providerId) {
        try {
            const accounts = await this._authenticationService.getAccounts(providerId);
            for (const account of accounts) {
                const usage = this.readAccountUsages(providerId, account.label);
                for (const u of usage) {
                    this._extensionsUsingAuth.add(u.extensionId);
                }
            }
        }
        catch (e) {
            this._logService.error(e);
        }
    }
};
AuthenticationUsageService = __decorate([
    __param(0, IStorageService),
    __param(1, IAuthenticationService),
    __param(2, ILogService),
    __param(3, IProductService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], AuthenticationUsageService);
export { AuthenticationUsageService };
registerSingleton(IAuthenticationUsageService, AuthenticationUsageService, 1 /* InstantiationType.Delayed */);
