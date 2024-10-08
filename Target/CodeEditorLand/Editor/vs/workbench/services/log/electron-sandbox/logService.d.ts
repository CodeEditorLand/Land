import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { LoggerChannelClient } from '../../../../platform/log/common/logIpc.js';
import { LogService } from '../../../../platform/log/common/logService.js';
export declare class NativeLogService extends LogService {
    constructor(loggerService: LoggerChannelClient, environmentService: INativeWorkbenchEnvironmentService);
}
