import { Disposable } from '../../../../base/common/lifecycle.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IBrowserWorkbenchEnvironmentService } from '../../../services/environment/browser/environmentService.js';
export declare class ExternalUriResolverContribution extends Disposable implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.externalUriResolver";
    constructor(_openerService: IOpenerService, _workbenchEnvironmentService: IBrowserWorkbenchEnvironmentService);
}
