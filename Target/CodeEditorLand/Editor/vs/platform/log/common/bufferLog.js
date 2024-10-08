/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { MutableDisposable } from '../../../base/common/lifecycle.js';
import { AbstractMessageLogger, DEFAULT_LOG_LEVEL, log } from './log.js';
export class BufferLogger extends AbstractMessageLogger {
    constructor(logLevel = DEFAULT_LOG_LEVEL) {
        super();
        this.buffer = [];
        this._logger = undefined;
        this._logLevelDisposable = this._register(new MutableDisposable());
        this.setLevel(logLevel);
    }
    set logger(logger) {
        this._logger = logger;
        this.setLevel(logger.getLevel());
        this._logLevelDisposable.value = logger.onDidChangeLogLevel(this.setLevel, this);
        for (const { level, message } of this.buffer) {
            log(logger, level, message);
        }
        this.buffer = [];
    }
    log(level, message) {
        if (this._logger) {
            log(this._logger, level, message);
        }
        else if (this.getLevel() <= level) {
            this.buffer.push({ level, message });
        }
    }
    dispose() {
        this._logger?.dispose();
        super.dispose();
    }
    flush() {
        this._logger?.flush();
    }
}
