import { ITextModel } from '../../../common/model.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
export declare const SEMANTIC_HIGHLIGHTING_SETTING_ID = "editor.semanticHighlighting";
export interface IEditorSemanticHighlightingOptions {
    enabled: true | false | 'configuredByTheme';
}
export declare function isSemanticColoringEnabled(model: ITextModel, themeService: IThemeService, configurationService: IConfigurationService): boolean;
