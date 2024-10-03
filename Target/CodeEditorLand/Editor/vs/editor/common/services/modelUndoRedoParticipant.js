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
import { IModelService } from './model.js';
import { ITextModelService } from './resolverService.js';
import { Disposable, dispose } from '../../../base/common/lifecycle.js';
import { IUndoRedoService } from '../../../platform/undoRedo/common/undoRedo.js';
import { MultiModelEditStackElement } from '../model/editStack.js';
let ModelUndoRedoParticipant = class ModelUndoRedoParticipant extends Disposable {
    constructor(_modelService, _textModelService, _undoRedoService) {
        super();
        this._modelService = _modelService;
        this._textModelService = _textModelService;
        this._undoRedoService = _undoRedoService;
        this._register(this._modelService.onModelRemoved((model) => {
            const elements = this._undoRedoService.getElements(model.uri);
            if (elements.past.length === 0 && elements.future.length === 0) {
                return;
            }
            for (const element of elements.past) {
                if (element instanceof MultiModelEditStackElement) {
                    element.setDelegate(this);
                }
            }
            for (const element of elements.future) {
                if (element instanceof MultiModelEditStackElement) {
                    element.setDelegate(this);
                }
            }
        }));
    }
    prepareUndoRedo(element) {
        const missingModels = element.getMissingModels();
        if (missingModels.length === 0) {
            return Disposable.None;
        }
        const disposablesPromises = missingModels.map(async (uri) => {
            try {
                const reference = await this._textModelService.createModelReference(uri);
                return reference;
            }
            catch (err) {
                return Disposable.None;
            }
        });
        return Promise.all(disposablesPromises).then(disposables => {
            return {
                dispose: () => dispose(disposables)
            };
        });
    }
};
ModelUndoRedoParticipant = __decorate([
    __param(0, IModelService),
    __param(1, ITextModelService),
    __param(2, IUndoRedoService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ModelUndoRedoParticipant);
export { ModelUndoRedoParticipant };
