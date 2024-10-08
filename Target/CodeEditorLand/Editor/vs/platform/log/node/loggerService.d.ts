import { URI } from '../../../base/common/uri.js';
import { AbstractLoggerService, ILogger, ILoggerOptions, ILoggerService, LogLevel } from '../common/log.js';
export declare class LoggerService extends AbstractLoggerService implements ILoggerService {
    protected doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
}
