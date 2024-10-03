import { mainWindow } from '../../../base/browser/window.js';
import { relativePath } from '../../../base/common/resources.js';
import { AdapterLogger, DEFAULT_LOG_LEVEL, LogLevel } from '../common/log.js';
export async function getLogs(fileService, environmentService) {
    const result = [];
    await doGetLogs(fileService, result, environmentService.logsHome, environmentService.logsHome);
    return result;
}
async function doGetLogs(fileService, logs, curFolder, logsHome) {
    const stat = await fileService.resolve(curFolder);
    for (const { resource, isDirectory } of stat.children || []) {
        if (isDirectory) {
            await doGetLogs(fileService, logs, resource, logsHome);
        }
        else {
            const contents = (await fileService.readFile(resource)).value.toString();
            if (contents) {
                const path = relativePath(logsHome, resource);
                if (path) {
                    logs.push({ relativePath: path, contents });
                }
            }
        }
    }
}
function logLevelToString(level) {
    switch (level) {
        case LogLevel.Trace: return 'trace';
        case LogLevel.Debug: return 'debug';
        case LogLevel.Info: return 'info';
        case LogLevel.Warning: return 'warn';
        case LogLevel.Error: return 'error';
    }
    return 'info';
}
export class ConsoleLogInAutomationLogger extends AdapterLogger {
    constructor(logLevel = DEFAULT_LOG_LEVEL) {
        super({ log: (level, args) => this.consoleLog(logLevelToString(level), args) }, logLevel);
    }
    consoleLog(type, args) {
        const automatedWindow = mainWindow;
        if (typeof automatedWindow.codeAutomationLog === 'function') {
            try {
                automatedWindow.codeAutomationLog(type, args);
            }
            catch (err) {
                console.error('Problems writing to codeAutomationLog', err);
            }
        }
    }
}
