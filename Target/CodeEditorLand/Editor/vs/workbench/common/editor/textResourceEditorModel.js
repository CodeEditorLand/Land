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
import { BaseTextEditorModel } from './textEditorModel.js';
import { URI } from '../../../base/common/uri.js';
import { ILanguageService } from '../../../editor/common/languages/language.js';
import { IModelService } from '../../../editor/common/services/model.js';
import { ILanguageDetectionService } from '../../services/languageDetection/common/languageDetectionWorkerService.js';
import { IAccessibilityService } from '../../../platform/accessibility/common/accessibility.js';
let TextResourceEditorModel = class TextResourceEditorModel extends BaseTextEditorModel {
    constructor(resource, languageService, modelService, languageDetectionService, accessibilityService) {
        super(modelService, languageService, languageDetectionService, accessibilityService, resource);
    }
    dispose() {
        if (this.textEditorModelHandle) {
            this.modelService.destroyModel(this.textEditorModelHandle);
        }
        super.dispose();
    }
};
TextResourceEditorModel = __decorate([
    __param(1, ILanguageService),
    __param(2, IModelService),
    __param(3, ILanguageDetectionService),
    __param(4, IAccessibilityService),
    __metadata("design:paramtypes", [URI, Object, Object, Object, Object])
], TextResourceEditorModel);
export { TextResourceEditorModel };
