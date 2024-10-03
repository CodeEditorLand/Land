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
        this.capabilities = this.isScratchpad ? 2 | 4 : 2;
        this._model = undefined;
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
        this.modified = this.hasAssociatedFilePath || Boolean(this.initialContents && this.initialContents.markModified !== false);
        this._register(workingCopyService.registerWorkingCopy(this));
    }
    isDirty() {
        return this.modified && !this.isScratchpad;
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
    async resolve() {
        this.trace('resolve()');
        if (this.isResolved()) {
            this.trace('resolve() - exit (already resolved)');
            return;
        }
        let untitledContents;
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
        await this.doCreateModel(untitledContents);
        this.setModified(this.hasAssociatedFilePath || !!backup || Boolean(this.initialContents && this.initialContents.markModified !== false));
        if (!!backup || this.initialContents) {
            this._onDidChangeContent.fire();
        }
    }
    async doCreateModel(contents) {
        this.trace('doCreateModel()');
        this._model = this._register(await this.modelFactory.createModel(this.resource, contents, CancellationToken.None));
        this.installModelListeners(this._model);
    }
    installModelListeners(model) {
        this._register(model.onDidChangeContent(e => this.onModelContentChanged(e)));
        this._register(model.onWillDispose(() => this.dispose()));
    }
    onModelContentChanged(e) {
        if (!this.hasAssociatedFilePath && e.isInitial) {
            this.setModified(false);
        }
        else {
            this.setModified(true);
        }
        this._onDidChangeContent.fire();
    }
    isResolved() {
        return !!this.model;
    }
    get backupDelay() {
        return this.model?.configuration?.backupDelay;
    }
    async backup(token) {
        let content = undefined;
        if (this.isResolved()) {
            content = await raceCancellation(this.model.snapshot(2, token), token);
        }
        else if (this.initialContents) {
            content = this.initialContents.value;
        }
        return { content };
    }
    async save(options) {
        this.trace('save()');
        const result = await this.saveDelegate(this, options);
        if (result) {
            this._onDidSave.fire({ reason: options?.reason, source: options?.source });
        }
        return result;
    }
    async revert() {
        this.trace('revert()');
        this.setModified(false);
        this._onDidRevert.fire();
        this.dispose();
    }
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
