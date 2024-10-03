import { Event } from '../../../base/common/event.js';
import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { ILocalizedString } from '../../action/common/action.js';
import { RawContextKey } from '../../contextkey/common/contextkey.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
export declare const ILogService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ILogService>;
export declare const ILoggerService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ILoggerService>;
export declare function isLogLevel(thing: unknown): thing is LogLevel;
export declare enum LogLevel {
    Off = 0,
    Trace = 1,
    Debug = 2,
    Info = 3,
    Warning = 4,
    Error = 5
}
export declare const DEFAULT_LOG_LEVEL: LogLevel;
export interface ILogger extends IDisposable {
    onDidChangeLogLevel: Event<LogLevel>;
    getLevel(): LogLevel;
    setLevel(level: LogLevel): void;
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    flush(): void;
}
export declare function log(logger: ILogger, level: LogLevel, message: string): void;
export interface ILogService extends ILogger {
    readonly _serviceBrand: undefined;
}
export interface ILoggerOptions {
    id?: string;
    name?: string;
    donotRotate?: boolean;
    donotUseFormatters?: boolean;
    logLevel?: 'always' | LogLevel;
    hidden?: boolean;
    when?: string;
    extensionId?: string;
}
export interface ILoggerResource {
    readonly resource: URI;
    readonly id: string;
    readonly name?: string;
    readonly logLevel?: LogLevel;
    readonly hidden?: boolean;
    readonly when?: string;
    readonly extensionId?: string;
}
export type DidChangeLoggersEvent = {
    readonly added: Iterable<ILoggerResource>;
    readonly removed: Iterable<ILoggerResource>;
};
export interface ILoggerService {
    readonly _serviceBrand: undefined;
    createLogger(resource: URI, options?: ILoggerOptions): ILogger;
    createLogger(id: string, options?: Omit<ILoggerOptions, 'id'>): ILogger;
    getLogger(resourceOrId: URI | string): ILogger | undefined;
    readonly onDidChangeLogLevel: Event<LogLevel | [URI, LogLevel]>;
    setLogLevel(level: LogLevel): void;
    setLogLevel(resource: URI, level: LogLevel): void;
    getLogLevel(resource?: URI): LogLevel;
    readonly onDidChangeVisibility: Event<[URI, boolean]>;
    setVisibility(resourceOrId: URI | string, visible: boolean): void;
    readonly onDidChangeLoggers: Event<DidChangeLoggersEvent>;
    registerLogger(resource: ILoggerResource): void;
    deregisterLogger(resource: URI): void;
    getRegisteredLoggers(): Iterable<ILoggerResource>;
    getRegisteredLogger(resource: URI): ILoggerResource | undefined;
}
export declare abstract class AbstractLogger extends Disposable implements ILogger {
    private level;
    private readonly _onDidChangeLogLevel;
    readonly onDidChangeLogLevel: Event<LogLevel>;
    setLevel(level: LogLevel): void;
    getLevel(): LogLevel;
    protected checkLogLevel(level: LogLevel): boolean;
    abstract trace(message: string, ...args: any[]): void;
    abstract debug(message: string, ...args: any[]): void;
    abstract info(message: string, ...args: any[]): void;
    abstract warn(message: string, ...args: any[]): void;
    abstract error(message: string | Error, ...args: any[]): void;
    abstract flush(): void;
}
export declare abstract class AbstractMessageLogger extends AbstractLogger implements ILogger {
    private readonly logAlways?;
    protected abstract log(level: LogLevel, message: string): void;
    constructor(logAlways?: boolean | undefined);
    protected checkLogLevel(level: LogLevel): boolean;
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    flush(): void;
}
export declare class ConsoleMainLogger extends AbstractLogger implements ILogger {
    private useColors;
    constructor(logLevel?: LogLevel);
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string | Error, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    flush(): void;
}
export declare class ConsoleLogger extends AbstractLogger implements ILogger {
    private readonly useColors;
    constructor(logLevel?: LogLevel, useColors?: boolean);
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string | Error, ...args: any[]): void;
    error(message: string, ...args: any[]): void;
    flush(): void;
}
export declare class AdapterLogger extends AbstractLogger implements ILogger {
    private readonly adapter;
    constructor(adapter: {
        log: (logLevel: LogLevel, args: any[]) => void;
    }, logLevel?: LogLevel);
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string | Error, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    private extractMessage;
    flush(): void;
}
export declare class MultiplexLogger extends AbstractLogger implements ILogger {
    private readonly loggers;
    constructor(loggers: ReadonlyArray<ILogger>);
    setLevel(level: LogLevel): void;
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    flush(): void;
    dispose(): void;
}
export declare abstract class AbstractLoggerService extends Disposable implements ILoggerService {
    protected logLevel: LogLevel;
    private readonly logsHome;
    readonly _serviceBrand: undefined;
    private readonly _loggers;
    private _onDidChangeLoggers;
    readonly onDidChangeLoggers: Event<{
        added: ILoggerResource[];
        removed: ILoggerResource[];
    }>;
    private _onDidChangeLogLevel;
    readonly onDidChangeLogLevel: Event<LogLevel | [URI, LogLevel]>;
    private _onDidChangeVisibility;
    readonly onDidChangeVisibility: Event<[URI, boolean]>;
    constructor(logLevel: LogLevel, logsHome: URI, loggerResources?: Iterable<ILoggerResource>);
    private getLoggerEntry;
    getLogger(resourceOrId: URI | string): ILogger | undefined;
    createLogger(idOrResource: URI | string, options?: ILoggerOptions): ILogger;
    protected toResource(idOrResource: string | URI): URI;
    setLogLevel(logLevel: LogLevel): void;
    setLogLevel(resource: URI, logLevel: LogLevel): void;
    setVisibility(resourceOrId: URI | string, visibility: boolean): void;
    getLogLevel(resource?: URI): LogLevel;
    registerLogger(resource: ILoggerResource): void;
    deregisterLogger(resource: URI): void;
    getRegisteredLoggers(): Iterable<ILoggerResource>;
    getRegisteredLogger(resource: URI): ILoggerResource | undefined;
    dispose(): void;
    protected abstract doCreateLogger(resource: URI, logLevel: LogLevel, options?: ILoggerOptions): ILogger;
}
export declare class NullLogger implements ILogger {
    readonly onDidChangeLogLevel: Event<LogLevel>;
    setLevel(level: LogLevel): void;
    getLevel(): LogLevel;
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    critical(message: string | Error, ...args: any[]): void;
    dispose(): void;
    flush(): void;
}
export declare class NullLogService extends NullLogger implements ILogService {
    readonly _serviceBrand: undefined;
}
export declare function getLogLevel(environmentService: IEnvironmentService): LogLevel;
export declare function LogLevelToString(logLevel: LogLevel): string;
export declare function LogLevelToLocalizedString(logLevel: LogLevel): ILocalizedString;
export declare function parseLogLevel(logLevel: string): LogLevel | undefined;
export declare const CONTEXT_LOG_LEVEL: RawContextKey<string>;
