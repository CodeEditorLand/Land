import { Dimension } from '../../../../../base/browser/dom.js';
import { IHistoryNavigationWidget } from '../../../../../base/browser/history.js';
import { Widget } from '../../../../../base/browser/ui/widget.js';
import { Event } from '../../../../../base/common/event.js';
import { HistoryNavigator } from '../../../../../base/common/history.js';
import './suggestEnabledInput.css';
import { CodeEditorWidget } from '../../../../../editor/browser/widget/codeEditor/codeEditorWidget.js';
import * as languages from '../../../../../editor/common/languages.js';
import { ILanguageFeaturesService } from '../../../../../editor/common/services/languageFeatures.js';
import { IModelService } from '../../../../../editor/common/services/model.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKey, IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { ColorIdentifier } from '../../../../../platform/theme/common/colorRegistry.js';
export interface SuggestResultsProvider {
    provideResults: (query: string) => (Partial<languages.CompletionItem> & ({
        label: string;
    }) | string)[];
    triggerCharacters?: string[];
    wordDefinition?: RegExp;
    alwaysShowSuggestions?: boolean;
    sortKey?: (result: string) => string;
}
interface SuggestEnabledInputOptions {
    placeholderText?: string;
    value?: string;
    focusContextKey?: IContextKey<boolean>;
    overflowWidgetsDomNode?: HTMLElement;
    styleOverrides?: ISuggestEnabledInputStyleOverrides;
}
export interface ISuggestEnabledInputStyleOverrides {
    inputBackground?: ColorIdentifier;
    inputForeground?: ColorIdentifier;
    inputBorder?: ColorIdentifier;
    inputPlaceholderForeground?: ColorIdentifier;
}
export declare class SuggestEnabledInput extends Widget {
    private readonly _onShouldFocusResults;
    readonly onShouldFocusResults: Event<void>;
    private readonly _onInputDidChange;
    readonly onInputDidChange: Event<string | undefined>;
    private readonly _onDidFocus;
    readonly onDidFocus: Event<void>;
    private readonly _onDidBlur;
    readonly onDidBlur: Event<void>;
    readonly inputWidget: CodeEditorWidget;
    private readonly inputModel;
    protected stylingContainer: HTMLDivElement;
    readonly element: HTMLElement;
    private placeholderText;
    constructor(id: string, parent: HTMLElement, suggestionProvider: SuggestResultsProvider, ariaLabel: string, resourceHandle: string, options: SuggestEnabledInputOptions, defaultInstantiationService: IInstantiationService, modelService: IModelService, contextKeyService: IContextKeyService, languageFeaturesService: ILanguageFeaturesService, configurationService: IConfigurationService);
    protected getScopedContextKeyService(_contextKeyService: IContextKeyService): IContextKeyService | undefined;
    updateAriaLabel(label: string): void;
    setValue(val: string): void;
    getValue(): string;
    private style;
    focus(selectAll?: boolean): void;
    onHide(): void;
    layout(dimension: Dimension): void;
    private selectAll;
}
export interface ISuggestEnabledHistoryOptions {
    id: string;
    ariaLabel: string;
    parent: HTMLElement;
    suggestionProvider: SuggestResultsProvider;
    resourceHandle: string;
    suggestOptions: SuggestEnabledInputOptions;
    history: string[];
}
export declare class SuggestEnabledInputWithHistory extends SuggestEnabledInput implements IHistoryNavigationWidget {
    protected readonly history: HistoryNavigator<string>;
    constructor({ id, parent, ariaLabel, suggestionProvider, resourceHandle, suggestOptions, history }: ISuggestEnabledHistoryOptions, instantiationService: IInstantiationService, modelService: IModelService, contextKeyService: IContextKeyService, languageFeaturesService: ILanguageFeaturesService, configurationService: IConfigurationService);
    addToHistory(): void;
    getHistory(): string[];
    showNextValue(): void;
    showPreviousValue(): void;
    clearHistory(): void;
    private getCurrentValue;
    private getPreviousValue;
    private getNextValue;
}
export declare class ContextScopedSuggestEnabledInputWithHistory extends SuggestEnabledInputWithHistory {
    private historyContext;
    constructor(options: ISuggestEnabledHistoryOptions, instantiationService: IInstantiationService, modelService: IModelService, contextKeyService: IContextKeyService, languageFeaturesService: ILanguageFeaturesService, configurationService: IConfigurationService);
    protected getScopedContextKeyService(contextKeyService: IContextKeyService): import("../../../../../platform/contextkey/common/contextkey.js").IScopedContextKeyService;
}
export {};
