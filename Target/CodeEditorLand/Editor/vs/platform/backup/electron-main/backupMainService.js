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
var BackupMainService_1;
import { createHash } from 'crypto';
import { isEqual } from '../../../base/common/extpath.js';
import { Schemas } from '../../../base/common/network.js';
import { join } from '../../../base/common/path.js';
import { isLinux } from '../../../base/common/platform.js';
import { extUriBiasedIgnorePathCase } from '../../../base/common/resources.js';
import { Promises, RimRafMode } from '../../../base/node/pfs.js';
import { isEmptyWindowBackupInfo, deserializeWorkspaceInfos, deserializeFolderInfos } from '../node/backup.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { IStateService } from '../../state/node/state.js';
import { HotExitConfiguration } from '../../files/common/files.js';
import { ILogService } from '../../log/common/log.js';
import { isFolderBackupInfo } from '../common/backup.js';
import { isWorkspaceIdentifier } from '../../workspace/common/workspace.js';
import { createEmptyWorkspaceIdentifier } from '../../workspaces/node/workspaces.js';
let BackupMainService = class BackupMainService {
    static { BackupMainService_1 = this; }
    static { this.backupWorkspacesMetadataStorageKey = 'backupWorkspaces'; }
    constructor(environmentMainService, configurationService, logService, stateService) {
        this.environmentMainService = environmentMainService;
        this.configurationService = configurationService;
        this.logService = logService;
        this.stateService = stateService;
        this.backupHome = this.environmentMainService.backupHome;
        this.workspaces = [];
        this.folders = [];
        this.emptyWindows = [];
        this.backupUriComparer = extUriBiasedIgnorePathCase;
        this.backupPathComparer = { isEqual: (pathA, pathB) => isEqual(pathA, pathB, !isLinux) };
    }
    async initialize() {
        const serializedBackupWorkspaces = this.stateService.getItem(BackupMainService_1.backupWorkspacesMetadataStorageKey) ?? { workspaces: [], folders: [], emptyWindows: [] };
        this.emptyWindows = await this.validateEmptyWorkspaces(serializedBackupWorkspaces.emptyWindows);
        this.workspaces = await this.validateWorkspaces(deserializeWorkspaceInfos(serializedBackupWorkspaces));
        this.folders = await this.validateFolders(deserializeFolderInfos(serializedBackupWorkspaces));
        this.storeWorkspacesMetadata();
    }
    getWorkspaceBackups() {
        if (this.isHotExitOnExitAndWindowClose()) {
            return [];
        }
        return this.workspaces.slice(0);
    }
    getFolderBackups() {
        if (this.isHotExitOnExitAndWindowClose()) {
            return [];
        }
        return this.folders.slice(0);
    }
    isHotExitEnabled() {
        return this.getHotExitConfig() !== HotExitConfiguration.OFF;
    }
    isHotExitOnExitAndWindowClose() {
        return this.getHotExitConfig() === HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE;
    }
    getHotExitConfig() {
        const config = this.configurationService.getValue();
        return config?.files?.hotExit || HotExitConfiguration.ON_EXIT;
    }
    getEmptyWindowBackups() {
        return this.emptyWindows.slice(0);
    }
    registerWorkspaceBackup(workspaceInfo, migrateFrom) {
        if (!this.workspaces.some(workspace => workspaceInfo.workspace.id === workspace.workspace.id)) {
            this.workspaces.push(workspaceInfo);
            this.storeWorkspacesMetadata();
        }
        const backupPath = join(this.backupHome, workspaceInfo.workspace.id);
        if (migrateFrom) {
            return this.moveBackupFolder(backupPath, migrateFrom).then(() => backupPath);
        }
        return backupPath;
    }
    async moveBackupFolder(backupPath, moveFromPath) {
        if (await Promises.exists(backupPath)) {
            await this.convertToEmptyWindowBackup(backupPath);
        }
        if (await Promises.exists(moveFromPath)) {
            try {
                await Promises.rename(moveFromPath, backupPath, false);
            }
            catch (error) {
                this.logService.error(`Backup: Could not move backup folder to new location: ${error.toString()}`);
            }
        }
    }
    registerFolderBackup(folderInfo) {
        if (!this.folders.some(folder => this.backupUriComparer.isEqual(folderInfo.folderUri, folder.folderUri))) {
            this.folders.push(folderInfo);
            this.storeWorkspacesMetadata();
        }
        return join(this.backupHome, this.getFolderHash(folderInfo));
    }
    registerEmptyWindowBackup(emptyWindowInfo) {
        if (!this.emptyWindows.some(emptyWindow => !!emptyWindow.backupFolder && this.backupPathComparer.isEqual(emptyWindow.backupFolder, emptyWindowInfo.backupFolder))) {
            this.emptyWindows.push(emptyWindowInfo);
            this.storeWorkspacesMetadata();
        }
        return join(this.backupHome, emptyWindowInfo.backupFolder);
    }
    async validateWorkspaces(rootWorkspaces) {
        if (!Array.isArray(rootWorkspaces)) {
            return [];
        }
        const seenIds = new Set();
        const result = [];
        for (const workspaceInfo of rootWorkspaces) {
            const workspace = workspaceInfo.workspace;
            if (!isWorkspaceIdentifier(workspace)) {
                return [];
            }
            if (!seenIds.has(workspace.id)) {
                seenIds.add(workspace.id);
                const backupPath = join(this.backupHome, workspace.id);
                const hasBackups = await this.doHasBackups(backupPath);
                if (hasBackups) {
                    if (workspace.configPath.scheme !== Schemas.file || await Promises.exists(workspace.configPath.fsPath)) {
                        result.push(workspaceInfo);
                    }
                    else {
                        await this.convertToEmptyWindowBackup(backupPath);
                    }
                }
                else {
                    await this.deleteStaleBackup(backupPath);
                }
            }
        }
        return result;
    }
    async validateFolders(folderWorkspaces) {
        if (!Array.isArray(folderWorkspaces)) {
            return [];
        }
        const result = [];
        const seenIds = new Set();
        for (const folderInfo of folderWorkspaces) {
            const folderURI = folderInfo.folderUri;
            const key = this.backupUriComparer.getComparisonKey(folderURI);
            if (!seenIds.has(key)) {
                seenIds.add(key);
                const backupPath = join(this.backupHome, this.getFolderHash(folderInfo));
                const hasBackups = await this.doHasBackups(backupPath);
                if (hasBackups) {
                    if (folderURI.scheme !== Schemas.file || await Promises.exists(folderURI.fsPath)) {
                        result.push(folderInfo);
                    }
                    else {
                        await this.convertToEmptyWindowBackup(backupPath);
                    }
                }
                else {
                    await this.deleteStaleBackup(backupPath);
                }
            }
        }
        return result;
    }
    async validateEmptyWorkspaces(emptyWorkspaces) {
        if (!Array.isArray(emptyWorkspaces)) {
            return [];
        }
        const result = [];
        const seenIds = new Set();
        for (const backupInfo of emptyWorkspaces) {
            const backupFolder = backupInfo.backupFolder;
            if (typeof backupFolder !== 'string') {
                return [];
            }
            if (!seenIds.has(backupFolder)) {
                seenIds.add(backupFolder);
                const backupPath = join(this.backupHome, backupFolder);
                if (await this.doHasBackups(backupPath)) {
                    result.push(backupInfo);
                }
                else {
                    await this.deleteStaleBackup(backupPath);
                }
            }
        }
        return result;
    }
    async deleteStaleBackup(backupPath) {
        try {
            await Promises.rm(backupPath, RimRafMode.MOVE);
        }
        catch (error) {
            this.logService.error(`Backup: Could not delete stale backup: ${error.toString()}`);
        }
    }
    prepareNewEmptyWindowBackup() {
        let emptyWorkspaceIdentifier = createEmptyWorkspaceIdentifier();
        while (this.emptyWindows.some(emptyWindow => !!emptyWindow.backupFolder && this.backupPathComparer.isEqual(emptyWindow.backupFolder, emptyWorkspaceIdentifier.id))) {
            emptyWorkspaceIdentifier = createEmptyWorkspaceIdentifier();
        }
        return { backupFolder: emptyWorkspaceIdentifier.id };
    }
    async convertToEmptyWindowBackup(backupPath) {
        const newEmptyWindowBackupInfo = this.prepareNewEmptyWindowBackup();
        const newEmptyWindowBackupPath = join(this.backupHome, newEmptyWindowBackupInfo.backupFolder);
        try {
            await Promises.rename(backupPath, newEmptyWindowBackupPath, false);
        }
        catch (error) {
            this.logService.error(`Backup: Could not rename backup folder: ${error.toString()}`);
            return false;
        }
        this.emptyWindows.push(newEmptyWindowBackupInfo);
        return true;
    }
    async getDirtyWorkspaces() {
        const dirtyWorkspaces = [];
        for (const workspace of this.workspaces) {
            if ((await this.hasBackups(workspace))) {
                dirtyWorkspaces.push(workspace);
            }
        }
        for (const folder of this.folders) {
            if ((await this.hasBackups(folder))) {
                dirtyWorkspaces.push(folder);
            }
        }
        return dirtyWorkspaces;
    }
    hasBackups(backupLocation) {
        let backupPath;
        if (isEmptyWindowBackupInfo(backupLocation)) {
            backupPath = join(this.backupHome, backupLocation.backupFolder);
        }
        else if (isFolderBackupInfo(backupLocation)) {
            backupPath = join(this.backupHome, this.getFolderHash(backupLocation));
        }
        else {
            backupPath = join(this.backupHome, backupLocation.workspace.id);
        }
        return this.doHasBackups(backupPath);
    }
    async doHasBackups(backupPath) {
        try {
            const backupSchemas = await Promises.readdir(backupPath);
            for (const backupSchema of backupSchemas) {
                try {
                    const backupSchemaChildren = await Promises.readdir(join(backupPath, backupSchema));
                    if (backupSchemaChildren.length > 0) {
                        return true;
                    }
                }
                catch (error) {
                }
            }
        }
        catch (error) {
        }
        return false;
    }
    storeWorkspacesMetadata() {
        const serializedBackupWorkspaces = {
            workspaces: this.workspaces.map(({ workspace, remoteAuthority }) => {
                const serializedWorkspaceBackupInfo = {
                    id: workspace.id,
                    configURIPath: workspace.configPath.toString()
                };
                if (remoteAuthority) {
                    serializedWorkspaceBackupInfo.remoteAuthority = remoteAuthority;
                }
                return serializedWorkspaceBackupInfo;
            }),
            folders: this.folders.map(({ folderUri, remoteAuthority }) => {
                const serializedFolderBackupInfo = {
                    folderUri: folderUri.toString()
                };
                if (remoteAuthority) {
                    serializedFolderBackupInfo.remoteAuthority = remoteAuthority;
                }
                return serializedFolderBackupInfo;
            }),
            emptyWindows: this.emptyWindows.map(({ backupFolder, remoteAuthority }) => {
                const serializedEmptyWindowBackupInfo = {
                    backupFolder
                };
                if (remoteAuthority) {
                    serializedEmptyWindowBackupInfo.remoteAuthority = remoteAuthority;
                }
                return serializedEmptyWindowBackupInfo;
            })
        };
        this.stateService.setItem(BackupMainService_1.backupWorkspacesMetadataStorageKey, serializedBackupWorkspaces);
    }
    getFolderHash(folder) {
        const folderUri = folder.folderUri;
        let key;
        if (folderUri.scheme === Schemas.file) {
            key = isLinux ? folderUri.fsPath : folderUri.fsPath.toLowerCase();
        }
        else {
            key = folderUri.toString().toLowerCase();
        }
        return createHash('md5').update(key).digest('hex');
    }
};
BackupMainService = BackupMainService_1 = __decorate([
    __param(0, IEnvironmentMainService),
    __param(1, IConfigurationService),
    __param(2, ILogService),
    __param(3, IStateService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], BackupMainService);
export { BackupMainService };
