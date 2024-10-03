import { hash } from '../../../../base/common/hash.js';
export function getWorkspaceIdentifier(workspaceUri) {
    return {
        id: getWorkspaceId(workspaceUri),
        configPath: workspaceUri
    };
}
export function getSingleFolderWorkspaceIdentifier(folderUri) {
    return {
        id: getWorkspaceId(folderUri),
        uri: folderUri
    };
}
function getWorkspaceId(uri) {
    return hash(uri.toString()).toString(16);
}
