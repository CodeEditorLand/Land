/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { CancellationError, onUnexpectedError } from '../../../../base/common/errors.js';
export class LazyPromise {
    constructor() {
        this._actual = null;
        this._actualOk = null;
        this._actualErr = null;
        this._hasValue = false;
        this._value = null;
        this._hasErr = false;
        this._err = null;
    }
    get [Symbol.toStringTag]() {
        return this.toString();
    }
    _ensureActual() {
        if (!this._actual) {
            this._actual = new Promise((c, e) => {
                this._actualOk = c;
                this._actualErr = e;
                if (this._hasValue) {
                    this._actualOk(this._value);
                }
                if (this._hasErr) {
                    this._actualErr(this._err);
                }
            });
        }
        return this._actual;
    }
    resolveOk(value) {
        if (this._hasValue || this._hasErr) {
            return;
        }
        this._hasValue = true;
        this._value = value;
        if (this._actual) {
            this._actualOk(value);
        }
    }
    resolveErr(err) {
        if (this._hasValue || this._hasErr) {
            return;
        }
        this._hasErr = true;
        this._err = err;
        if (this._actual) {
            this._actualErr(err);
        }
        else {
            // If nobody's listening at this point, it is safe to assume they never will,
            // since resolving this promise is always "async"
            onUnexpectedError(err);
        }
    }
    then(success, error) {
        return this._ensureActual().then(success, error);
    }
    catch(error) {
        return this._ensureActual().then(undefined, error);
    }
    finally(callback) {
        return this._ensureActual().finally(callback);
    }
}
export class CanceledLazyPromise extends LazyPromise {
    constructor() {
        super();
        this._hasErr = true;
        this._err = new CancellationError();
    }
}
