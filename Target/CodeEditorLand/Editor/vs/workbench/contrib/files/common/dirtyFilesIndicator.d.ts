import { IWorkbenchContribution } from '../../../common/contributions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IActivityService } from '../../../services/activity/common/activity.js';
import { IWorkingCopyService } from '../../../services/workingCopy/common/workingCopyService.js';
import { IFilesConfigurationService } from '../../../services/filesConfiguration/common/filesConfigurationService.js';
export declare class DirtyFilesIndicator extends Disposable implements IWorkbenchContribution {
    private readonly activityService;
    private readonly workingCopyService;
    private readonly filesConfigurationService;
    static readonly ID = "workbench.contrib.dirtyFilesIndicator";
    private readonly badgeHandle;
    private lastKnownDirtyCount;
    constructor(activityService: IActivityService, workingCopyService: IWorkingCopyService, filesConfigurationService: IFilesConfigurationService);
    private registerListeners;
    private onWorkingCopyDidChangeDirty;
    private updateActivityBadge;
}
