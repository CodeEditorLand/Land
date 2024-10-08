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
import { toErrorMessage } from '../../../base/common/errorMessage.js';
import { dispose, Disposable } from '../../../base/common/lifecycle.js';
import { Schemas } from '../../../base/common/network.js';
import { URI } from '../../../base/common/uri.js';
import { shouldSynchronizeModel } from '../../../editor/common/model.js';
import { IModelService } from '../../../editor/common/services/model.js';
import { ITextModelService } from '../../../editor/common/services/resolverService.js';
import { IFileService } from '../../../platform/files/common/files.js';
import { ExtHostContext } from '../common/extHost.protocol.js';
import { ITextFileService } from '../../services/textfile/common/textfiles.js';
import { IWorkbenchEnvironmentService } from '../../services/environment/common/environmentService.js';
import { toLocalResource, extUri } from '../../../base/common/resources.js';
import { IWorkingCopyFileService } from '../../services/workingCopy/common/workingCopyFileService.js';
import { IUriIdentityService } from '../../../platform/uriIdentity/common/uriIdentity.js';
import { Emitter, Event } from '../../../base/common/event.js';
import { IPathService } from '../../services/path/common/pathService.js';
import { ResourceMap } from '../../../base/common/map.js';
import { ErrorNoTelemetry } from '../../../base/common/errors.js';
export class BoundModelReferenceCollection {
    constructor(_extUri, _maxAge = 1000 * 60 * 3, // auto-dispse by age
    _maxLength = 1024 * 1024 * 80, // auto-dispose by total length
    _maxSize = 50 // auto-dispose by number of references
    ) {
        this._extUri = _extUri;
        this._maxAge = _maxAge;
        this._maxLength = _maxLength;
        this._maxSize = _maxSize;
        this._data = new Array();
        this._length = 0;
        //
    }
    dispose() {
        this._data = dispose(this._data);
    }
    remove(uri) {
        for (const entry of [...this._data] /* copy array because dispose will modify it */) {
            if (this._extUri.isEqualOrParent(entry.uri, uri)) {
                entry.dispose();
            }
        }
    }
    add(uri, ref, length = 0) {
        // const length = ref.object.textEditorModel.getValueLength();
        const dispose = () => {
            const idx = this._data.indexOf(entry);
            if (idx >= 0) {
                this._length -= length;
                ref.dispose();
                clearTimeout(handle);
                this._data.splice(idx, 1);
            }
        };
        const handle = setTimeout(dispose, this._maxAge);
        const entry = { uri, length, dispose };
        this._data.push(entry);
        this._length += length;
        this._cleanup();
    }
    _cleanup() {
        // clean-up wrt total length
        while (this._length > this._maxLength) {
            this._data[0].dispose();
        }
        // clean-up wrt number of documents
        const extraSize = Math.ceil(this._maxSize * 1.2);
        if (this._data.length >= extraSize) {
            dispose(this._data.slice(0, extraSize - this._maxSize));
        }
    }
}
class ModelTracker extends Disposable {
    constructor(_model, _onIsCaughtUpWithContentChanges, _proxy, _textFileService) {
        super();
        this._model = _model;
        this._onIsCaughtUpWithContentChanges = _onIsCaughtUpWithContentChanges;
        this._proxy = _proxy;
        this._textFileService = _textFileService;
        this._knownVersionId = this._model.getVersionId();
        this._store.add(this._model.onDidChangeContent((e) => {
            this._knownVersionId = e.versionId;
            this._proxy.$acceptModelChanged(this._model.uri, e, this._textFileService.isDirty(this._model.uri));
            if (this.isCaughtUpWithContentChanges()) {
                this._onIsCaughtUpWithContentChanges.fire(this._model.uri);
            }
        }));
    }
    isCaughtUpWithContentChanges() {
        return (this._model.getVersionId() === this._knownVersionId);
    }
}
let MainThreadDocuments = class MainThreadDocuments extends Disposable {
    constructor(extHostContext, _modelService, _textFileService, _fileService, _textModelResolverService, _environmentService, _uriIdentityService, workingCopyFileService, _pathService) {
        super();
        this._modelService = _modelService;
        this._textFileService = _textFileService;
        this._fileService = _fileService;
        this._textModelResolverService = _textModelResolverService;
        this._environmentService = _environmentService;
        this._uriIdentityService = _uriIdentityService;
        this._pathService = _pathService;
        this._onIsCaughtUpWithContentChanges = this._store.add(new Emitter());
        this.onIsCaughtUpWithContentChanges = this._onIsCaughtUpWithContentChanges.event;
        this._modelTrackers = new ResourceMap();
        this._modelReferenceCollection = this._store.add(new BoundModelReferenceCollection(_uriIdentityService.extUri));
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostDocuments);
        this._store.add(_modelService.onModelLanguageChanged(this._onModelModeChanged, this));
        this._store.add(_textFileService.files.onDidSave(e => {
            if (this._shouldHandleFileEvent(e.model.resource)) {
                this._proxy.$acceptModelSaved(e.model.resource);
            }
        }));
        this._store.add(_textFileService.files.onDidChangeDirty(m => {
            if (this._shouldHandleFileEvent(m.resource)) {
                this._proxy.$acceptDirtyStateChanged(m.resource, m.isDirty());
            }
        }));
        this._store.add(workingCopyFileService.onDidRunWorkingCopyFileOperation(e => {
            const isMove = e.operation === 2 /* FileOperation.MOVE */;
            if (isMove || e.operation === 1 /* FileOperation.DELETE */) {
                for (const pair of e.files) {
                    const removed = isMove ? pair.source : pair.target;
                    if (removed) {
                        this._modelReferenceCollection.remove(removed);
                    }
                }
            }
        }));
    }
    dispose() {
        dispose(this._modelTrackers.values());
        this._modelTrackers.clear();
        super.dispose();
    }
    isCaughtUpWithContentChanges(resource) {
        const tracker = this._modelTrackers.get(resource);
        if (tracker) {
            return tracker.isCaughtUpWithContentChanges();
        }
        return true;
    }
    _shouldHandleFileEvent(resource) {
        const model = this._modelService.getModel(resource);
        return !!model && shouldSynchronizeModel(model);
    }
    handleModelAdded(model) {
        // Same filter as in mainThreadEditorsTracker
        if (!shouldSynchronizeModel(model)) {
            // don't synchronize too large models
            return;
        }
        this._modelTrackers.set(model.uri, new ModelTracker(model, this._onIsCaughtUpWithContentChanges, this._proxy, this._textFileService));
    }
    _onModelModeChanged(event) {
        const { model } = event;
        if (!this._modelTrackers.has(model.uri)) {
            return;
        }
        this._proxy.$acceptModelLanguageChanged(model.uri, model.getLanguageId());
    }
    handleModelRemoved(modelUrl) {
        if (!this._modelTrackers.has(modelUrl)) {
            return;
        }
        this._modelTrackers.get(modelUrl).dispose();
        this._modelTrackers.delete(modelUrl);
    }
    // --- from extension host process
    async $trySaveDocument(uri) {
        const target = await this._textFileService.save(URI.revive(uri));
        return Boolean(target);
    }
    async $tryOpenDocument(uriData) {
        const inputUri = URI.revive(uriData);
        if (!inputUri.scheme || !(inputUri.fsPath || inputUri.authority)) {
            throw new ErrorNoTelemetry(`Invalid uri. Scheme and authority or path must be set.`);
        }
        const canonicalUri = this._uriIdentityService.asCanonicalUri(inputUri);
        let promise;
        switch (canonicalUri.scheme) {
            case Schemas.untitled:
                promise = this._handleUntitledScheme(canonicalUri);
                break;
            case Schemas.file:
            default:
                promise = this._handleAsResourceInput(canonicalUri);
                break;
        }
        let documentUri;
        try {
            documentUri = await promise;
        }
        catch (err) {
            throw new ErrorNoTelemetry(`cannot open ${canonicalUri.toString()}. Detail: ${toErrorMessage(err)}`);
        }
        if (!documentUri) {
            throw new ErrorNoTelemetry(`cannot open ${canonicalUri.toString()}`);
        }
        else if (!extUri.isEqual(documentUri, canonicalUri)) {
            throw new ErrorNoTelemetry(`cannot open ${canonicalUri.toString()}. Detail: Actual document opened as ${documentUri.toString()}`);
        }
        else if (!this._modelTrackers.has(canonicalUri)) {
            throw new ErrorNoTelemetry(`cannot open ${canonicalUri.toString()}. Detail: Files above 50MB cannot be synchronized with extensions.`);
        }
        else {
            return canonicalUri;
        }
    }
    $tryCreateDocument(options) {
        return this._doCreateUntitled(undefined, options ? options.language : undefined, options ? options.content : undefined);
    }
    async _handleAsResourceInput(uri) {
        const ref = await this._textModelResolverService.createModelReference(uri);
        this._modelReferenceCollection.add(uri, ref, ref.object.textEditorModel.getValueLength());
        return ref.object.textEditorModel.uri;
    }
    async _handleUntitledScheme(uri) {
        const asLocalUri = toLocalResource(uri, this._environmentService.remoteAuthority, this._pathService.defaultUriScheme);
        const exists = await this._fileService.exists(asLocalUri);
        if (exists) {
            // don't create a new file ontop of an existing file
            return Promise.reject(new Error('file already exists'));
        }
        return await this._doCreateUntitled(Boolean(uri.path) ? uri : undefined);
    }
    async _doCreateUntitled(associatedResource, languageId, initialValue) {
        const model = this._textFileService.untitled.create({
            associatedResource,
            languageId,
            initialValue
        });
        const resource = model.resource;
        const ref = await this._textModelResolverService.createModelReference(resource);
        if (!this._modelTrackers.has(resource)) {
            ref.dispose();
            throw new Error(`expected URI ${resource.toString()} to have come to LIFE`);
        }
        this._modelReferenceCollection.add(resource, ref, ref.object.textEditorModel.getValueLength());
        Event.once(model.onDidRevert)(() => this._modelReferenceCollection.remove(resource));
        this._proxy.$acceptDirtyStateChanged(resource, true); // mark as dirty
        return resource;
    }
};
MainThreadDocuments = __decorate([
    __param(1, IModelService),
    __param(2, ITextFileService),
    __param(3, IFileService),
    __param(4, ITextModelService),
    __param(5, IWorkbenchEnvironmentService),
    __param(6, IUriIdentityService),
    __param(7, IWorkingCopyFileService),
    __param(8, IPathService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object])
], MainThreadDocuments);
export { MainThreadDocuments };
