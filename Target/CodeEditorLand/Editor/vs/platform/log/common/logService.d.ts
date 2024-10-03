import { Disposable } from '../../../base/common/lifecycle.js';
import { Event } from '../../../base/common/event.js';
import { ILogger, ILogService, LogLevel } from './log.js';
export declare class LogService extends Disposable implements ILogService {
    readonly _serviceBrand: undefined;
    private readonly logger;
    constructor(primaryLogger: ILogger, otherLoggers?: ILogger[]);
    get onDidChangeLogLevel(): Event<LogLevel>;
    setLevel(level: LogLevel): void;
    getLevel(): LogLevel;
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    flush(): void;
}
