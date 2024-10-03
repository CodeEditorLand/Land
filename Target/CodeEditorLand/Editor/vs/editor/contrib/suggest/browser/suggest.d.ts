import { CancellationToken } from '../../../../base/common/cancellation.js';
import { FuzzyScore } from '../../../../base/common/filters.js';
import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { IPosition, Position } from '../../../common/core/position.js';
import { ITextModel } from '../../../common/model.js';
import * as languages from '../../../common/languages.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { LanguageFeatureRegistry } from '../../../common/languageFeatureRegistry.js';
import { InternalQuickSuggestionsOptions, QuickSuggestionsValue } from '../../../common/config/editorOptions.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { StandardTokenType } from '../../../common/encodedTokenAttributes.js';
export declare const Context: {
    Visible: RawContextKey<boolean>;
    HasFocusedSuggestion: RawContextKey<boolean>;
    DetailsVisible: RawContextKey<boolean>;
    MultipleSuggestions: RawContextKey<boolean>;
    MakesTextEdit: RawContextKey<boolean>;
    AcceptSuggestionsOnEnter: RawContextKey<boolean>;
    HasInsertAndReplaceRange: RawContextKey<boolean>;
    InsertMode: RawContextKey<"replace" | "insert">;
    CanResolve: RawContextKey<boolean>;
};
export declare const suggestWidgetStatusbarMenu: MenuId;
export declare class CompletionItem {
    readonly position: IPosition;
    readonly completion: languages.CompletionItem;
    readonly container: languages.CompletionList;
    readonly provider: languages.CompletionItemProvider;
    _brand: 'ISuggestionItem';
    readonly editStart: IPosition;
    readonly editInsertEnd: IPosition;
    readonly editReplaceEnd: IPosition;
    readonly textLabel: string;
    readonly labelLow: string;
    readonly sortTextLow?: string;
    readonly filterTextLow?: string;
    readonly isInvalid: boolean;
    score: FuzzyScore;
    distance: number;
    idx?: number;
    word?: string;
    readonly extensionId?: ExtensionIdentifier;
    private _resolveDuration?;
    private _resolveCache?;
    constructor(position: IPosition, completion: languages.CompletionItem, container: languages.CompletionList, provider: languages.CompletionItemProvider);
    get isResolved(): boolean;
    get resolveDuration(): number;
    resolve(token: CancellationToken): Promise<void>;
}
export declare const enum SnippetSortOrder {
    Top = 0,
    Inline = 1,
    Bottom = 2
}
export declare class CompletionOptions {
    readonly snippetSortOrder: SnippetSortOrder;
    readonly kindFilter: Set<languages.CompletionItemKind>;
    readonly providerFilter: Set<languages.CompletionItemProvider>;
    readonly providerItemsToReuse: ReadonlyMap<languages.CompletionItemProvider, CompletionItem[]>;
    readonly showDeprecated: boolean;
    static readonly default: CompletionOptions;
    constructor(snippetSortOrder?: SnippetSortOrder, kindFilter?: Set<languages.CompletionItemKind>, providerFilter?: Set<languages.CompletionItemProvider>, providerItemsToReuse?: ReadonlyMap<languages.CompletionItemProvider, CompletionItem[]>, showDeprecated?: boolean);
}
export declare function getSnippetSuggestSupport(): languages.CompletionItemProvider | undefined;
export declare function setSnippetSuggestSupport(support: languages.CompletionItemProvider | undefined): languages.CompletionItemProvider | undefined;
export interface CompletionDurationEntry {
    readonly providerName: string;
    readonly elapsedProvider: number;
    readonly elapsedOverall: number;
}
export interface CompletionDurations {
    readonly entries: readonly CompletionDurationEntry[];
    readonly elapsed: number;
}
export declare class CompletionItemModel {
    readonly items: CompletionItem[];
    readonly needsClipboard: boolean;
    readonly durations: CompletionDurations;
    readonly disposable: IDisposable;
    constructor(items: CompletionItem[], needsClipboard: boolean, durations: CompletionDurations, disposable: IDisposable);
}
export declare function provideSuggestionItems(registry: LanguageFeatureRegistry<languages.CompletionItemProvider>, model: ITextModel, position: Position, options?: CompletionOptions, context?: languages.CompletionContext, token?: CancellationToken): Promise<CompletionItemModel>;
export declare function getSuggestionComparator(snippetConfig: SnippetSortOrder): (a: CompletionItem, b: CompletionItem) => number;
export declare function showSimpleSuggestions(editor: ICodeEditor, provider: languages.CompletionItemProvider): void;
export interface ISuggestItemPreselector {
    readonly priority: number;
    select(model: ITextModel, pos: IPosition, items: CompletionItem[]): number | -1;
}
export declare abstract class QuickSuggestionsOptions {
    static isAllOff(config: InternalQuickSuggestionsOptions): boolean;
    static isAllOn(config: InternalQuickSuggestionsOptions): boolean;
    static valueFor(config: InternalQuickSuggestionsOptions, tokenType: StandardTokenType): QuickSuggestionsValue;
}
