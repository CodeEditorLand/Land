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
/**
 * Only used in browser contexts where the log files are not stored on disk
 * but in IndexedDB. A method to get all logs with their contents so that
 * CI automation can persist them.
 */
export declare function getLogs(fileService: IFileService, environmentService: IEnvironmentService): Promise<ILogFile[]>;
/**
 * A logger that is used when VSCode is running in the web with
 * an automation such as playwright. We expect a global codeAutomationLog
 * to be defined that we can use to log to.
 */
export declare class ConsoleLogInAutomationLogger extends AdapterLogger implements ILogger {
    codeAutomationLog: any;
    constructor(logLevel?: LogLevel);
    private consoleLog;
}
