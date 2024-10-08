import { Disposable } from '../../../../base/common/lifecycle.js';
import { IModelService } from '../../../common/services/model.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ILanguageFeatureDebounceService } from '../../../common/services/languageFeatureDebounce.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { ISemanticTokensStylingService } from '../../../common/services/semanticTokensStyling.js';
export declare class DocumentSemanticTokensFeature extends Disposable {
    private readonly _watchers;
    constructor(semanticTokensStylingService: ISemanticTokensStylingService, modelService: IModelService, themeService: IThemeService, configurationService: IConfigurationService, languageFeatureDebounceService: ILanguageFeatureDebounceService, languageFeaturesService: ILanguageFeaturesService);
    dispose(): void;
}
