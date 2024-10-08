import { IDisposable } from '../../../base/common/lifecycle.js';
import { ICodeEditor, IDiffEditor, IDiffEditorConstructionOptions } from '../../browser/editorBrowser.js';
import { ICodeEditorService } from '../../browser/services/codeEditorService.js';
import { CodeEditorWidget } from '../../browser/widget/codeEditor/codeEditorWidget.js';
import { IDiffEditorOptions, IEditorOptions } from '../../common/config/editorOptions.js';
import { ITextModel } from '../../common/model.js';
import { IStandaloneThemeService } from '../common/standaloneTheme.js';
import { ICommandHandler, ICommandService } from '../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { ContextKeyValue, IContextKey, IContextKeyService } from '../../../platform/contextkey/common/contextkey.js';
import { IContextMenuService } from '../../../platform/contextview/browser/contextView.js';
import { IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../platform/keybinding/common/keybinding.js';
import { INotificationService } from '../../../platform/notification/common/notification.js';
import { IThemeService } from '../../../platform/theme/common/themeService.js';
import { IAccessibilityService } from '../../../platform/accessibility/common/accessibility.js';
import { IClipboardService } from '../../../platform/clipboard/common/clipboardService.js';
import { IEditorProgressService } from '../../../platform/progress/common/progress.js';
import { IModelService } from '../../common/services/model.js';
import { ILanguageService } from '../../common/languages/language.js';
import { URI } from '../../../base/common/uri.js';
import { ILanguageConfigurationService } from '../../common/languages/languageConfigurationRegistry.js';
import { IEditorConstructionOptions } from '../../browser/config/editorConfiguration.js';
import { ILanguageFeaturesService } from '../../common/services/languageFeatures.js';
import { DiffEditorWidget } from '../../browser/widget/diffEditor/diffEditorWidget.js';
import { IAccessibilitySignalService } from '../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { IHoverService } from '../../../platform/hover/browser/hover.js';
/**
 * Description of an action contribution
 */
export interface IActionDescriptor {
    /**
     * An unique identifier of the contributed action.
     */
    id: string;
    /**
     * A label of the action that will be presented to the user.
     */
    label: string;
    /**
     * Precondition rule. The value should be a [context key expression](https://code.visualstudio.com/docs/getstarted/keybindings#_when-clause-contexts).
     */
    precondition?: string;
    /**
     * An array of keybindings for the action.
     */
    keybindings?: number[];
    /**
     * The keybinding rule (condition on top of precondition).
     */
    keybindingContext?: string;
    /**
     * Control if the action should show up in the context menu and where.
     * The context menu of the editor has these default:
     *   navigation - The navigation group comes first in all cases.
     *   1_modification - This group comes next and contains commands that modify your code.
     *   9_cutcopypaste - The last default group with the basic editing commands.
     * You can also create your own group.
     * Defaults to null (don't show in context menu).
     */
    contextMenuGroupId?: string;
    /**
     * Control the order in the context menu group.
     */
    contextMenuOrder?: number;
    /**
     * Method that will be executed when the action is triggered.
     * @param editor The editor instance is passed in as a convenience
     */
    run(editor: ICodeEditor, ...args: any[]): void | Promise<void>;
}
/**
 * Options which apply for all editors.
 */
export interface IGlobalEditorOptions {
    /**
     * The number of spaces a tab is equal to.
     * This setting is overridden based on the file contents when `detectIndentation` is on.
     * Defaults to 4.
     */
    tabSize?: number;
    /**
     * Insert spaces when pressing `Tab`.
     * This setting is overridden based on the file contents when `detectIndentation` is on.
     * Defaults to true.
     */
    insertSpaces?: boolean;
    /**
     * Controls whether `tabSize` and `insertSpaces` will be automatically detected when a file is opened based on the file contents.
     * Defaults to true.
     */
    detectIndentation?: boolean;
    /**
     * Remove trailing auto inserted whitespace.
     * Defaults to true.
     */
    trimAutoWhitespace?: boolean;
    /**
     * Special handling for large files to disable certain memory intensive features.
     * Defaults to true.
     */
    largeFileOptimizations?: boolean;
    /**
     * Controls whether completions should be computed based on words in the document.
     * Defaults to true.
     */
    wordBasedSuggestions?: 'off' | 'currentDocument' | 'matchingDocuments' | 'allDocuments';
    /**
     * Controls whether word based completions should be included from opened documents of the same language or any language.
     */
    wordBasedSuggestionsOnlySameLanguage?: boolean;
    /**
     * Controls whether the semanticHighlighting is shown for the languages that support it.
     * true: semanticHighlighting is enabled for all themes
     * false: semanticHighlighting is disabled for all themes
     * 'configuredByTheme': semanticHighlighting is controlled by the current color theme's semanticHighlighting setting.
     * Defaults to 'byTheme'.
     */
    'semanticHighlighting.enabled'?: true | false | 'configuredByTheme';
    /**
     * Keep peek editors open even when double-clicking their content or when hitting `Escape`.
     * Defaults to false.
     */
    stablePeek?: boolean;
    /**
     * Lines above this length will not be tokenized for performance reasons.
     * Defaults to 20000.
     */
    maxTokenizationLineLength?: number;
    /**
     * Theme to be used for rendering.
     * The current out-of-the-box available themes are: 'vs' (default), 'vs-dark', 'hc-black', 'hc-light'.
     * You can create custom themes via `monaco.editor.defineTheme`.
     * To switch a theme, use `monaco.editor.setTheme`.
     * **NOTE**: The theme might be overwritten if the OS is in high contrast mode, unless `autoDetectHighContrast` is set to false.
     */
    theme?: string;
    /**
     * If enabled, will automatically change to high contrast theme if the OS is using a high contrast theme.
     * Defaults to true.
     */
    autoDetectHighContrast?: boolean;
}
/**
 * The options to create an editor.
 */
export interface IStandaloneEditorConstructionOptions extends IEditorConstructionOptions, IGlobalEditorOptions {
    /**
     * The initial model associated with this code editor.
     */
    model?: ITextModel | null;
    /**
     * The initial value of the auto created model in the editor.
     * To not automatically create a model, use `model: null`.
     */
    value?: string;
    /**
     * The initial language of the auto created model in the editor.
     * To not automatically create a model, use `model: null`.
     */
    language?: string;
    /**
     * Initial theme to be used for rendering.
     * The current out-of-the-box available themes are: 'vs' (default), 'vs-dark', 'hc-black', 'hc-light.
     * You can create custom themes via `monaco.editor.defineTheme`.
     * To switch a theme, use `monaco.editor.setTheme`.
     * **NOTE**: The theme might be overwritten if the OS is in high contrast mode, unless `autoDetectHighContrast` is set to false.
     */
    theme?: string;
    /**
     * If enabled, will automatically change to high contrast theme if the OS is using a high contrast theme.
     * Defaults to true.
     */
    autoDetectHighContrast?: boolean;
    /**
     * An URL to open when Ctrl+H (Windows and Linux) or Cmd+H (OSX) is pressed in
     * the accessibility help dialog in the editor.
     *
     * Defaults to "https://go.microsoft.com/fwlink/?linkid=852450"
     */
    accessibilityHelpUrl?: string;
    /**
     * Container element to use for ARIA messages.
     * Defaults to document.body.
     */
    ariaContainerElement?: HTMLElement;
}
/**
 * The options to create a diff editor.
 */
export interface IStandaloneDiffEditorConstructionOptions extends IDiffEditorConstructionOptions {
    /**
     * Initial theme to be used for rendering.
     * The current out-of-the-box available themes are: 'vs' (default), 'vs-dark', 'hc-black', 'hc-light.
     * You can create custom themes via `monaco.editor.defineTheme`.
     * To switch a theme, use `monaco.editor.setTheme`.
     * **NOTE**: The theme might be overwritten if the OS is in high contrast mode, unless `autoDetectHighContrast` is set to false.
     */
    theme?: string;
    /**
     * If enabled, will automatically change to high contrast theme if the OS is using a high contrast theme.
     * Defaults to true.
     */
    autoDetectHighContrast?: boolean;
}
export interface IStandaloneCodeEditor extends ICodeEditor {
    updateOptions(newOptions: IEditorOptions & IGlobalEditorOptions): void;
    addCommand(keybinding: number, handler: ICommandHandler, context?: string): string | null;
    createContextKey<T extends ContextKeyValue = ContextKeyValue>(key: string, defaultValue: T): IContextKey<T>;
    addAction(descriptor: IActionDescriptor): IDisposable;
}
export interface IStandaloneDiffEditor extends IDiffEditor {
    addCommand(keybinding: number, handler: ICommandHandler, context?: string): string | null;
    createContextKey<T extends ContextKeyValue = ContextKeyValue>(key: string, defaultValue: T): IContextKey<T>;
    addAction(descriptor: IActionDescriptor): IDisposable;
    getOriginalEditor(): IStandaloneCodeEditor;
    getModifiedEditor(): IStandaloneCodeEditor;
}
/**
 * A code editor to be used both by the standalone editor and the standalone diff editor.
 */
export declare class StandaloneCodeEditor extends CodeEditorWidget implements IStandaloneCodeEditor {
    private readonly _standaloneKeybindingService;
    constructor(domElement: HTMLElement, _options: Readonly<IStandaloneEditorConstructionOptions>, instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, commandService: ICommandService, contextKeyService: IContextKeyService, hoverService: IHoverService, keybindingService: IKeybindingService, themeService: IThemeService, notificationService: INotificationService, accessibilityService: IAccessibilityService, languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService);
    addCommand(keybinding: number, handler: ICommandHandler, context?: string): string | null;
    createContextKey<T extends ContextKeyValue = ContextKeyValue>(key: string, defaultValue: T): IContextKey<T>;
    addAction(_descriptor: IActionDescriptor): IDisposable;
    protected _triggerCommand(handlerId: string, payload: any): void;
}
export declare class StandaloneEditor extends StandaloneCodeEditor implements IStandaloneCodeEditor {
    private readonly _configurationService;
    private readonly _standaloneThemeService;
    private _ownsModel;
    constructor(domElement: HTMLElement, _options: Readonly<IStandaloneEditorConstructionOptions> | undefined, instantiationService: IInstantiationService, codeEditorService: ICodeEditorService, commandService: ICommandService, contextKeyService: IContextKeyService, hoverService: IHoverService, keybindingService: IKeybindingService, themeService: IStandaloneThemeService, notificationService: INotificationService, configurationService: IConfigurationService, accessibilityService: IAccessibilityService, modelService: IModelService, languageService: ILanguageService, languageConfigurationService: ILanguageConfigurationService, languageFeaturesService: ILanguageFeaturesService);
    dispose(): void;
    updateOptions(newOptions: Readonly<IEditorOptions & IGlobalEditorOptions>): void;
    protected _postDetachModelCleanup(detachedModel: ITextModel): void;
}
export declare class StandaloneDiffEditor2 extends DiffEditorWidget implements IStandaloneDiffEditor {
    private readonly _configurationService;
    private readonly _standaloneThemeService;
    constructor(domElement: HTMLElement, _options: Readonly<IStandaloneDiffEditorConstructionOptions> | undefined, instantiationService: IInstantiationService, contextKeyService: IContextKeyService, codeEditorService: ICodeEditorService, themeService: IStandaloneThemeService, notificationService: INotificationService, configurationService: IConfigurationService, contextMenuService: IContextMenuService, editorProgressService: IEditorProgressService, clipboardService: IClipboardService, accessibilitySignalService: IAccessibilitySignalService);
    dispose(): void;
    updateOptions(newOptions: Readonly<IDiffEditorOptions & IGlobalEditorOptions>): void;
    protected _createInnerEditor(instantiationService: IInstantiationService, container: HTMLElement, options: Readonly<IEditorOptions>): CodeEditorWidget;
    getOriginalEditor(): IStandaloneCodeEditor;
    getModifiedEditor(): IStandaloneCodeEditor;
    addCommand(keybinding: number, handler: ICommandHandler, context?: string): string | null;
    createContextKey<T extends ContextKeyValue = ContextKeyValue>(key: string, defaultValue: T): IContextKey<T>;
    addAction(descriptor: IActionDescriptor): IDisposable;
}
/**
 * @internal
 */
export declare function createTextModel(modelService: IModelService, languageService: ILanguageService, value: string, languageId: string | undefined, uri: URI | undefined): ITextModel;
