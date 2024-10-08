import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
export declare class ListContext implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.listContext";
    constructor(contextKeyService: IContextKeyService);
}
