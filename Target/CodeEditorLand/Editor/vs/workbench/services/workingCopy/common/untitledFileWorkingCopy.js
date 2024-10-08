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
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { URI } from '../../../../base/common/uri.js';
import { IWorkingCopyService } from './workingCopyService.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { raceCancellation } from '../../../../base/common/async.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkingCopyBackupService } from './workingCopyBackup.js';
import { emptyStream } from '../../../../base/common/stream.js';
let UntitledFileWorkingCopy = class UntitledFileWorkingCopy extends Disposable {
    get model() { return this._model; }
    //#endregion
    constructor(typeId, resource, name, hasAssociatedFilePath, isScratchpad, initialContents, modelFactory, saveDelegate, workingCopyService, workingCopyBackupService, logService) {
        super();
        this.typeId = typeId;
        this.resource = resource;
        this.name = name;
        this.hasAssociatedFilePath = hasAssociatedFilePath;
        this.isScratchpad = isScratchpad;
        this.initialContents = initialContents;
        this.modelFactory = modelFactory;
        this.saveDelegate = saveDelegate;
        this.workingCopyBackupService = workingCopyBackupService;
        this.logService = logService;
        this.capabilities = this.isScratchpad ? 2 /* WorkingCopyCapabilities.Untitled */ | 4 /* WorkingCopyCapabilities.Scratchpad */ : 2 /* WorkingCopyCapabilities.Untitled */;
        this._model = undefined;
        //#region Events
        this._onDidChangeContent = this._register(new Emitter());
        this.onDidChangeContent = this._onDidChangeContent.event;
        this._onDidChangeDirty = this._register(new Emitter());
        this.onDidChangeDirty = this._onDidChangeDirty.event;
        this._onDidSave = this._register(new Emitter());
        this.onDidSave = this._onDidSave.event;
        this._onDidRevert = this._register(new Emitter());
        this.onDidRevert = this._onDidRevert.event;
        this._onWillDispose = this._register(new Emitter());
        this.onWillDispose = this._onWillDispose.event;
        //#region Dirty/Modified
        this.modified = this.hasAssociatedFilePath || Boolean(this.initialContents && this.initialContents.markModified !== false);
        // Make known to working copy service
        this._register(workingCopyService.registerWorkingCopy(this));
    }
    isDirty() {
        return this.modified && !this.isScratchpad; // Scratchpad working copies are never dirty
    }
    isModified() {
        return this.modified;
    }
    setModified(modified) {
        if (this.modified === modified) {
            return;
        }
        this.modified = modified;
        if (!this.isScratchpad) {
            this._onDidChangeDirty.fire();
        }
    }
    //#endregion
    //#region Resolve
    async resolve() {
        this.trace('resolve()');
        if (this.isResolved()) {
            this.trace('resolve() - exit (already resolved)');
            // return early if the untitled file working copy is already
            // resolved assuming that the contents have meanwhile changed
            // in the underlying model. we only resolve untitled once.
            return;
        }
        let untitledContents;
        // Check for backups or use initial value or empty
        const backup = await this.workingCopyBackupService.resolve(this);
        if (backup) {
            this.trace('resolve() - with backup');
            untitledContents = backup.value;
        }
        else if (this.initialContents?.value) {
            this.trace('resolve() - with initial contents');
            untitledContents = this.initialContents.value;
        }
        else {
            this.trace('resolve() - empty');
            untitledContents = emptyStream();
        }
        // Create model
        await this.doCreateModel(untitledContents);
        // Untitled associated to file path are modified right away as well as untitled with content
        this.setModified(this.hasAssociatedFilePath || !!backup || Boolean(this.initialContents && this.initialContents.markModified !== false));
        // If we have initial contents, make sure to emit this
        // as the appropriate events to the outside.
        if (!!backup || this.initialContents) {
            this._onDidChangeContent.fire();
        }
    }
    async doCreateModel(contents) {
        this.trace('doCreateModel()');
        // Create model and dispose it when we get disposed
        this._model = this._register(await this.modelFactory.createModel(this.resource, contents, CancellationToken.None));
        // Model listeners
        this.installModelListeners(this._model);
    }
    installModelListeners(model) {
        // Content Change
        this._register(model.onDidChangeContent(e => this.onModelContentChanged(e)));
        // Lifecycle
        this._register(model.onWillDispose(() => this.dispose()));
    }
    onModelContentChanged(e) {
        // Mark the untitled file working copy as non-modified once its
        // in case provided by the change event and in case we do not
        // have an associated path set
        if (!this.hasAssociatedFilePath && e.isInitial) {
            this.setModified(false);
        }
        // Turn modified otherwise
        else {
            this.setModified(true);
        }
        // Emit as general content change event
        this._onDidChangeContent.fire();
    }
    isResolved() {
        return !!this.model;
    }
    //#endregion
    //#region Backup
    get backupDelay() {
        return this.model?.configuration?.backupDelay;
    }
    async backup(token) {
        let content = undefined;
        // Make sure to check whether this working copy has been
        // resolved or not and fallback to the initial value -
        // if any - to prevent backing up an unresolved working
        // copy and loosing the initial value.
        if (this.isResolved()) {
            content = await raceCancellation(this.model.snapshot(2 /* SnapshotContext.Backup */, token), token);
        }
        else if (this.initialContents) {
            content = this.initialContents.value;
        }
        return { content };
    }
    //#endregion
    //#region Save
    async save(options) {
        this.trace('save()');
        const result = await this.saveDelegate(this, options);
        // Emit Save Event
        if (result) {
            this._onDidSave.fire({ reason: options?.reason, source: options?.source });
        }
        return result;
    }
    //#endregion
    //#region Revert
    async revert() {
        this.trace('revert()');
        // No longer modified
        this.setModified(false);
        // Emit as event
        this._onDidRevert.fire();
        // A reverted untitled file working copy is invalid
        // because it has no actual source on disk to revert to.
        // As such we dispose the model.
        this.dispose();
    }
    //#endregion
    dispose() {
        this.trace('dispose()');
        this._onWillDispose.fire();
        super.dispose();
    }
    trace(msg) {
        this.logService.trace(`[untitled file working copy] ${msg}`, this.resource.toString(), this.typeId);
    }
};
UntitledFileWorkingCopy = __decorate([
    __param(8, IWorkingCopyService),
    __param(9, IWorkingCopyBackupService),
    __param(10, ILogService),
    __metadata("design:paramtypes", [String, URI, String, Boolean, Boolean, Object, Object, Function, Object, Object, Object])
], UntitledFileWorkingCopy);
export { UntitledFileWorkingCopy };
