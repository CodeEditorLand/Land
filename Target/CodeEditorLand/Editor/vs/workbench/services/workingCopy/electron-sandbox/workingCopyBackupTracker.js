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
import { localize } from '../../../../nls.js';
import { IWorkingCopyBackupService } from '../common/workingCopyBackup.js';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.js';
import { IWorkingCopyService } from '../common/workingCopyService.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IFileDialogService, IDialogService, getFileNamesMessage } from '../../../../platform/dialogs/common/dialogs.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { isMacintosh } from '../../../../base/common/platform.js';
import { HotExitConfiguration } from '../../../../platform/files/common/files.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { WorkingCopyBackupTracker } from '../common/workingCopyBackupTracker.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { Promises, raceCancellation } from '../../../../base/common/async.js';
import { IWorkingCopyEditorService } from '../common/workingCopyEditorService.js';
import { IEditorGroupsService } from '../../editor/common/editorGroupsService.js';
let NativeWorkingCopyBackupTracker = class NativeWorkingCopyBackupTracker extends WorkingCopyBackupTracker {
    static { this.ID = 'workbench.contrib.nativeWorkingCopyBackupTracker'; }
    constructor(workingCopyBackupService, filesConfigurationService, workingCopyService, lifecycleService, fileDialogService, dialogService, contextService, nativeHostService, logService, environmentService, progressService, workingCopyEditorService, editorService, editorGroupService) {
        super(workingCopyBackupService, workingCopyService, logService, lifecycleService, filesConfigurationService, workingCopyEditorService, editorService, editorGroupService);
        this.fileDialogService = fileDialogService;
        this.dialogService = dialogService;
        this.contextService = contextService;
        this.nativeHostService = nativeHostService;
        this.environmentService = environmentService;
        this.progressService = progressService;
    }
    async onFinalBeforeShutdown(reason) {
        this.cancelBackupOperations();
        const { resume } = this.suspendBackupOperations();
        try {
            const modifiedWorkingCopies = this.workingCopyService.modifiedWorkingCopies;
            if (modifiedWorkingCopies.length) {
                return await this.onBeforeShutdownWithModified(reason, modifiedWorkingCopies);
            }
            else {
                return await this.onBeforeShutdownWithoutModified();
            }
        }
        finally {
            resume();
        }
    }
    async onBeforeShutdownWithModified(reason, modifiedWorkingCopies) {
        const workingCopiesToAutoSave = modifiedWorkingCopies.filter(wc => !(wc.capabilities & 2) && this.filesConfigurationService.getAutoSaveMode(wc.resource).mode !== 0);
        if (workingCopiesToAutoSave.length > 0) {
            try {
                await this.doSaveAllBeforeShutdown(workingCopiesToAutoSave, 2);
            }
            catch (error) {
                this.logService.error(`[backup tracker] error saving modified working copies: ${error}`);
            }
            const remainingModifiedWorkingCopies = this.workingCopyService.modifiedWorkingCopies;
            if (remainingModifiedWorkingCopies.length) {
                return this.handleModifiedBeforeShutdown(remainingModifiedWorkingCopies, reason);
            }
            return this.noVeto([...modifiedWorkingCopies]);
        }
        return this.handleModifiedBeforeShutdown(modifiedWorkingCopies, reason);
    }
    async handleModifiedBeforeShutdown(modifiedWorkingCopies, reason) {
        let backups = [];
        let backupError = undefined;
        const modifiedWorkingCopiesToBackup = await this.shouldBackupBeforeShutdown(reason, modifiedWorkingCopies);
        if (modifiedWorkingCopiesToBackup.length > 0) {
            try {
                const backupResult = await this.backupBeforeShutdown(modifiedWorkingCopiesToBackup);
                backups = backupResult.backups;
                backupError = backupResult.error;
                if (backups.length === modifiedWorkingCopies.length) {
                    return false;
                }
            }
            catch (error) {
                backupError = error;
            }
        }
        const remainingModifiedWorkingCopies = modifiedWorkingCopies.filter(workingCopy => !backups.includes(workingCopy));
        if (backupError) {
            if (this.environmentService.isExtensionDevelopment) {
                this.logService.error(`[backup tracker] error creating backups: ${backupError}`);
                return false;
            }
            return this.showErrorDialog(localize('backupTrackerBackupFailed', "The following editors with unsaved changes could not be saved to the backup location."), remainingModifiedWorkingCopies, backupError, reason);
        }
        try {
            return await this.confirmBeforeShutdown(remainingModifiedWorkingCopies);
        }
        catch (error) {
            if (this.environmentService.isExtensionDevelopment) {
                this.logService.error(`[backup tracker] error saving or reverting modified working copies: ${error}`);
                return false;
            }
            return this.showErrorDialog(localize('backupTrackerConfirmFailed', "The following editors with unsaved changes could not be saved or reverted."), remainingModifiedWorkingCopies, error, reason);
        }
    }
    async shouldBackupBeforeShutdown(reason, modifiedWorkingCopies) {
        if (!this.filesConfigurationService.isHotExitEnabled) {
            return [];
        }
        if (this.environmentService.isExtensionDevelopment) {
            return modifiedWorkingCopies;
        }
        switch (reason) {
            case 1:
                if (this.contextService.getWorkbenchState() !== 1 && this.filesConfigurationService.hotExitConfiguration === HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
                    return modifiedWorkingCopies;
                }
                if (isMacintosh || await this.nativeHostService.getWindowCount() > 1) {
                    if (this.contextService.getWorkbenchState() !== 1) {
                        return modifiedWorkingCopies.filter(modifiedWorkingCopy => modifiedWorkingCopy.capabilities & 4);
                    }
                    return [];
                }
                return modifiedWorkingCopies;
            case 2:
                return modifiedWorkingCopies;
            case 3:
                return modifiedWorkingCopies;
            case 4:
                if (this.contextService.getWorkbenchState() !== 1) {
                    if (this.filesConfigurationService.hotExitConfiguration === HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
                        return modifiedWorkingCopies;
                    }
                    return modifiedWorkingCopies.filter(modifiedWorkingCopy => modifiedWorkingCopy.capabilities & 4);
                }
                return [];
        }
    }
    async showErrorDialog(message, workingCopies, error, reason) {
        this.logService.error(`[backup tracker] ${message}: ${error}`);
        const modifiedWorkingCopies = workingCopies.filter(workingCopy => workingCopy.isModified());
        const advice = localize('backupErrorDetails', "Try saving or reverting the editors with unsaved changes first and then try again.");
        const detail = modifiedWorkingCopies.length
            ? `${getFileNamesMessage(modifiedWorkingCopies.map(x => x.name))}\n${advice}`
            : advice;
        const { result } = await this.dialogService.prompt({
            type: 'error',
            message,
            detail,
            buttons: [
                {
                    label: localize({ key: 'ok', comment: ['&& denotes a mnemonic'] }, "&&OK"),
                    run: () => true
                },
                {
                    label: this.toForceShutdownLabel(reason),
                    run: () => false
                }
            ],
        });
        return result ?? true;
    }
    toForceShutdownLabel(reason) {
        switch (reason) {
            case 1:
            case 4:
                return localize('shutdownForceClose', "Close Anyway");
            case 2:
                return localize('shutdownForceQuit', "Quit Anyway");
            case 3:
                return localize('shutdownForceReload', "Reload Anyway");
        }
    }
    async backupBeforeShutdown(modifiedWorkingCopies) {
        const backups = [];
        let error = undefined;
        await this.withProgressAndCancellation(async (token) => {
            try {
                await Promises.settled(modifiedWorkingCopies.map(async (workingCopy) => {
                    const contentVersion = this.getContentVersion(workingCopy);
                    if (this.workingCopyBackupService.hasBackupSync(workingCopy, contentVersion)) {
                        backups.push(workingCopy);
                    }
                    else {
                        const backup = await workingCopy.backup(token);
                        if (token.isCancellationRequested) {
                            return;
                        }
                        await this.workingCopyBackupService.backup(workingCopy, backup.content, contentVersion, backup.meta, token);
                        if (token.isCancellationRequested) {
                            return;
                        }
                        backups.push(workingCopy);
                    }
                }));
            }
            catch (backupError) {
                error = backupError;
            }
        }, localize('backupBeforeShutdownMessage', "Backing up editors with unsaved changes is taking a bit longer..."), localize('backupBeforeShutdownDetail', "Click 'Cancel' to stop waiting and to save or revert editors with unsaved changes."));
        return { backups, error };
    }
    async confirmBeforeShutdown(modifiedWorkingCopies) {
        const confirm = await this.fileDialogService.showSaveConfirm(modifiedWorkingCopies.map(workingCopy => workingCopy.name));
        if (confirm === 0) {
            const modifiedCountBeforeSave = this.workingCopyService.modifiedCount;
            try {
                await this.doSaveAllBeforeShutdown(modifiedWorkingCopies, 1);
            }
            catch (error) {
                this.logService.error(`[backup tracker] error saving modified working copies: ${error}`);
            }
            const savedWorkingCopies = modifiedCountBeforeSave - this.workingCopyService.modifiedCount;
            if (savedWorkingCopies < modifiedWorkingCopies.length) {
                return true;
            }
            return this.noVeto(modifiedWorkingCopies);
        }
        else if (confirm === 1) {
            try {
                await this.doRevertAllBeforeShutdown(modifiedWorkingCopies);
            }
            catch (error) {
                this.logService.error(`[backup tracker] error reverting modified working copies: ${error}`);
            }
            return this.noVeto(modifiedWorkingCopies);
        }
        return true;
    }
    doSaveAllBeforeShutdown(workingCopies, reason) {
        return this.withProgressAndCancellation(async () => {
            const saveOptions = { skipSaveParticipants: true, reason };
            let result = undefined;
            if (workingCopies.length === this.workingCopyService.modifiedCount) {
                result = (await this.editorService.saveAll({
                    includeUntitled: { includeScratchpad: true },
                    ...saveOptions
                })).success;
            }
            if (result !== false) {
                await Promises.settled(workingCopies.map(workingCopy => workingCopy.isModified() ? workingCopy.save(saveOptions) : Promise.resolve(true)));
            }
        }, localize('saveBeforeShutdown', "Saving editors with unsaved changes is taking a bit longer..."), undefined, workingCopies.some(workingCopy => workingCopy.capabilities & 2 || workingCopy.capabilities & 4) ? 10 : 20);
    }
    doRevertAllBeforeShutdown(modifiedWorkingCopies) {
        return this.withProgressAndCancellation(async () => {
            const revertOptions = { soft: true };
            if (modifiedWorkingCopies.length === this.workingCopyService.modifiedCount) {
                await this.editorService.revertAll(revertOptions);
            }
            await Promises.settled(modifiedWorkingCopies.map(workingCopy => workingCopy.isModified() ? workingCopy.revert(revertOptions) : Promise.resolve()));
        }, localize('revertBeforeShutdown', "Reverting editors with unsaved changes is taking a bit longer..."));
    }
    onBeforeShutdownWithoutModified() {
        return this.noVeto({ except: this.contextService.getWorkbenchState() === 1 ? [] : Array.from(this.unrestoredBackups) });
    }
    async noVeto(arg1) {
        await this.discardBackupsBeforeShutdown(arg1);
        return false;
    }
    async discardBackupsBeforeShutdown(arg1) {
        if (!this.isReady) {
            return;
        }
        await this.withProgressAndCancellation(async () => {
            try {
                if (Array.isArray(arg1)) {
                    await Promises.settled(arg1.map(workingCopy => this.workingCopyBackupService.discardBackup(workingCopy)));
                }
                else {
                    await this.workingCopyBackupService.discardBackups(arg1);
                }
            }
            catch (error) {
                this.logService.error(`[backup tracker] error discarding backups: ${error}`);
            }
        }, localize('discardBackupsBeforeShutdown', "Discarding backups is taking a bit longer..."));
    }
    withProgressAndCancellation(promiseFactory, title, detail, location = 20) {
        const cts = new CancellationTokenSource();
        return this.progressService.withProgress({
            location,
            cancellable: true,
            delay: 800,
            title,
            detail
        }, () => raceCancellation(promiseFactory(cts.token), cts.token), () => cts.dispose(true));
    }
};
NativeWorkingCopyBackupTracker = __decorate([
    __param(0, IWorkingCopyBackupService),
    __param(1, IFilesConfigurationService),
    __param(2, IWorkingCopyService),
    __param(3, ILifecycleService),
    __param(4, IFileDialogService),
    __param(5, IDialogService),
    __param(6, IWorkspaceContextService),
    __param(7, INativeHostService),
    __param(8, ILogService),
    __param(9, IEnvironmentService),
    __param(10, IProgressService),
    __param(11, IWorkingCopyEditorService),
    __param(12, IEditorService),
    __param(13, IEditorGroupsService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], NativeWorkingCopyBackupTracker);
export { NativeWorkingCopyBackupTracker };
