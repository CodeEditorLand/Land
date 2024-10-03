import { IWorkingCopyBackupService } from '../common/workingCopyBackup.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.js';
import { IWorkingCopyService } from '../common/workingCopyService.js';
import { ILifecycleService, ShutdownReason } from '../../lifecycle/common/lifecycle.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { WorkingCopyBackupTracker } from '../common/workingCopyBackupTracker.js';
import { IWorkingCopyEditorService } from '../common/workingCopyEditorService.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IEditorGroupsService } from '../../editor/common/editorGroupsService.js';
export declare class BrowserWorkingCopyBackupTracker extends WorkingCopyBackupTracker implements IWorkbenchContribution {
    static readonly ID = "workbench.contrib.browserWorkingCopyBackupTracker";
    constructor(workingCopyBackupService: IWorkingCopyBackupService, filesConfigurationService: IFilesConfigurationService, workingCopyService: IWorkingCopyService, lifecycleService: ILifecycleService, logService: ILogService, workingCopyEditorService: IWorkingCopyEditorService, editorService: IEditorService, editorGroupService: IEditorGroupsService);
    protected onFinalBeforeShutdown(reason: ShutdownReason): boolean;
}
