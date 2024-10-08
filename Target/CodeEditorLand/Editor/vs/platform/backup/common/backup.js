/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export function isFolderBackupInfo(curr) {
    return curr && curr.hasOwnProperty('folderUri');
}
export function isWorkspaceBackupInfo(curr) {
    return curr && curr.hasOwnProperty('workspace');
}
