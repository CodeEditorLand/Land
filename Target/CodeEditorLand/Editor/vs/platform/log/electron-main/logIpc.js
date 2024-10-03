import { ResourceMap } from '../../../base/common/map.js';
import { URI } from '../../../base/common/uri.js';
import { isLogLevel, log, LogLevel } from '../common/log.js';
export class LoggerChannel {
    constructor(loggerService) {
        this.loggerService = loggerService;
        this.loggers = new ResourceMap();
    }
    listen(_, event, windowId) {
        switch (event) {
            case 'onDidChangeLoggers': return windowId ? this.loggerService.getOnDidChangeLoggersEvent(windowId) : this.loggerService.onDidChangeLoggers;
            case 'onDidChangeLogLevel': return windowId ? this.loggerService.getOnDidChangeLogLevelEvent(windowId) : this.loggerService.onDidChangeLogLevel;
            case 'onDidChangeVisibility': return windowId ? this.loggerService.getOnDidChangeVisibilityEvent(windowId) : this.loggerService.onDidChangeVisibility;
        }
        throw new Error(`Event not found: ${event}`);
    }
    async call(_, command, arg) {
        switch (command) {
            case 'createLogger':
                this.createLogger(URI.revive(arg[0]), arg[1], arg[2]);
                return;
            case 'log': return this.log(URI.revive(arg[0]), arg[1]);
            case 'consoleLog': return this.consoleLog(arg[0], arg[1]);
            case 'setLogLevel': return isLogLevel(arg[0]) ? this.loggerService.setLogLevel(arg[0]) : this.loggerService.setLogLevel(URI.revive(arg[0]), arg[1]);
            case 'setVisibility': return this.loggerService.setVisibility(URI.revive(arg[0]), arg[1]);
            case 'registerLogger': return this.loggerService.registerLogger({ ...arg[0], resource: URI.revive(arg[0].resource) }, arg[1]);
            case 'deregisterLogger': return this.loggerService.deregisterLogger(URI.revive(arg[0]));
        }
        throw new Error(`Call not found: ${command}`);
    }
    createLogger(file, options, windowId) {
        this.loggers.set(file, this.loggerService.createLogger(file, options, windowId));
    }
    consoleLog(level, args) {
        let consoleFn = console.log;
        switch (level) {
            case LogLevel.Error:
                consoleFn = console.error;
                break;
            case LogLevel.Warning:
                consoleFn = console.warn;
                break;
            case LogLevel.Info:
                consoleFn = console.info;
                break;
        }
        consoleFn.call(console, ...args);
    }
    log(file, messages) {
        const logger = this.loggers.get(file);
        if (!logger) {
            throw new Error('Create the logger before logging');
        }
        for (const [level, message] of messages) {
            log(logger, level, message);
        }
    }
}
