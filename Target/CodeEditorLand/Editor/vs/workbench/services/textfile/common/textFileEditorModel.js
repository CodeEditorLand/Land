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
var TextFileEditorModel_1;
import { localize } from '../../../../nls.js';
import { Emitter } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { mark } from '../../../../base/common/performance.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { ITextFileService } from './textfiles.js';
import { SaveSourceRegistry } from '../../../common/editor.js';
import { BaseTextEditorModel } from '../../../common/editor/textEditorModel.js';
import { IWorkingCopyBackupService } from '../../workingCopy/common/workingCopyBackup.js';
import { IFileService, ETAG_DISABLED, NotModifiedSinceFileOperationError } from '../../../../platform/files/common/files.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { timeout, TaskSequentializer } from '../../../../base/common/async.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { basename } from '../../../../base/common/path.js';
import { IWorkingCopyService } from '../../workingCopy/common/workingCopyService.js';
import { NO_TYPE_ID } from '../../workingCopy/common/workingCopy.js';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { CancellationToken, CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { UTF16be, UTF16le, UTF8, UTF8_with_bom } from './encoding.js';
import { createTextBufferFactoryFromStream } from '../../../../editor/common/model/textModel.js';
import { ILanguageDetectionService } from '../../languageDetection/common/languageDetectionWorkerService.js';
import { IPathService } from '../../path/common/pathService.js';
import { extUri } from '../../../../base/common/resources.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { PLAINTEXT_LANGUAGE_ID } from '../../../../editor/common/languages/modesRegistry.js';
import { IExtensionService } from '../../extensions/common/extensions.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
let TextFileEditorModel = class TextFileEditorModel extends BaseTextEditorModel {
    static { TextFileEditorModel_1 = this; }
    static { this.TEXTFILE_SAVE_ENCODING_SOURCE = SaveSourceRegistry.registerSource('textFileEncoding.source', localize('textFileCreate.source', "File Encoding Changed")); }
    static { this.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD = 500; }
    constructor(resource, preferredEncoding, preferredLanguageId, languageService, modelService, fileService, textFileService, workingCopyBackupService, logService, workingCopyService, filesConfigurationService, labelService, languageDetectionService, accessibilityService, pathService, extensionService, progressService) {
        super(modelService, languageService, languageDetectionService, accessibilityService);
        this.resource = resource;
        this.preferredEncoding = preferredEncoding;
        this.preferredLanguageId = preferredLanguageId;
        this.fileService = fileService;
        this.textFileService = textFileService;
        this.workingCopyBackupService = workingCopyBackupService;
        this.logService = logService;
        this.workingCopyService = workingCopyService;
        this.filesConfigurationService = filesConfigurationService;
        this.labelService = labelService;
        this.pathService = pathService;
        this.extensionService = extensionService;
        this.progressService = progressService;
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
        this._onDidChangeEncoding = this._register(new Emitter());
        this.onDidChangeEncoding = this._onDidChangeEncoding.event;
        this._onDidChangeOrphaned = this._register(new Emitter());
        this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
        this._onDidChangeReadonly = this._register(new Emitter());
        this.onDidChangeReadonly = this._onDidChangeReadonly.event;
        this.typeId = NO_TYPE_ID;
        this.capabilities = 0;
        this.name = basename(this.labelService.getUriLabel(this.resource));
        this.resourceHasExtension = !!extUri.extname(this.resource);
        this.versionId = 0;
        this.ignoreDirtyOnModelContentChange = false;
        this.ignoreSaveFromSaveParticipants = false;
        this.lastModelContentChangeFromUndoRedo = undefined;
        this.saveSequentializer = new TaskSequentializer();
        this.dirty = false;
        this.inConflictMode = false;
        this.inOrphanMode = false;
        this.inErrorMode = false;
        this.hasEncodingSetExplicitly = false;
        this._register(this.workingCopyService.registerWorkingCopy(this));
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
        this._register(this.filesConfigurationService.onDidChangeFilesAssociation(() => this.onDidChangeFilesAssociation()));
        this._register(this.filesConfigurationService.onDidChangeReadonly(() => this._onDidChangeReadonly.fire()));
    }
    async onDidFilesChange(e) {
        let fileEventImpactsModel = false;
        let newInOrphanModeGuess;
        if (this.inOrphanMode) {
            const modelFileAdded = e.contains(this.resource, 1);
            if (modelFileAdded) {
                newInOrphanModeGuess = false;
                fileEventImpactsModel = true;
            }
        }
        else {
            const modelFileDeleted = e.contains(this.resource, 2);
            if (modelFileDeleted) {
                newInOrphanModeGuess = true;
                fileEventImpactsModel = true;
            }
        }
        if (fileEventImpactsModel && this.inOrphanMode !== newInOrphanModeGuess) {
            let newInOrphanModeValidated = false;
            if (newInOrphanModeGuess) {
                await timeout(100, CancellationToken.None);
                if (this.isDisposed()) {
                    newInOrphanModeValidated = true;
                }
                else {
                    const exists = await this.fileService.exists(this.resource);
                    newInOrphanModeValidated = !exists;
                }
            }
            if (this.inOrphanMode !== newInOrphanModeValidated && !this.isDisposed()) {
                this.setOrphaned(newInOrphanModeValidated);
            }
        }
    }
    setOrphaned(orphaned) {
        if (this.inOrphanMode !== orphaned) {
            this.inOrphanMode = orphaned;
            this._onDidChangeOrphaned.fire();
        }
    }
    onDidChangeFilesAssociation() {
        if (!this.isResolved()) {
            return;
        }
        const firstLineText = this.getFirstLineText(this.textEditorModel);
        const languageSelection = this.getOrCreateLanguage(this.resource, this.languageService, this.preferredLanguageId, firstLineText);
        this.textEditorModel.setLanguage(languageSelection);
    }
    setLanguageId(languageId, source) {
        super.setLanguageId(languageId, source);
        this.preferredLanguageId = languageId;
    }
    async backup(token) {
        let meta = undefined;
        if (this.lastResolvedFileStat) {
            meta = {
                mtime: this.lastResolvedFileStat.mtime,
                ctime: this.lastResolvedFileStat.ctime,
                size: this.lastResolvedFileStat.size,
                etag: this.lastResolvedFileStat.etag,
                orphaned: this.inOrphanMode
            };
        }
        const content = await this.textFileService.getEncodedReadable(this.resource, this.createSnapshot() ?? undefined, { encoding: UTF8 });
        return { meta, content };
    }
    async revert(options) {
        if (!this.isResolved()) {
            return;
        }
        const wasDirty = this.dirty;
        const undo = this.doSetDirty(false);
        const softUndo = options?.soft;
        if (!softUndo) {
            try {
                await this.forceResolveFromFile();
            }
            catch (error) {
                if (error.fileOperationResult !== 1) {
                    undo();
                    throw error;
                }
            }
        }
        this._onDidRevert.fire();
        if (wasDirty) {
            this._onDidChangeDirty.fire();
        }
    }
    async resolve(options) {
        this.trace('resolve() - enter');
        mark('code/willResolveTextFileEditorModel');
        if (this.isDisposed()) {
            this.trace('resolve() - exit - without resolving because model is disposed');
            return;
        }
        if (!options?.contents && (this.dirty || this.saveSequentializer.isRunning())) {
            this.trace('resolve() - exit - without resolving because model is dirty or being saved');
            return;
        }
        await this.doResolve(options);
        mark('code/didResolveTextFileEditorModel');
    }
    async doResolve(options) {
        if (options?.contents) {
            return this.resolveFromBuffer(options.contents, options);
        }
        const isNewModel = !this.isResolved();
        if (isNewModel) {
            const resolvedFromBackup = await this.resolveFromBackup(options);
            if (resolvedFromBackup) {
                return;
            }
        }
        return this.resolveFromFile(options);
    }
    async resolveFromBuffer(buffer, options) {
        this.trace('resolveFromBuffer()');
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
            this.setOrphaned(false);
        }
        catch (error) {
            mtime = Date.now();
            ctime = Date.now();
            size = 0;
            etag = ETAG_DISABLED;
            this.setOrphaned(error.fileOperationResult === 1);
        }
        const preferredEncoding = await this.textFileService.encoding.getPreferredWriteEncoding(this.resource, this.preferredEncoding);
        this.resolveFromContent({
            resource: this.resource,
            name: this.name,
            mtime,
            ctime,
            size,
            etag,
            value: buffer,
            encoding: preferredEncoding.encoding,
            readonly: false,
            locked: false
        }, true, options);
    }
    async resolveFromBackup(options) {
        const backup = await this.workingCopyBackupService.resolve(this);
        let encoding = UTF8;
        if (backup) {
            encoding = (await this.textFileService.encoding.getPreferredWriteEncoding(this.resource, this.preferredEncoding)).encoding;
        }
        const isNewModel = !this.isResolved();
        if (!isNewModel) {
            this.trace('resolveFromBackup() - exit - without resolving because previously new model got created meanwhile');
            return true;
        }
        if (backup) {
            await this.doResolveFromBackup(backup, encoding, options);
            return true;
        }
        return false;
    }
    async doResolveFromBackup(backup, encoding, options) {
        this.trace('doResolveFromBackup()');
        this.resolveFromContent({
            resource: this.resource,
            name: this.name,
            mtime: backup.meta ? backup.meta.mtime : Date.now(),
            ctime: backup.meta ? backup.meta.ctime : Date.now(),
            size: backup.meta ? backup.meta.size : 0,
            etag: backup.meta ? backup.meta.etag : ETAG_DISABLED,
            value: await createTextBufferFactoryFromStream(await this.textFileService.getDecodedStream(this.resource, backup.value, { encoding: UTF8 })),
            encoding,
            readonly: false,
            locked: false
        }, true, options);
        if (backup.meta?.orphaned) {
            this.setOrphaned(true);
        }
    }
    async resolveFromFile(options) {
        this.trace('resolveFromFile()');
        const forceReadFromFile = options?.forceReadFromFile;
        const allowBinary = this.isResolved() || options?.allowBinary;
        let etag;
        if (forceReadFromFile) {
            etag = ETAG_DISABLED;
        }
        else if (this.lastResolvedFileStat) {
            etag = this.lastResolvedFileStat.etag;
        }
        const currentVersionId = this.versionId;
        try {
            const content = await this.textFileService.readStream(this.resource, {
                acceptTextOnly: !allowBinary,
                etag,
                encoding: this.preferredEncoding,
                limits: options?.limits
            });
            this.setOrphaned(false);
            if (currentVersionId !== this.versionId) {
                this.trace('resolveFromFile() - exit - without resolving because model content changed');
                return;
            }
            return this.resolveFromContent(content, false, options);
        }
        catch (error) {
            const result = error.fileOperationResult;
            this.setOrphaned(result === 1);
            if (this.isResolved() && result === 2) {
                if (error instanceof NotModifiedSinceFileOperationError) {
                    this.updateLastResolvedFileStat(error.stat);
                }
                return;
            }
            if (this.isResolved() && result === 1 && !forceReadFromFile) {
                return;
            }
            throw error;
        }
    }
    resolveFromContent(content, dirty, options) {
        this.trace('resolveFromContent() - enter');
        if (this.isDisposed()) {
            this.trace('resolveFromContent() - exit - because model is disposed');
            return;
        }
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
        const oldEncoding = this.contentEncoding;
        this.contentEncoding = content.encoding;
        if (this.preferredEncoding) {
            this.updatePreferredEncoding(this.contentEncoding);
        }
        else if (oldEncoding !== this.contentEncoding) {
            this._onDidChangeEncoding.fire();
        }
        if (this.textEditorModel) {
            this.doUpdateTextModel(content.value);
        }
        else {
            this.doCreateTextModel(content.resource, content.value);
        }
        this.setDirty(!!dirty);
        this._onDidResolve.fire(options?.reason ?? 3);
    }
    doCreateTextModel(resource, value) {
        this.trace('doCreateTextModel()');
        const textModel = this.createTextEditorModel(value, resource, this.preferredLanguageId);
        this.installModelListeners(textModel);
        this.autoDetectLanguage();
    }
    doUpdateTextModel(value) {
        this.trace('doUpdateTextModel()');
        this.ignoreDirtyOnModelContentChange = true;
        try {
            this.updateTextEditorModel(value, this.preferredLanguageId);
        }
        finally {
            this.ignoreDirtyOnModelContentChange = false;
        }
    }
    installModelListeners(model) {
        this._register(model.onDidChangeContent(e => this.onModelContentChanged(model, e.isUndoing || e.isRedoing)));
        this._register(model.onDidChangeLanguage(() => this.onMaybeShouldChangeEncoding()));
        super.installModelListeners(model);
    }
    onModelContentChanged(model, isUndoingOrRedoing) {
        this.trace(`onModelContentChanged() - enter`);
        this.versionId++;
        this.trace(`onModelContentChanged() - new versionId ${this.versionId}`);
        if (isUndoingOrRedoing) {
            this.lastModelContentChangeFromUndoRedo = Date.now();
        }
        if (!this.ignoreDirtyOnModelContentChange && !this.isReadonly()) {
            if (model.getAlternativeVersionId() === this.bufferSavedVersionId) {
                this.trace('onModelContentChanged() - model content changed back to last saved version');
                const wasDirty = this.dirty;
                this.setDirty(false);
                if (wasDirty) {
                    this._onDidRevert.fire();
                }
            }
            else {
                this.trace('onModelContentChanged() - model content changed and marked as dirty');
                this.setDirty(true);
            }
        }
        this._onDidChangeContent.fire();
        this.autoDetectLanguage();
    }
    async autoDetectLanguage() {
        await this.extensionService?.whenInstalledExtensionsRegistered();
        const languageId = this.getLanguageId();
        if (this.resource.scheme === this.pathService.defaultUriScheme &&
            (!languageId || languageId === PLAINTEXT_LANGUAGE_ID) &&
            !this.resourceHasExtension) {
            return super.autoDetectLanguage();
        }
    }
    async forceResolveFromFile() {
        if (this.isDisposed()) {
            return;
        }
        await this.textFileService.files.resolve(this.resource, {
            reload: { async: false },
            forceReadFromFile: true
        });
    }
    isDirty() {
        return this.dirty;
    }
    isModified() {
        return this.isDirty();
    }
    setDirty(dirty) {
        if (!this.isResolved()) {
            return;
        }
        const wasDirty = this.dirty;
        this.doSetDirty(dirty);
        if (dirty !== wasDirty) {
            this._onDidChangeDirty.fire();
        }
    }
    doSetDirty(dirty) {
        const wasDirty = this.dirty;
        const wasInConflictMode = this.inConflictMode;
        const wasInErrorMode = this.inErrorMode;
        const oldBufferSavedVersionId = this.bufferSavedVersionId;
        if (!dirty) {
            this.dirty = false;
            this.inConflictMode = false;
            this.inErrorMode = false;
            this.updateSavedVersionId();
        }
        else {
            this.dirty = true;
        }
        return () => {
            this.dirty = wasDirty;
            this.inConflictMode = wasInConflictMode;
            this.inErrorMode = wasInErrorMode;
            this.bufferSavedVersionId = oldBufferSavedVersionId;
        };
    }
    async save(options = Object.create(null)) {
        if (!this.isResolved()) {
            return false;
        }
        if (this.isReadonly()) {
            this.trace('save() - ignoring request for readonly resource');
            return false;
        }
        if ((this.hasState(3) || this.hasState(5)) &&
            (options.reason === 2 || options.reason === 3 || options.reason === 4)) {
            this.trace('save() - ignoring auto save request for model that is in conflict or error');
            return false;
        }
        this.trace('save() - enter');
        await this.doSave(options);
        this.trace('save() - exit');
        return this.hasState(0);
    }
    async doSave(options) {
        if (typeof options.reason !== 'number') {
            options.reason = 1;
        }
        const versionId = this.versionId;
        this.trace(`doSave(${versionId}) - enter with versionId ${versionId}`);
        if (this.ignoreSaveFromSaveParticipants) {
            this.trace(`doSave(${versionId}) - exit - refusing to save() recursively from save participant`);
            return;
        }
        if (this.saveSequentializer.isRunning(versionId)) {
            this.trace(`doSave(${versionId}) - exit - found a running save for versionId ${versionId}`);
            return this.saveSequentializer.running;
        }
        if (!options.force && !this.dirty) {
            this.trace(`doSave(${versionId}) - exit - because not dirty and/or versionId is different (this.isDirty: ${this.dirty}, this.versionId: ${this.versionId})`);
            return;
        }
        if (this.saveSequentializer.isRunning()) {
            this.trace(`doSave(${versionId}) - exit - because busy saving`);
            this.saveSequentializer.cancelRunning();
            return this.saveSequentializer.queue(() => this.doSave(options));
        }
        if (this.isResolved()) {
            this.textEditorModel.pushStackElement();
        }
        const saveCancellation = new CancellationTokenSource();
        return this.progressService.withProgress({
            title: localize('saveParticipants', "Saving '{0}'", this.name),
            location: 10,
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
            if (this.isResolved() && !options.skipSaveParticipants) {
                try {
                    if (options.reason === 2 && typeof this.lastModelContentChangeFromUndoRedo === 'number') {
                        const timeFromUndoRedoToSave = Date.now() - this.lastModelContentChangeFromUndoRedo;
                        if (timeFromUndoRedoToSave < TextFileEditorModel_1.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD) {
                            await timeout(TextFileEditorModel_1.UNDO_REDO_SAVE_PARTICIPANTS_AUTO_SAVE_THROTTLE_THRESHOLD - timeFromUndoRedoToSave);
                        }
                    }
                    if (!saveCancellation.token.isCancellationRequested) {
                        this.ignoreSaveFromSaveParticipants = true;
                        try {
                            await this.textFileService.files.runSaveParticipants(this, { reason: options.reason ?? 1, savedFrom: options.from }, progress, saveCancellation.token);
                        }
                        finally {
                            this.ignoreSaveFromSaveParticipants = false;
                        }
                    }
                }
                catch (error) {
                    this.logService.error(`[text file model] runSaveParticipants(${versionId}) - resulted in an error: ${error.toString()}`, this.resource.toString());
                }
            }
            if (saveCancellation.token.isCancellationRequested) {
                return;
            }
            else {
                saveCancellation.dispose();
            }
            if (this.isDisposed()) {
                return;
            }
            if (!this.isResolved()) {
                return;
            }
            versionId = this.versionId;
            this.inErrorMode = false;
            progress.report({ message: localize('saveTextFile', "Writing into file...") });
            this.trace(`doSave(${versionId}) - before write()`);
            const lastResolvedFileStat = assertIsDefined(this.lastResolvedFileStat);
            const resolvedTextFileEditorModel = this;
            return this.saveSequentializer.run(versionId, (async () => {
                try {
                    const stat = await this.textFileService.write(lastResolvedFileStat.resource, resolvedTextFileEditorModel.createSnapshot(), {
                        mtime: lastResolvedFileStat.mtime,
                        encoding: this.getEncoding(),
                        etag: (options.ignoreModifiedSince || !this.filesConfigurationService.preventSaveConflicts(lastResolvedFileStat.resource, resolvedTextFileEditorModel.getLanguageId())) ? ETAG_DISABLED : lastResolvedFileStat.etag,
                        unlock: options.writeUnlock,
                        writeElevated: options.writeElevated
                    });
                    this.handleSaveSuccess(stat, versionId, options);
                }
                catch (error) {
                    this.handleSaveError(error, versionId, options);
                }
            })());
        })(), () => saveCancellation.cancel());
    }
    handleSaveSuccess(stat, versionId, options) {
        this.updateLastResolvedFileStat(stat);
        if (versionId === this.versionId) {
            this.trace(`handleSaveSuccess(${versionId}) - setting dirty to false because versionId did not change`);
            this.setDirty(false);
        }
        else {
            this.trace(`handleSaveSuccess(${versionId}) - not setting dirty to false because versionId did change meanwhile`);
        }
        this.setOrphaned(false);
        this._onDidSave.fire({ reason: options.reason, stat, source: options.source });
    }
    handleSaveError(error, versionId, options) {
        (options.ignoreErrorHandler ? this.logService.trace : this.logService.error).apply(this.logService, [`[text file model] handleSaveError(${versionId}) - exit - resulted in a save error: ${error.toString()}`, this.resource.toString()]);
        if (options.ignoreErrorHandler) {
            throw error;
        }
        this.setDirty(true);
        this.inErrorMode = true;
        if (error.fileOperationResult === 3) {
            this.inConflictMode = true;
        }
        this.textFileService.files.saveErrorHandler.onSaveError(error, this, options);
        this._onDidSaveError.fire();
    }
    updateSavedVersionId() {
        if (this.isResolved()) {
            this.bufferSavedVersionId = this.textEditorModel.getAlternativeVersionId();
        }
    }
    updateLastResolvedFileStat(newFileStat) {
        const oldReadonly = this.isReadonly();
        if (!this.lastResolvedFileStat) {
            this.lastResolvedFileStat = newFileStat;
        }
        else if (this.lastResolvedFileStat.mtime <= newFileStat.mtime) {
            this.lastResolvedFileStat = newFileStat;
        }
        else {
            this.lastResolvedFileStat = { ...this.lastResolvedFileStat, readonly: newFileStat.readonly, locked: newFileStat.locked };
        }
        if (this.isReadonly() !== oldReadonly) {
            this._onDidChangeReadonly.fire();
        }
    }
    hasState(state) {
        switch (state) {
            case 3:
                return this.inConflictMode;
            case 1:
                return this.dirty;
            case 5:
                return this.inErrorMode;
            case 4:
                return this.inOrphanMode;
            case 2:
                return this.saveSequentializer.isRunning();
            case 0:
                return !this.dirty;
        }
    }
    async joinState(state) {
        return this.saveSequentializer.running;
    }
    getLanguageId() {
        if (this.textEditorModel) {
            return this.textEditorModel.getLanguageId();
        }
        return this.preferredLanguageId;
    }
    async onMaybeShouldChangeEncoding() {
        if (this.hasEncodingSetExplicitly) {
            this.trace('onMaybeShouldChangeEncoding() - ignoring because encoding was set explicitly');
            return;
        }
        if (this.contentEncoding === UTF8_with_bom || this.contentEncoding === UTF16be || this.contentEncoding === UTF16le) {
            this.trace('onMaybeShouldChangeEncoding() - ignoring because content encoding has a BOM');
            return;
        }
        const { encoding } = await this.textFileService.encoding.getPreferredReadEncoding(this.resource);
        if (typeof encoding !== 'string' || !this.isNewEncoding(encoding)) {
            this.trace(`onMaybeShouldChangeEncoding() - ignoring because preferred encoding ${encoding} is not new`);
            return;
        }
        if (this.isDirty()) {
            this.trace('onMaybeShouldChangeEncoding() - ignoring because model is dirty');
            return;
        }
        this.logService.info(`Adjusting encoding based on configured language override to '${encoding}' for ${this.resource.toString(true)}.`);
        return this.forceResolveFromFile();
    }
    setEncoding(encoding, mode) {
        this.hasEncodingSetExplicitly = true;
        return this.setEncodingInternal(encoding, mode);
    }
    async setEncodingInternal(encoding, mode) {
        if (mode === 0) {
            this.updatePreferredEncoding(encoding);
            if (!this.isDirty()) {
                this.versionId++;
                this.setDirty(true);
            }
            if (!this.inConflictMode) {
                await this.save({ source: TextFileEditorModel_1.TEXTFILE_SAVE_ENCODING_SOURCE });
            }
        }
        else {
            if (!this.isNewEncoding(encoding)) {
                return;
            }
            if (this.isDirty() && !this.inConflictMode) {
                await this.save();
            }
            this.updatePreferredEncoding(encoding);
            await this.forceResolveFromFile();
        }
    }
    updatePreferredEncoding(encoding) {
        if (!this.isNewEncoding(encoding)) {
            return;
        }
        this.preferredEncoding = encoding;
        this._onDidChangeEncoding.fire();
    }
    isNewEncoding(encoding) {
        if (this.preferredEncoding === encoding) {
            return false;
        }
        if (!this.preferredEncoding && this.contentEncoding === encoding) {
            return false;
        }
        return true;
    }
    getEncoding() {
        return this.preferredEncoding || this.contentEncoding;
    }
    trace(msg) {
        this.logService.trace(`[text file model] ${msg}`, this.resource.toString());
    }
    isResolved() {
        return !!this.textEditorModel;
    }
    isReadonly() {
        return this.filesConfigurationService.isReadonly(this.resource, this.lastResolvedFileStat);
    }
    dispose() {
        this.trace('dispose()');
        this.inConflictMode = false;
        this.inOrphanMode = false;
        this.inErrorMode = false;
        super.dispose();
    }
};
TextFileEditorModel = TextFileEditorModel_1 = __decorate([
    __param(3, ILanguageService),
    __param(4, IModelService),
    __param(5, IFileService),
    __param(6, ITextFileService),
    __param(7, IWorkingCopyBackupService),
    __param(8, ILogService),
    __param(9, IWorkingCopyService),
    __param(10, IFilesConfigurationService),
    __param(11, ILabelService),
    __param(12, ILanguageDetectionService),
    __param(13, IAccessibilityService),
    __param(14, IPathService),
    __param(15, IExtensionService),
    __param(16, IProgressService),
    __metadata("design:paramtypes", [URI, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], TextFileEditorModel);
export { TextFileEditorModel };
