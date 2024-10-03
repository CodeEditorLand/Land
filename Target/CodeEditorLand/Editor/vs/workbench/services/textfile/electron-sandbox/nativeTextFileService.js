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
import { AbstractTextFileService } from '../browser/textFileService.js';
import { ITextFileService } from '../common/textfiles.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IUntitledTextEditorService } from '../../untitled/common/untitledTextEditorService.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { IPathService } from '../../path/common/pathService.js';
import { IWorkingCopyFileService } from '../../workingCopy/common/workingCopyFileService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { IElevatedFileService } from '../../files/common/elevatedFileService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { Promises } from '../../../../base/common/async.js';
import { IDecorationsService } from '../../decorations/common/decorations.js';
let NativeTextFileService = class NativeTextFileService extends AbstractTextFileService {
    constructor(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, elevatedFileService, logService, decorationsService) {
        super(fileService, untitledTextEditorService, lifecycleService, instantiationService, modelService, environmentService, dialogService, fileDialogService, textResourceConfigurationService, filesConfigurationService, codeEditorService, pathService, workingCopyFileService, uriIdentityService, languageService, logService, elevatedFileService, decorationsService);
        this.environmentService = environmentService;
        this.registerListeners();
    }
    registerListeners() {
        this._register(this.lifecycleService.onWillShutdown(event => event.join(this.onWillShutdown(), { id: 'join.textFiles', label: localize('join.textFiles', "Saving text files") })));
    }
    async onWillShutdown() {
        let modelsPendingToSave;
        while ((modelsPendingToSave = this.files.models.filter(model => model.hasState(2))).length > 0) {
            await Promises.settled(modelsPendingToSave.map(model => model.joinState(2)));
        }
    }
    async read(resource, options) {
        options = this.ensureLimits(options);
        return super.read(resource, options);
    }
    async readStream(resource, options) {
        options = this.ensureLimits(options);
        return super.readStream(resource, options);
    }
    ensureLimits(options) {
        let ensuredOptions;
        if (!options) {
            ensuredOptions = Object.create(null);
        }
        else {
            ensuredOptions = options;
        }
        let ensuredLimits;
        if (!ensuredOptions.limits) {
            ensuredLimits = Object.create(null);
            ensuredOptions = {
                ...ensuredOptions,
                limits: ensuredLimits
            };
        }
        else {
            ensuredLimits = ensuredOptions.limits;
        }
        return ensuredOptions;
    }
};
NativeTextFileService = __decorate([
    __param(0, IFileService),
    __param(1, IUntitledTextEditorService),
    __param(2, ILifecycleService),
    __param(3, IInstantiationService),
    __param(4, IModelService),
    __param(5, INativeWorkbenchEnvironmentService),
    __param(6, IDialogService),
    __param(7, IFileDialogService),
    __param(8, ITextResourceConfigurationService),
    __param(9, IFilesConfigurationService),
    __param(10, ICodeEditorService),
    __param(11, IPathService),
    __param(12, IWorkingCopyFileService),
    __param(13, IUriIdentityService),
    __param(14, ILanguageService),
    __param(15, IElevatedFileService),
    __param(16, ILogService),
    __param(17, IDecorationsService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], NativeTextFileService);
export { NativeTextFileService };
registerSingleton(ITextFileService, NativeTextFileService, 0);
