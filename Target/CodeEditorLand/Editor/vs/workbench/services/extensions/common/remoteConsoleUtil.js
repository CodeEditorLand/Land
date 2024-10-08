/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { parse } from '../../../../base/common/console.js';
export function logRemoteEntry(logService, entry, label = null) {
    const args = parse(entry).args;
    let firstArg = args.shift();
    if (typeof firstArg !== 'string') {
        return;
    }
    if (!entry.severity) {
        entry.severity = 'info';
    }
    if (label) {
        if (!/^\[/.test(label)) {
            label = `[${label}]`;
        }
        if (!/ $/.test(label)) {
            label = `${label} `;
        }
        firstArg = label + firstArg;
    }
    switch (entry.severity) {
        case 'log':
        case 'info':
            logService.info(firstArg, ...args);
            break;
        case 'warn':
            logService.warn(firstArg, ...args);
            break;
        case 'error':
            logService.error(firstArg, ...args);
            break;
    }
}
export function logRemoteEntryIfError(logService, entry, label) {
    const args = parse(entry).args;
    const firstArg = args.shift();
    if (typeof firstArg !== 'string' || entry.severity !== 'error') {
        return;
    }
    if (!/^\[/.test(label)) {
        label = `[${label}]`;
    }
    if (!/ $/.test(label)) {
        label = `${label} `;
    }
    logService.error(label + firstArg, ...args);
}
