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
import { URI } from '../../../../base/common/uri.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { toDisposable, ReferenceCollection, Disposable, AsyncReferenceCollection } from '../../../../base/common/lifecycle.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { TextResourceEditorModel } from '../../../common/editor/textResourceEditorModel.js';
import { ITextFileService } from '../../textfile/common/textfiles.js';
import { Schemas } from '../../../../base/common/network.js';
import { ITextModelService, isResolvedTextEditorModel } from '../../../../editor/common/services/resolverService.js';
import { TextFileEditorModel } from '../../textfile/common/textFileEditorModel.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IUndoRedoService } from '../../../../platform/undoRedo/common/undoRedo.js';
import { ModelUndoRedoParticipant } from '../../../../editor/common/services/modelUndoRedoParticipant.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { UntitledTextEditorModel } from '../../untitled/common/untitledTextEditorModel.js';
let ResourceModelCollection = class ResourceModelCollection extends ReferenceCollection {
    constructor(instantiationService, textFileService, fileService, modelService) {
        super();
        this.instantiationService = instantiationService;
        this.textFileService = textFileService;
        this.fileService = fileService;
        this.modelService = modelService;
        this.providers = new Map();
        this.modelsToDispose = new Set();
    }
    createReferencedObject(key) {
        return this.doCreateReferencedObject(key);
    }
    async doCreateReferencedObject(key, skipActivateProvider) {
        this.modelsToDispose.delete(key);
        const resource = URI.parse(key);
        if (resource.scheme === Schemas.inMemory) {
            const cachedModel = this.modelService.getModel(resource);
            if (!cachedModel) {
                throw new Error(`Unable to resolve inMemory resource ${key}`);
            }
            const model = this.instantiationService.createInstance(TextResourceEditorModel, resource);
            if (this.ensureResolvedModel(model, key)) {
                return model;
            }
        }
        if (resource.scheme === Schemas.untitled) {
            const model = await this.textFileService.untitled.resolve({ untitledResource: resource });
            if (this.ensureResolvedModel(model, key)) {
                return model;
            }
        }
        if (this.fileService.hasProvider(resource)) {
            const model = await this.textFileService.files.resolve(resource, { reason: 2 });
            if (this.ensureResolvedModel(model, key)) {
                return model;
            }
        }
        if (this.providers.has(resource.scheme)) {
            await this.resolveTextModelContent(key);
            const model = this.instantiationService.createInstance(TextResourceEditorModel, resource);
            if (this.ensureResolvedModel(model, key)) {
                return model;
            }
        }
        if (!skipActivateProvider) {
            await this.fileService.activateProvider(resource.scheme);
            return this.doCreateReferencedObject(key, true);
        }
        throw new Error(`Unable to resolve resource ${key}`);
    }
    ensureResolvedModel(model, key) {
        if (isResolvedTextEditorModel(model)) {
            return true;
        }
        throw new Error(`Unable to resolve resource ${key}`);
    }
    destroyReferencedObject(key, modelPromise) {
        const resource = URI.parse(key);
        if (resource.scheme === Schemas.inMemory) {
            return;
        }
        this.modelsToDispose.add(key);
        (async () => {
            try {
                const model = await modelPromise;
                if (!this.modelsToDispose.has(key)) {
                    return;
                }
                if (model instanceof TextFileEditorModel) {
                    await this.textFileService.files.canDispose(model);
                }
                else if (model instanceof UntitledTextEditorModel) {
                    await this.textFileService.untitled.canDispose(model);
                }
                if (!this.modelsToDispose.has(key)) {
                    return;
                }
                model.dispose();
            }
            catch (error) {
            }
            finally {
                this.modelsToDispose.delete(key);
            }
        })();
    }
    registerTextModelContentProvider(scheme, provider) {
        let providers = this.providers.get(scheme);
        if (!providers) {
            providers = [];
            this.providers.set(scheme, providers);
        }
        providers.unshift(provider);
        return toDisposable(() => {
            const providersForScheme = this.providers.get(scheme);
            if (!providersForScheme) {
                return;
            }
            const index = providersForScheme.indexOf(provider);
            if (index === -1) {
                return;
            }
            providersForScheme.splice(index, 1);
            if (providersForScheme.length === 0) {
                this.providers.delete(scheme);
            }
        });
    }
    hasTextModelContentProvider(scheme) {
        return this.providers.get(scheme) !== undefined;
    }
    async resolveTextModelContent(key) {
        const resource = URI.parse(key);
        const providersForScheme = this.providers.get(resource.scheme) || [];
        for (const provider of providersForScheme) {
            const value = await provider.provideTextContent(resource);
            if (value) {
                return value;
            }
        }
        throw new Error(`Unable to resolve text model content for resource ${key}`);
    }
};
ResourceModelCollection = __decorate([
    __param(0, IInstantiationService),
    __param(1, ITextFileService),
    __param(2, IFileService),
    __param(3, IModelService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ResourceModelCollection);
let TextModelResolverService = class TextModelResolverService extends Disposable {
    get resourceModelCollection() {
        if (!this._resourceModelCollection) {
            this._resourceModelCollection = this.instantiationService.createInstance(ResourceModelCollection);
        }
        return this._resourceModelCollection;
    }
    get asyncModelCollection() {
        if (!this._asyncModelCollection) {
            this._asyncModelCollection = new AsyncReferenceCollection(this.resourceModelCollection);
        }
        return this._asyncModelCollection;
    }
    constructor(instantiationService, fileService, undoRedoService, modelService, uriIdentityService) {
        super();
        this.instantiationService = instantiationService;
        this.fileService = fileService;
        this.undoRedoService = undoRedoService;
        this.modelService = modelService;
        this.uriIdentityService = uriIdentityService;
        this._resourceModelCollection = undefined;
        this._asyncModelCollection = undefined;
        this._register(new ModelUndoRedoParticipant(this.modelService, this, this.undoRedoService));
    }
    async createModelReference(resource) {
        resource = this.uriIdentityService.asCanonicalUri(resource);
        return await this.asyncModelCollection.acquire(resource.toString());
    }
    registerTextModelContentProvider(scheme, provider) {
        return this.resourceModelCollection.registerTextModelContentProvider(scheme, provider);
    }
    canHandleResource(resource) {
        if (this.fileService.hasProvider(resource) || resource.scheme === Schemas.untitled || resource.scheme === Schemas.inMemory) {
            return true;
        }
        return this.resourceModelCollection.hasTextModelContentProvider(resource.scheme);
    }
};
TextModelResolverService = __decorate([
    __param(0, IInstantiationService),
    __param(1, IFileService),
    __param(2, IUndoRedoService),
    __param(3, IModelService),
    __param(4, IUriIdentityService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], TextModelResolverService);
export { TextModelResolverService };
registerSingleton(ITextModelService, TextModelResolverService, 1);
