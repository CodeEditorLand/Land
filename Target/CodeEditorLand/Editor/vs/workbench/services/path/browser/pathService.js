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
import { IPathService, AbstractPathService } from '../common/pathService.js';
import { URI } from '../../../../base/common/uri.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { dirname } from '../../../../base/common/resources.js';
let BrowserPathService = class BrowserPathService extends AbstractPathService {
    constructor(remoteAgentService, environmentService, contextService) {
        super(guessLocalUserHome(environmentService, contextService), remoteAgentService, environmentService, contextService);
    }
};
BrowserPathService = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, IWorkbenchEnvironmentService),
    __param(2, IWorkspaceContextService),
    __metadata("design:paramtypes", [Object, Object, Object])
], BrowserPathService);
export { BrowserPathService };
function guessLocalUserHome(environmentService, contextService) {
    // In web we do not really have the concept of a "local" user home
    // but we still require it in many places as a fallback. As such,
    // we have to come up with a synthetic location derived from the
    // environment.
    const workspace = contextService.getWorkspace();
    const firstFolder = workspace.folders.at(0);
    if (firstFolder) {
        return firstFolder.uri;
    }
    if (workspace.configuration) {
        return dirname(workspace.configuration);
    }
    // This is not ideal because with a user home location of `/`, all paths
    // will potentially appear with `~/...`, but at this point we really do
    // not have any other good alternative.
    return URI.from({
        scheme: AbstractPathService.findDefaultUriScheme(environmentService, contextService),
        authority: environmentService.remoteAuthority,
        path: '/'
    });
}
registerSingleton(IPathService, BrowserPathService, 1 /* InstantiationType.Delayed */);
