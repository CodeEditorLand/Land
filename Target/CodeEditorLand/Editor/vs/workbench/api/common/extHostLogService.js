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
import { localize } from '../../../nls.js';
import { ILoggerService } from '../../../platform/log/common/log.js';
import { LogService } from '../../../platform/log/common/logService.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
let ExtHostLogService = class ExtHostLogService extends LogService {
    constructor(isWorker, loggerService, initData) {
        const id = initData.remote.isRemote ? 'remoteexthost' : isWorker ? 'workerexthost' : 'exthost';
        const name = initData.remote.isRemote ? localize('remote', "Extension Host (Remote)") : isWorker ? localize('worker', "Extension Host (Worker)") : localize('local', "Extension Host");
        super(loggerService.createLogger(id, { name }));
    }
};
ExtHostLogService = __decorate([
    __param(1, ILoggerService),
    __param(2, IExtHostInitDataService),
    __metadata("design:paramtypes", [Boolean, Object, Object])
], ExtHostLogService);
export { ExtHostLogService };
