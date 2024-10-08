import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.js';
import { IRemoteExplorerService } from '../../../services/remote/common/remoteExplorerService.js';
export declare class ShowCandidateContribution extends Disposable implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.showPortCandidate";
    constructor(remoteExplorerService: IRemoteExplorerService, environmentService: IBrowserWorkbenchEnvironmentService);
}
