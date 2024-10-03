import { Disposable } from '../../../base/common/lifecycle.js';
import { ILanguageService } from '../languages/language.js';
import { DocumentTokensProvider } from './model.js';
import { IThemeService } from '../../../platform/theme/common/themeService.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { SemanticTokensProviderStyling } from './semanticTokensProviderStyling.js';
import { ISemanticTokensStylingService } from './semanticTokensStyling.js';
export declare class SemanticTokensStylingService extends Disposable implements ISemanticTokensStylingService {
    private readonly _themeService;
    private readonly _logService;
    private readonly _languageService;
    _serviceBrand: undefined;
    private _caches;
    constructor(_themeService: IThemeService, _logService: ILogService, _languageService: ILanguageService);
    getStyling(provider: DocumentTokensProvider): SemanticTokensProviderStyling;
}
