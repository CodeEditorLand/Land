/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { URI } from '../../../base/common/uri.js';
export function isEmptyWindowBackupInfo(obj) {
    const candidate = obj;
    return typeof candidate?.backupFolder === 'string';
}
export function deserializeWorkspaceInfos(serializedBackupWorkspaces) {
    let workspaceBackupInfos = [];
    try {
        if (Array.isArray(serializedBackupWorkspaces.workspaces)) {
            workspaceBackupInfos = serializedBackupWorkspaces.workspaces.map(workspace => ({
                workspace: {
                    id: workspace.id,
                    configPath: URI.parse(workspace.configURIPath)
                },
                remoteAuthority: workspace.remoteAuthority
            }));
        }
    }
    catch (e) {
        // ignore URI parsing exceptions
    }
    return workspaceBackupInfos;
}
export function deserializeFolderInfos(serializedBackupWorkspaces) {
    let folderBackupInfos = [];
    try {
        if (Array.isArray(serializedBackupWorkspaces.folders)) {
            folderBackupInfos = serializedBackupWorkspaces.folders.map(folder => ({
                folderUri: URI.parse(folder.folderUri),
                remoteAuthority: folder.remoteAuthority
            }));
        }
    }
    catch (e) {
        // ignore URI parsing exceptions
    }
    return folderBackupInfos;
}
