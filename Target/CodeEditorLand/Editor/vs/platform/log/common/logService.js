import { Disposable } from '../../../base/common/lifecycle.js';
import { MultiplexLogger } from './log.js';
export class LogService extends Disposable {
    constructor(primaryLogger, otherLoggers = []) {
        super();
        this.logger = new MultiplexLogger([primaryLogger, ...otherLoggers]);
        this._register(primaryLogger.onDidChangeLogLevel(level => this.setLevel(level)));
    }
    get onDidChangeLogLevel() {
        return this.logger.onDidChangeLogLevel;
    }
    setLevel(level) {
        this.logger.setLevel(level);
    }
    getLevel() {
        return this.logger.getLevel();
    }
    trace(message, ...args) {
        this.logger.trace(message, ...args);
    }
    debug(message, ...args) {
        this.logger.debug(message, ...args);
    }
    info(message, ...args) {
        this.logger.info(message, ...args);
    }
    warn(message, ...args) {
        this.logger.warn(message, ...args);
    }
    error(message, ...args) {
        this.logger.error(message, ...args);
    }
    flush() {
        this.logger.flush();
    }
}
