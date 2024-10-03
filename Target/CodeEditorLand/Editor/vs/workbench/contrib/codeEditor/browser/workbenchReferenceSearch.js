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
import { registerEditorContribution } from '../../../../editor/browser/editorExtensions.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { ReferencesController } from '../../../../editor/contrib/gotoSymbol/browser/peek/referencesController.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
let WorkbenchReferencesController = class WorkbenchReferencesController extends ReferencesController {
    constructor(editor, contextKeyService, editorService, notificationService, instantiationService, storageService, configurationService) {
        super(false, editor, contextKeyService, editorService, notificationService, instantiationService, storageService, configurationService);
    }
};
WorkbenchReferencesController = __decorate([
    __param(1, IContextKeyService),
    __param(2, ICodeEditorService),
    __param(3, INotificationService),
    __param(4, IInstantiationService),
    __param(5, IStorageService),
    __param(6, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], WorkbenchReferencesController);
export { WorkbenchReferencesController };
registerEditorContribution(ReferencesController.ID, WorkbenchReferencesController, 4);
