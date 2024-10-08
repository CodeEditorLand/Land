/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class ValidationStatus {
    constructor() {
        this._state = 0 /* ValidationState.OK */;
    }
    get state() {
        return this._state;
    }
    set state(value) {
        if (value > this._state) {
            this._state = value;
        }
    }
    isOK() {
        return this._state === 0 /* ValidationState.OK */;
    }
    isFatal() {
        return this._state === 4 /* ValidationState.Fatal */;
    }
}
export class Parser {
    constructor(problemReporter) {
        this._problemReporter = problemReporter;
    }
    reset() {
        this._problemReporter.status.state = 0 /* ValidationState.OK */;
    }
    get problemReporter() {
        return this._problemReporter;
    }
    info(message) {
        this._problemReporter.info(message);
    }
    warn(message) {
        this._problemReporter.warn(message);
    }
    error(message) {
        this._problemReporter.error(message);
    }
    fatal(message) {
        this._problemReporter.fatal(message);
    }
}
