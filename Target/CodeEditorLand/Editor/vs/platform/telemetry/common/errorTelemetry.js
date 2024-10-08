/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { binarySearch } from '../../../base/common/arrays.js';
import { errorHandler, ErrorNoTelemetry } from '../../../base/common/errors.js';
import { DisposableStore, toDisposable } from '../../../base/common/lifecycle.js';
import { safeStringify } from '../../../base/common/objects.js';
import { FileOperationError } from '../../files/common/files.js';
export var ErrorEvent;
(function (ErrorEvent) {
    function compare(a, b) {
        if (a.callstack < b.callstack) {
            return -1;
        }
        else if (a.callstack > b.callstack) {
            return 1;
        }
        return 0;
    }
    ErrorEvent.compare = compare;
})(ErrorEvent || (ErrorEvent = {}));
export default class BaseErrorTelemetry {
    static { this.ERROR_FLUSH_TIMEOUT = 5 * 1000; }
    constructor(telemetryService, flushDelay = BaseErrorTelemetry.ERROR_FLUSH_TIMEOUT) {
        this._flushHandle = -1;
        this._buffer = [];
        this._disposables = new DisposableStore();
        this._telemetryService = telemetryService;
        this._flushDelay = flushDelay;
        // (1) check for unexpected but handled errors
        const unbind = errorHandler.addListener((err) => this._onErrorEvent(err));
        this._disposables.add(toDisposable(unbind));
        // (2) install implementation-specific error listeners
        this.installErrorListeners();
    }
    dispose() {
        clearTimeout(this._flushHandle);
        this._flushBuffer();
        this._disposables.dispose();
    }
    installErrorListeners() {
        // to override
    }
    _onErrorEvent(err) {
        if (!err || err.code) {
            return;
        }
        // unwrap nested errors from loader
        if (err.detail && err.detail.stack) {
            err = err.detail;
        }
        // If it's the no telemetry error it doesn't get logged
        // TOOD @lramos15 hacking in FileOperation error because it's too messy to adopt ErrorNoTelemetry. A better solution should be found
        if (ErrorNoTelemetry.isErrorNoTelemetry(err) || err instanceof FileOperationError || (typeof err?.message === 'string' && err.message.includes('Unable to read file'))) {
            return;
        }
        // work around behavior in workerServer.ts that breaks up Error.stack
        const callstack = Array.isArray(err.stack) ? err.stack.join('\n') : err.stack;
        const msg = err.message ? err.message : safeStringify(err);
        // errors without a stack are not useful telemetry
        if (!callstack) {
            return;
        }
        this._enqueue({ msg, callstack });
    }
    _enqueue(e) {
        const idx = binarySearch(this._buffer, e, ErrorEvent.compare);
        if (idx < 0) {
            e.count = 1;
            this._buffer.splice(~idx, 0, e);
        }
        else {
            if (!this._buffer[idx].count) {
                this._buffer[idx].count = 0;
            }
            this._buffer[idx].count += 1;
        }
        if (this._flushHandle === -1) {
            this._flushHandle = setTimeout(() => {
                this._flushBuffer();
                this._flushHandle = -1;
            }, this._flushDelay);
        }
    }
    _flushBuffer() {
        for (const error of this._buffer) {
            this._telemetryService.publicLogError2('UnhandledError', error);
        }
        this._buffer.length = 0;
    }
}
