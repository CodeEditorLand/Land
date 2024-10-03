import { WorkingCopyBackupService } from '../common/workingCopyBackupService.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
export declare class NativeWorkingCopyBackupService extends WorkingCopyBackupService {
    private readonly lifecycleService;
    constructor(environmentService: INativeWorkbenchEnvironmentService, fileService: IFileService, logService: ILogService, lifecycleService: ILifecycleService);
    private registerListeners;
}
