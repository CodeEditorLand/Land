import { SimpleCompletionItem } from './simpleCompletionItem.js';
export interface ISimpleCompletionStats {
    pLabelLen: number;
}
export declare class LineContext {
    readonly leadingLineContent: string;
    readonly characterCountDelta: number;
    constructor(leadingLineContent: string, characterCountDelta: number);
}
export declare class SimpleCompletionModel {
    private readonly _items;
    private _lineContext;
    readonly replacementIndex: number;
    readonly replacementLength: number;
    private _stats?;
    private _filteredItems?;
    private _refilterKind;
    private _fuzzyScoreOptions;
    private _options;
    constructor(_items: SimpleCompletionItem[], _lineContext: LineContext, replacementIndex: number, replacementLength: number);
    get items(): SimpleCompletionItem[];
    get stats(): ISimpleCompletionStats;
    get lineContext(): LineContext;
    set lineContext(value: LineContext);
    private _ensureCachedState;
    private _createCachedState;
}
