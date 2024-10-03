import { AbstractMessageLogger, ILogger, LogLevel } from './log.js';
export declare class BufferLogger extends AbstractMessageLogger {
    readonly _serviceBrand: undefined;
    private buffer;
    private _logger;
    private readonly _logLevelDisposable;
    constructor(logLevel?: LogLevel);
    set logger(logger: ILogger);
    protected log(level: LogLevel, message: string): void;
    dispose(): void;
    flush(): void;
}
