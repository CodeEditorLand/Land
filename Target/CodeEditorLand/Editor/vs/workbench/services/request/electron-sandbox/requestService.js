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
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { AbstractRequestService, IRequestService } from '../../../../platform/request/common/request.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { request } from '../../../../base/parts/request/browser/request.js';
import { ILogService } from '../../../../platform/log/common/log.js';
let NativeRequestService = class NativeRequestService extends AbstractRequestService {
    constructor(nativeHostService, configurationService, logService) {
        super(logService);
        this.nativeHostService = nativeHostService;
        this.configurationService = configurationService;
    }
    async request(options, token) {
        if (!options.proxyAuthorization) {
            options.proxyAuthorization = this.configurationService.getValue('http.proxyAuthorization');
        }
        return this.logAndRequest(options, () => request(options, token));
    }
    async resolveProxy(url) {
        return this.nativeHostService.resolveProxy(url);
    }
    async lookupAuthorization(authInfo) {
        return this.nativeHostService.lookupAuthorization(authInfo);
    }
    async lookupKerberosAuthorization(url) {
        return this.nativeHostService.lookupKerberosAuthorization(url);
    }
    async loadCertificates() {
        return this.nativeHostService.loadCertificates();
    }
};
NativeRequestService = __decorate([
    __param(0, INativeHostService),
    __param(1, IConfigurationService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], NativeRequestService);
export { NativeRequestService };
registerSingleton(IRequestService, NativeRequestService, 1 /* InstantiationType.Delayed */);
