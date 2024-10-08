/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export function VSCodeSequence(osc, data) {
    return oscSequence(633 /* ShellIntegrationOscPs.VSCode */, osc, data);
}
export function ITermSequence(osc, data) {
    return oscSequence(1337 /* ShellIntegrationOscPs.ITerm */, osc, data);
}
function oscSequence(ps, pt, data) {
    let result = `\x1b]${ps};${pt}`;
    if (data) {
        result += `;${data}`;
    }
    result += `\x07`;
    return result;
}
