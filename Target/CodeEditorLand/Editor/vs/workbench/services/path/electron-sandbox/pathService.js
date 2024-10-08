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
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { IPathService, AbstractPathService } from '../common/pathService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
let NativePathService = class NativePathService extends AbstractPathService {
    constructor(remoteAgentService, environmentService, contextService) {
        super(environmentService.userHome, remoteAgentService, environmentService, contextService);
    }
};
NativePathService = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, INativeWorkbenchEnvironmentService),
    __param(2, IWorkspaceContextService),
    __metadata("design:paramtypes", [Object, Object, Object])
], NativePathService);
export { NativePathService };
registerSingleton(IPathService, NativePathService, 1 /* InstantiationType.Delayed */);
