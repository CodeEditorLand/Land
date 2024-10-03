import { Schemas } from '../../../base/common/network.js';
export function isVirtualResource(resource) {
    return resource.scheme !== Schemas.file && resource.scheme !== Schemas.vscodeRemote;
}
export function getVirtualWorkspaceLocation(workspace) {
    if (workspace.folders.length) {
        return workspace.folders.every(f => isVirtualResource(f.uri)) ? workspace.folders[0].uri : undefined;
    }
    else if (workspace.configuration && isVirtualResource(workspace.configuration)) {
        return workspace.configuration;
    }
    return undefined;
}
export function getVirtualWorkspaceScheme(workspace) {
    return getVirtualWorkspaceLocation(workspace)?.scheme;
}
export function getVirtualWorkspaceAuthority(workspace) {
    return getVirtualWorkspaceLocation(workspace)?.authority;
}
export function isVirtualWorkspace(workspace) {
    return getVirtualWorkspaceLocation(workspace) !== undefined;
}
