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
        // Important: we are about to shutdown and handle modified working copies
        // and backups. We do not want any pending backup ops to interfer with
        // this because there is a risk of a backup being scheduled after we have
        // acknowledged to shutdown and then might end up with partial backups
        // written to disk, or even empty backups or deletes after writes.
        // (https://github.com/microsoft/vscode/issues/138055)
        this.cancelBackupOperations();
        // For the duration of the shutdown handling, suspend backup operations
        // and only resume after we have handled backups. Similar to above, we
        // do not want to trigger backup tracking during our shutdown handling
        // but we must resume, in case of a veto afterwards.
        const { resume } = this.suspendBackupOperations();
        try {
            // Modified working copies need treatment on shutdown
            const modifiedWorkingCopies = this.workingCopyService.modifiedWorkingCopies;
            if (modifiedWorkingCopies.length) {
                return await this.onBeforeShutdownWithModified(reason, modifiedWorkingCopies);
            }
            // No modified working copies
            else {
                return await this.onBeforeShutdownWithoutModified();
            }
        }
        finally {
            resume();
        }
    }
    async onBeforeShutdownWithModified(reason, modifiedWorkingCopies) {
        // If auto save is enabled, save all non-untitled working copies
        // and then check again for modified copies
        const workingCopiesToAutoSave = modifiedWorkingCopies.filter(wc => !(wc.capabilities & 2 /* WorkingCopyCapabilities.Untitled */) && this.filesConfigurationService.getAutoSaveMode(wc.resource).mode !== 0 /* AutoSaveMode.OFF */);
        if (workingCopiesToAutoSave.length > 0) {
            // Save all modified working copies that can be auto-saved
            try {
                await this.doSaveAllBeforeShutdown(workingCopiesToAutoSave, 2 /* SaveReason.AUTO */);
            }
            catch (error) {
                this.logService.error(`[backup tracker] error saving modified working copies: ${error}`); // guard against misbehaving saves, we handle remaining modified below
            }
            // If we still have modified working copies, we either have untitled ones or working copies that cannot be saved
            const remainingModifiedWorkingCopies = this.workingCopyService.modifiedWorkingCopies;
            if (remainingModifiedWorkingCopies.length) {
                return this.handleModifiedBeforeShutdown(remainingModifiedWorkingCopies, reason);
            }
            return this.noVeto([...modifiedWorkingCopies]); // no veto (modified auto-saved)
        }
        // Auto save is not enabled
        return this.handleModifiedBeforeShutdown(modifiedWorkingCopies, reason);
    }
    async handleModifiedBeforeShutdown(modifiedWorkingCopies, reason) {
        // Trigger backup if configured and enabled for shutdown reason
        let backups = [];
        let backupError = undefined;
        const modifiedWorkingCopiesToBackup = await this.shouldBackupBeforeShutdown(reason, modifiedWorkingCopies);
        if (modifiedWorkingCopiesToBackup.length > 0) {
            try {
                const backupResult = await this.backupBeforeShutdown(modifiedWorkingCopiesToBackup);
                backups = backupResult.backups;
                backupError = backupResult.error;
                if (backups.length === modifiedWorkingCopies.length) {
                    return false; // no veto (backup was successful for all working copies)
                }
            }
            catch (error) {
                backupError = error;
            }
        }
        const remainingModifiedWorkingCopies = modifiedWorkingCopies.filter(workingCopy => !backups.includes(workingCopy));
        // We ran a backup but received an error that we show to the user
        if (backupError) {
            if (this.environmentService.isExtensionDevelopment) {
                this.logService.error(`[backup tracker] error creating backups: ${backupError}`);
                return false; // do not block shutdown during extension development (https://github.com/microsoft/vscode/issues/115028)
            }
            return this.showErrorDialog(localize('backupTrackerBackupFailed', "The following editors with unsaved changes could not be saved to the backup location."), remainingModifiedWorkingCopies, backupError, reason);
        }
        // Since a backup did not happen, we have to confirm for
        // the working copies that did not successfully backup
        try {
            return await this.confirmBeforeShutdown(remainingModifiedWorkingCopies);
        }
        catch (error) {
            if (this.environmentService.isExtensionDevelopment) {
                this.logService.error(`[backup tracker] error saving or reverting modified working copies: ${error}`);
                return false; // do not block shutdown during extension development (https://github.com/microsoft/vscode/issues/115028)
            }
            return this.showErrorDialog(localize('backupTrackerConfirmFailed', "The following editors with unsaved changes could not be saved or reverted."), remainingModifiedWorkingCopies, error, reason);
        }
    }
    async shouldBackupBeforeShutdown(reason, modifiedWorkingCopies) {
        if (!this.filesConfigurationService.isHotExitEnabled) {
            return []; // never backup when hot exit is disabled via settings
        }
        if (this.environmentService.isExtensionDevelopment) {
            return modifiedWorkingCopies; // always backup closing extension development window without asking to speed up debugging
        }
        switch (reason) {
            // Window Close
            case 1 /* ShutdownReason.CLOSE */:
                if (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */ && this.filesConfigurationService.hotExitConfiguration === HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
                    return modifiedWorkingCopies; // backup if a workspace/folder is open and onExitAndWindowClose is configured
                }
                if (isMacintosh || await this.nativeHostService.getWindowCount() > 1) {
                    if (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */) {
                        return modifiedWorkingCopies.filter(modifiedWorkingCopy => modifiedWorkingCopy.capabilities & 4 /* WorkingCopyCapabilities.Scratchpad */); // backup scratchpads automatically to avoid user confirmation
                    }
                    return []; // do not backup if a window is closed that does not cause quitting of the application
                }
                return modifiedWorkingCopies; // backup if last window is closed on win/linux where the application quits right after
            // Application Quit
            case 2 /* ShutdownReason.QUIT */:
                return modifiedWorkingCopies; // backup because next start we restore all backups
            // Window Reload
            case 3 /* ShutdownReason.RELOAD */:
                return modifiedWorkingCopies; // backup because after window reload, backups restore
            // Workspace Change
            case 4 /* ShutdownReason.LOAD */:
                if (this.contextService.getWorkbenchState() !== 1 /* WorkbenchState.EMPTY */) {
                    if (this.filesConfigurationService.hotExitConfiguration === HotExitConfiguration.ON_EXIT_AND_WINDOW_CLOSE) {
                        return modifiedWorkingCopies; // backup if a workspace/folder is open and onExitAndWindowClose is configured
                    }
                    return modifiedWorkingCopies.filter(modifiedWorkingCopy => modifiedWorkingCopy.capabilities & 4 /* WorkingCopyCapabilities.Scratchpad */); // backup scratchpads automatically to avoid user confirmation
                }
                return []; // do not backup because we are switching contexts with no workspace/folder open
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
                    run: () => true // veto
                },
                {
                    label: this.toForceShutdownLabel(reason),
                    run: () => false // no veto
                }
            ],
        });
        return result ?? true;
    }
    toForceShutdownLabel(reason) {
        switch (reason) {
            case 1 /* ShutdownReason.CLOSE */:
            case 4 /* ShutdownReason.LOAD */:
                return localize('shutdownForceClose', "Close Anyway");
            case 2 /* ShutdownReason.QUIT */:
                return localize('shutdownForceQuit', "Quit Anyway");
            case 3 /* ShutdownReason.RELOAD */:
                return localize('shutdownForceReload', "Reload Anyway");
        }
    }
    async backupBeforeShutdown(modifiedWorkingCopies) {
        const backups = [];
        let error = undefined;
        await this.withProgressAndCancellation(async (token) => {
            // Perform a backup of all modified working copies unless a backup already exists
            try {
                await Promises.settled(modifiedWorkingCopies.map(async (workingCopy) => {
                    // Backup exists
                    const contentVersion = this.getContentVersion(workingCopy);
                    if (this.workingCopyBackupService.hasBackupSync(workingCopy, contentVersion)) {
                        backups.push(workingCopy);
                    }
                    // Backup does not exist
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
        // Save
        const confirm = await this.fileDialogService.showSaveConfirm(modifiedWorkingCopies.map(workingCopy => workingCopy.name));
        if (confirm === 0 /* ConfirmResult.SAVE */) {
            const modifiedCountBeforeSave = this.workingCopyService.modifiedCount;
            try {
                await this.doSaveAllBeforeShutdown(modifiedWorkingCopies, 1 /* SaveReason.EXPLICIT */);
            }
            catch (error) {
                this.logService.error(`[backup tracker] error saving modified working copies: ${error}`); // guard against misbehaving saves, we handle remaining modified below
            }
            const savedWorkingCopies = modifiedCountBeforeSave - this.workingCopyService.modifiedCount;
            if (savedWorkingCopies < modifiedWorkingCopies.length) {
                return true; // veto (save failed or was canceled)
            }
            return this.noVeto(modifiedWorkingCopies); // no veto (modified saved)
        }
        // Don't Save
        else if (confirm === 1 /* ConfirmResult.DONT_SAVE */) {
            try {
                await this.doRevertAllBeforeShutdown(modifiedWorkingCopies);
            }
            catch (error) {
                this.logService.error(`[backup tracker] error reverting modified working copies: ${error}`); // do not block the shutdown on errors from revert
            }
            return this.noVeto(modifiedWorkingCopies); // no veto (modified reverted)
        }
        // Cancel
        return true; // veto (user canceled)
    }
    doSaveAllBeforeShutdown(workingCopies, reason) {
        return this.withProgressAndCancellation(async () => {
            // Skip save participants on shutdown for performance reasons
            const saveOptions = { skipSaveParticipants: true, reason };
            // First save through the editor service if we save all to benefit
            // from some extras like switching to untitled modified editors before saving.
            let result = undefined;
            if (workingCopies.length === this.workingCopyService.modifiedCount) {
                result = (await this.editorService.saveAll({
                    includeUntitled: { includeScratchpad: true },
                    ...saveOptions
                })).success;
            }
            // If we still have modified working copies, save those directly
            // unless the save was not successful (e.g. cancelled)
            if (result !== false) {
                await Promises.settled(workingCopies.map(workingCopy => workingCopy.isModified() ? workingCopy.save(saveOptions) : Promise.resolve(true)));
            }
        }, localize('saveBeforeShutdown', "Saving editors with unsaved changes is taking a bit longer..."), undefined, 
        // Do not pick `Dialog` as location for reporting progress if it is likely
        // that the save operation will itself open a dialog for asking for the
        // location to save to for untitled or scratchpad working copies.
        // https://github.com/microsoft/vscode-internalbacklog/issues/4943
        workingCopies.some(workingCopy => workingCopy.capabilities & 2 /* WorkingCopyCapabilities.Untitled */ || workingCopy.capabilities & 4 /* WorkingCopyCapabilities.Scratchpad */) ? 10 /* ProgressLocation.Window */ : 20 /* ProgressLocation.Dialog */);
    }
    doRevertAllBeforeShutdown(modifiedWorkingCopies) {
        return this.withProgressAndCancellation(async () => {
            // Soft revert is good enough on shutdown
            const revertOptions = { soft: true };
            // First revert through the editor service if we revert all
            if (modifiedWorkingCopies.length === this.workingCopyService.modifiedCount) {
                await this.editorService.revertAll(revertOptions);
            }
            // If we still have modified working copies, revert those directly
            await Promises.settled(modifiedWorkingCopies.map(workingCopy => workingCopy.isModified() ? workingCopy.revert(revertOptions) : Promise.resolve()));
        }, localize('revertBeforeShutdown', "Reverting editors with unsaved changes is taking a bit longer..."));
    }
    onBeforeShutdownWithoutModified() {
        // We are about to shutdown without modified editors
        // and will discard any backups that are still
        // around that have not been handled depending
        // on the window state.
        //
        // Empty window: discard even unrestored backups to
        // prevent empty windows from restoring that cannot
        // be closed (workaround for not having implemented
        // https://github.com/microsoft/vscode/issues/127163
        // and a fix for what users have reported in issue
        // https://github.com/microsoft/vscode/issues/126725)
        //
        // Workspace/Folder window: do not discard unrestored
        // backups to give a chance to restore them in the
        // future. Since we do not restore workspace/folder
        // windows with backups, this is fine.
        return this.noVeto({ except: this.contextService.getWorkbenchState() === 1 /* WorkbenchState.EMPTY */ ? [] : Array.from(this.unrestoredBackups) });
    }
    async noVeto(arg1) {
        // Discard backups from working copies the
        // user either saved or reverted
        await this.discardBackupsBeforeShutdown(arg1);
        return false; // no veto (no modified)
    }
    async discardBackupsBeforeShutdown(arg1) {
        // We never discard any backups before we are ready
        // and have resolved all backups that exist. This
        // is important to not loose backups that have not
        // been handled.
        if (!this.isReady) {
            return;
        }
        await this.withProgressAndCancellation(async () => {
            // When we shutdown either with no modified working copies left
            // or with some handled, we start to discard these backups
            // to free them up. This helps to get rid of stale backups
            // as reported in https://github.com/microsoft/vscode/issues/92962
            //
            // However, we never want to discard backups that we know
            // were not restored in the session.
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
    withProgressAndCancellation(promiseFactory, title, detail, location = 20 /* ProgressLocation.Dialog */) {
        const cts = new CancellationTokenSource();
        return this.progressService.withProgress({
            location, // by default use a dialog to prevent the user from making any more changes now (https://github.com/microsoft/vscode/issues/122774)
            cancellable: true, // allow to cancel (https://github.com/microsoft/vscode/issues/112278)
            delay: 800, // delay so that it only appears when operation takes a long time
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
