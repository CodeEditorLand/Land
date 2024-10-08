/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { MainContext } from './extHost.protocol.js';
export class ExtHostClipboard {
    constructor(mainContext) {
        const proxy = mainContext.getProxy(MainContext.MainThreadClipboard);
        this.value = Object.freeze({
            readText() {
                return proxy.$readText();
            },
            writeText(value) {
                return proxy.$writeText(value);
            }
        });
    }
}
