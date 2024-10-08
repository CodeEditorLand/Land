import { FuzzyScoreOptions } from '../../../../base/common/filters.js';
import { InternalSuggestOptions } from '../../../common/config/editorOptions.js';
import { CompletionItemProvider } from '../../../common/languages.js';
import { WordDistance } from './wordDistance.js';
import { CompletionItem } from './suggest.js';
export interface ICompletionStats {
    pLabelLen: number;
}
export declare class LineContext {
    readonly leadingLineContent: string;
    readonly characterCountDelta: number;
    constructor(leadingLineContent: string, characterCountDelta: number);
}
/**
 * Sorted, filtered completion view model
 * */
export declare class CompletionModel {
    readonly clipboardText: string | undefined;
    private readonly _items;
    private readonly _column;
    private readonly _wordDistance;
    private readonly _options;
    private readonly _snippetCompareFn;
    private readonly _fuzzyScoreOptions;
    private _lineContext;
    private _refilterKind;
    private _filteredItems?;
    private _itemsByProvider?;
    private _stats?;
    constructor(items: CompletionItem[], column: number, lineContext: LineContext, wordDistance: WordDistance, options: InternalSuggestOptions, snippetSuggestions: 'top' | 'bottom' | 'inline' | 'none', fuzzyScoreOptions?: FuzzyScoreOptions | undefined, clipboardText?: string | undefined);
    get lineContext(): LineContext;
    set lineContext(value: LineContext);
    get items(): CompletionItem[];
    getItemsByProvider(): ReadonlyMap<CompletionItemProvider, CompletionItem[]>;
    getIncompleteProvider(): Set<CompletionItemProvider>;
    get stats(): ICompletionStats;
    private _ensureCachedState;
    private _createCachedState;
    private static _compareCompletionItems;
    private static _compareCompletionItemsSnippetsDown;
    private static _compareCompletionItemsSnippetsUp;
}
