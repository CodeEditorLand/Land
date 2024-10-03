import { IEnvironmentService } from '../../environment/common/environment.js';
import { IFileService } from '../../files/common/files.js';
import { AdapterLogger, ILogger, LogLevel } from '../common/log.js';
export interface IAutomatedWindow {
    codeAutomationLog(type: string, args: any[]): void;
    codeAutomationExit(code: number, logs: Array<ILogFile>): void;
}
export interface ILogFile {
    readonly relativePath: string;
    readonly contents: string;
}
export declare function getLogs(fileService: IFileService, environmentService: IEnvironmentService): Promise<ILogFile[]>;
export declare class ConsoleLogInAutomationLogger extends AdapterLogger implements ILogger {
    codeAutomationLog: any;
    constructor(logLevel?: LogLevel);
    private consoleLog;
}
