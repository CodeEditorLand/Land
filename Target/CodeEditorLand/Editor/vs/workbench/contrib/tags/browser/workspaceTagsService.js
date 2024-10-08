/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
registerSingleton(IWorkspaceTagsService, NoOpWorkspaceTagsService, 1 /* InstantiationType.Delayed */);
