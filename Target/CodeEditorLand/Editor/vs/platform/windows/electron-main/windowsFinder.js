import { extUriBiasedIgnorePathCase } from '../../../base/common/resources.js';
import { URI } from '../../../base/common/uri.js';
import { isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from '../../workspace/common/workspace.js';
export async function findWindowOnFile(windows, fileUri, localWorkspaceResolver) {
    for (const window of windows) {
        const workspace = window.openedWorkspace;
        if (isWorkspaceIdentifier(workspace)) {
            const resolvedWorkspace = await localWorkspaceResolver(workspace);
            if (resolvedWorkspace) {
                if (resolvedWorkspace.folders.some(folder => extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, folder.uri))) {
                    return window;
                }
            }
            else {
                if (extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, workspace.configPath)) {
                    return window;
                }
            }
        }
    }
    const singleFolderWindowsOnFilePath = windows.filter(window => isSingleFolderWorkspaceIdentifier(window.openedWorkspace) && extUriBiasedIgnorePathCase.isEqualOrParent(fileUri, window.openedWorkspace.uri));
    if (singleFolderWindowsOnFilePath.length) {
        return singleFolderWindowsOnFilePath.sort((windowA, windowB) => -(windowA.openedWorkspace.uri.path.length - windowB.openedWorkspace.uri.path.length))[0];
    }
    return undefined;
}
export function findWindowOnWorkspaceOrFolder(windows, folderOrWorkspaceConfigUri) {
    for (const window of windows) {
        if (isWorkspaceIdentifier(window.openedWorkspace) && extUriBiasedIgnorePathCase.isEqual(window.openedWorkspace.configPath, folderOrWorkspaceConfigUri)) {
            return window;
        }
        if (isSingleFolderWorkspaceIdentifier(window.openedWorkspace) && extUriBiasedIgnorePathCase.isEqual(window.openedWorkspace.uri, folderOrWorkspaceConfigUri)) {
            return window;
        }
    }
    return undefined;
}
export function findWindowOnExtensionDevelopmentPath(windows, extensionDevelopmentPaths) {
    const matches = (uriString) => {
        return extensionDevelopmentPaths.some(path => extUriBiasedIgnorePathCase.isEqual(URI.file(path), URI.file(uriString)));
    };
    for (const window of windows) {
        if (window.config?.extensionDevelopmentPath?.some(path => matches(path))) {
            return window;
        }
    }
    return undefined;
}
