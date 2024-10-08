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
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { URI } from '../../../../base/common/uri.js';
import { CellUri, NotebookSetting, NotebookWorkingCopyTypeIdentifier } from './notebookCommon.js';
import { NotebookFileWorkingCopyModelFactory, SimpleNotebookEditorModel } from './notebookEditorModel.js';
import { combinedDisposable, DisposableStore, dispose, ReferenceCollection, toDisposable } from '../../../../base/common/lifecycle.js';
import { INotebookService } from './notebookService.js';
import { AsyncEmitter, Emitter } from '../../../../base/common/event.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { ResourceMap } from '../../../../base/common/map.js';
import { FileWorkingCopyManager } from '../../../services/workingCopy/common/fileWorkingCopyManager.js';
import { Schemas } from '../../../../base/common/network.js';
import { NotebookProviderInfo } from './notebookProvider.js';
import { assertIsDefined } from '../../../../base/common/types.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
import { INotebookLoggingService } from './notebookLoggingService.js';
let NotebookModelReferenceCollection = class NotebookModelReferenceCollection extends ReferenceCollection {
    constructor(_instantiationService, _notebookService, _configurationService, _telemetryService, _notebookLoggingService) {
        super();
        this._instantiationService = _instantiationService;
        this._notebookService = _notebookService;
        this._configurationService = _configurationService;
        this._telemetryService = _telemetryService;
        this._notebookLoggingService = _notebookLoggingService;
        this._disposables = new DisposableStore();
        this._workingCopyManagers = new Map();
        this._modelListener = new Map();
        this._onDidSaveNotebook = new Emitter();
        this.onDidSaveNotebook = this._onDidSaveNotebook.event;
        this._onDidChangeDirty = new Emitter();
        this.onDidChangeDirty = this._onDidChangeDirty.event;
        this._dirtyStates = new ResourceMap();
        this.modelsToDispose = new Set();
    }
    dispose() {
        this._disposables.dispose();
        this._onDidSaveNotebook.dispose();
        this._onDidChangeDirty.dispose();
        dispose(this._modelListener.values());
        dispose(this._workingCopyManagers.values());
    }
    isDirty(resource) {
        return this._dirtyStates.get(resource) ?? false;
    }
    async createReferencedObject(key, notebookType, hasAssociatedFilePath, limits, isScratchpad, viewType) {
        // Untrack as being disposed
        this.modelsToDispose.delete(key);
        const uri = URI.parse(key);
        const workingCopyTypeId = NotebookWorkingCopyTypeIdentifier.create(notebookType, viewType);
        let workingCopyManager = this._workingCopyManagers.get(workingCopyTypeId);
        if (!workingCopyManager) {
            const factory = new NotebookFileWorkingCopyModelFactory(notebookType, this._notebookService, this._configurationService, this._telemetryService, this._notebookLoggingService);
            workingCopyManager = this._instantiationService.createInstance(FileWorkingCopyManager, workingCopyTypeId, factory, factory);
            this._workingCopyManagers.set(workingCopyTypeId, workingCopyManager);
        }
        const isScratchpadView = isScratchpad || (notebookType === 'interactive' && this._configurationService.getValue(NotebookSetting.InteractiveWindowPromptToSave) !== true);
        const model = this._instantiationService.createInstance(SimpleNotebookEditorModel, uri, hasAssociatedFilePath, notebookType, workingCopyManager, isScratchpadView);
        const result = await model.load({ limits });
        // Whenever a notebook model is dirty we automatically reference it so that
        // we can ensure that at least one reference exists. That guarantees that
        // a model with unsaved changes is never disposed.
        let onDirtyAutoReference;
        this._modelListener.set(result, combinedDisposable(result.onDidSave(() => this._onDidSaveNotebook.fire(result.resource)), result.onDidChangeDirty(() => {
            const isDirty = result.isDirty();
            this._dirtyStates.set(result.resource, isDirty);
            // isDirty -> add reference
            // !isDirty -> free reference
            if (isDirty && !onDirtyAutoReference) {
                onDirtyAutoReference = this.acquire(key, notebookType);
            }
            else if (onDirtyAutoReference) {
                onDirtyAutoReference.dispose();
                onDirtyAutoReference = undefined;
            }
            this._onDidChangeDirty.fire(result);
        }), toDisposable(() => onDirtyAutoReference?.dispose())));
        return result;
    }
    destroyReferencedObject(key, object) {
        this.modelsToDispose.add(key);
        (async () => {
            try {
                const model = await object;
                if (!this.modelsToDispose.has(key)) {
                    // return if model has been acquired again meanwhile
                    return;
                }
                if (model instanceof SimpleNotebookEditorModel) {
                    await model.canDispose();
                }
                if (!this.modelsToDispose.has(key)) {
                    // return if model has been acquired again meanwhile
                    return;
                }
                // Finally we can dispose the model
                this._modelListener.get(model)?.dispose();
                this._modelListener.delete(model);
                model.dispose();
            }
            catch (err) {
                this._notebookLoggingService.error('NotebookModelCollection', 'FAILED to destory notebook - ' + err);
            }
            finally {
                this.modelsToDispose.delete(key); // Untrack as being disposed
            }
        })();
    }
};
NotebookModelReferenceCollection = __decorate([
    __param(0, IInstantiationService),
    __param(1, INotebookService),
    __param(2, IConfigurationService),
    __param(3, ITelemetryService),
    __param(4, INotebookLoggingService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], NotebookModelReferenceCollection);
let NotebookModelResolverServiceImpl = class NotebookModelResolverServiceImpl {
    constructor(instantiationService, _notebookService, _extensionService, _uriIdentService) {
        this._notebookService = _notebookService;
        this._extensionService = _extensionService;
        this._uriIdentService = _uriIdentService;
        this._onWillFailWithConflict = new AsyncEmitter();
        this.onWillFailWithConflict = this._onWillFailWithConflict.event;
        this._data = instantiationService.createInstance(NotebookModelReferenceCollection);
        this.onDidSaveNotebook = this._data.onDidSaveNotebook;
        this.onDidChangeDirty = this._data.onDidChangeDirty;
    }
    dispose() {
        this._data.dispose();
    }
    isDirty(resource) {
        return this._data.isDirty(resource);
    }
    createUntitledUri(notebookType) {
        const info = this._notebookService.getContributedNotebookType(assertIsDefined(notebookType));
        if (!info) {
            throw new Error('UNKNOWN notebook type: ' + notebookType);
        }
        const suffix = NotebookProviderInfo.possibleFileEnding(info.selectors) ?? '';
        for (let counter = 1;; counter++) {
            const candidate = URI.from({ scheme: Schemas.untitled, path: `Untitled-${counter}${suffix}`, query: notebookType });
            if (!this._notebookService.getNotebookTextModel(candidate)) {
                return candidate;
            }
        }
    }
    async validateResourceViewType(uri, viewType) {
        if (!uri && !viewType) {
            throw new Error('Must provide at least one of resource or viewType');
        }
        if (uri?.scheme === CellUri.scheme) {
            throw new Error(`CANNOT open a cell-uri as notebook. Tried with ${uri.toString()}`);
        }
        const resource = this._uriIdentService.asCanonicalUri(uri ?? this.createUntitledUri(viewType));
        const existingNotebook = this._notebookService.getNotebookTextModel(resource);
        if (!viewType) {
            if (existingNotebook) {
                viewType = existingNotebook.viewType;
            }
            else {
                await this._extensionService.whenInstalledExtensionsRegistered();
                const providers = this._notebookService.getContributedNotebookTypes(resource);
                viewType = providers.find(provider => provider.priority === 'exclusive')?.id ??
                    providers.find(provider => provider.priority === 'default')?.id ??
                    providers[0]?.id;
            }
        }
        if (!viewType) {
            throw new Error(`Missing viewType for '${resource}'`);
        }
        if (existingNotebook && existingNotebook.viewType !== viewType) {
            await this._onWillFailWithConflict.fireAsync({ resource: resource, viewType }, CancellationToken.None);
            // check again, listener should have done cleanup
            const existingViewType2 = this._notebookService.getNotebookTextModel(resource)?.viewType;
            if (existingViewType2 && existingViewType2 !== viewType) {
                throw new Error(`A notebook with view type '${existingViewType2}' already exists for '${resource}', CANNOT create another notebook with view type ${viewType}`);
            }
        }
        return { resource, viewType };
    }
    async createUntitledNotebookTextModel(viewType) {
        const resource = this._uriIdentService.asCanonicalUri(this.createUntitledUri(viewType));
        return (await this._notebookService.createNotebookTextModel(viewType, resource));
    }
    async resolve(arg0, viewType, options) {
        let resource;
        let hasAssociatedFilePath;
        if (URI.isUri(arg0)) {
            resource = arg0;
        }
        else if (arg0.untitledResource) {
            if (arg0.untitledResource.scheme === Schemas.untitled) {
                resource = arg0.untitledResource;
            }
            else {
                resource = arg0.untitledResource.with({ scheme: Schemas.untitled });
                hasAssociatedFilePath = true;
            }
        }
        const validated = await this.validateResourceViewType(resource, viewType);
        const reference = this._data.acquire(validated.resource.toString(), validated.viewType, hasAssociatedFilePath, options?.limits, options?.scratchpad, options?.viewType);
        try {
            const model = await reference.object;
            return {
                object: model,
                dispose() { reference.dispose(); }
            };
        }
        catch (err) {
            reference.dispose();
            throw err;
        }
    }
};
NotebookModelResolverServiceImpl = __decorate([
    __param(0, IInstantiationService),
    __param(1, INotebookService),
    __param(2, IExtensionService),
    __param(3, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], NotebookModelResolverServiceImpl);
export { NotebookModelResolverServiceImpl };
