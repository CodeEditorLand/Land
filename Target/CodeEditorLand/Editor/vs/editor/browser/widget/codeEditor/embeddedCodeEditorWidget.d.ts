import { ICodeEditor } from '../../editorBrowser.js';
import { ICodeEditorService } from '../../services/codeEditorService.js';
import { CodeEditorWidget, ICodeEditorWidgetOptions } from './codeEditorWidget.js';
import { IEditorOptions } from '../../../common/config/editorOptions.js';
import { ILanguageConfigurationService } from '../../../common/languages/languageConfigurationRegistry.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
export declare class EmbeddedCodeEditorWidget extends CodeEditorWidget {
    private readonly _parentEditor;
    private readonly _overwriteOptions;
    constructor(domElement: HTMLElement, options: IEditorOptions, codeEditorWidgetOptions: ICodeEditorWidgetOptions, parentEditor: ICodeEditor, instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, commandService: ICommandService, contextKeyService: IContextKeyService, themeService: IThemeService, notificationService: INotificationService, accessibilityService: IAccessibilityService, languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService);
    getParentEditor(): ICodeEditor;
    private _onParentConfigurationChanged;
    updateOptions(newOptions: IEditorOptions): void;
}
