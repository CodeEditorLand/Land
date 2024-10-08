import { Disposable } from '../../../../base/common/lifecycle.js';
import { INativeEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
export declare class UnusedWorkspaceStorageDataCleaner extends Disposable {
    private readonly environmentService;
    private readonly logService;
    private readonly nativeHostService;
    private readonly mainProcessService;
    constructor(environmentService: INativeEnvironmentService, logService: ILogService, nativeHostService: INativeHostService, mainProcessService: IMainProcessService);
    private cleanUpStorage;
}
