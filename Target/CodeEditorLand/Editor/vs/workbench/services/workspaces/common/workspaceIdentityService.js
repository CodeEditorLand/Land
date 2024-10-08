/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { VSBuffer } from '../../../../base/common/buffer.js';
import { isEqualOrParent, joinPath, relativePath } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { EditSessionIdentityMatch, IEditSessionIdentityService } from '../../../../platform/workspace/common/editSessions.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
export const IWorkspaceIdentityService = createDecorator('IWorkspaceIdentityService');
let WorkspaceIdentityService = class WorkspaceIdentityService {
    constructor(workspaceContextService, editSessionIdentityService) {
        this.workspaceContextService = workspaceContextService;
        this.editSessionIdentityService = editSessionIdentityService;
    }
    async getWorkspaceStateFolders(cancellationToken) {
        const workspaceStateFolders = [];
        for (const workspaceFolder of this.workspaceContextService.getWorkspace().folders) {
            const workspaceFolderIdentity = await this.editSessionIdentityService.getEditSessionIdentifier(workspaceFolder, cancellationToken);
            if (!workspaceFolderIdentity) {
                continue;
            }
            workspaceStateFolders.push({ resourceUri: workspaceFolder.uri.toString(), workspaceFolderIdentity });
        }
        return workspaceStateFolders;
    }
    async matches(incomingWorkspaceFolders, cancellationToken) {
        const incomingToCurrentWorkspaceFolderUris = {};
        const incomingIdentitiesToIncomingWorkspaceFolders = {};
        for (const workspaceFolder of incomingWorkspaceFolders) {
            incomingIdentitiesToIncomingWorkspaceFolders[workspaceFolder.workspaceFolderIdentity] = workspaceFolder.resourceUri;
        }
        // Precompute the identities of the current workspace folders
        const currentWorkspaceFoldersToIdentities = new Map();
        for (const workspaceFolder of this.workspaceContextService.getWorkspace().folders) {
            const workspaceFolderIdentity = await this.editSessionIdentityService.getEditSessionIdentifier(workspaceFolder, cancellationToken);
            if (!workspaceFolderIdentity) {
                continue;
            }
            currentWorkspaceFoldersToIdentities.set(workspaceFolder, workspaceFolderIdentity);
        }
        // Match the current workspace folders to the incoming workspace folders
        for (const [currentWorkspaceFolder, currentWorkspaceFolderIdentity] of currentWorkspaceFoldersToIdentities.entries()) {
            // Happy case: identities do not need further disambiguation
            const incomingWorkspaceFolder = incomingIdentitiesToIncomingWorkspaceFolders[currentWorkspaceFolderIdentity];
            if (incomingWorkspaceFolder) {
                // There is an incoming workspace folder with the exact same identity as the current workspace folder
                incomingToCurrentWorkspaceFolderUris[incomingWorkspaceFolder] = currentWorkspaceFolder.uri.toString();
                continue;
            }
            // Unhappy case: compare the identity of the current workspace folder to all incoming workspace folder identities
            let hasCompleteMatch = false;
            for (const [incomingIdentity, incomingFolder] of Object.entries(incomingIdentitiesToIncomingWorkspaceFolders)) {
                if (await this.editSessionIdentityService.provideEditSessionIdentityMatch(currentWorkspaceFolder, currentWorkspaceFolderIdentity, incomingIdentity, cancellationToken) === EditSessionIdentityMatch.Complete) {
                    incomingToCurrentWorkspaceFolderUris[incomingFolder] = currentWorkspaceFolder.uri.toString();
                    hasCompleteMatch = true;
                    break;
                }
            }
            if (hasCompleteMatch) {
                continue;
            }
            return false;
        }
        const convertUri = (uriToConvert) => {
            // Figure out which current folder the incoming URI is a child of
            for (const incomingFolderUriKey of Object.keys(incomingToCurrentWorkspaceFolderUris)) {
                const incomingFolderUri = URI.parse(incomingFolderUriKey);
                if (isEqualOrParent(incomingFolderUri, uriToConvert)) {
                    const currentWorkspaceFolderUri = incomingToCurrentWorkspaceFolderUris[incomingFolderUriKey];
                    // Compute the relative file path section of the uri to convert relative to the folder it came from
                    const relativeFilePath = relativePath(incomingFolderUri, uriToConvert);
                    // Reparent the relative file path under the current workspace folder it belongs to
                    if (relativeFilePath) {
                        return joinPath(URI.parse(currentWorkspaceFolderUri), relativeFilePath);
                    }
                }
            }
            // No conversion was possible; return the original URI
            return uriToConvert;
        };
        // Recursively look for any URIs in the provided object and
        // replace them with the URIs of the current workspace folders
        const uriReplacer = (obj, depth = 0) => {
            if (!obj || depth > 200) {
                return obj;
            }
            if (obj instanceof VSBuffer || obj instanceof Uint8Array) {
                return obj;
            }
            if (URI.isUri(obj)) {
                return convertUri(obj);
            }
            if (Array.isArray(obj)) {
                for (let i = 0; i < obj.length; ++i) {
                    obj[i] = uriReplacer(obj[i], depth + 1);
                }
            }
            else {
                // walk object
                for (const key in obj) {
                    if (Object.hasOwnProperty.call(obj, key)) {
                        obj[key] = uriReplacer(obj[key], depth + 1);
                    }
                }
            }
            return obj;
        };
        return uriReplacer;
    }
};
WorkspaceIdentityService = __decorate([
    __param(0, IWorkspaceContextService),
    __param(1, IEditSessionIdentityService),
    __metadata("design:paramtypes", [Object, Object])
], WorkspaceIdentityService);
export { WorkspaceIdentityService };
registerSingleton(IWorkspaceIdentityService, WorkspaceIdentityService, 1 /* InstantiationType.Delayed */);
