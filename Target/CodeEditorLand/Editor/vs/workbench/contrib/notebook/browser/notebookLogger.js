/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
// import * as DOM from 'vs/base/browser/dom';
class NotebookLogger {
    constructor() {
        this._frameId = 0;
        this._domFrameLog();
    }
    _domFrameLog() {
        // DOM.scheduleAtNextAnimationFrame(() => {
        // 	this._frameId++;
        // 	this._domFrameLog();
        // }, 1000000);
    }
    debug(...args) {
        const date = new Date();
        console.log(`${date.getSeconds()}:${date.getMilliseconds().toString().padStart(3, '0')}`, `frame #${this._frameId}: `, ...args);
    }
}
const instance = new NotebookLogger();
export function notebookDebug(...args) {
    instance.debug(...args);
}
