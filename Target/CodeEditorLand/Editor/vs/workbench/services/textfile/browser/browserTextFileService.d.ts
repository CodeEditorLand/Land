import { AbstractTextFileService } from './textFileService.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { IDialogService, IFileDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IElevatedFileService } from '../../files/common/elevatedFileService.js';
import { IFilesConfigurationService } from '../../filesConfiguration/common/filesConfigurationService.js';
import { ILifecycleService } from '../../lifecycle/common/lifecycle.js';
import { IPathService } from '../../path/common/pathService.js';
import { IUntitledTextEditorService } from '../../untitled/common/untitledTextEditorService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IWorkingCopyFileService } from '../../workingCopy/common/workingCopyFileService.js';
import { IDecorationsService } from '../../decorations/common/decorations.js';
export declare class BrowserTextFileService extends AbstractTextFileService {
    constructor(fileService: IFileService, untitledTextEditorService: IUntitledTextEditorService, lifecycleService: ILifecycleService, instantiationService: IInstantiationService, modelService: IModelService, environmentService: IWorkbenchEnvironmentService, dialogService: IDialogService, fileDialogService: IFileDialogService, textResourceConfigurationService: ITextResourceConfigurationService, filesConfigurationService: IFilesConfigurationService, codeEditorService: ICodeEditorService, pathService: IPathService, workingCopyFileService: IWorkingCopyFileService, uriIdentityService: IUriIdentityService, languageService: ILanguageService, elevatedFileService: IElevatedFileService, logService: ILogService, decorationsService: IDecorationsService);
    private registerListeners;
    private onBeforeShutdown;
}
