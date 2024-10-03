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
var CustomTextEditorModel_1;
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { basename } from '../../../../base/common/path.js';
import { isEqual } from '../../../../base/common/resources.js';
import { URI } from '../../../../base/common/uri.js';
import { ITextModelService } from '../../../../editor/common/services/resolverService.js';
import { localize } from '../../../../nls.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IExtensionService } from '../../../../workbench/services/extensions/common/extensions.js';
import { ITextFileService } from '../../../services/textfile/common/textfiles.js';
let CustomTextEditorModel = CustomTextEditorModel_1 = class CustomTextEditorModel extends Disposable {
    static async create(instantiationService, viewType, resource) {
        return instantiationService.invokeFunction(async (accessor) => {
            const textModelResolverService = accessor.get(ITextModelService);
            const model = await textModelResolverService.createModelReference(resource);
            return instantiationService.createInstance(CustomTextEditorModel_1, viewType, resource, model);
        });
    }
    constructor(viewType, _resource, _model, textFileService, _labelService, extensionService) {
        super();
        this.viewType = viewType;
        this._resource = _resource;
        this._model = _model;
        this.textFileService = textFileService;
        this._labelService = _labelService;
        this._onDidChangeOrphaned = this._register(new Emitter());
        this.onDidChangeOrphaned = this._onDidChangeOrphaned.event;
        this._onDidChangeReadonly = this._register(new Emitter());
        this.onDidChangeReadonly = this._onDidChangeReadonly.event;
        this._onDidChangeDirty = this._register(new Emitter());
        this.onDidChangeDirty = this._onDidChangeDirty.event;
        this._onDidChangeContent = this._register(new Emitter());
        this.onDidChangeContent = this._onDidChangeContent.event;
        this._register(_model);
        this._textFileModel = this.textFileService.files.get(_resource);
        if (this._textFileModel) {
            this._register(this._textFileModel.onDidChangeOrphaned(() => this._onDidChangeOrphaned.fire()));
            this._register(this._textFileModel.onDidChangeReadonly(() => this._onDidChangeReadonly.fire()));
        }
        this._register(this.textFileService.files.onDidChangeDirty(e => {
            if (isEqual(this.resource, e.resource)) {
                this._onDidChangeDirty.fire();
                this._onDidChangeContent.fire();
            }
        }));
        this._register(extensionService.onWillStop(e => {
            e.veto(true, localize('vetoExtHostRestart', "A custom text editor for '{0}' is open.", this.resource.path));
        }));
    }
    get resource() {
        return this._resource;
    }
    get name() {
        return basename(this._labelService.getUriLabel(this._resource));
    }
    isReadonly() {
        return this._model.object.isReadonly();
    }
    get backupId() {
        return undefined;
    }
    get canHotExit() {
        return true;
    }
    isDirty() {
        return this.textFileService.isDirty(this.resource);
    }
    isOrphaned() {
        return !!this._textFileModel?.hasState(4);
    }
    async revert(options) {
        return this.textFileService.revert(this.resource, options);
    }
    saveCustomEditor(options) {
        return this.textFileService.save(this.resource, options);
    }
    async saveCustomEditorAs(resource, targetResource, options) {
        return !!await this.textFileService.saveAs(resource, targetResource, options);
    }
};
CustomTextEditorModel = CustomTextEditorModel_1 = __decorate([
    __param(3, ITextFileService),
    __param(4, ILabelService),
    __param(5, IExtensionService),
    __metadata("design:paramtypes", [String, URI, Object, Object, Object, Object])
], CustomTextEditorModel);
export { CustomTextEditorModel };
