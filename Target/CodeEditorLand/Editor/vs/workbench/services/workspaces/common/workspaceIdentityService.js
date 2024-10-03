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
        const currentWorkspaceFoldersToIdentities = new Map();
        for (const workspaceFolder of this.workspaceContextService.getWorkspace().folders) {
            const workspaceFolderIdentity = await this.editSessionIdentityService.getEditSessionIdentifier(workspaceFolder, cancellationToken);
            if (!workspaceFolderIdentity) {
                continue;
            }
            currentWorkspaceFoldersToIdentities.set(workspaceFolder, workspaceFolderIdentity);
        }
        for (const [currentWorkspaceFolder, currentWorkspaceFolderIdentity] of currentWorkspaceFoldersToIdentities.entries()) {
            const incomingWorkspaceFolder = incomingIdentitiesToIncomingWorkspaceFolders[currentWorkspaceFolderIdentity];
            if (incomingWorkspaceFolder) {
                incomingToCurrentWorkspaceFolderUris[incomingWorkspaceFolder] = currentWorkspaceFolder.uri.toString();
                continue;
            }
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
            for (const incomingFolderUriKey of Object.keys(incomingToCurrentWorkspaceFolderUris)) {
                const incomingFolderUri = URI.parse(incomingFolderUriKey);
                if (isEqualOrParent(incomingFolderUri, uriToConvert)) {
                    const currentWorkspaceFolderUri = incomingToCurrentWorkspaceFolderUris[incomingFolderUriKey];
                    const relativeFilePath = relativePath(incomingFolderUri, uriToConvert);
                    if (relativeFilePath) {
                        return joinPath(URI.parse(currentWorkspaceFolderUri), relativeFilePath);
                    }
                }
            }
            return uriToConvert;
        };
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
registerSingleton(IWorkspaceIdentityService, WorkspaceIdentityService, 1);
