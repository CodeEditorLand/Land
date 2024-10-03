import { URI } from '../../../base/common/uri.js';
import { IFileService } from '../../files/common/files.js';
import { AbstractLoggerService, ILogger, ILoggerOptions, ILoggerService, LogLevel } from './log.js';
export declare class FileLoggerService extends AbstractLoggerService implements ILoggerService {
    private readonly fileService;
    constructor(logLevel: LogLevel, logsHome: URI, fileService: IFileService);
    protected doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
}
