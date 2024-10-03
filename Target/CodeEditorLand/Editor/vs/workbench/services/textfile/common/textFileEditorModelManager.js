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
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { Event, Emitter } from '../../../../base/common/event.js';
import { URI } from '../../../../base/common/uri.js';
import { TextFileEditorModel } from './textFileEditorModel.js';
import { dispose, Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { Promises, ResourceQueue } from '../../../../base/common/async.js';
import { onUnexpectedError } from '../../../../base/common/errors.js';
import { TextFileSaveParticipant } from './textFileSaveParticipant.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IWorkingCopyFileService } from '../../workingCopy/common/workingCopyFileService.js';
import { extname, joinPath } from '../../../../base/common/resources.js';
import { createTextBufferFactoryFromSnapshot } from '../../../../editor/common/model/textModel.js';
import { PLAINTEXT_EXTENSION, PLAINTEXT_LANGUAGE_ID } from '../../../../editor/common/languages/modesRegistry.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
let TextFileEditorModelManager = class TextFileEditorModelManager extends Disposable {
    get models() {
        return [...this.mapResourceToModel.values()];
    }
    constructor(instantiationService, fileService, notificationService, workingCopyFileService, uriIdentityService) {
        super();
        this.instantiationService = instantiationService;
        this.fileService = fileService;
        this.notificationService = notificationService;
        this.workingCopyFileService = workingCopyFileService;
        this.uriIdentityService = uriIdentityService;
        this._onDidCreate = this._register(new Emitter({ leakWarningThreshold: 500 }));
        this.onDidCreate = this._onDidCreate.event;
        this._onDidResolve = this._register(new Emitter());
        this.onDidResolve = this._onDidResolve.event;
        this._onDidRemove = this._register(new Emitter());
        this.onDidRemove = this._onDidRemove.event;
        this._onDidChangeDirty = this._register(new Emitter());
        this.onDidChangeDirty = this._onDidChangeDirty.event;
        this._onDidChangeReadonly = this._register(new Emitter());
        this.onDidChangeReadonly = this._onDidChangeReadonly.event;
        this._onDidChangeOrphaned = this._register(new Emitter());
        this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
        this._onDidSaveError = this._register(new Emitter());
        this.onDidSaveError = this._onDidSaveError.event;
        this._onDidSave = this._register(new Emitter());
        this.onDidSave = this._onDidSave.event;
        this._onDidRevert = this._register(new Emitter());
        this.onDidRevert = this._onDidRevert.event;
        this._onDidChangeEncoding = this._register(new Emitter());
        this.onDidChangeEncoding = this._onDidChangeEncoding.event;
        this.mapResourceToModel = new ResourceMap();
        this.mapResourceToModelListeners = new ResourceMap();
        this.mapResourceToDisposeListener = new ResourceMap();
        this.mapResourceToPendingModelResolvers = new ResourceMap();
        this.modelResolveQueue = this._register(new ResourceQueue());
        this.saveErrorHandler = (() => {
            const notificationService = this.notificationService;
            return {
                onSaveError(error, model) {
                    notificationService.error(localize({ key: 'genericSaveError', comment: ['{0} is the resource that failed to save and {1} the error message'] }, "Failed to save '{0}': {1}", model.name, toErrorMessage(error, false)));
                }
            };
        })();
        this.mapCorrelationIdToModelsToRestore = new Map();
        this.saveParticipants = this._register(this.instantiationService.createInstance(TextFileSaveParticipant));
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.fileService.onDidFilesChange(e => this.onDidFilesChange(e)));
        this._register(this.fileService.onDidChangeFileSystemProviderCapabilities(e => this.onDidChangeFileSystemProviderCapabilities(e)));
        this._register(this.fileService.onDidChangeFileSystemProviderRegistrations(e => this.onDidChangeFileSystemProviderRegistrations(e)));
        this._register(this.workingCopyFileService.onWillRunWorkingCopyFileOperation(e => this.onWillRunWorkingCopyFileOperation(e)));
        this._register(this.workingCopyFileService.onDidFailWorkingCopyFileOperation(e => this.onDidFailWorkingCopyFileOperation(e)));
        this._register(this.workingCopyFileService.onDidRunWorkingCopyFileOperation(e => this.onDidRunWorkingCopyFileOperation(e)));
    }
    onDidFilesChange(e) {
        for (const model of this.models) {
            if (model.isDirty()) {
                continue;
            }
            if (e.contains(model.resource, 0, 1)) {
                this.queueModelReload(model);
            }
        }
    }
    onDidChangeFileSystemProviderCapabilities(e) {
        this.queueModelReloads(e.scheme);
    }
    onDidChangeFileSystemProviderRegistrations(e) {
        if (!e.added) {
            return;
        }
        this.queueModelReloads(e.scheme);
    }
    queueModelReloads(scheme) {
        for (const model of this.models) {
            if (model.isDirty()) {
                continue;
            }
            if (scheme === model.resource.scheme) {
                this.queueModelReload(model);
            }
        }
    }
    queueModelReload(model) {
        const queueSize = this.modelResolveQueue.queueSize(model.resource);
        if (queueSize <= 1) {
            this.modelResolveQueue.queueFor(model.resource, async () => {
                try {
                    await this.reload(model);
                }
                catch (error) {
                    onUnexpectedError(error);
                }
            });
        }
    }
    onWillRunWorkingCopyFileOperation(e) {
        if (e.operation === 2 || e.operation === 3) {
            const modelsToRestore = [];
            for (const { source, target } of e.files) {
                if (source) {
                    if (this.uriIdentityService.extUri.isEqual(source, target)) {
                        continue;
                    }
                    const sourceModels = [];
                    for (const model of this.models) {
                        if (this.uriIdentityService.extUri.isEqualOrParent(model.resource, source)) {
                            sourceModels.push(model);
                        }
                    }
                    for (const sourceModel of sourceModels) {
                        const sourceModelResource = sourceModel.resource;
                        let targetModelResource;
                        if (this.uriIdentityService.extUri.isEqual(sourceModelResource, source)) {
                            targetModelResource = target;
                        }
                        else {
                            targetModelResource = joinPath(target, sourceModelResource.path.substr(source.path.length + 1));
                        }
                        modelsToRestore.push({
                            source: sourceModelResource,
                            target: targetModelResource,
                            languageId: sourceModel.getLanguageId(),
                            encoding: sourceModel.getEncoding(),
                            snapshot: sourceModel.isDirty() ? sourceModel.createSnapshot() : undefined
                        });
                    }
                }
            }
            this.mapCorrelationIdToModelsToRestore.set(e.correlationId, modelsToRestore);
        }
    }
    onDidFailWorkingCopyFileOperation(e) {
        if ((e.operation === 2 || e.operation === 3)) {
            const modelsToRestore = this.mapCorrelationIdToModelsToRestore.get(e.correlationId);
            if (modelsToRestore) {
                this.mapCorrelationIdToModelsToRestore.delete(e.correlationId);
                modelsToRestore.forEach(model => {
                    if (model.snapshot) {
                        this.get(model.source)?.setDirty(true);
                    }
                });
            }
        }
    }
    onDidRunWorkingCopyFileOperation(e) {
        switch (e.operation) {
            case 0:
                e.waitUntil((async () => {
                    for (const { target } of e.files) {
                        const model = this.get(target);
                        if (model && !model.isDisposed()) {
                            await model.revert();
                        }
                    }
                })());
                break;
            case 2:
            case 3:
                e.waitUntil((async () => {
                    const modelsToRestore = this.mapCorrelationIdToModelsToRestore.get(e.correlationId);
                    if (modelsToRestore) {
                        this.mapCorrelationIdToModelsToRestore.delete(e.correlationId);
                        await Promises.settled(modelsToRestore.map(async (modelToRestore) => {
                            const target = this.uriIdentityService.asCanonicalUri(modelToRestore.target);
                            const restoredModel = await this.resolve(target, {
                                reload: { async: false },
                                contents: modelToRestore.snapshot ? createTextBufferFactoryFromSnapshot(modelToRestore.snapshot) : undefined,
                                encoding: modelToRestore.encoding
                            });
                            if (modelToRestore.languageId &&
                                modelToRestore.languageId !== PLAINTEXT_LANGUAGE_ID &&
                                restoredModel.getLanguageId() === PLAINTEXT_LANGUAGE_ID &&
                                extname(target) !== PLAINTEXT_EXTENSION) {
                                restoredModel.updateTextEditorModel(undefined, modelToRestore.languageId);
                            }
                        }));
                    }
                })());
                break;
        }
    }
    get(resource) {
        return this.mapResourceToModel.get(resource);
    }
    has(resource) {
        return this.mapResourceToModel.has(resource);
    }
    async reload(model) {
        await this.joinPendingResolves(model.resource);
        if (model.isDirty() || model.isDisposed() || !this.has(model.resource)) {
            return;
        }
        await this.doResolve(model, { reload: { async: false } });
    }
    async resolve(resource, options) {
        const pendingResolve = this.joinPendingResolves(resource);
        if (pendingResolve) {
            await pendingResolve;
        }
        return this.doResolve(resource, options);
    }
    async doResolve(resourceOrModel, options) {
        let model;
        let resource;
        if (URI.isUri(resourceOrModel)) {
            resource = resourceOrModel;
            model = this.get(resource);
        }
        else {
            resource = resourceOrModel.resource;
            model = resourceOrModel;
        }
        let modelResolve;
        let didCreateModel = false;
        if (model) {
            if (options?.contents) {
                modelResolve = model.resolve(options);
            }
            else if (options?.reload) {
                if (options.reload.async) {
                    modelResolve = Promise.resolve();
                    (async () => {
                        try {
                            await model.resolve(options);
                        }
                        catch (error) {
                            onUnexpectedError(error);
                        }
                    })();
                }
                else {
                    modelResolve = model.resolve(options);
                }
            }
            else {
                modelResolve = Promise.resolve();
            }
        }
        else {
            didCreateModel = true;
            const newModel = model = this.instantiationService.createInstance(TextFileEditorModel, resource, options ? options.encoding : undefined, options ? options.languageId : undefined);
            modelResolve = model.resolve(options);
            this.registerModel(newModel);
        }
        this.mapResourceToPendingModelResolvers.set(resource, modelResolve);
        this.add(resource, model);
        if (didCreateModel) {
            this._onDidCreate.fire(model);
            if (model.isDirty()) {
                this._onDidChangeDirty.fire(model);
            }
        }
        try {
            await modelResolve;
        }
        catch (error) {
            if (didCreateModel) {
                model.dispose();
            }
            throw error;
        }
        finally {
            this.mapResourceToPendingModelResolvers.delete(resource);
        }
        if (options?.languageId) {
            model.setLanguageId(options.languageId);
        }
        if (didCreateModel && model.isDirty()) {
            this._onDidChangeDirty.fire(model);
        }
        return model;
    }
    joinPendingResolves(resource) {
        const pendingModelResolve = this.mapResourceToPendingModelResolvers.get(resource);
        if (!pendingModelResolve) {
            return;
        }
        return this.doJoinPendingResolves(resource);
    }
    async doJoinPendingResolves(resource) {
        let currentModelCopyResolve;
        while (this.mapResourceToPendingModelResolvers.has(resource)) {
            const nextPendingModelResolve = this.mapResourceToPendingModelResolvers.get(resource);
            if (nextPendingModelResolve === currentModelCopyResolve) {
                return;
            }
            currentModelCopyResolve = nextPendingModelResolve;
            try {
                await nextPendingModelResolve;
            }
            catch (error) {
            }
        }
    }
    registerModel(model) {
        const modelListeners = new DisposableStore();
        modelListeners.add(model.onDidResolve(reason => this._onDidResolve.fire({ model, reason })));
        modelListeners.add(model.onDidChangeDirty(() => this._onDidChangeDirty.fire(model)));
        modelListeners.add(model.onDidChangeReadonly(() => this._onDidChangeReadonly.fire(model)));
        modelListeners.add(model.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire(model)));
        modelListeners.add(model.onDidSaveError(() => this._onDidSaveError.fire(model)));
        modelListeners.add(model.onDidSave(e => this._onDidSave.fire({ model, ...e })));
        modelListeners.add(model.onDidRevert(() => this._onDidRevert.fire(model)));
        modelListeners.add(model.onDidChangeEncoding(() => this._onDidChangeEncoding.fire(model)));
        this.mapResourceToModelListeners.set(model.resource, modelListeners);
    }
    add(resource, model) {
        const knownModel = this.mapResourceToModel.get(resource);
        if (knownModel === model) {
            return;
        }
        const disposeListener = this.mapResourceToDisposeListener.get(resource);
        disposeListener?.dispose();
        this.mapResourceToModel.set(resource, model);
        this.mapResourceToDisposeListener.set(resource, model.onWillDispose(() => this.remove(resource)));
    }
    remove(resource) {
        const removed = this.mapResourceToModel.delete(resource);
        const disposeListener = this.mapResourceToDisposeListener.get(resource);
        if (disposeListener) {
            dispose(disposeListener);
            this.mapResourceToDisposeListener.delete(resource);
        }
        const modelListener = this.mapResourceToModelListeners.get(resource);
        if (modelListener) {
            dispose(modelListener);
            this.mapResourceToModelListeners.delete(resource);
        }
        if (removed) {
            this._onDidRemove.fire(resource);
        }
    }
    addSaveParticipant(participant) {
        return this.saveParticipants.addSaveParticipant(participant);
    }
    runSaveParticipants(model, context, progress, token) {
        return this.saveParticipants.participate(model, context, progress, token);
    }
    canDispose(model) {
        if (model.isDisposed() ||
            (!this.mapResourceToPendingModelResolvers.has(model.resource) && !model.isDirty())) {
            return true;
        }
        return this.doCanDispose(model);
    }
    async doCanDispose(model) {
        const pendingResolve = this.joinPendingResolves(model.resource);
        if (pendingResolve) {
            await pendingResolve;
            return this.canDispose(model);
        }
        if (model.isDirty()) {
            await Event.toPromise(model.onDidChangeDirty);
            return this.canDispose(model);
        }
        return true;
    }
    dispose() {
        super.dispose();
        this.mapResourceToModel.clear();
        this.mapResourceToPendingModelResolvers.clear();
        dispose(this.mapResourceToDisposeListener.values());
        this.mapResourceToDisposeListener.clear();
        dispose(this.mapResourceToModelListeners.values());
        this.mapResourceToModelListeners.clear();
    }
};
TextFileEditorModelManager = __decorate([
    __param(0, IInstantiationService),
    __param(1, IFileService),
    __param(2, INotificationService),
    __param(3, IWorkingCopyFileService),
    __param(4, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], TextFileEditorModelManager);
export { TextFileEditorModelManager };
