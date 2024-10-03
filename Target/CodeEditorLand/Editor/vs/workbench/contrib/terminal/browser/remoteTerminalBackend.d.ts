import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ITerminalInstanceService } from './terminal.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
export declare class RemoteTerminalBackendContribution implements IWorkbenchContribution {
    static ID: string;
    constructor(instantiationService: IInstantiationService, remoteAgentService: IRemoteAgentService, terminalInstanceService: ITerminalInstanceService);
}
