import { ExtensionIdentifierMap } from '../../../../platform/extensions/common/extensions.js';
import { localize } from '../../../../nls.js';
import * as semver from '../../../../base/common/semver/semver.js';
export function dedupExtensions(system, user, workspace, development, logService) {
    const result = new ExtensionIdentifierMap();
    system.forEach((systemExtension) => {
        const extension = result.get(systemExtension.identifier);
        if (extension) {
            logService.warn(localize('overwritingExtension', "Overwriting extension {0} with {1}.", extension.extensionLocation.fsPath, systemExtension.extensionLocation.fsPath));
        }
        result.set(systemExtension.identifier, systemExtension);
    });
    user.forEach((userExtension) => {
        const extension = result.get(userExtension.identifier);
        if (extension) {
            if (extension.isBuiltin) {
                if (semver.gte(extension.version, userExtension.version)) {
                    logService.warn(`Skipping extension ${userExtension.extensionLocation.path} in favour of the builtin extension ${extension.extensionLocation.path}.`);
                    return;
                }
                userExtension.isBuiltin = true;
            }
            else {
                logService.warn(localize('overwritingExtension', "Overwriting extension {0} with {1}.", extension.extensionLocation.fsPath, userExtension.extensionLocation.fsPath));
            }
        }
        else if (userExtension.isBuiltin) {
            logService.warn(`Skipping obsolete builtin extension ${userExtension.extensionLocation.path}`);
            return;
        }
        result.set(userExtension.identifier, userExtension);
    });
    workspace.forEach(workspaceExtension => {
        const extension = result.get(workspaceExtension.identifier);
        if (extension) {
            logService.warn(localize('overwritingWithWorkspaceExtension', "Overwriting {0} with Workspace Extension {1}.", extension.extensionLocation.fsPath, workspaceExtension.extensionLocation.fsPath));
        }
        result.set(workspaceExtension.identifier, workspaceExtension);
    });
    development.forEach(developedExtension => {
        logService.info(localize('extensionUnderDevelopment', "Loading development extension at {0}", developedExtension.extensionLocation.fsPath));
        const extension = result.get(developedExtension.identifier);
        if (extension) {
            if (extension.isBuiltin) {
                developedExtension.isBuiltin = true;
            }
        }
        result.set(developedExtension.identifier, developedExtension);
    });
    return Array.from(result.values());
}
