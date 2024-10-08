import { IObservable } from '../../../../../base/common/observable.js';
import { InlineCompletionsModel } from '../model/inlineCompletionsModel.js';
import { RawContextKey, IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
export declare class InlineCompletionContextKeys extends Disposable {
    private readonly contextKeyService;
    private readonly model;
    static readonly inlineSuggestionVisible: RawContextKey<boolean>;
    static readonly inlineSuggestionHasIndentation: RawContextKey<boolean>;
    static readonly inlineSuggestionHasIndentationLessThanTabSize: RawContextKey<boolean>;
    static readonly suppressSuggestions: RawContextKey<boolean | undefined>;
    static readonly cursorInIndentation: RawContextKey<boolean | undefined>;
    static readonly hasSelection: RawContextKey<boolean | undefined>;
    static readonly cursorAtInlineEdit: RawContextKey<boolean | undefined>;
    static readonly inlineEditVisible: RawContextKey<boolean>;
    readonly inlineCompletionVisible: import("../../../../../platform/contextkey/common/contextkey.js").IContextKey<boolean>;
    readonly inlineCompletionSuggestsIndentation: import("../../../../../platform/contextkey/common/contextkey.js").IContextKey<boolean>;
    readonly inlineCompletionSuggestsIndentationLessThanTabSize: import("../../../../../platform/contextkey/common/contextkey.js").IContextKey<boolean>;
    readonly suppressSuggestions: import("../../../../../platform/contextkey/common/contextkey.js").IContextKey<boolean | undefined>;
    constructor(contextKeyService: IContextKeyService, model: IObservable<InlineCompletionsModel | undefined>);
}
