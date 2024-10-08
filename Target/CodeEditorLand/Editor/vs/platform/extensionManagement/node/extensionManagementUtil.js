/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { buffer, ExtractError } from '../../../base/node/zip.js';
import { localize } from '../../../nls.js';
import { toExtensionManagementError } from '../common/abstractExtensionManagementService.js';
import { ExtensionManagementError } from '../common/extensionManagement.js';
export function fromExtractError(e) {
    let errorCode = "Extract" /* ExtensionManagementErrorCode.Extract */;
    if (e instanceof ExtractError) {
        if (e.type === 'CorruptZip') {
            errorCode = "CorruptZip" /* ExtensionManagementErrorCode.CorruptZip */;
        }
        else if (e.type === 'Incomplete') {
            errorCode = "IncompleteZip" /* ExtensionManagementErrorCode.IncompleteZip */;
        }
    }
    return toExtensionManagementError(e, errorCode);
}
export async function getManifest(vsixPath) {
    let data;
    try {
        data = await buffer(vsixPath, 'extension/package.json');
    }
    catch (e) {
        throw fromExtractError(e);
    }
    try {
        return JSON.parse(data.toString('utf8'));
    }
    catch (err) {
        throw new ExtensionManagementError(localize('invalidManifest', "VSIX invalid: package.json is not a JSON file."), "Invalid" /* ExtensionManagementErrorCode.Invalid */);
    }
}
