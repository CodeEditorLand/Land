import { Disposable } from '../../../../base/common/lifecycle.js';
import { IAccessibilitySignalService } from '../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IWorkingCopyService } from '../../../services/workingCopy/common/workingCopyService.js';
export declare class SaveAccessibilitySignalContribution extends Disposable implements IWorkbenchContribution {
    private readonly _accessibilitySignalService;
    private readonly _workingCopyService;
    static readonly ID = "workbench.contrib.saveAccessibilitySignal";
    constructor(_accessibilitySignalService: IAccessibilitySignalService, _workingCopyService: IWorkingCopyService);
}
