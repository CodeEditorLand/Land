export function isFolderBackupInfo(curr) {
    return curr && curr.hasOwnProperty('folderUri');
}
export function isWorkspaceBackupInfo(curr) {
    return curr && curr.hasOwnProperty('workspace');
}
