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
import { CancellationToken } from '../../../base/common/cancellation.js';
import { dispose } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
import { IShareService } from '../../contrib/share/common/share.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
let MainThreadShare = class MainThreadShare {
    constructor(extHostContext, shareService) {
        this.shareService = shareService;
        this.providers = new Map();
        this.providerDisposables = new Map();
        this.proxy = extHostContext.getProxy(ExtHostContext.ExtHostShare);
    }
    $registerShareProvider(handle, selector, id, label, priority) {
        const provider = {
            id,
            label,
            selector,
            priority,
            provideShare: async (item) => {
                const result = await this.proxy.$provideShare(handle, item, CancellationToken.None);
                return typeof result === 'string' ? result : URI.revive(result);
            }
        };
        this.providers.set(handle, provider);
        const disposable = this.shareService.registerShareProvider(provider);
        this.providerDisposables.set(handle, disposable);
    }
    $unregisterShareProvider(handle) {
        if (this.providers.has(handle)) {
            this.providers.delete(handle);
        }
        if (this.providerDisposables.has(handle)) {
            this.providerDisposables.delete(handle);
        }
    }
    dispose() {
        this.providers.clear();
        dispose(this.providerDisposables.values());
        this.providerDisposables.clear();
    }
};
MainThreadShare = __decorate([
    extHostNamedCustomer(MainContext.MainThreadShare),
    __param(1, IShareService),
    __metadata("design:paramtypes", [Object, Object])
], MainThreadShare);
export { MainThreadShare };
