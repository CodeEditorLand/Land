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
    /**
     * An operation to flush the contents. Can be synchronous.
     */
    flush(): void;
}
export declare function log(logger: ILogger, level: LogLevel, message: string): void;
export interface ILogService extends ILogger {
    readonly _serviceBrand: undefined;
}
export interface ILoggerOptions {
    /**
     * Id of the logger.
     */
    id?: string;
    /**
     * Name of the logger.
     */
    name?: string;
    /**
     * Do not create rotating files if max size exceeds.
     */
    donotRotate?: boolean;
    /**
     * Do not use formatters.
     */
    donotUseFormatters?: boolean;
    /**
     * When to log. Set to `always` to log always.
     */
    logLevel?: 'always' | LogLevel;
    /**
     * Whether the log should be hidden from the user.
     */
    hidden?: boolean;
    /**
     * Condition which must be true to show this logger
     */
    when?: string;
    /**
     * Id of the extension that created this logger.
     */
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
    /**
     * Creates a logger for the given resource, or gets one if it already exists.
     *
     * This will also register the logger with the logger service.
     */
    createLogger(resource: URI, options?: ILoggerOptions): ILogger;
    /**
     * Creates a logger with the given id in the logs folder, or gets one if it already exists.
     *
     * This will also register the logger with the logger service.
     */
    createLogger(id: string, options?: Omit<ILoggerOptions, 'id'>): ILogger;
    /**
     * Gets an existing logger, if any.
     */
    getLogger(resourceOrId: URI | string): ILogger | undefined;
    /**
     * An event which fires when the log level of a logger has changed
     */
    readonly onDidChangeLogLevel: Event<LogLevel | [URI, LogLevel]>;
    /**
     * Set default log level.
     */
    setLogLevel(level: LogLevel): void;
    /**
     * Set log level for a logger.
     */
    setLogLevel(resource: URI, level: LogLevel): void;
    /**
     * Get log level for a logger or the default log level.
     */
    getLogLevel(resource?: URI): LogLevel;
    /**
     * An event which fires when the visibility of a logger has changed
     */
    readonly onDidChangeVisibility: Event<[URI, boolean]>;
    /**
     * Set the visibility of a logger.
     */
    setVisibility(resourceOrId: URI | string, visible: boolean): void;
    /**
     * An event which fires when the logger resources are changed
     */
    readonly onDidChangeLoggers: Event<DidChangeLoggersEvent>;
    /**
     * Register a logger with the logger service.
     *
     * Note that this will not create a logger, but only register it.
     *
     * Use `createLogger` to create a logger and register it.
     *
     * Use it when you want to register a logger that is not created by the logger service.
     */
    registerLogger(resource: ILoggerResource): void;
    /**
     * Deregister the logger for the given resource.
     */
    deregisterLogger(resource: URI): void;
    /**
     * Get all registered loggers
     */
    getRegisteredLoggers(): Iterable<ILoggerResource>;
    /**
     * Get the registered logger for the given resource.
     */
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
