import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { Promises } from '../../../../base/common/async.js';
export class WorkingCopyBackupTracker extends Disposable {
    constructor(workingCopyBackupService, workingCopyService, logService, lifecycleService, filesConfigurationService, workingCopyEditorService, editorService, editorGroupService) {
        super();
        this.workingCopyBackupService = workingCopyBackupService;
        this.workingCopyService = workingCopyService;
        this.logService = logService;
        this.lifecycleService = lifecycleService;
        this.filesConfigurationService = filesConfigurationService;
        this.workingCopyEditorService = workingCopyEditorService;
        this.editorService = editorService;
        this.editorGroupService = editorGroupService;
        this.mapWorkingCopyToContentVersion = new Map();
        this.pendingBackupOperations = new Map();
        this.suspended = false;
        this.unrestoredBackups = new Set();
        this.whenReady = this.resolveBackupsToRestore();
        this._isReady = false;
        for (const workingCopy of this.workingCopyService.modifiedWorkingCopies) {
            this.onDidRegister(workingCopy);
        }
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.workingCopyService.onDidRegister(workingCopy => this.onDidRegister(workingCopy)));
        this._register(this.workingCopyService.onDidUnregister(workingCopy => this.onDidUnregister(workingCopy)));
        this._register(this.workingCopyService.onDidChangeDirty(workingCopy => this.onDidChangeDirty(workingCopy)));
        this._register(this.workingCopyService.onDidChangeContent(workingCopy => this.onDidChangeContent(workingCopy)));
        this._register(this.lifecycleService.onBeforeShutdown(event => event.finalVeto(() => this.onFinalBeforeShutdown(event.reason), 'veto.backups')));
        this._register(this.lifecycleService.onWillShutdown(() => this.onWillShutdown()));
        this._register(this.workingCopyEditorService.onDidRegisterHandler(handler => this.restoreBackups(handler)));
    }
    onWillShutdown() {
        this.cancelBackupOperations();
        this.suspendBackupOperations();
    }
    static { this.DEFAULT_BACKUP_SCHEDULE_DELAYS = {
        ['default']: 1000,
        ['delayed']: 2000
    }; }
    onDidRegister(workingCopy) {
        if (this.suspended) {
            this.logService.warn(`[backup tracker] suspended, ignoring register event`, workingCopy.resource.toString(), workingCopy.typeId);
            return;
        }
        if (workingCopy.isModified()) {
            this.scheduleBackup(workingCopy);
        }
    }
    onDidUnregister(workingCopy) {
        this.mapWorkingCopyToContentVersion.delete(workingCopy);
        if (this.suspended) {
            this.logService.warn(`[backup tracker] suspended, ignoring unregister event`, workingCopy.resource.toString(), workingCopy.typeId);
            return;
        }
        this.discardBackup(workingCopy);
    }
    onDidChangeDirty(workingCopy) {
        if (this.suspended) {
            this.logService.warn(`[backup tracker] suspended, ignoring dirty change event`, workingCopy.resource.toString(), workingCopy.typeId);
            return;
        }
        if (workingCopy.isDirty()) {
            this.scheduleBackup(workingCopy);
        }
        else {
            this.discardBackup(workingCopy);
        }
    }
    onDidChangeContent(workingCopy) {
        const contentVersionId = this.getContentVersion(workingCopy);
        this.mapWorkingCopyToContentVersion.set(workingCopy, contentVersionId + 1);
        if (this.suspended) {
            this.logService.warn(`[backup tracker] suspended, ignoring content change event`, workingCopy.resource.toString(), workingCopy.typeId);
            return;
        }
        if (workingCopy.isModified()) {
            this.scheduleBackup(workingCopy);
        }
    }
    scheduleBackup(workingCopy) {
        this.cancelBackupOperation(workingCopy);
        this.logService.trace(`[backup tracker] scheduling backup`, workingCopy.resource.toString(), workingCopy.typeId);
        const workingCopyIdentifier = { resource: workingCopy.resource, typeId: workingCopy.typeId };
        const cts = new CancellationTokenSource();
        const handle = setTimeout(async () => {
            if (cts.token.isCancellationRequested) {
                return;
            }
            if (workingCopy.isModified()) {
                this.logService.trace(`[backup tracker] creating backup`, workingCopy.resource.toString(), workingCopy.typeId);
                try {
                    const backup = await workingCopy.backup(cts.token);
                    if (cts.token.isCancellationRequested) {
                        return;
                    }
                    if (workingCopy.isModified()) {
                        this.logService.trace(`[backup tracker] storing backup`, workingCopy.resource.toString(), workingCopy.typeId);
                        await this.workingCopyBackupService.backup(workingCopy, backup.content, this.getContentVersion(workingCopy), backup.meta, cts.token);
                    }
                }
                catch (error) {
                    this.logService.error(error);
                }
            }
            if (!cts.token.isCancellationRequested) {
                this.doClearPendingBackupOperation(workingCopyIdentifier);
            }
        }, this.getBackupScheduleDelay(workingCopy));
        this.pendingBackupOperations.set(workingCopyIdentifier, {
            cancel: () => {
                this.logService.trace(`[backup tracker] clearing pending backup creation`, workingCopy.resource.toString(), workingCopy.typeId);
                cts.cancel();
            },
            disposable: toDisposable(() => {
                cts.dispose();
                clearTimeout(handle);
            })
        });
    }
    getBackupScheduleDelay(workingCopy) {
        if (typeof workingCopy.backupDelay === 'number') {
            return workingCopy.backupDelay;
        }
        let backupScheduleDelay;
        if (workingCopy.capabilities & 2) {
            backupScheduleDelay = 'default';
        }
        else {
            backupScheduleDelay = this.filesConfigurationService.hasShortAutoSaveDelay(workingCopy.resource) ? 'delayed' : 'default';
        }
        return WorkingCopyBackupTracker.DEFAULT_BACKUP_SCHEDULE_DELAYS[backupScheduleDelay];
    }
    getContentVersion(workingCopy) {
        return this.mapWorkingCopyToContentVersion.get(workingCopy) || 0;
    }
    discardBackup(workingCopy) {
        this.cancelBackupOperation(workingCopy);
        const workingCopyIdentifier = { resource: workingCopy.resource, typeId: workingCopy.typeId };
        const cts = new CancellationTokenSource();
        this.doDiscardBackup(workingCopyIdentifier, cts);
        this.pendingBackupOperations.set(workingCopyIdentifier, {
            cancel: () => {
                this.logService.trace(`[backup tracker] clearing pending backup discard`, workingCopy.resource.toString(), workingCopy.typeId);
                cts.cancel();
            },
            disposable: cts
        });
    }
    async doDiscardBackup(workingCopyIdentifier, cts) {
        this.logService.trace(`[backup tracker] discarding backup`, workingCopyIdentifier.resource.toString(), workingCopyIdentifier.typeId);
        try {
            await this.workingCopyBackupService.discardBackup(workingCopyIdentifier, cts.token);
        }
        catch (error) {
            this.logService.error(error);
        }
        if (!cts.token.isCancellationRequested) {
            this.doClearPendingBackupOperation(workingCopyIdentifier);
        }
    }
    cancelBackupOperation(workingCopy) {
        let workingCopyIdentifier = undefined;
        for (const [identifier] of this.pendingBackupOperations) {
            if (identifier.resource.toString() === workingCopy.resource.toString() && identifier.typeId === workingCopy.typeId) {
                workingCopyIdentifier = identifier;
                break;
            }
        }
        if (workingCopyIdentifier) {
            this.doClearPendingBackupOperation(workingCopyIdentifier, { cancel: true });
        }
    }
    doClearPendingBackupOperation(workingCopyIdentifier, options) {
        const pendingBackupOperation = this.pendingBackupOperations.get(workingCopyIdentifier);
        if (!pendingBackupOperation) {
            return;
        }
        if (options?.cancel) {
            pendingBackupOperation.cancel();
        }
        pendingBackupOperation.disposable.dispose();
        this.pendingBackupOperations.delete(workingCopyIdentifier);
    }
    cancelBackupOperations() {
        for (const [, operation] of this.pendingBackupOperations) {
            operation.cancel();
            operation.disposable.dispose();
        }
        this.pendingBackupOperations.clear();
    }
    suspendBackupOperations() {
        this.suspended = true;
        return { resume: () => this.suspended = false };
    }
    get isReady() { return this._isReady; }
    async resolveBackupsToRestore() {
        await this.lifecycleService.when(3);
        for (const backup of await this.workingCopyBackupService.getBackups()) {
            this.unrestoredBackups.add(backup);
        }
        this._isReady = true;
    }
    async restoreBackups(handler) {
        await this.whenReady;
        const openedEditorsForBackups = new Set();
        const nonOpenedEditorsForBackups = new Set();
        const restoredBackups = new Set();
        for (const unrestoredBackup of this.unrestoredBackups) {
            const canHandleUnrestoredBackup = await handler.handles(unrestoredBackup);
            if (!canHandleUnrestoredBackup) {
                continue;
            }
            let hasOpenedEditorForBackup = false;
            for (const { editor } of this.editorService.getEditors(0)) {
                const isUnrestoredBackupOpened = handler.isOpen(unrestoredBackup, editor);
                if (isUnrestoredBackupOpened) {
                    openedEditorsForBackups.add(editor);
                    hasOpenedEditorForBackup = true;
                }
            }
            if (!hasOpenedEditorForBackup) {
                nonOpenedEditorsForBackups.add(await handler.createEditor(unrestoredBackup));
            }
            restoredBackups.add(unrestoredBackup);
        }
        if (nonOpenedEditorsForBackups.size > 0) {
            await this.editorGroupService.activeGroup.openEditors([...nonOpenedEditorsForBackups].map(nonOpenedEditorForBackup => ({
                editor: nonOpenedEditorForBackup,
                options: {
                    pinned: true,
                    preserveFocus: true,
                    inactive: true
                }
            })));
            for (const nonOpenedEditorForBackup of nonOpenedEditorsForBackups) {
                openedEditorsForBackups.add(nonOpenedEditorForBackup);
            }
        }
        await Promises.settled([...openedEditorsForBackups].map(async (openedEditorForBackup) => {
            if (this.editorService.isVisible(openedEditorForBackup)) {
                return;
            }
            return openedEditorForBackup.resolve();
        }));
        for (const restoredBackup of restoredBackups) {
            this.unrestoredBackups.delete(restoredBackup);
        }
    }
}
