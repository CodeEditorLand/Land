import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { AbstractLogger, ILoggerService } from '../../../../platform/log/common/log.js';
import { IEditSessionsLogService } from './editSessions.js';
export declare class EditSessionsLogService extends AbstractLogger implements IEditSessionsLogService {
    readonly _serviceBrand: undefined;
    private readonly logger;
    constructor(loggerService: ILoggerService, environmentService: IEnvironmentService);
    trace(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    error(message: string | Error, ...args: any[]): void;
    flush(): void;
}
