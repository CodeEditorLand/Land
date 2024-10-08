import { Event } from '../../../base/common/event.js';
import { IServerChannel } from '../../../base/parts/ipc/common/ipc.js';
import { ILoggerMainService } from './loggerService.js';
export declare class LoggerChannel implements IServerChannel {
    private readonly loggerService;
    private readonly loggers;
    constructor(loggerService: ILoggerMainService);
    listen(_: unknown, event: string, windowId?: number): Event<any>;
    call(_: unknown, command: string, arg?: any): Promise<any>;
    private createLogger;
    private consoleLog;
    private log;
}
