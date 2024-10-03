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
export interface IActionDescriptor {
    id: string;
    label: string;
    precondition?: string;
    keybindings?: number[];
    keybindingContext?: string;
    contextMenuGroupId?: string;
    contextMenuOrder?: number;
    run(editor: ICodeEditor, ...args: any[]): void | Promise<void>;
}
export interface IGlobalEditorOptions {
    tabSize?: number;
    insertSpaces?: boolean;
    detectIndentation?: boolean;
    trimAutoWhitespace?: boolean;
    largeFileOptimizations?: boolean;
    wordBasedSuggestions?: 'off' | 'currentDocument' | 'matchingDocuments' | 'allDocuments';
    wordBasedSuggestionsOnlySameLanguage?: boolean;
    'semanticHighlighting.enabled'?: true | false | 'configuredByTheme';
    stablePeek?: boolean;
    maxTokenizationLineLength?: number;
    theme?: string;
    autoDetectHighContrast?: boolean;
}
export interface IStandaloneEditorConstructionOptions extends IEditorConstructionOptions, IGlobalEditorOptions {
    model?: ITextModel | null;
    value?: string;
    language?: string;
    theme?: string;
    autoDetectHighContrast?: boolean;
    accessibilityHelpUrl?: string;
    ariaContainerElement?: HTMLElement;
}
export interface IStandaloneDiffEditorConstructionOptions extends IDiffEditorConstructionOptions {
    theme?: string;
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
export declare function createTextModel(modelService: IModelService, languageService: ILanguageService, value: string, languageId: string | undefined, uri: URI | undefined): ITextModel;
