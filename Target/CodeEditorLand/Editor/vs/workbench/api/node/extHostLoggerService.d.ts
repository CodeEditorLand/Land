import { ILogger, ILoggerOptions, ILoggerResource, LogLevel } from '../../../platform/log/common/log.js';
import { URI } from '../../../base/common/uri.js';
import { ExtHostLoggerService as BaseExtHostLoggerService } from '../common/extHostLoggerService.js';
export declare class ExtHostLoggerService extends BaseExtHostLoggerService {
    protected doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
    registerLogger(resource: ILoggerResource): void;
    deregisterLogger(resource: URI): void;
}
