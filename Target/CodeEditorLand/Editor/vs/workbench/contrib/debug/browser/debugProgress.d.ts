import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IDebugService } from '../common/debug.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
export declare class DebugProgressContribution implements IWorkbenchContribution {
    private toDispose;
    constructor(debugService: IDebugService, progressService: IProgressService, viewsService: IViewsService);
    dispose(): void;
}
