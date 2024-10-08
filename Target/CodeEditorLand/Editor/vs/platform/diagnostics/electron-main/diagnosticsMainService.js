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
import { app, BrowserWindow } from 'electron';
import { validatedIpcMain } from '../../../base/parts/ipc/electron-main/ipcMain.js';
import { CancellationToken } from '../../../base/common/cancellation.js';
import { createDecorator } from '../../instantiation/common/instantiation.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
import { isSingleFolderWorkspaceIdentifier, isWorkspaceIdentifier } from '../../workspace/common/workspace.js';
import { IWorkspacesManagementMainService } from '../../workspaces/electron-main/workspacesManagementMainService.js';
import { assertIsDefined } from '../../../base/common/types.js';
import { ILogService } from '../../log/common/log.js';
import { UtilityProcess } from '../../utilityProcess/electron-main/utilityProcess.js';
export const ID = 'diagnosticsMainService';
export const IDiagnosticsMainService = createDecorator(ID);
let DiagnosticsMainService = class DiagnosticsMainService {
    constructor(windowsMainService, workspacesManagementMainService, logService) {
        this.windowsMainService = windowsMainService;
        this.workspacesManagementMainService = workspacesManagementMainService;
        this.logService = logService;
    }
    async getRemoteDiagnostics(options) {
        const windows = this.windowsMainService.getWindows();
        const diagnostics = await Promise.all(windows.map(async (window) => {
            const remoteAuthority = window.remoteAuthority;
            if (!remoteAuthority) {
                return undefined;
            }
            const replyChannel = `vscode:getDiagnosticInfoResponse${window.id}`;
            const args = {
                includeProcesses: options.includeProcesses,
                folders: options.includeWorkspaceMetadata ? await this.getFolderURIs(window) : undefined
            };
            return new Promise(resolve => {
                window.sendWhenReady('vscode:getDiagnosticInfo', CancellationToken.None, { replyChannel, args });
                validatedIpcMain.once(replyChannel, (_, data) => {
                    // No data is returned if getting the connection fails.
                    if (!data) {
                        resolve({ hostName: remoteAuthority, errorMessage: `Unable to resolve connection to '${remoteAuthority}'.` });
                    }
                    resolve(data);
                });
                setTimeout(() => {
                    resolve({ hostName: remoteAuthority, errorMessage: `Connection to '${remoteAuthority}' could not be established` });
                }, 5000);
            });
        }));
        return diagnostics.filter((x) => !!x);
    }
    async getMainDiagnostics() {
        this.logService.trace('Received request for main process info from other instance.');
        const windows = [];
        for (const window of BrowserWindow.getAllWindows()) {
            const codeWindow = this.windowsMainService.getWindowById(window.id);
            if (codeWindow) {
                windows.push(await this.codeWindowToInfo(codeWindow));
            }
            else {
                windows.push(this.browserWindowToInfo(window));
            }
        }
        const pidToNames = [];
        for (const { pid, name } of UtilityProcess.getAll()) {
            pidToNames.push({ pid, name });
        }
        return {
            mainPID: process.pid,
            mainArguments: process.argv.slice(1),
            windows,
            pidToNames,
            screenReader: !!app.accessibilitySupportEnabled,
            gpuFeatureStatus: app.getGPUFeatureStatus()
        };
    }
    async codeWindowToInfo(window) {
        const folderURIs = await this.getFolderURIs(window);
        const win = assertIsDefined(window.win);
        return this.browserWindowToInfo(win, folderURIs, window.remoteAuthority);
    }
    browserWindowToInfo(window, folderURIs = [], remoteAuthority) {
        return {
            id: window.id,
            pid: window.webContents.getOSProcessId(),
            title: window.getTitle(),
            folderURIs,
            remoteAuthority
        };
    }
    async getFolderURIs(window) {
        const folderURIs = [];
        const workspace = window.openedWorkspace;
        if (isSingleFolderWorkspaceIdentifier(workspace)) {
            folderURIs.push(workspace.uri);
        }
        else if (isWorkspaceIdentifier(workspace)) {
            const resolvedWorkspace = await this.workspacesManagementMainService.resolveLocalWorkspace(workspace.configPath); // workspace folders can only be shown for local (resolved) workspaces
            if (resolvedWorkspace) {
                const rootFolders = resolvedWorkspace.folders;
                rootFolders.forEach(root => {
                    folderURIs.push(root.uri);
                });
            }
        }
        return folderURIs;
    }
};
DiagnosticsMainService = __decorate([
    __param(0, IWindowsMainService),
    __param(1, IWorkspacesManagementMainService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], DiagnosticsMainService);
export { DiagnosticsMainService };
