import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { INotebookExecutionService } from '../../../common/notebookExecutionService.js';
import { IWorkbenchContribution } from '../../../../../common/contributions.js';
export declare class CellExecutionParticipantsContribution extends Disposable implements IWorkbenchContribution {
    private readonly instantiationService;
    private readonly notebookExecutionService;
    constructor(instantiationService: IInstantiationService, notebookExecutionService: INotebookExecutionService);
    private registerKernelExecutionParticipants;
}
