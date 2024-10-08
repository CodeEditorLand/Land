import { IEnvironmentService } from '../../environment/common/environment.js';
import { AbstractLogger, ILoggerService } from '../../log/common/log.js';
import { IUserDataSyncLogService } from './userDataSync.js';
export declare class UserDataSyncLogService extends AbstractLogger implements IUserDataSyncLogService {
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
