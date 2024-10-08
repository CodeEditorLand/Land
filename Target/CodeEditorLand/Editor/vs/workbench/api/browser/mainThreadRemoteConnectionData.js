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
import { extHostCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext } from '../common/extHost.protocol.js';
import { IRemoteAuthorityResolverService } from '../../../platform/remote/common/remoteAuthorityResolver.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IWorkbenchEnvironmentService } from '../../services/environment/common/environmentService.js';
let MainThreadRemoteConnectionData = class MainThreadRemoteConnectionData extends Disposable {
    constructor(extHostContext, _environmentService, remoteAuthorityResolverService) {
        super();
        this._environmentService = _environmentService;
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostExtensionService);
        const remoteAuthority = this._environmentService.remoteAuthority;
        if (remoteAuthority) {
            this._register(remoteAuthorityResolverService.onDidChangeConnectionData(() => {
                const connectionData = remoteAuthorityResolverService.getConnectionData(remoteAuthority);
                if (connectionData) {
                    this._proxy.$updateRemoteConnectionData(connectionData);
                }
            }));
        }
    }
};
MainThreadRemoteConnectionData = __decorate([
    extHostCustomer,
    __param(1, IWorkbenchEnvironmentService),
    __param(2, IRemoteAuthorityResolverService),
    __metadata("design:paramtypes", [Object, Object, Object])
], MainThreadRemoteConnectionData);
export { MainThreadRemoteConnectionData };
