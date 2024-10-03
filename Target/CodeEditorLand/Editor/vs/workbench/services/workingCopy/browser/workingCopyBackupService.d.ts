import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { WorkingCopyBackupService } from '../common/workingCopyBackupService.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
export declare class BrowserWorkingCopyBackupService extends WorkingCopyBackupService {
    constructor(contextService: IWorkspaceContextService, environmentService: IWorkbenchEnvironmentService, fileService: IFileService, logService: ILogService);
}
