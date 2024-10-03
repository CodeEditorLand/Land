import { URI } from '../../../base/common/uri.js';
import { Event } from '../../../base/common/event.js';
import { DidChangeLoggersEvent, ILogger, ILoggerOptions, ILoggerResource, ILoggerService, LogLevel } from '../common/log.js';
import { LoggerService } from '../node/loggerService.js';
export declare const ILoggerMainService: import("../../instantiation/common/instantiation.js").ServiceIdentifier<ILoggerMainService>;
export interface ILoggerMainService extends ILoggerService {
    getOnDidChangeLogLevelEvent(windowId: number): Event<LogLevel | [URI, LogLevel]>;
    getOnDidChangeVisibilityEvent(windowId: number): Event<[URI, boolean]>;
    getOnDidChangeLoggersEvent(windowId: number): Event<DidChangeLoggersEvent>;
    createLogger(resource: URI, options?: ILoggerOptions, windowId?: number): ILogger;
    createLogger(id: string, options?: Omit<ILoggerOptions, 'id'>, windowId?: number): ILogger;
    registerLogger(resource: ILoggerResource, windowId?: number): void;
    getRegisteredLoggers(windowId?: number): ILoggerResource[];
    deregisterLoggers(windowId: number): void;
}
export declare class LoggerMainService extends LoggerService implements ILoggerMainService {
    private readonly loggerResourcesByWindow;
    createLogger(idOrResource: URI | string, options?: ILoggerOptions, windowId?: number): ILogger;
    registerLogger(resource: ILoggerResource, windowId?: number): void;
    deregisterLogger(resource: URI): void;
    getRegisteredLoggers(windowId?: number): ILoggerResource[];
    getOnDidChangeLogLevelEvent(windowId: number): Event<LogLevel | [URI, LogLevel]>;
    getOnDidChangeVisibilityEvent(windowId: number): Event<[URI, boolean]>;
    getOnDidChangeLoggersEvent(windowId: number): Event<DidChangeLoggersEvent>;
    deregisterLoggers(windowId: number): void;
    private isInterestedLoggerResource;
    dispose(): void;
}
