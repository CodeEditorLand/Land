import { EditorWorkerService } from '../../../../editor/browser/services/editorWorkerService.js';
import { ILanguageConfigurationService } from '../../../../editor/common/languages/languageConfigurationRegistry.js';
import { ILanguageFeaturesService } from '../../../../editor/common/services/languageFeatures.js';
import { IModelService } from '../../../../editor/common/services/model.js';
import { ITextResourceConfigurationService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare class WorkbenchEditorWorkerService extends EditorWorkerService {
    constructor(modelService: IModelService, configurationService: ITextResourceConfigurationService, logService: ILogService, languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService);
}
