import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
export declare class LabelContribution implements IWorkbenchContribution {
    private readonly labelService;
    private readonly remoteAgentService;
    static readonly ID = "workbench.contrib.remoteLabel";
    constructor(labelService: ILabelService, remoteAgentService: IRemoteAgentService);
    private registerFormatters;
}
