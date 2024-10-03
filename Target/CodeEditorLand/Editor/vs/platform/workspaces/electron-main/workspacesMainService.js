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
import { IBackupMainService } from '../../backup/electron-main/backup.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
import { IWorkspacesHistoryMainService } from './workspacesHistoryMainService.js';
import { IWorkspacesManagementMainService } from './workspacesManagementMainService.js';
let WorkspacesMainService = class WorkspacesMainService {
    constructor(workspacesManagementMainService, windowsMainService, workspacesHistoryMainService, backupMainService) {
        this.workspacesManagementMainService = workspacesManagementMainService;
        this.windowsMainService = windowsMainService;
        this.workspacesHistoryMainService = workspacesHistoryMainService;
        this.backupMainService = backupMainService;
        this.onDidChangeRecentlyOpened = this.workspacesHistoryMainService.onDidChangeRecentlyOpened;
    }
    async enterWorkspace(windowId, path) {
        const window = this.windowsMainService.getWindowById(windowId);
        if (window) {
            return this.workspacesManagementMainService.enterWorkspace(window, this.windowsMainService.getWindows(), path);
        }
        return undefined;
    }
    createUntitledWorkspace(windowId, folders, remoteAuthority) {
        return this.workspacesManagementMainService.createUntitledWorkspace(folders, remoteAuthority);
    }
    deleteUntitledWorkspace(windowId, workspace) {
        return this.workspacesManagementMainService.deleteUntitledWorkspace(workspace);
    }
    getWorkspaceIdentifier(windowId, workspacePath) {
        return this.workspacesManagementMainService.getWorkspaceIdentifier(workspacePath);
    }
    getRecentlyOpened(windowId) {
        return this.workspacesHistoryMainService.getRecentlyOpened();
    }
    addRecentlyOpened(windowId, recents) {
        return this.workspacesHistoryMainService.addRecentlyOpened(recents);
    }
    removeRecentlyOpened(windowId, paths) {
        return this.workspacesHistoryMainService.removeRecentlyOpened(paths);
    }
    clearRecentlyOpened(windowId) {
        return this.workspacesHistoryMainService.clearRecentlyOpened();
    }
    async getDirtyWorkspaces() {
        return this.backupMainService.getDirtyWorkspaces();
    }
};
WorkspacesMainService = __decorate([
    __param(0, IWorkspacesManagementMainService),
    __param(1, IWindowsMainService),
    __param(2, IWorkspacesHistoryMainService),
    __param(3, IBackupMainService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], WorkspacesMainService);
export { WorkspacesMainService };
