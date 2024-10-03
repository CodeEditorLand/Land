import { Disposable } from '../../../../base/common/lifecycle.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare class LogsDataCleaner extends Disposable {
    private readonly environmentService;
    private readonly logService;
    constructor(environmentService: IEnvironmentService, logService: ILogService);
    private cleanUpOldLogs;
}
