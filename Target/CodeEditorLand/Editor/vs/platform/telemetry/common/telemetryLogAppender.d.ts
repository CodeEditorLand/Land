import { Disposable } from '../../../base/common/lifecycle.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { ILogService, ILoggerService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { ITelemetryAppender } from './telemetryUtils.js';
export declare class TelemetryLogAppender extends Disposable implements ITelemetryAppender {
    private readonly prefix;
    private readonly logger;
    constructor(logService: ILogService, loggerService: ILoggerService, environmentService: IEnvironmentService, productService: IProductService, prefix?: string);
    flush(): Promise<void>;
    log(eventName: string, data: any): void;
}
