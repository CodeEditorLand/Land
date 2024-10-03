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
import { IModelService } from '../../../../editor/common/services/model.js';
import { ModelService } from '../../../../editor/common/services/modelService.js';
import { ITextResourcePropertiesService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IUndoRedoService } from '../../../../platform/undoRedo/common/undoRedo.js';
import { IPathService } from '../../path/common/pathService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
let WorkbenchModelService = class WorkbenchModelService extends ModelService {
    constructor(configurationService, resourcePropertiesService, undoRedoService, _pathService, instantiationService) {
        super(configurationService, resourcePropertiesService, undoRedoService, instantiationService);
        this._pathService = _pathService;
    }
    _schemaShouldMaintainUndoRedoElements(resource) {
        return (super._schemaShouldMaintainUndoRedoElements(resource)
            || resource.scheme === this._pathService.defaultUriScheme);
    }
};
WorkbenchModelService = __decorate([
    __param(0, IConfigurationService),
    __param(1, ITextResourcePropertiesService),
    __param(2, IUndoRedoService),
    __param(3, IPathService),
    __param(4, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], WorkbenchModelService);
export { WorkbenchModelService };
registerSingleton(IModelService, WorkbenchModelService, 1);
