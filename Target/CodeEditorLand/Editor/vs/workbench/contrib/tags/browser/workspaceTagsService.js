import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IWorkspaceTagsService } from '../common/workspaceTags.js';
export class NoOpWorkspaceTagsService {
    getTags() {
        return Promise.resolve({});
    }
    async getTelemetryWorkspaceId(workspace, state) {
        return undefined;
    }
    getHashedRemotesFromUri(workspaceUri, stripEndingDotGit) {
        return Promise.resolve([]);
    }
}
registerSingleton(IWorkspaceTagsService, NoOpWorkspaceTagsService, 1);
