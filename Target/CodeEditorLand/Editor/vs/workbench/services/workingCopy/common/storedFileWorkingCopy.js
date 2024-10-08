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
var StoredFileWorkingCopy_1;
import { localize } from '../../../../nls.js';
import { URI } from '../../../../base/common/uri.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { CancellationToken, CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { ETAG_DISABLED, IFileService, NotModifiedSinceFileOperationError } from '../../../../platform/files/common/files.js';
import { IWorkingCopyService } from './workingCopyService.js';
import { raceCancellation, TaskSequentializer, timeout } from '../../../../base/common/async.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { IWorkingCopyFileService } from './workingCopyFileService.js';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.js';
import { IWorkingCopyBackupService } from './workingCopyBackup.js';
import { INotificationService, Severity } from '../../../../platform/notification/common/notification.js';
import { hash } from '../../../../base/common/hash.js';
import { isErrorWithActions, toErrorMessage } from '../../../../base/common/errorMessage.js';
import { toAction } from '../../../../base/common/actions.js';
import { isWindows } from '../../../../base/common/platform.js';
import { IWorkingCopyEditorService } from './workingCopyEditorService.js';
import { IEditorService } from '../../editor/common/editorService.js';
import { IElevatedFileService } from '../../files/common/elevatedFileService.js';
import { ResourceWorkingCopy } from './resourceWorkingCopy.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
export function isStoredFileWorkingCopySaveEvent(e) {
    const candidate = e;
    return !!candidate.stat;
}
let StoredFileWorkingCopy = class StoredFileWorkingCopy extends ResourceWorkingCopy {
    static { StoredFileWorkingCopy_1 = this; }
    get model() { return this._model; }
    //#endregion
    constructor(typeId, resource, name, modelFactory, externalResolver, fileService, logService, workingCopyFileService, filesConfigurationService, workingCopyBackupService, workingCopyService, notificationService, workingCopyEditorService, editorService, elevatedFileService, progressService) {
        super(resource, fileService);
        this.typeId = typeId;
        this.name = name;
        this.modelFactory = modelFactory;
        this.externalResolver = externalResolver;
        this.logService = logService;
        this.workingCopyFileService = workingCopyFileService;
        this.filesConfigurationService = filesConfigurationService;
        this.workingCopyBackupService = workingCopyBackupService;
        this.notificationService = notificationService;
        this.workingCopyEditorService = workingCopyEditorService;
        this.editorService = editorService;
        this.elevatedFileService = elevatedFileService;
        this.progressService = progressService;
        this.capabilities = 0 /* WorkingCopyCapabilities.None */;
        this._model = undefined;
        //#region events
        this._onDidChangeContent = this._register(new Emitter());
        this.onDidChangeContent = this._onDidChangeContent.event;
        this._onDidResolve = this._register(new Emitter());
        this.onDidResolve = this._onDidResolve.event;
        this._onDidChangeDirty = this._register(new Emitter());
        this.onDidChangeDirty = this._onDidChangeDirty.event;
        this._onDidSaveError = this._register(new Emitter());
        this.onDidSaveError = this._onDidSaveError.event;
        this._onDidSave = this._register(new Emitter());
        this.onDidSave = this._onDidSave.event;
        this._onDidRevert = this._register(new Emitter());
        this.onDidRevert = this._onDidRevert.event;
        this._onDidChangeReadonly = this._register(new Emitter());
        this.onDidChangeReadonly = this._onDidChangeReadonly.event;
        //#region Dirty
        this.dirty = false;
        this.ignoreDirtyOnModelContentChange = false;
        //#endregion
        //#region Save
        this.versionId = 0;
        this.lastContentChangeFromUndoRedo = undefined;
        this.saveSequentializer = new TaskSequentializer();
        this.ignoreSaveFromSaveParticipants = false;
        //#endregion
        //#region State
        this.inConflictMode = false;
        this.inErrorMode = false;
        // Make known to working copy service
        this._register(workingCopyService.registerWorkingCopy(this));
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.filesConfigurationService.onDidChangeReadonly(() => this._onDidChangeReadonly.fire()));
    }
    isDirty() {
        return this.dirty;
    }
    markModified() {
        this.setDirty(true); // stored file working copy tracks modified via dirty
    }
    setDirty(dirty) {
        if (!this.isResolved()) {
            return; // only resolved working copies can be marked dirty
        }
        // Track dirty state and version id
        const wasDirty = this.dirty;
        this.doSetDirty(dirty);
        // Emit as Event if dirty changed
        if (dirty !== wasDirty) {
            this._onDidChangeDirty.fire();
        }
    }
    doSetDirty(dirty) {
        const wasDirty = this.dirty;
        const wasInConflictMode = this.inConflictMode;
        const wasInErrorMode = this.inErrorMode;
        const oldSavedVersionId = this.savedVersionId;
        if (!dirty) {
            this.dirty = false;
            this.inConflictMode = false;
            this.inErrorMode = false;
            // we remember the models alternate version id to remember when the version
            // of the model matches with the saved version on disk. we need to keep this
            // in order to find out if the model changed back to a saved version (e.g.
            // when undoing long enough to reach to a version that is saved and then to
            // clear the dirty flag)
            if (this.isResolved()) {
                this.savedVersionId = this.model.versionId;
            }
        }
        else {
            this.dirty = true;
        }
        // Return function to revert this call
        return () => {
            this.dirty = wasDirty;
            this.inConflictMode = wasInConflictMode;
            this.inErrorMode = wasInErrorMode;
            this.savedVersionId = oldSavedVersionId;
        };
    }
    isResolved() {
        return !!this.model;
    }
    async resolve(options) {
        this.trace('resolve() - enter');
        // Return early if we are disposed
        if (this.isDisposed()) {
            this.trace('resolve() - exit - without resolving because file working copy is disposed');
            return;
        }
        // Unless there are explicit contents provided, it is important that we do not
        // resolve a working copy that is dirty or is in the process of saving to prevent
        // data loss.
        if (!options?.contents && (this.dirty || this.saveSequentializer.isRunning())) {
            this.trace('resolve() - exit - without resolving because file working copy is dirty or being saved');
            return;
        }
        return this.doResolve(options);
    }
    async doResolve(options) {
        // First check if we have contents to use for the working copy
        if (options?.contents) {
            return this.resolveFromBuffer(options.contents);
        }
        // Second, check if we have a backup to resolve from (only for new working copies)
        const isNew = !this.isResolved();
        if (isNew) {
            const resolvedFromBackup = await this.resolveFromBackup();
            if (resolvedFromBackup) {
                return;
            }
        }
        // Finally, resolve from file resource
        return this.resolveFromFile(options);
    }
    async resolveFromBuffer(buffer) {
        this.trace('resolveFromBuffer()');
        // Try to resolve metdata from disk
        let mtime;
        let ctime;
        let size;
        let etag;
        try {
            const metadata = await this.fileService.stat(this.resource);
            mtime = metadata.mtime;
            ctime = metadata.ctime;
            size = metadata.size;
            etag = metadata.etag;
            // Clear orphaned state when resolving was successful
            this.setOrphaned(false);
        }
        catch (error) {
            // Put some fallback values in error case
            mtime = Date.now();
            ctime = Date.now();
            size = 0;
            etag = ETAG_DISABLED;
            // Apply orphaned state based on error code
            this.setOrphaned(error.fileOperationResult === 1 /* FileOperationResult.FILE_NOT_FOUND */);
        }
        // Resolve with buffer
        return this.resolveFromContent({
            resource: this.resource,
            name: this.name,
            mtime,
            ctime,
            size,
            etag,
            value: buffer,
            readonly: false,
            locked: false
        }, true /* dirty (resolved from buffer) */);
    }
    async resolveFromBackup() {
        // Resolve backup if any
        const backup = await this.workingCopyBackupService.resolve(this);
        // Abort if someone else managed to resolve the working copy by now
        const isNew = !this.isResolved();
        if (!isNew) {
            this.trace('resolveFromBackup() - exit - withoutresolving because previously new file working copy got created meanwhile');
            return true; // imply that resolving has happened in another operation
        }
        // Try to resolve from backup if we have any
        if (backup) {
            await this.doResolveFromBackup(backup);
            return true;
        }
        // Otherwise signal back that resolving did not happen
        return false;
    }
    async doResolveFromBackup(backup) {
        this.trace('doResolveFromBackup()');
        // Resolve with backup
        await this.resolveFromContent({
            resource: this.resource,
            name: this.name,
            mtime: backup.meta ? backup.meta.mtime : Date.now(),
            ctime: backup.meta ? backup.meta.ctime : Date.now(),
            size: backup.meta ? backup.meta.size : 0,
            etag: backup.meta ? backup.meta.etag : ETAG_DISABLED, // etag disabled if unknown!
            value: backup.value,
            readonly: false,
            locked: false
        }, true /* dirty (resolved from backup) */);
        // Restore orphaned flag based on state
        if (backup.meta && backup.meta.orphaned) {
            this.setOrphaned(true);
        }
    }
    async resolveFromFile(options) {
        this.trace('resolveFromFile()');
        const forceReadFromFile = options?.forceReadFromFile;
        // Decide on etag
        let etag;
        if (forceReadFromFile) {
            etag = ETAG_DISABLED; // disable ETag if we enforce to read from disk
        }
        else if (this.lastResolvedFileStat) {
            etag = this.lastResolvedFileStat.etag; // otherwise respect etag to support caching
        }
        // Remember current version before doing any long running operation
        // to ensure we are not changing a working copy that was changed
        // meanwhile
        const currentVersionId = this.versionId;
        // Resolve Content
        try {
            const content = await this.fileService.readFileStream(this.resource, {
                etag,
                limits: options?.limits
            });
            // Clear orphaned state when resolving was successful
            this.setOrphaned(false);
            // Return early if the working copy content has changed
            // meanwhile to prevent loosing any changes
            if (currentVersionId !== this.versionId) {
                this.trace('resolveFromFile() - exit - without resolving because file working copy content changed');
                return;
            }
            await this.resolveFromContent(content, false /* not dirty (resolved from file) */);
        }
        catch (error) {
            const result = error.fileOperationResult;
            // Apply orphaned state based on error code
            this.setOrphaned(result === 1 /* FileOperationResult.FILE_NOT_FOUND */);
            // NotModified status is expected and can be handled gracefully
            // if we are resolved. We still want to update our last resolved
            // stat to e.g. detect changes to the file's readonly state
            if (this.isResolved() && result === 2 /* FileOperationResult.FILE_NOT_MODIFIED_SINCE */) {
                if (error instanceof NotModifiedSinceFileOperationError) {
                    this.updateLastResolvedFileStat(error.stat);
                }
                return;
            }
            // Unless we are forced to read from the file, ignore when a working copy has
            // been resolved once and the file was deleted meanwhile. Since we already have
            // the working copy resolved, we can return to this state and update the orphaned
            // flag to indicate that this working copy has no version on disk anymore.
            if (this.isResolved() && result === 1 /* FileOperationResult.FILE_NOT_FOUND */ && !forceReadFromFile) {
                return;
            }
            // Otherwise bubble up the error
            throw error;
        }
    }
    async resolveFromContent(content, dirty) {
        this.trace('resolveFromContent() - enter');
        // Return early if we are disposed
        if (this.isDisposed()) {
            this.trace('resolveFromContent() - exit - because working copy is disposed');
            return;
        }
        // Update our resolved disk stat
        this.updateLastResolvedFileStat({
            resource: this.resource,
            name: content.name,
            mtime: content.mtime,
            ctime: content.ctime,
            size: content.size,
            etag: content.etag,
            readonly: content.readonly,
            locked: content.locked,
            isFile: true,
            isDirectory: false,
            isSymbolicLink: false,
            children: undefined
        });
        // Update existing model if we had been resolved
        if (this.isResolved()) {
            await this.doUpdateModel(content.value);
        }
        // Create new model otherwise
        else {
            await this.doCreateModel(content.value);
        }
        // Update working copy dirty flag. This is very important to call
        // in both cases of dirty or not because it conditionally updates
        // the `savedVersionId` to determine the version when to consider
        // the working copy as saved again (e.g. when undoing back to the
        // saved state)
        this.setDirty(!!dirty);
        // Emit as event
        this._onDidResolve.fire();
    }
    async doCreateModel(contents) {
        this.trace('doCreateModel()');
        // Create model and dispose it when we get disposed
        this._model = this._register(await this.modelFactory.createModel(this.resource, contents, CancellationToken.None));
        // Model listeners
        this.installModelListeners(this._model);
    }
    async doUpdateModel(contents) {
        this.trace('doUpdateModel()');
        // Update model value in a block that ignores content change events for dirty tracking
        this.ignoreDirtyOnModelContentChange = true;
        try {
            await this.model?.update(contents, CancellationToken.None);
        }
        finally {
            this.ignoreDirtyOnModelContentChange = false;
        }
    }
    installModelListeners(model) {
        // See https://github.com/microsoft/vscode/issues/30189
        // This code has been extracted to a different method because it caused a memory leak
        // where `value` was captured in the content change listener closure scope.
        // Content Change
        this._register(model.onDidChangeContent(e => this.onModelContentChanged(model, e.isUndoing || e.isRedoing)));
        // Lifecycle
        this._register(model.onWillDispose(() => this.dispose()));
    }
    onModelContentChanged(model, isUndoingOrRedoing) {
        this.trace(`onModelContentChanged() - enter`);
        // In any case increment the version id because it tracks the content state of the model at all times
        this.versionId++;
        this.trace(`onModelContentChanged() - new versionId ${this.versionId}`);
        // Remember when the user changed the model through a undo/redo operation.
        // We need this information to throttle save participants to fix
        // https://github.com/microsoft/vscode/issues/102542
        if (isUndoingOrRedoing) {
            this.lastContentChangeFromUndoRedo = Date.now();
        }
        // We mark check for a dirty-state change upon model content change, unless:
        // - explicitly instructed to ignore it (e.g. from model.resolve())
        // - the model is readonly (in that case we never assume the change was done by the user)
        if (!this.ignoreDirtyOnModelContentChange && !this.isReadonly()) {
            // The contents changed as a matter of Undo and the version reached matches the saved one
            // In this case we clear the dirty flag and emit a SAVED event to indicate this state.
            if (model.versionId === this.savedVersionId) {
                this.trace('onModelContentChanged() - model content changed back to last saved version');
                // Clear flags
                const wasDirty = this.dirty;
                this.setDirty(false);
                // Emit revert event if we were dirty
                if (wasDirty) {
                    this._onDidRevert.fire();
                }
            }
            // Otherwise the content has changed and we signal this as becoming dirty
            else {
                this.trace('onModelContentChanged() - model content changed and marked as dirty');
                // Mark as dirty
                this.setDirty(true);
            }
        }
        // Emit as event
        this._onDidChangeContent.fire();
    }
    async forceResolveFromFile() {
        if (this.isDisposed()) {
            return; // return early when the working copy is invalid
        }
        // We go through the resolver to make
        // sure this kind of `resolve` is properly
        // running in sequence with any other running
        // `resolve` if any, including subsequent runs
        // that are triggered right after.
        await this.externalResolver({
            forceReadFromFile: true
        });
    }
    //#endregion
    //#region Backup
    get backupDelay() {
        return this.model?.configuration?.backupDelay;
    }
    async backup(token) {
        // Fill in metadata if we are resolved
        let meta = undefined;
        if (this.lastResolvedFileStat) {
            meta = {
                mtime: this.lastResolvedFileStat.mtime,
                ctime: this.lastResolvedFileStat.ctime,
                size: this.lastResolvedFileStat.size,
                etag: this.lastResolvedFileStat.etag,
                orphaned: this.isOrphaned()
            };
        }
        // Fill in content if we are resolved
        let content = undefined;
        if (this.isResolved()) {
            content = await raceCancellation(this.model.snapshot(2 /* SnapshotContext.Backup */, token), token);
        }
        return { meta, content };
    }
    static { this.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD = 500; }
    async save(options = Object.create(null)) {
        if (!this.isResolved()) {
            return false;
        }
        if (this.isReadonly()) {
            this.trace('save() - ignoring request for readonly resource');
            return false; // if working copy is readonly we do not attempt to save at all
        }
        if ((this.hasState(3 /* StoredFileWorkingCopyState.CONFLICT */) || this.hasState(5 /* StoredFileWorkingCopyState.ERROR */)) &&
            (options.reason === 2 /* SaveReason.AUTO */ || options.reason === 3 /* SaveReason.FOCUS_CHANGE */ || options.reason === 4 /* SaveReason.WINDOW_CHANGE */)) {
            this.trace('save() - ignoring auto save request for file working copy that is in conflict or error');
            return false; // if working copy is in save conflict or error, do not save unless save reason is explicit
        }
        // Actually do save
        this.trace('save() - enter');
        await this.doSave(options);
        this.trace('save() - exit');
        return this.hasState(0 /* StoredFileWorkingCopyState.SAVED */);
    }
    async doSave(options) {
        if (typeof options.reason !== 'number') {
            options.reason = 1 /* SaveReason.EXPLICIT */;
        }
        const versionId = this.versionId;
        this.trace(`doSave(${versionId}) - enter with versionId ${versionId}`);
        // Return early if saved from within save participant to break recursion
        //
        // Scenario: a save participant triggers a save() on the working copy
        if (this.ignoreSaveFromSaveParticipants) {
            this.trace(`doSave(${versionId}) - exit - refusing to save() recursively from save participant`);
            return;
        }
        // Lookup any running save for this versionId and return it if found
        //
        // Scenario: user invoked the save action multiple times quickly for the same contents
        //           while the save was not yet finished to disk
        //
        if (this.saveSequentializer.isRunning(versionId)) {
            this.trace(`doSave(${versionId}) - exit - found a running save for versionId ${versionId}`);
            return this.saveSequentializer.running;
        }
        // Return early if not dirty (unless forced)
        //
        // Scenario: user invoked save action even though the working copy is not dirty
        if (!options.force && !this.dirty) {
            this.trace(`doSave(${versionId}) - exit - because not dirty and/or versionId is different (this.isDirty: ${this.dirty}, this.versionId: ${this.versionId})`);
            return;
        }
        // Return if currently saving by storing this save request as the next save that should happen.
        // Never ever must 2 saves execute at the same time because this can lead to dirty writes and race conditions.
        //
        // Scenario A: auto save was triggered and is currently busy saving to disk. this takes long enough that another auto save
        //             kicks in.
        // Scenario B: save is very slow (e.g. network share) and the user manages to change the working copy and trigger another save
        //             while the first save has not returned yet.
        //
        if (this.saveSequentializer.isRunning()) {
            this.trace(`doSave(${versionId}) - exit - because busy saving`);
            // Indicate to the save sequentializer that we want to
            // cancel the running operation so that ours can run
            // before the running one finishes.
            // Currently this will try to cancel running save
            // participants and running snapshots from the
            // save operation, but not the actual save which does
            // not support cancellation yet.
            this.saveSequentializer.cancelRunning();
            // Queue this as the upcoming save and return
            return this.saveSequentializer.queue(() => this.doSave(options));
        }
        // Push all edit operations to the undo stack so that the user has a chance to
        // Ctrl+Z back to the saved version.
        if (this.isResolved()) {
            this.model.pushStackElement();
        }
        const saveCancellation = new CancellationTokenSource();
        return this.progressService.withProgress({
            title: localize('saveParticipants', "Saving '{0}'", this.name),
            location: 10 /* ProgressLocation.Window */,
            cancellable: true,
            delay: this.isDirty() ? 3000 : 5000
        }, progress => {
            return this.doSaveSequential(versionId, options, progress, saveCancellation);
        }, () => {
            saveCancellation.cancel();
        }).finally(() => {
            saveCancellation.dispose();
        });
    }
    doSaveSequential(versionId, options, progress, saveCancellation) {
        return this.saveSequentializer.run(versionId, (async () => {
            // A save participant can still change the working copy now
            // and since we are so close to saving we do not want to trigger
            // another auto save or similar, so we block this
            // In addition we update our version right after in case it changed
            // because of a working copy change
            // Save participants can also be skipped through API.
            if (this.isResolved() && !options.skipSaveParticipants && this.workingCopyFileService.hasSaveParticipants) {
                try {
                    // Measure the time it took from the last undo/redo operation to this save. If this
                    // time is below `UNDO_REDO_SAVE_PARTICIPANTS_THROTTLE_THRESHOLD`, we make sure to
                    // delay the save participant for the remaining time if the reason is auto save.
                    //
                    // This fixes the following issue:
                    // - the user has configured auto save with delay of 100ms or shorter
                    // - the user has a save participant enabled that modifies the file on each save
                    // - the user types into the file and the file gets saved
                    // - the user triggers undo operation
                    // - this will undo the save participant change but trigger the save participant right after
                    // - the user has no chance to undo over the save participant
                    //
                    // Reported as: https://github.com/microsoft/vscode/issues/102542
                    if (options.reason === 2 /* SaveReason.AUTO */ && typeof this.lastContentChangeFromUndoRedo === 'number') {
                        const timeFromUndoRedoToSave = Date.now() - this.lastContentChangeFromUndoRedo;
                        if (timeFromUndoRedoToSave < StoredFileWorkingCopy_1.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD) {
                            await timeout(StoredFileWorkingCopy_1.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD - timeFromUndoRedoToSave);
                        }
                    }
                    // Run save participants unless save was cancelled meanwhile
                    if (!saveCancellation.token.isCancellationRequested) {
                        this.ignoreSaveFromSaveParticipants = true;
                        try {
                            await this.workingCopyFileService.runSaveParticipants(this, { reason: options.reason ?? 1 /* SaveReason.EXPLICIT */, savedFrom: options.from }, progress, saveCancellation.token);
                        }
                        finally {
                            this.ignoreSaveFromSaveParticipants = false;
                        }
                    }
                }
                catch (error) {
                    this.logService.error(`[stored file working copy] runSaveParticipants(${versionId}) - resulted in an error: ${error.toString()}`, this.resource.toString(), this.typeId);
                }
            }
            // It is possible that a subsequent save is cancelling this
            // running save. As such we return early when we detect that.
            if (saveCancellation.token.isCancellationRequested) {
                return;
            }
            // We have to protect against being disposed at this point. It could be that the save() operation
            // was triggerd followed by a dispose() operation right after without waiting. Typically we cannot
            // be disposed if we are dirty, but if we are not dirty, save() and dispose() can still be triggered
            // one after the other without waiting for the save() to complete. If we are disposed(), we risk
            // saving contents to disk that are stale (see https://github.com/microsoft/vscode/issues/50942).
            // To fix this issue, we will not store the contents to disk when we got disposed.
            if (this.isDisposed()) {
                return;
            }
            // We require a resolved working copy from this point on, since we are about to write data to disk.
            if (!this.isResolved()) {
                return;
            }
            // update versionId with its new value (if pre-save changes happened)
            versionId = this.versionId;
            // Clear error flag since we are trying to save again
            this.inErrorMode = false;
            // Save to Disk. We mark the save operation as currently running with
            // the latest versionId because it might have changed from a save
            // participant triggering
            progress.report({ message: localize('saveTextFile', "Writing into file...") });
            this.trace(`doSave(${versionId}) - before write()`);
            const lastResolvedFileStat = assertIsDefined(this.lastResolvedFileStat);
            const resolvedFileWorkingCopy = this;
            return this.saveSequentializer.run(versionId, (async () => {
                try {
                    const writeFileOptions = {
                        mtime: lastResolvedFileStat.mtime,
                        etag: (options.ignoreModifiedSince || !this.filesConfigurationService.preventSaveConflicts(lastResolvedFileStat.resource)) ? ETAG_DISABLED : lastResolvedFileStat.etag,
                        unlock: options.writeUnlock
                    };
                    let stat;
                    // Delegate to working copy model save method if any
                    if (typeof resolvedFileWorkingCopy.model.save === 'function') {
                        try {
                            stat = await resolvedFileWorkingCopy.model.save(writeFileOptions, saveCancellation.token);
                        }
                        catch (error) {
                            if (saveCancellation.token.isCancellationRequested) {
                                return undefined; // save was cancelled
                            }
                            throw error;
                        }
                    }
                    // Otherwise ask for a snapshot and save via file services
                    else {
                        // Snapshot working copy model contents
                        const snapshot = await raceCancellation(resolvedFileWorkingCopy.model.snapshot(1 /* SnapshotContext.Save */, saveCancellation.token), saveCancellation.token);
                        // It is possible that a subsequent save is cancelling this
                        // running save. As such we return early when we detect that
                        // However, we do not pass the token into the file service
                        // because that is an atomic operation currently without
                        // cancellation support, so we dispose the cancellation if
                        // it was not cancelled yet.
                        if (saveCancellation.token.isCancellationRequested) {
                            return;
                        }
                        else {
                            saveCancellation.dispose();
                        }
                        // Write them to disk
                        if (options?.writeElevated && this.elevatedFileService.isSupported(lastResolvedFileStat.resource)) {
                            stat = await this.elevatedFileService.writeFileElevated(lastResolvedFileStat.resource, assertIsDefined(snapshot), writeFileOptions);
                        }
                        else {
                            stat = await this.fileService.writeFile(lastResolvedFileStat.resource, assertIsDefined(snapshot), writeFileOptions);
                        }
                    }
                    this.handleSaveSuccess(stat, versionId, options);
                }
                catch (error) {
                    this.handleSaveError(error, versionId, options);
                }
            })(), () => saveCancellation.cancel());
        })(), () => saveCancellation.cancel());
    }
    handleSaveSuccess(stat, versionId, options) {
        // Updated resolved stat with updated stat
        this.updateLastResolvedFileStat(stat);
        // Update dirty state unless working copy has changed meanwhile
        if (versionId === this.versionId) {
            this.trace(`handleSaveSuccess(${versionId}) - setting dirty to false because versionId did not change`);
            this.setDirty(false);
        }
        else {
            this.trace(`handleSaveSuccess(${versionId}) - not setting dirty to false because versionId did change meanwhile`);
        }
        // Update orphan state given save was successful
        this.setOrphaned(false);
        // Emit Save Event
        this._onDidSave.fire({ reason: options.reason, stat, source: options.source });
    }
    handleSaveError(error, versionId, options) {
        (options.ignoreErrorHandler ? this.logService.trace : this.logService.error).apply(this.logService, [`[stored file working copy] handleSaveError(${versionId}) - exit - resulted in a save error: ${error.toString()}`, this.resource.toString(), this.typeId]);
        // Return early if the save() call was made asking to
        // handle the save error itself.
        if (options.ignoreErrorHandler) {
            throw error;
        }
        // In any case of an error, we mark the working copy as dirty to prevent data loss
        // It could be possible that the write corrupted the file on disk (e.g. when
        // an error happened after truncating the file) and as such we want to preserve
        // the working copy contents to prevent data loss.
        this.setDirty(true);
        // Flag as error state
        this.inErrorMode = true;
        // Look out for a save conflict
        if (error.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
            this.inConflictMode = true;
        }
        // Show save error to user for handling
        this.doHandleSaveError(error, options);
        // Emit as event
        this._onDidSaveError.fire();
    }
    doHandleSaveError(error, options) {
        const fileOperationError = error;
        const primaryActions = [];
        let message;
        // Dirty write prevention
        if (fileOperationError.fileOperationResult === 3 /* FileOperationResult.FILE_MODIFIED_SINCE */) {
            message = localize('staleSaveError', "Failed to save '{0}': The content of the file is newer. Do you want to overwrite the file with your changes?", this.name);
            primaryActions.push(toAction({ id: 'fileWorkingCopy.overwrite', label: localize('overwrite', "Overwrite"), run: () => this.save({ ...options, ignoreModifiedSince: true, reason: 1 /* SaveReason.EXPLICIT */ }) }));
            primaryActions.push(toAction({ id: 'fileWorkingCopy.revert', label: localize('revert', "Revert"), run: () => this.revert() }));
        }
        // Any other save error
        else {
            const isWriteLocked = fileOperationError.fileOperationResult === 5 /* FileOperationResult.FILE_WRITE_LOCKED */;
            const triedToUnlock = isWriteLocked && fileOperationError.options?.unlock;
            const isPermissionDenied = fileOperationError.fileOperationResult === 6 /* FileOperationResult.FILE_PERMISSION_DENIED */;
            const canSaveElevated = this.elevatedFileService.isSupported(this.resource);
            // Error with Actions
            if (isErrorWithActions(error)) {
                primaryActions.push(...error.actions);
            }
            // Save Elevated
            if (canSaveElevated && (isPermissionDenied || triedToUnlock)) {
                primaryActions.push(toAction({
                    id: 'fileWorkingCopy.saveElevated',
                    label: triedToUnlock ?
                        isWindows ? localize('overwriteElevated', "Overwrite as Admin...") : localize('overwriteElevatedSudo', "Overwrite as Sudo...") :
                        isWindows ? localize('saveElevated', "Retry as Admin...") : localize('saveElevatedSudo', "Retry as Sudo..."),
                    run: () => {
                        this.save({ ...options, writeElevated: true, writeUnlock: triedToUnlock, reason: 1 /* SaveReason.EXPLICIT */ });
                    }
                }));
            }
            // Unlock
            else if (isWriteLocked) {
                primaryActions.push(toAction({ id: 'fileWorkingCopy.unlock', label: localize('overwrite', "Overwrite"), run: () => this.save({ ...options, writeUnlock: true, reason: 1 /* SaveReason.EXPLICIT */ }) }));
            }
            // Retry
            else {
                primaryActions.push(toAction({ id: 'fileWorkingCopy.retry', label: localize('retry', "Retry"), run: () => this.save({ ...options, reason: 1 /* SaveReason.EXPLICIT */ }) }));
            }
            // Save As
            primaryActions.push(toAction({
                id: 'fileWorkingCopy.saveAs',
                label: localize('saveAs', "Save As..."),
                run: async () => {
                    const editor = this.workingCopyEditorService.findEditor(this);
                    if (editor) {
                        const result = await this.editorService.save(editor, { saveAs: true, reason: 1 /* SaveReason.EXPLICIT */ });
                        if (!result.success) {
                            this.doHandleSaveError(error, options); // show error again given the operation failed
                        }
                    }
                }
            }));
            // Revert
            primaryActions.push(toAction({ id: 'fileWorkingCopy.revert', label: localize('revert', "Revert"), run: () => this.revert() }));
            // Message
            if (isWriteLocked) {
                if (triedToUnlock && canSaveElevated) {
                    message = isWindows ?
                        localize('readonlySaveErrorAdmin', "Failed to save '{0}': File is read-only. Select 'Overwrite as Admin' to retry as administrator.", this.name) :
                        localize('readonlySaveErrorSudo', "Failed to save '{0}': File is read-only. Select 'Overwrite as Sudo' to retry as superuser.", this.name);
                }
                else {
                    message = localize('readonlySaveError', "Failed to save '{0}': File is read-only. Select 'Overwrite' to attempt to make it writeable.", this.name);
                }
            }
            else if (canSaveElevated && isPermissionDenied) {
                message = isWindows ?
                    localize('permissionDeniedSaveError', "Failed to save '{0}': Insufficient permissions. Select 'Retry as Admin' to retry as administrator.", this.name) :
                    localize('permissionDeniedSaveErrorSudo', "Failed to save '{0}': Insufficient permissions. Select 'Retry as Sudo' to retry as superuser.", this.name);
            }
            else {
                message = localize({ key: 'genericSaveError', comment: ['{0} is the resource that failed to save and {1} the error message'] }, "Failed to save '{0}': {1}", this.name, toErrorMessage(error, false));
            }
        }
        // Show to the user as notification
        const handle = this.notificationService.notify({ id: `${hash(this.resource.toString())}`, severity: Severity.Error, message, actions: { primary: primaryActions } });
        // Remove automatically when we get saved/reverted
        const listener = this._register(Event.once(Event.any(this.onDidSave, this.onDidRevert))(() => handle.close()));
        this._register(Event.once(handle.onDidClose)(() => listener.dispose()));
    }
    updateLastResolvedFileStat(newFileStat) {
        const oldReadonly = this.isReadonly();
        // First resolve - just take
        if (!this.lastResolvedFileStat) {
            this.lastResolvedFileStat = newFileStat;
        }
        // Subsequent resolve - make sure that we only assign it if the mtime
        // is equal or has advanced.
        // This prevents race conditions from resolving and saving. If a save
        // comes in late after a revert was called, the mtime could be out of
        // sync.
        else if (this.lastResolvedFileStat.mtime <= newFileStat.mtime) {
            this.lastResolvedFileStat = newFileStat;
        }
        // In all other cases update only the readonly and locked flags
        else {
            this.lastResolvedFileStat = { ...this.lastResolvedFileStat, readonly: newFileStat.readonly, locked: newFileStat.locked };
        }
        // Signal that the readonly state changed
        if (this.isReadonly() !== oldReadonly) {
            this._onDidChangeReadonly.fire();
        }
    }
    //#endregion
    //#region Revert
    async revert(options) {
        if (!this.isResolved() || (!this.dirty && !options?.force)) {
            return; // ignore if not resolved or not dirty and not enforced
        }
        this.trace('revert()');
        // Unset flags
        const wasDirty = this.dirty;
        const undoSetDirty = this.doSetDirty(false);
        // Force read from disk unless reverting soft
        const softUndo = options?.soft;
        if (!softUndo) {
            try {
                await this.forceResolveFromFile();
            }
            catch (error) {
                // FileNotFound means the file got deleted meanwhile, so ignore it
                if (error.fileOperationResult !== 1 /* FileOperationResult.FILE_NOT_FOUND */) {
                    // Set flags back to previous values, we are still dirty if revert failed
                    undoSetDirty();
                    throw error;
                }
            }
        }
        // Emit file change event
        this._onDidRevert.fire();
        // Emit dirty change event
        if (wasDirty) {
            this._onDidChangeDirty.fire();
        }
    }
    hasState(state) {
        switch (state) {
            case 3 /* StoredFileWorkingCopyState.CONFLICT */:
                return this.inConflictMode;
            case 1 /* StoredFileWorkingCopyState.DIRTY */:
                return this.dirty;
            case 5 /* StoredFileWorkingCopyState.ERROR */:
                return this.inErrorMode;
            case 4 /* StoredFileWorkingCopyState.ORPHAN */:
                return this.isOrphaned();
            case 2 /* StoredFileWorkingCopyState.PENDING_SAVE */:
                return this.saveSequentializer.isRunning();
            case 0 /* StoredFileWorkingCopyState.SAVED */:
                return !this.dirty;
        }
    }
    async joinState(state) {
        return this.saveSequentializer.running;
    }
    //#endregion
    //#region Utilities
    isReadonly() {
        return this.filesConfigurationService.isReadonly(this.resource, this.lastResolvedFileStat);
    }
    trace(msg) {
        this.logService.trace(`[stored file working copy] ${msg}`, this.resource.toString(), this.typeId);
    }
    //#endregion
    //#region Dispose
    dispose() {
        this.trace('dispose()');
        // State
        this.inConflictMode = false;
        this.inErrorMode = false;
        // Free up model for GC
        this._model = undefined;
        super.dispose();
    }
};
StoredFileWorkingCopy = StoredFileWorkingCopy_1 = __decorate([
    __param(5, IFileService),
    __param(6, ILogService),
    __param(7, IWorkingCopyFileService),
    __param(8, IFilesConfigurationService),
    __param(9, IWorkingCopyBackupService),
    __param(10, IWorkingCopyService),
    __param(11, INotificationService),
    __param(12, IWorkingCopyEditorService),
    __param(13, IEditorService),
    __param(14, IElevatedFileService),
    __param(15, IProgressService),
    __metadata("design:paramtypes", [String, URI, String, Object, Function, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], StoredFileWorkingCopy);
export { StoredFileWorkingCopy };
