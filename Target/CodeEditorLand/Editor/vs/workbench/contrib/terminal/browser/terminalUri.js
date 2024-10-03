import { Schemas } from '../../../../base/common/network.js';
import { URI } from '../../../../base/common/uri.js';
export function parseTerminalUri(resource) {
    const [, workspaceId, instanceId] = resource.path.split('/');
    if (!workspaceId || !Number.parseInt(instanceId)) {
        throw new Error(`Could not parse terminal uri for resource ${resource}`);
    }
    return { workspaceId, instanceId: Number.parseInt(instanceId) };
}
export function getTerminalUri(workspaceId, instanceId, title) {
    return URI.from({
        scheme: Schemas.vscodeTerminal,
        path: `/${workspaceId}/${instanceId}`,
        fragment: title || undefined,
    });
}
export function getTerminalResourcesFromDragEvent(event) {
    const resources = event.dataTransfer?.getData("Terminals");
    if (resources) {
        const json = JSON.parse(resources);
        const result = [];
        for (const entry of json) {
            result.push(URI.parse(entry));
        }
        return result.length === 0 ? undefined : result;
    }
    return undefined;
}
export function getInstanceFromResource(instances, resource) {
    if (resource) {
        for (const instance of instances) {
            if (instance.resource.path === resource.path) {
                return instance;
            }
        }
    }
    return undefined;
}
