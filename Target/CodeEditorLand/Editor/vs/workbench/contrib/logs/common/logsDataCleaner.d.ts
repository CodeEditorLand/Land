import { Disposable } from '../../../../base/common/lifecycle.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkbenchEnvironmentService } from '../../../services/environment/common/environmentService.js';
import { ILifecycleService } from '../../../services/lifecycle/common/lifecycle.js';
export declare class LogsDataCleaner extends Disposable {
    private readonly environmentService;
    private readonly fileService;
    private readonly lifecycleService;
    constructor(environmentService: IWorkbenchEnvironmentService, fileService: IFileService, lifecycleService: ILifecycleService);
    private cleanUpOldLogsSoon;
}
