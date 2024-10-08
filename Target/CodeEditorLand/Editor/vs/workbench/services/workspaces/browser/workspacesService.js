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
var BrowserWorkspacesService_1;
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IWorkspacesService, restoreRecentlyOpened, isRecentFile, isRecentFolder, toStoreData, getStoredWorkspaceFolder, isRecentWorkspace } from '../../../../platform/workspaces/common/workspaces.js';
import { Emitter } from '../../../../base/common/event.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { isTemporaryWorkspace, IWorkspaceContextService, WORKSPACE_EXTENSION } from '../../../../platform/workspace/common/workspace.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { getWorkspaceIdentifier } from './workspaces.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { joinPath } from '../../../../base/common/resources.js';
import { VSBuffer } from '../../../../base/common/buffer.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { Schemas } from '../../../../base/common/network.js';
let BrowserWorkspacesService = class BrowserWorkspacesService extends Disposable {
    static { BrowserWorkspacesService_1 = this; }
    static { this.RECENTLY_OPENED_KEY = 'recently.opened'; }
    constructor(storageService, contextService, logService, fileService, environmentService, uriIdentityService) {
        super();
        this.storageService = storageService;
        this.contextService = contextService;
        this.logService = logService;
        this.fileService = fileService;
        this.environmentService = environmentService;
        this.uriIdentityService = uriIdentityService;
        this._onRecentlyOpenedChange = this._register(new Emitter());
        this.onDidChangeRecentlyOpened = this._onRecentlyOpenedChange.event;
        // Opening a workspace should push it as most
        // recently used to the workspaces history
        this.addWorkspaceToRecentlyOpened();
        this.registerListeners();
    }
    registerListeners() {
        // Storage
        this._register(this.storageService.onDidChangeValue(-1 /* StorageScope.APPLICATION */, BrowserWorkspacesService_1.RECENTLY_OPENED_KEY, this._register(new DisposableStore()))(() => this._onRecentlyOpenedChange.fire()));
        // Workspace
        this._register(this.contextService.onDidChangeWorkspaceFolders(e => this.onDidChangeWorkspaceFolders(e)));
    }
    onDidChangeWorkspaceFolders(e) {
        if (!isTemporaryWorkspace(this.contextService.getWorkspace())) {
            return;
        }
        // When in a temporary workspace, make sure to track folder changes
        // in the history so that these can later be restored.
        for (const folder of e.added) {
            this.addRecentlyOpened([{ folderUri: folder.uri }]);
        }
    }
    addWorkspaceToRecentlyOpened() {
        const workspace = this.contextService.getWorkspace();
        const remoteAuthority = this.environmentService.remoteAuthority;
        switch (this.contextService.getWorkbenchState()) {
            case 2 /* WorkbenchState.FOLDER */:
                this.addRecentlyOpened([{ folderUri: workspace.folders[0].uri, remoteAuthority }]);
                break;
            case 3 /* WorkbenchState.WORKSPACE */:
                this.addRecentlyOpened([{ workspace: { id: workspace.id, configPath: workspace.configuration }, remoteAuthority }]);
                break;
        }
    }
    //#region Workspaces History
    async getRecentlyOpened() {
        const recentlyOpenedRaw = this.storageService.get(BrowserWorkspacesService_1.RECENTLY_OPENED_KEY, -1 /* StorageScope.APPLICATION */);
        if (recentlyOpenedRaw) {
            const recentlyOpened = restoreRecentlyOpened(JSON.parse(recentlyOpenedRaw), this.logService);
            recentlyOpened.workspaces = recentlyOpened.workspaces.filter(recent => {
                // In web, unless we are in a temporary workspace, we cannot support
                // to switch to local folders because this would require a window
                // reload and local file access only works with explicit user gesture
                // from the current session.
                if (isRecentFolder(recent) && recent.folderUri.scheme === Schemas.file && !isTemporaryWorkspace(this.contextService.getWorkspace())) {
                    return false;
                }
                // Never offer temporary workspaces in the history
                if (isRecentWorkspace(recent) && isTemporaryWorkspace(recent.workspace.configPath)) {
                    return false;
                }
                return true;
            });
            return recentlyOpened;
        }
        return { workspaces: [], files: [] };
    }
    async addRecentlyOpened(recents) {
        const recentlyOpened = await this.getRecentlyOpened();
        for (const recent of recents) {
            if (isRecentFile(recent)) {
                this.doRemoveRecentlyOpened(recentlyOpened, [recent.fileUri]);
                recentlyOpened.files.unshift(recent);
            }
            else if (isRecentFolder(recent)) {
                this.doRemoveRecentlyOpened(recentlyOpened, [recent.folderUri]);
                recentlyOpened.workspaces.unshift(recent);
            }
            else {
                this.doRemoveRecentlyOpened(recentlyOpened, [recent.workspace.configPath]);
                recentlyOpened.workspaces.unshift(recent);
            }
        }
        return this.saveRecentlyOpened(recentlyOpened);
    }
    async removeRecentlyOpened(paths) {
        const recentlyOpened = await this.getRecentlyOpened();
        this.doRemoveRecentlyOpened(recentlyOpened, paths);
        return this.saveRecentlyOpened(recentlyOpened);
    }
    doRemoveRecentlyOpened(recentlyOpened, paths) {
        recentlyOpened.files = recentlyOpened.files.filter(file => {
            return !paths.some(path => path.toString() === file.fileUri.toString());
        });
        recentlyOpened.workspaces = recentlyOpened.workspaces.filter(workspace => {
            return !paths.some(path => path.toString() === (isRecentFolder(workspace) ? workspace.folderUri.toString() : workspace.workspace.configPath.toString()));
        });
    }
    async saveRecentlyOpened(data) {
        return this.storageService.store(BrowserWorkspacesService_1.RECENTLY_OPENED_KEY, JSON.stringify(toStoreData(data)), -1 /* StorageScope.APPLICATION */, 0 /* StorageTarget.USER */);
    }
    async clearRecentlyOpened() {
        this.storageService.remove(BrowserWorkspacesService_1.RECENTLY_OPENED_KEY, -1 /* StorageScope.APPLICATION */);
    }
    //#endregion
    //#region Workspace Management
    async enterWorkspace(workspaceUri) {
        return { workspace: await this.getWorkspaceIdentifier(workspaceUri) };
    }
    async createUntitledWorkspace(folders, remoteAuthority) {
        const randomId = (Date.now() + Math.round(Math.random() * 1000)).toString();
        const newUntitledWorkspacePath = joinPath(this.environmentService.untitledWorkspacesHome, `Untitled-${randomId}.${WORKSPACE_EXTENSION}`);
        // Build array of workspace folders to store
        const storedWorkspaceFolder = [];
        if (folders) {
            for (const folder of folders) {
                storedWorkspaceFolder.push(getStoredWorkspaceFolder(folder.uri, true, folder.name, this.environmentService.untitledWorkspacesHome, this.uriIdentityService.extUri));
            }
        }
        // Store at untitled workspaces location
        const storedWorkspace = { folders: storedWorkspaceFolder, remoteAuthority };
        await this.fileService.writeFile(newUntitledWorkspacePath, VSBuffer.fromString(JSON.stringify(storedWorkspace, null, '\t')));
        return this.getWorkspaceIdentifier(newUntitledWorkspacePath);
    }
    async deleteUntitledWorkspace(workspace) {
        try {
            await this.fileService.del(workspace.configPath);
        }
        catch (error) {
            if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                throw error; // re-throw any other error than file not found which is OK
            }
        }
    }
    async getWorkspaceIdentifier(workspaceUri) {
        return getWorkspaceIdentifier(workspaceUri);
    }
    //#endregion
    //#region Dirty Workspaces
    async getDirtyWorkspaces() {
        return []; // Currently not supported in web
    }
};
BrowserWorkspacesService = BrowserWorkspacesService_1 = __decorate([
    __param(0, IStorageService),
    __param(1, IWorkspaceContextService),
    __param(2, ILogService),
    __param(3, IFileService),
    __param(4, IWorkbenchEnvironmentService),
    __param(5, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], BrowserWorkspacesService);
export { BrowserWorkspacesService };
registerSingleton(IWorkspacesService, BrowserWorkspacesService, 1 /* InstantiationType.Delayed */);
