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
import * as fs from 'fs';
import electron from 'electron';
import { Emitter } from '../../../base/common/event.js';
import { parse } from '../../../base/common/json.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { Schemas } from '../../../base/common/network.js';
import { dirname, join } from '../../../base/common/path.js';
import { basename, extUriBiasedIgnorePathCase, joinPath, originalFSPath } from '../../../base/common/resources.js';
import { Promises } from '../../../base/node/pfs.js';
import { localize } from '../../../nls.js';
import { IBackupMainService } from '../../backup/electron-main/backup.js';
import { IDialogMainService } from '../../dialogs/electron-main/dialogMainService.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { ILogService } from '../../log/common/log.js';
import { IUserDataProfilesMainService } from '../../userDataProfile/electron-main/userDataProfile.js';
import { findWindowOnWorkspaceOrFolder } from '../../windows/electron-main/windowsFinder.js';
import { isWorkspaceIdentifier, hasWorkspaceFileExtension, UNTITLED_WORKSPACE_NAME, isUntitledWorkspace } from '../../workspace/common/workspace.js';
import { getStoredWorkspaceFolder, isStoredWorkspaceFolder, toWorkspaceFolders } from '../common/workspaces.js';
import { getWorkspaceIdentifier } from '../node/workspaces.js';
export const IWorkspacesManagementMainService = createDecorator('workspacesManagementMainService');
let WorkspacesManagementMainService = class WorkspacesManagementMainService extends Disposable {
    constructor(environmentMainService, logService, userDataProfilesMainService, backupMainService, dialogMainService) {
        super();
        this.environmentMainService = environmentMainService;
        this.logService = logService;
        this.userDataProfilesMainService = userDataProfilesMainService;
        this.backupMainService = backupMainService;
        this.dialogMainService = dialogMainService;
        this._onDidDeleteUntitledWorkspace = this._register(new Emitter());
        this.onDidDeleteUntitledWorkspace = this._onDidDeleteUntitledWorkspace.event;
        this._onDidEnterWorkspace = this._register(new Emitter());
        this.onDidEnterWorkspace = this._onDidEnterWorkspace.event;
        this.untitledWorkspacesHome = this.environmentMainService.untitledWorkspacesHome; // local URI that contains all untitled workspaces
        this.untitledWorkspaces = [];
    }
    async initialize() {
        // Reset
        this.untitledWorkspaces = [];
        // Resolve untitled workspaces
        try {
            const untitledWorkspacePaths = (await Promises.readdir(this.untitledWorkspacesHome.with({ scheme: Schemas.file }).fsPath)).map(folder => joinPath(this.untitledWorkspacesHome, folder, UNTITLED_WORKSPACE_NAME));
            for (const untitledWorkspacePath of untitledWorkspacePaths) {
                const workspace = getWorkspaceIdentifier(untitledWorkspacePath);
                const resolvedWorkspace = await this.resolveLocalWorkspace(untitledWorkspacePath);
                if (!resolvedWorkspace) {
                    await this.deleteUntitledWorkspace(workspace);
                }
                else {
                    this.untitledWorkspaces.push({ workspace, remoteAuthority: resolvedWorkspace.remoteAuthority });
                }
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                this.logService.warn(`Unable to read folders in ${this.untitledWorkspacesHome} (${error}).`);
            }
        }
    }
    resolveLocalWorkspace(uri) {
        return this.doResolveLocalWorkspace(uri, path => fs.promises.readFile(path, 'utf8'));
    }
    doResolveLocalWorkspace(uri, contentsFn) {
        if (!this.isWorkspacePath(uri)) {
            return undefined; // does not look like a valid workspace config file
        }
        if (uri.scheme !== Schemas.file) {
            return undefined;
        }
        try {
            const contents = contentsFn(uri.fsPath);
            if (contents instanceof Promise) {
                return contents.then(value => this.doResolveWorkspace(uri, value), error => undefined /* invalid workspace */);
            }
            else {
                return this.doResolveWorkspace(uri, contents);
            }
        }
        catch {
            return undefined; // invalid workspace
        }
    }
    isWorkspacePath(uri) {
        return isUntitledWorkspace(uri, this.environmentMainService) || hasWorkspaceFileExtension(uri);
    }
    doResolveWorkspace(path, contents) {
        try {
            const workspace = this.doParseStoredWorkspace(path, contents);
            const workspaceIdentifier = getWorkspaceIdentifier(path);
            return {
                id: workspaceIdentifier.id,
                configPath: workspaceIdentifier.configPath,
                folders: toWorkspaceFolders(workspace.folders, workspaceIdentifier.configPath, extUriBiasedIgnorePathCase),
                remoteAuthority: workspace.remoteAuthority,
                transient: workspace.transient
            };
        }
        catch (error) {
            this.logService.warn(error.toString());
        }
        return undefined;
    }
    doParseStoredWorkspace(path, contents) {
        // Parse workspace file
        const storedWorkspace = parse(contents); // use fault tolerant parser
        // Filter out folders which do not have a path or uri set
        if (storedWorkspace && Array.isArray(storedWorkspace.folders)) {
            storedWorkspace.folders = storedWorkspace.folders.filter(folder => isStoredWorkspaceFolder(folder));
        }
        else {
            throw new Error(`${path.toString(true)} looks like an invalid workspace file.`);
        }
        return storedWorkspace;
    }
    async createUntitledWorkspace(folders, remoteAuthority) {
        const { workspace, storedWorkspace } = this.newUntitledWorkspace(folders, remoteAuthority);
        const configPath = workspace.configPath.fsPath;
        await fs.promises.mkdir(dirname(configPath), { recursive: true });
        await Promises.writeFile(configPath, JSON.stringify(storedWorkspace, null, '\t'));
        this.untitledWorkspaces.push({ workspace, remoteAuthority });
        return workspace;
    }
    newUntitledWorkspace(folders = [], remoteAuthority) {
        const randomId = (Date.now() + Math.round(Math.random() * 1000)).toString();
        const untitledWorkspaceConfigFolder = joinPath(this.untitledWorkspacesHome, randomId);
        const untitledWorkspaceConfigPath = joinPath(untitledWorkspaceConfigFolder, UNTITLED_WORKSPACE_NAME);
        const storedWorkspaceFolder = [];
        for (const folder of folders) {
            storedWorkspaceFolder.push(getStoredWorkspaceFolder(folder.uri, true, folder.name, untitledWorkspaceConfigFolder, extUriBiasedIgnorePathCase));
        }
        return {
            workspace: getWorkspaceIdentifier(untitledWorkspaceConfigPath),
            storedWorkspace: { folders: storedWorkspaceFolder, remoteAuthority }
        };
    }
    async getWorkspaceIdentifier(configPath) {
        return getWorkspaceIdentifier(configPath);
    }
    isUntitledWorkspace(workspace) {
        return isUntitledWorkspace(workspace.configPath, this.environmentMainService);
    }
    async deleteUntitledWorkspace(workspace) {
        if (!this.isUntitledWorkspace(workspace)) {
            return; // only supported for untitled workspaces
        }
        // Delete from disk
        await this.doDeleteUntitledWorkspace(workspace);
        // unset workspace from profiles
        this.userDataProfilesMainService.unsetWorkspace(workspace);
        // Event
        this._onDidDeleteUntitledWorkspace.fire(workspace);
    }
    async doDeleteUntitledWorkspace(workspace) {
        const configPath = originalFSPath(workspace.configPath);
        try {
            // Delete Workspace
            await Promises.rm(dirname(configPath));
            // Mark Workspace Storage to be deleted
            const workspaceStoragePath = join(this.environmentMainService.workspaceStorageHome.with({ scheme: Schemas.file }).fsPath, workspace.id);
            if (await Promises.exists(workspaceStoragePath)) {
                await Promises.writeFile(join(workspaceStoragePath, 'obsolete'), '');
            }
            // Remove from list
            this.untitledWorkspaces = this.untitledWorkspaces.filter(untitledWorkspace => untitledWorkspace.workspace.id !== workspace.id);
        }
        catch (error) {
            this.logService.warn(`Unable to delete untitled workspace ${configPath} (${error}).`);
        }
    }
    getUntitledWorkspaces() {
        return this.untitledWorkspaces;
    }
    async enterWorkspace(window, windows, path) {
        if (!window || !window.win || !window.isReady) {
            return undefined; // return early if the window is not ready or disposed
        }
        const isValid = await this.isValidTargetWorkspacePath(window, windows, path);
        if (!isValid) {
            return undefined; // return early if the workspace is not valid
        }
        const result = await this.doEnterWorkspace(window, getWorkspaceIdentifier(path));
        if (!result) {
            return undefined;
        }
        // Emit as event
        this._onDidEnterWorkspace.fire({ window, workspace: result.workspace });
        return result;
    }
    async isValidTargetWorkspacePath(window, windows, workspacePath) {
        if (!workspacePath) {
            return true;
        }
        if (isWorkspaceIdentifier(window.openedWorkspace) && extUriBiasedIgnorePathCase.isEqual(window.openedWorkspace.configPath, workspacePath)) {
            return false; // window is already opened on a workspace with that path
        }
        // Prevent overwriting a workspace that is currently opened in another window
        if (findWindowOnWorkspaceOrFolder(windows, workspacePath)) {
            await this.dialogMainService.showMessageBox({
                type: 'info',
                buttons: [localize({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK")],
                message: localize('workspaceOpenedMessage', "Unable to save workspace '{0}'", basename(workspacePath)),
                detail: localize('workspaceOpenedDetail', "The workspace is already opened in another window. Please close that window first and then try again.")
            }, electron.BrowserWindow.getFocusedWindow() ?? undefined);
            return false;
        }
        return true; // OK
    }
    async doEnterWorkspace(window, workspace) {
        if (!window.config) {
            return undefined;
        }
        window.focus();
        // Register window for backups and migrate current backups over
        let backupPath;
        if (!window.config.extensionDevelopmentPath) {
            if (window.config.backupPath) {
                backupPath = await this.backupMainService.registerWorkspaceBackup({ workspace, remoteAuthority: window.remoteAuthority }, window.config.backupPath);
            }
            else {
                backupPath = this.backupMainService.registerWorkspaceBackup({ workspace, remoteAuthority: window.remoteAuthority });
            }
        }
        // if the window was opened on an untitled workspace, delete it.
        if (isWorkspaceIdentifier(window.openedWorkspace) && this.isUntitledWorkspace(window.openedWorkspace)) {
            await this.deleteUntitledWorkspace(window.openedWorkspace);
        }
        // Update window configuration properly based on transition to workspace
        window.config.workspace = workspace;
        window.config.backupPath = backupPath;
        return { workspace, backupPath };
    }
};
WorkspacesManagementMainService = __decorate([
    __param(0, IEnvironmentMainService),
    __param(1, ILogService),
    __param(2, IUserDataProfilesMainService),
    __param(3, IBackupMainService),
    __param(4, IDialogMainService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], WorkspacesManagementMainService);
export { WorkspacesManagementMainService };
