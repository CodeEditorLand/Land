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
    /**
     * Provider function for suggestion results.
     *
     * @param query the full text of the input.
     */
    provideResults: (query: string) => (Partial<languages.CompletionItem> & ({
        label: string;
    }) | string)[];
    /**
     * Trigger characters for this input. Suggestions will appear when one of these is typed,
     * or upon `ctrl+space` triggering at a word boundary.
     *
     * Defaults to the empty array.
     */
    triggerCharacters?: string[];
    /**
     * Optional regular expression that describes what a word is
     *
     * Defaults to space separated words.
     */
    wordDefinition?: RegExp;
    /**
     * Show suggestions even if the trigger character is not present.
     *
     * Defaults to false.
     */
    alwaysShowSuggestions?: boolean;
    /**
     * Defines the sorting function used when showing results.
     *
     * Defaults to the identity function.
     */
    sortKey?: (result: string) => string;
}
interface SuggestEnabledInputOptions {
    /**
     * The text to show when no input is present.
     *
     * Defaults to the empty string.
     */
    placeholderText?: string;
    /**
     * Initial value to be shown
     */
    value?: string;
    /**
     * Context key tracking the focus state of this element
     */
    focusContextKey?: IContextKey<boolean>;
    /**
     * Place overflow widgets inside an external DOM node.
     * Defaults to an internal DOM node.
     */
    overflowWidgetsDomNode?: HTMLElement;
    /**
     * Override the default styling of the input.
     */
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
