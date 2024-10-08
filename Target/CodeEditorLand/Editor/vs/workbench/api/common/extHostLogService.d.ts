import { ILoggerService } from '../../../platform/log/common/log.js';
import { LogService } from '../../../platform/log/common/logService.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
export declare class ExtHostLogService extends LogService {
    readonly _serviceBrand: undefined;
    constructor(isWorker: boolean, loggerService: ILoggerService, initData: IExtHostInitDataService);
}
