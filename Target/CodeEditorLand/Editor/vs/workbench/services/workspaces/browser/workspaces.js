/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { hash } from '../../../../base/common/hash.js';
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// NOTE: DO NOT CHANGE. IDENTIFIERS HAVE TO REMAIN STABLE
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
export function getWorkspaceIdentifier(workspaceUri) {
    return {
        id: getWorkspaceId(workspaceUri),
        configPath: workspaceUri
    };
}
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// NOTE: DO NOT CHANGE. IDENTIFIERS HAVE TO REMAIN STABLE
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
export function getSingleFolderWorkspaceIdentifier(folderUri) {
    return {
        id: getWorkspaceId(folderUri),
        uri: folderUri
    };
}
function getWorkspaceId(uri) {
    return hash(uri.toString()).toString(16);
}
