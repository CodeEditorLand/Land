import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ITerminalLogService } from '../../../../platform/terminal/common/terminal.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ITerminalInstanceService } from '../browser/terminal.js';
import { BaseTerminalProfileResolverService } from '../browser/terminalProfileResolverService.js';
import { ITerminalProfileService } from '../common/terminal.js';
import { IConfigurationResolverService } from '../../../services/configurationResolver/common/configurationResolver.js';
import { IHistoryService } from '../../../services/history/common/history.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
export declare class ElectronTerminalProfileResolverService extends BaseTerminalProfileResolverService {
    constructor(configurationResolverService: IConfigurationResolverService, configurationService: IConfigurationService, historyService: IHistoryService, logService: ITerminalLogService, workspaceContextService: IWorkspaceContextService, terminalProfileService: ITerminalProfileService, remoteAgentService: IRemoteAgentService, terminalInstanceService: ITerminalInstanceService);
}
