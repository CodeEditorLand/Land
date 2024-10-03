import { ByteSize } from '../../files/common/files.js';
import { AbstractMessageLogger, LogLevel } from '../common/log.js';
var SpdLogLevel;
(function (SpdLogLevel) {
    SpdLogLevel[SpdLogLevel["Trace"] = 0] = "Trace";
    SpdLogLevel[SpdLogLevel["Debug"] = 1] = "Debug";
    SpdLogLevel[SpdLogLevel["Info"] = 2] = "Info";
    SpdLogLevel[SpdLogLevel["Warning"] = 3] = "Warning";
    SpdLogLevel[SpdLogLevel["Error"] = 4] = "Error";
    SpdLogLevel[SpdLogLevel["Critical"] = 5] = "Critical";
    SpdLogLevel[SpdLogLevel["Off"] = 6] = "Off";
})(SpdLogLevel || (SpdLogLevel = {}));
async function createSpdLogLogger(name, logfilePath, filesize, filecount, donotUseFormatters) {
    try {
        const _spdlog = await import('@vscode/spdlog');
        _spdlog.setFlushOn(SpdLogLevel.Trace);
        const logger = await _spdlog.createAsyncRotatingLogger(name, logfilePath, filesize, filecount);
        if (donotUseFormatters) {
            logger.clearFormatters();
        }
        else {
            logger.setPattern('%Y-%m-%d %H:%M:%S.%e [%l] %v');
        }
        return logger;
    }
    catch (e) {
        console.error(e);
    }
    return null;
}
function log(logger, level, message) {
    switch (level) {
        case LogLevel.Trace:
            logger.trace(message);
            break;
        case LogLevel.Debug:
            logger.debug(message);
            break;
        case LogLevel.Info:
            logger.info(message);
            break;
        case LogLevel.Warning:
            logger.warn(message);
            break;
        case LogLevel.Error:
            logger.error(message);
            break;
        case LogLevel.Off: break;
        default: throw new Error(`Invalid log level ${level}`);
    }
}
function setLogLevel(logger, level) {
    switch (level) {
        case LogLevel.Trace:
            logger.setLevel(SpdLogLevel.Trace);
            break;
        case LogLevel.Debug:
            logger.setLevel(SpdLogLevel.Debug);
            break;
        case LogLevel.Info:
            logger.setLevel(SpdLogLevel.Info);
            break;
        case LogLevel.Warning:
            logger.setLevel(SpdLogLevel.Warning);
            break;
        case LogLevel.Error:
            logger.setLevel(SpdLogLevel.Error);
            break;
        case LogLevel.Off:
            logger.setLevel(SpdLogLevel.Off);
            break;
        default: throw new Error(`Invalid log level ${level}`);
    }
}
export class SpdLogLogger extends AbstractMessageLogger {
    constructor(name, filepath, rotating, donotUseFormatters, level) {
        super();
        this.buffer = [];
        this.setLevel(level);
        this._loggerCreationPromise = this._createSpdLogLogger(name, filepath, rotating, donotUseFormatters);
        this._register(this.onDidChangeLogLevel(level => {
            if (this._logger) {
                setLogLevel(this._logger, level);
            }
        }));
    }
    async _createSpdLogLogger(name, filepath, rotating, donotUseFormatters) {
        const filecount = rotating ? 6 : 1;
        const filesize = (30 / filecount) * ByteSize.MB;
        const logger = await createSpdLogLogger(name, filepath, filesize, filecount, donotUseFormatters);
        if (logger) {
            this._logger = logger;
            setLogLevel(this._logger, this.getLevel());
            for (const { level, message } of this.buffer) {
                log(this._logger, level, message);
            }
            this.buffer = [];
        }
    }
    log(level, message) {
        if (this._logger) {
            log(this._logger, level, message);
        }
        else if (this.getLevel() <= level) {
            this.buffer.push({ level, message });
        }
    }
    flush() {
        if (this._logger) {
            this._logger.flush();
        }
        else {
            this._loggerCreationPromise.then(() => this.flush());
        }
    }
    dispose() {
        if (this._logger) {
            this.disposeLogger();
        }
        else {
            this._loggerCreationPromise.then(() => this.disposeLogger());
        }
        super.dispose();
    }
    disposeLogger() {
        if (this._logger) {
            this._logger.drop();
            this._logger = undefined;
        }
    }
}
