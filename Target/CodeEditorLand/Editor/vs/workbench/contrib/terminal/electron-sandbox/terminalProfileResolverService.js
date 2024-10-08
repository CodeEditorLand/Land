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
import { ErrorNoTelemetry } from '../../../../base/common/errors.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ITerminalLogService } from '../../../../platform/terminal/common/terminal.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ITerminalInstanceService } from '../browser/terminal.js';
import { BaseTerminalProfileResolverService } from '../browser/terminalProfileResolverService.js';
import { ITerminalProfileService } from '../common/terminal.js';
import { IConfigurationResolverService } from '../../../services/configurationResolver/common/configurationResolver.js';
import { IHistoryService } from '../../../services/history/common/history.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
let ElectronTerminalProfileResolverService = class ElectronTerminalProfileResolverService extends BaseTerminalProfileResolverService {
    constructor(configurationResolverService, configurationService, historyService, logService, workspaceContextService, terminalProfileService, remoteAgentService, terminalInstanceService) {
        super({
            getDefaultSystemShell: async (remoteAuthority, platform) => {
                const backend = await terminalInstanceService.getBackend(remoteAuthority);
                if (!backend) {
                    throw new ErrorNoTelemetry(`Cannot get default system shell when there is no backend for remote authority '${remoteAuthority}'`);
                }
                return backend.getDefaultSystemShell(platform);
            },
            getEnvironment: async (remoteAuthority) => {
                const backend = await terminalInstanceService.getBackend(remoteAuthority);
                if (!backend) {
                    throw new ErrorNoTelemetry(`Cannot get environment when there is no backend for remote authority '${remoteAuthority}'`);
                }
                return backend.getEnvironment();
            }
        }, configurationService, configurationResolverService, historyService, logService, terminalProfileService, workspaceContextService, remoteAgentService);
    }
};
ElectronTerminalProfileResolverService = __decorate([
    __param(0, IConfigurationResolverService),
    __param(1, IConfigurationService),
    __param(2, IHistoryService),
    __param(3, ITerminalLogService),
    __param(4, IWorkspaceContextService),
    __param(5, ITerminalProfileService),
    __param(6, IRemoteAgentService),
    __param(7, ITerminalInstanceService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], ElectronTerminalProfileResolverService);
export { ElectronTerminalProfileResolverService };
