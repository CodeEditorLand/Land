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
var WorkspacesHistoryMainService_1;
import { app } from 'electron';
import { coalesce } from '../../../base/common/arrays.js';
import { ThrottledDelayer } from '../../../base/common/async.js';
import { Emitter } from '../../../base/common/event.js';
import { normalizeDriveLetter, splitRecentLabel } from '../../../base/common/labels.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { Schemas } from '../../../base/common/network.js';
import { isMacintosh, isWindows } from '../../../base/common/platform.js';
import { basename, extUriBiasedIgnorePathCase, originalFSPath } from '../../../base/common/resources.js';
import { URI } from '../../../base/common/uri.js';
import { Promises } from '../../../base/node/pfs.js';
import { localize } from '../../../nls.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { ILifecycleMainService } from '../../lifecycle/electron-main/lifecycleMainService.js';
import { ILogService } from '../../log/common/log.js';
import { IApplicationStorageMainService } from '../../storage/electron-main/storageMainService.js';
import { isRecentFile, isRecentFolder, isRecentWorkspace, restoreRecentlyOpened, toStoreData } from '../common/workspaces.js';
import { WORKSPACE_EXTENSION } from '../../workspace/common/workspace.js';
import { IWorkspacesManagementMainService } from './workspacesManagementMainService.js';
import { ResourceMap } from '../../../base/common/map.js';
import { IDialogMainService } from '../../dialogs/electron-main/dialogMainService.js';
export const IWorkspacesHistoryMainService = createDecorator('workspacesHistoryMainService');
let WorkspacesHistoryMainService = class WorkspacesHistoryMainService extends Disposable {
    static { WorkspacesHistoryMainService_1 = this; }
    static { this.MAX_TOTAL_RECENT_ENTRIES = 500; }
    static { this.RECENTLY_OPENED_STORAGE_KEY = 'history.recentlyOpenedPathsList'; }
    constructor(logService, workspacesManagementMainService, lifecycleMainService, applicationStorageMainService, dialogMainService) {
        super();
        this.logService = logService;
        this.workspacesManagementMainService = workspacesManagementMainService;
        this.lifecycleMainService = lifecycleMainService;
        this.applicationStorageMainService = applicationStorageMainService;
        this.dialogMainService = dialogMainService;
        this._onDidChangeRecentlyOpened = this._register(new Emitter());
        this.onDidChangeRecentlyOpened = this._onDidChangeRecentlyOpened.event;
        this.macOSRecentDocumentsUpdater = this._register(new ThrottledDelayer(800));
        this.registerListeners();
    }
    registerListeners() {
        this.lifecycleMainService.when(4).then(() => this.handleWindowsJumpList());
        this._register(this.workspacesManagementMainService.onDidEnterWorkspace(event => this.addRecentlyOpened([{ workspace: event.workspace, remoteAuthority: event.window.remoteAuthority }])));
    }
    async addRecentlyOpened(recentToAdd) {
        let workspaces = [];
        let files = [];
        for (const recent of recentToAdd) {
            if (isRecentWorkspace(recent)) {
                if (!this.workspacesManagementMainService.isUntitledWorkspace(recent.workspace) && !this.containsWorkspace(workspaces, recent.workspace)) {
                    workspaces.push(recent);
                }
            }
            else if (isRecentFolder(recent)) {
                if (!this.containsFolder(workspaces, recent.folderUri)) {
                    workspaces.push(recent);
                }
            }
            else {
                const alreadyExistsInHistory = this.containsFile(files, recent.fileUri);
                const shouldBeFiltered = recent.fileUri.scheme === Schemas.file && WorkspacesHistoryMainService_1.COMMON_FILES_FILTER.indexOf(basename(recent.fileUri)) >= 0;
                if (!alreadyExistsInHistory && !shouldBeFiltered) {
                    files.push(recent);
                    if (isWindows && recent.fileUri.scheme === Schemas.file) {
                        app.addRecentDocument(recent.fileUri.fsPath);
                    }
                }
            }
        }
        const mergedEntries = await this.mergeEntriesFromStorage({ workspaces, files });
        workspaces = mergedEntries.workspaces;
        files = mergedEntries.files;
        if (workspaces.length > WorkspacesHistoryMainService_1.MAX_TOTAL_RECENT_ENTRIES) {
            workspaces.length = WorkspacesHistoryMainService_1.MAX_TOTAL_RECENT_ENTRIES;
        }
        if (files.length > WorkspacesHistoryMainService_1.MAX_TOTAL_RECENT_ENTRIES) {
            files.length = WorkspacesHistoryMainService_1.MAX_TOTAL_RECENT_ENTRIES;
        }
        await this.saveRecentlyOpened({ workspaces, files });
        this._onDidChangeRecentlyOpened.fire();
        if (isMacintosh) {
            this.macOSRecentDocumentsUpdater.trigger(() => this.updateMacOSRecentDocuments());
        }
    }
    async removeRecentlyOpened(recentToRemove) {
        const keep = (recent) => {
            const uri = this.location(recent);
            for (const resourceToRemove of recentToRemove) {
                if (extUriBiasedIgnorePathCase.isEqual(resourceToRemove, uri)) {
                    return false;
                }
            }
            return true;
        };
        const mru = await this.getRecentlyOpened();
        const workspaces = mru.workspaces.filter(keep);
        const files = mru.files.filter(keep);
        if (workspaces.length !== mru.workspaces.length || files.length !== mru.files.length) {
            await this.saveRecentlyOpened({ files, workspaces });
            this._onDidChangeRecentlyOpened.fire();
            if (isMacintosh) {
                this.macOSRecentDocumentsUpdater.trigger(() => this.updateMacOSRecentDocuments());
            }
        }
    }
    async clearRecentlyOpened(options) {
        if (options?.confirm) {
            const { response } = await this.dialogMainService.showMessageBox({
                type: 'warning',
                buttons: [
                    localize({ key: 'clearButtonLabel', comment: ['&& denotes a mnemonic'] }, "&&Clear"),
                    localize({ key: 'cancel', comment: ['&& denotes a mnemonic'] }, "&&Cancel")
                ],
                message: localize('confirmClearRecentsMessage', "Do you want to clear all recently opened files and workspaces?"),
                detail: localize('confirmClearDetail', "This action is irreversible!"),
                cancelId: 1
            });
            if (response !== 0) {
                return;
            }
        }
        await this.saveRecentlyOpened({ workspaces: [], files: [] });
        app.clearRecentDocuments();
        this._onDidChangeRecentlyOpened.fire();
    }
    async getRecentlyOpened() {
        return this.mergeEntriesFromStorage();
    }
    async mergeEntriesFromStorage(existingEntries) {
        const mapWorkspaceIdToWorkspace = new ResourceMap(uri => extUriBiasedIgnorePathCase.getComparisonKey(uri));
        if (existingEntries?.workspaces) {
            for (const workspace of existingEntries.workspaces) {
                mapWorkspaceIdToWorkspace.set(this.location(workspace), workspace);
            }
        }
        const mapFileIdToFile = new ResourceMap(uri => extUriBiasedIgnorePathCase.getComparisonKey(uri));
        if (existingEntries?.files) {
            for (const file of existingEntries.files) {
                mapFileIdToFile.set(this.location(file), file);
            }
        }
        const recentFromStorage = await this.getRecentlyOpenedFromStorage();
        for (const recentWorkspaceFromStorage of recentFromStorage.workspaces) {
            const existingRecentWorkspace = mapWorkspaceIdToWorkspace.get(this.location(recentWorkspaceFromStorage));
            if (existingRecentWorkspace) {
                existingRecentWorkspace.label = existingRecentWorkspace.label ?? recentWorkspaceFromStorage.label;
            }
            else {
                mapWorkspaceIdToWorkspace.set(this.location(recentWorkspaceFromStorage), recentWorkspaceFromStorage);
            }
        }
        for (const recentFileFromStorage of recentFromStorage.files) {
            const existingRecentFile = mapFileIdToFile.get(this.location(recentFileFromStorage));
            if (existingRecentFile) {
                existingRecentFile.label = existingRecentFile.label ?? recentFileFromStorage.label;
            }
            else {
                mapFileIdToFile.set(this.location(recentFileFromStorage), recentFileFromStorage);
            }
        }
        return {
            workspaces: [...mapWorkspaceIdToWorkspace.values()],
            files: [...mapFileIdToFile.values()]
        };
    }
    async getRecentlyOpenedFromStorage() {
        await this.applicationStorageMainService.whenReady;
        let storedRecentlyOpened = undefined;
        const storedRecentlyOpenedRaw = this.applicationStorageMainService.get(WorkspacesHistoryMainService_1.RECENTLY_OPENED_STORAGE_KEY, -1);
        if (typeof storedRecentlyOpenedRaw === 'string') {
            try {
                storedRecentlyOpened = JSON.parse(storedRecentlyOpenedRaw);
            }
            catch (error) {
                this.logService.error('Unexpected error parsing opened paths list', error);
            }
        }
        return restoreRecentlyOpened(storedRecentlyOpened, this.logService);
    }
    async saveRecentlyOpened(recent) {
        await this.applicationStorageMainService.whenReady;
        this.applicationStorageMainService.store(WorkspacesHistoryMainService_1.RECENTLY_OPENED_STORAGE_KEY, JSON.stringify(toStoreData(recent)), -1, 1);
    }
    location(recent) {
        if (isRecentFolder(recent)) {
            return recent.folderUri;
        }
        if (isRecentFile(recent)) {
            return recent.fileUri;
        }
        return recent.workspace.configPath;
    }
    containsWorkspace(recents, candidate) {
        return !!recents.find(recent => isRecentWorkspace(recent) && recent.workspace.id === candidate.id);
    }
    containsFolder(recents, candidate) {
        return !!recents.find(recent => isRecentFolder(recent) && extUriBiasedIgnorePathCase.isEqual(recent.folderUri, candidate));
    }
    containsFile(recents, candidate) {
        return !!recents.find(recent => extUriBiasedIgnorePathCase.isEqual(recent.fileUri, candidate));
    }
    static { this.MAX_MACOS_DOCK_RECENT_WORKSPACES = 7; }
    static { this.MAX_MACOS_DOCK_RECENT_ENTRIES_TOTAL = 10; }
    static { this.MAX_WINDOWS_JUMP_LIST_ENTRIES = 7; }
    static { this.COMMON_FILES_FILTER = [
        'COMMIT_EDITMSG',
        'MERGE_MSG',
        'git-rebase-todo'
    ]; }
    async handleWindowsJumpList() {
        if (!isWindows) {
            return;
        }
        await this.updateWindowsJumpList();
        this._register(this.onDidChangeRecentlyOpened(() => this.updateWindowsJumpList()));
    }
    async updateWindowsJumpList() {
        if (!isWindows) {
            return;
        }
        const jumpList = [];
        jumpList.push({
            type: 'tasks',
            items: [
                {
                    type: 'task',
                    title: localize('newWindow', "New Window"),
                    description: localize('newWindowDesc', "Opens a new window"),
                    program: process.execPath,
                    args: '-n',
                    iconPath: process.execPath,
                    iconIndex: 0
                }
            ]
        });
        if ((await this.getRecentlyOpened()).workspaces.length > 0) {
            const toRemove = [];
            for (const item of app.getJumpListSettings().removedItems) {
                const args = item.args;
                if (args) {
                    const match = /^--(folder|file)-uri\s+"([^"]+)"$/.exec(args);
                    if (match) {
                        toRemove.push(URI.parse(match[2]));
                    }
                }
            }
            await this.removeRecentlyOpened(toRemove);
            let hasWorkspaces = false;
            const items = coalesce((await this.getRecentlyOpened()).workspaces.slice(0, WorkspacesHistoryMainService_1.MAX_WINDOWS_JUMP_LIST_ENTRIES).map(recent => {
                const workspace = isRecentWorkspace(recent) ? recent.workspace : recent.folderUri;
                const { title, description } = this.getWindowsJumpListLabel(workspace, recent.label);
                let args;
                if (URI.isUri(workspace)) {
                    args = `--folder-uri "${workspace.toString()}"`;
                }
                else {
                    hasWorkspaces = true;
                    args = `--file-uri "${workspace.configPath.toString()}"`;
                }
                return {
                    type: 'task',
                    title: title.substr(0, 255),
                    description: description.substr(0, 255),
                    program: process.execPath,
                    args,
                    iconPath: 'explorer.exe',
                    iconIndex: 0
                };
            }));
            if (items.length > 0) {
                jumpList.push({
                    type: 'custom',
                    name: hasWorkspaces ? localize('recentFoldersAndWorkspaces', "Recent Folders & Workspaces") : localize('recentFolders', "Recent Folders"),
                    items
                });
            }
        }
        jumpList.push({
            type: 'recent'
        });
        try {
            const res = app.setJumpList(jumpList);
            if (res && res !== 'ok') {
                this.logService.warn(`updateWindowsJumpList#setJumpList unexpected result: ${res}`);
            }
        }
        catch (error) {
            this.logService.warn('updateWindowsJumpList#setJumpList', error);
        }
    }
    getWindowsJumpListLabel(workspace, recentLabel) {
        if (recentLabel) {
            return { title: splitRecentLabel(recentLabel).name, description: recentLabel };
        }
        if (URI.isUri(workspace)) {
            return { title: basename(workspace), description: this.renderJumpListPathDescription(workspace) };
        }
        if (this.workspacesManagementMainService.isUntitledWorkspace(workspace)) {
            return { title: localize('untitledWorkspace', "Untitled (Workspace)"), description: '' };
        }
        let filename = basename(workspace.configPath);
        if (filename.endsWith(WORKSPACE_EXTENSION)) {
            filename = filename.substr(0, filename.length - WORKSPACE_EXTENSION.length - 1);
        }
        return { title: localize('workspaceName', "{0} (Workspace)", filename), description: this.renderJumpListPathDescription(workspace.configPath) };
    }
    renderJumpListPathDescription(uri) {
        return uri.scheme === 'file' ? normalizeDriveLetter(uri.fsPath) : uri.toString();
    }
    async updateMacOSRecentDocuments() {
        if (!isMacintosh) {
            return;
        }
        app.clearRecentDocuments();
        const mru = await this.getRecentlyOpened();
        const workspaceEntries = [];
        let entries = 0;
        for (let i = 0; i < mru.workspaces.length && entries < WorkspacesHistoryMainService_1.MAX_MACOS_DOCK_RECENT_WORKSPACES; i++) {
            const loc = this.location(mru.workspaces[i]);
            if (loc.scheme === Schemas.file) {
                const workspacePath = originalFSPath(loc);
                if (await Promises.exists(workspacePath)) {
                    workspaceEntries.push(workspacePath);
                    entries++;
                }
            }
        }
        const fileEntries = [];
        for (let i = 0; i < mru.files.length && entries < WorkspacesHistoryMainService_1.MAX_MACOS_DOCK_RECENT_ENTRIES_TOTAL; i++) {
            const loc = this.location(mru.files[i]);
            if (loc.scheme === Schemas.file) {
                const filePath = originalFSPath(loc);
                if (WorkspacesHistoryMainService_1.COMMON_FILES_FILTER.includes(basename(loc)) ||
                    workspaceEntries.includes(filePath)) {
                    continue;
                }
                if (await Promises.exists(filePath)) {
                    fileEntries.push(filePath);
                    entries++;
                }
            }
        }
        fileEntries.reverse().forEach(fileEntry => app.addRecentDocument(fileEntry));
        workspaceEntries.reverse().forEach(workspaceEntry => app.addRecentDocument(workspaceEntry));
    }
};
WorkspacesHistoryMainService = WorkspacesHistoryMainService_1 = __decorate([
    __param(0, ILogService),
    __param(1, IWorkspacesManagementMainService),
    __param(2, ILifecycleMainService),
    __param(3, IApplicationStorageMainService),
    __param(4, IDialogMainService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], WorkspacesHistoryMainService);
export { WorkspacesHistoryMainService };
