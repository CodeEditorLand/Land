import { CancellationToken } from '../../../../base/common/cancellation.js';
import { CancellationError, isCancellationError, onUnexpectedExternalError } from '../../../../base/common/errors.js';
import { FuzzyScore } from '../../../../base/common/filters.js';
import { DisposableStore, isDisposable } from '../../../../base/common/lifecycle.js';
import { StopWatch } from '../../../../base/common/stopwatch.js';
import { assertType } from '../../../../base/common/types.js';
import { URI } from '../../../../base/common/uri.js';
import { Position } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import { ITextModelService } from '../../../common/services/resolverService.js';
import { SnippetParser } from '../../snippet/browser/snippetParser.js';
import { localize } from '../../../../nls.js';
import { MenuId } from '../../../../platform/actions/common/actions.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { historyNavigationVisible } from '../../../../platform/history/browser/contextScopedHistoryWidget.js';
export const Context = {
    Visible: historyNavigationVisible,
    HasFocusedSuggestion: new RawContextKey('suggestWidgetHasFocusedSuggestion', false, localize('suggestWidgetHasSelection', "Whether any suggestion is focused")),
    DetailsVisible: new RawContextKey('suggestWidgetDetailsVisible', false, localize('suggestWidgetDetailsVisible', "Whether suggestion details are visible")),
    MultipleSuggestions: new RawContextKey('suggestWidgetMultipleSuggestions', false, localize('suggestWidgetMultipleSuggestions', "Whether there are multiple suggestions to pick from")),
    MakesTextEdit: new RawContextKey('suggestionMakesTextEdit', true, localize('suggestionMakesTextEdit', "Whether inserting the current suggestion yields in a change or has everything already been typed")),
    AcceptSuggestionsOnEnter: new RawContextKey('acceptSuggestionOnEnter', true, localize('acceptSuggestionOnEnter', "Whether suggestions are inserted when pressing Enter")),
    HasInsertAndReplaceRange: new RawContextKey('suggestionHasInsertAndReplaceRange', false, localize('suggestionHasInsertAndReplaceRange', "Whether the current suggestion has insert and replace behaviour")),
    InsertMode: new RawContextKey('suggestionInsertMode', undefined, { type: 'string', description: localize('suggestionInsertMode', "Whether the default behaviour is to insert or replace") }),
    CanResolve: new RawContextKey('suggestionCanResolve', false, localize('suggestionCanResolve', "Whether the current suggestion supports to resolve further details")),
};
export const suggestWidgetStatusbarMenu = new MenuId('suggestWidgetStatusBar');
export class CompletionItem {
    constructor(position, completion, container, provider) {
        this.position = position;
        this.completion = completion;
        this.container = container;
        this.provider = provider;
        this.isInvalid = false;
        this.score = FuzzyScore.Default;
        this.distance = 0;
        this.textLabel = typeof completion.label === 'string'
            ? completion.label
            : completion.label?.label;
        this.labelLow = this.textLabel.toLowerCase();
        this.isInvalid = !this.textLabel;
        this.sortTextLow = completion.sortText && completion.sortText.toLowerCase();
        this.filterTextLow = completion.filterText && completion.filterText.toLowerCase();
        this.extensionId = completion.extensionId;
        if (Range.isIRange(completion.range)) {
            this.editStart = new Position(completion.range.startLineNumber, completion.range.startColumn);
            this.editInsertEnd = new Position(completion.range.endLineNumber, completion.range.endColumn);
            this.editReplaceEnd = new Position(completion.range.endLineNumber, completion.range.endColumn);
            this.isInvalid = this.isInvalid
                || Range.spansMultipleLines(completion.range) || completion.range.startLineNumber !== position.lineNumber;
        }
        else {
            this.editStart = new Position(completion.range.insert.startLineNumber, completion.range.insert.startColumn);
            this.editInsertEnd = new Position(completion.range.insert.endLineNumber, completion.range.insert.endColumn);
            this.editReplaceEnd = new Position(completion.range.replace.endLineNumber, completion.range.replace.endColumn);
            this.isInvalid = this.isInvalid
                || Range.spansMultipleLines(completion.range.insert) || Range.spansMultipleLines(completion.range.replace)
                || completion.range.insert.startLineNumber !== position.lineNumber || completion.range.replace.startLineNumber !== position.lineNumber
                || completion.range.insert.startColumn !== completion.range.replace.startColumn;
        }
        if (typeof provider.resolveCompletionItem !== 'function') {
            this._resolveCache = Promise.resolve();
            this._resolveDuration = 0;
        }
    }
    get isResolved() {
        return this._resolveDuration !== undefined;
    }
    get resolveDuration() {
        return this._resolveDuration !== undefined ? this._resolveDuration : -1;
    }
    async resolve(token) {
        if (!this._resolveCache) {
            const sub = token.onCancellationRequested(() => {
                this._resolveCache = undefined;
                this._resolveDuration = undefined;
            });
            const sw = new StopWatch(true);
            this._resolveCache = Promise.resolve(this.provider.resolveCompletionItem(this.completion, token)).then(value => {
                Object.assign(this.completion, value);
                this._resolveDuration = sw.elapsed();
            }, err => {
                if (isCancellationError(err)) {
                    this._resolveCache = undefined;
                    this._resolveDuration = undefined;
                }
            }).finally(() => {
                sub.dispose();
            });
        }
        return this._resolveCache;
    }
}
export class CompletionOptions {
    static { this.default = new CompletionOptions(); }
    constructor(snippetSortOrder = 2, kindFilter = new Set(), providerFilter = new Set(), providerItemsToReuse = new Map(), showDeprecated = true) {
        this.snippetSortOrder = snippetSortOrder;
        this.kindFilter = kindFilter;
        this.providerFilter = providerFilter;
        this.providerItemsToReuse = providerItemsToReuse;
        this.showDeprecated = showDeprecated;
    }
}
let _snippetSuggestSupport;
export function getSnippetSuggestSupport() {
    return _snippetSuggestSupport;
}
export function setSnippetSuggestSupport(support) {
    const old = _snippetSuggestSupport;
    _snippetSuggestSupport = support;
    return old;
}
export class CompletionItemModel {
    constructor(items, needsClipboard, durations, disposable) {
        this.items = items;
        this.needsClipboard = needsClipboard;
        this.durations = durations;
        this.disposable = disposable;
    }
}
export async function provideSuggestionItems(registry, model, position, options = CompletionOptions.default, context = { triggerKind: 0 }, token = CancellationToken.None) {
    const sw = new StopWatch();
    position = position.clone();
    const word = model.getWordAtPosition(position);
    const defaultReplaceRange = word ? new Range(position.lineNumber, word.startColumn, position.lineNumber, word.endColumn) : Range.fromPositions(position);
    const defaultRange = { replace: defaultReplaceRange, insert: defaultReplaceRange.setEndPosition(position.lineNumber, position.column) };
    const result = [];
    const disposables = new DisposableStore();
    const durations = [];
    let needsClipboard = false;
    const onCompletionList = (provider, container, sw) => {
        let didAddResult = false;
        if (!container) {
            return didAddResult;
        }
        for (const suggestion of container.suggestions) {
            if (!options.kindFilter.has(suggestion.kind)) {
                if (!options.showDeprecated && suggestion?.tags?.includes(1)) {
                    continue;
                }
                if (!suggestion.range) {
                    suggestion.range = defaultRange;
                }
                if (!suggestion.sortText) {
                    suggestion.sortText = typeof suggestion.label === 'string' ? suggestion.label : suggestion.label.label;
                }
                if (!needsClipboard && suggestion.insertTextRules && suggestion.insertTextRules & 4) {
                    needsClipboard = SnippetParser.guessNeedsClipboard(suggestion.insertText);
                }
                result.push(new CompletionItem(position, suggestion, container, provider));
                didAddResult = true;
            }
        }
        if (isDisposable(container)) {
            disposables.add(container);
        }
        durations.push({
            providerName: provider._debugDisplayName ?? 'unknown_provider', elapsedProvider: container.duration ?? -1, elapsedOverall: sw.elapsed()
        });
        return didAddResult;
    };
    const snippetCompletions = (async () => {
        if (!_snippetSuggestSupport || options.kindFilter.has(27)) {
            return;
        }
        const reuseItems = options.providerItemsToReuse.get(_snippetSuggestSupport);
        if (reuseItems) {
            reuseItems.forEach(item => result.push(item));
            return;
        }
        if (options.providerFilter.size > 0 && !options.providerFilter.has(_snippetSuggestSupport)) {
            return;
        }
        const sw = new StopWatch();
        const list = await _snippetSuggestSupport.provideCompletionItems(model, position, context, token);
        onCompletionList(_snippetSuggestSupport, list, sw);
    })();
    for (const providerGroup of registry.orderedGroups(model)) {
        let didAddResult = false;
        await Promise.all(providerGroup.map(async (provider) => {
            if (options.providerItemsToReuse.has(provider)) {
                const items = options.providerItemsToReuse.get(provider);
                items.forEach(item => result.push(item));
                didAddResult = didAddResult || items.length > 0;
                return;
            }
            if (options.providerFilter.size > 0 && !options.providerFilter.has(provider)) {
                return;
            }
            try {
                const sw = new StopWatch();
                const list = await provider.provideCompletionItems(model, position, context, token);
                didAddResult = onCompletionList(provider, list, sw) || didAddResult;
            }
            catch (err) {
                onUnexpectedExternalError(err);
            }
        }));
        if (didAddResult || token.isCancellationRequested) {
            break;
        }
    }
    await snippetCompletions;
    if (token.isCancellationRequested) {
        disposables.dispose();
        return Promise.reject(new CancellationError());
    }
    return new CompletionItemModel(result.sort(getSuggestionComparator(options.snippetSortOrder)), needsClipboard, { entries: durations, elapsed: sw.elapsed() }, disposables);
}
function defaultComparator(a, b) {
    if (a.sortTextLow && b.sortTextLow) {
        if (a.sortTextLow < b.sortTextLow) {
            return -1;
        }
        else if (a.sortTextLow > b.sortTextLow) {
            return 1;
        }
    }
    if (a.textLabel < b.textLabel) {
        return -1;
    }
    else if (a.textLabel > b.textLabel) {
        return 1;
    }
    return a.completion.kind - b.completion.kind;
}
function snippetUpComparator(a, b) {
    if (a.completion.kind !== b.completion.kind) {
        if (a.completion.kind === 27) {
            return -1;
        }
        else if (b.completion.kind === 27) {
            return 1;
        }
    }
    return defaultComparator(a, b);
}
function snippetDownComparator(a, b) {
    if (a.completion.kind !== b.completion.kind) {
        if (a.completion.kind === 27) {
            return 1;
        }
        else if (b.completion.kind === 27) {
            return -1;
        }
    }
    return defaultComparator(a, b);
}
const _snippetComparators = new Map();
_snippetComparators.set(0, snippetUpComparator);
_snippetComparators.set(2, snippetDownComparator);
_snippetComparators.set(1, defaultComparator);
export function getSuggestionComparator(snippetConfig) {
    return _snippetComparators.get(snippetConfig);
}
CommandsRegistry.registerCommand('_executeCompletionItemProvider', async (accessor, ...args) => {
    const [uri, position, triggerCharacter, maxItemsToResolve] = args;
    assertType(URI.isUri(uri));
    assertType(Position.isIPosition(position));
    assertType(typeof triggerCharacter === 'string' || !triggerCharacter);
    assertType(typeof maxItemsToResolve === 'number' || !maxItemsToResolve);
    const { completionProvider } = accessor.get(ILanguageFeaturesService);
    const ref = await accessor.get(ITextModelService).createModelReference(uri);
    try {
        const result = {
            incomplete: false,
            suggestions: []
        };
        const resolving = [];
        const actualPosition = ref.object.textEditorModel.validatePosition(position);
        const completions = await provideSuggestionItems(completionProvider, ref.object.textEditorModel, actualPosition, undefined, { triggerCharacter: triggerCharacter ?? undefined, triggerKind: triggerCharacter ? 1 : 0 });
        for (const item of completions.items) {
            if (resolving.length < (maxItemsToResolve ?? 0)) {
                resolving.push(item.resolve(CancellationToken.None));
            }
            result.incomplete = result.incomplete || item.container.incomplete;
            result.suggestions.push(item.completion);
        }
        try {
            await Promise.all(resolving);
            return result;
        }
        finally {
            setTimeout(() => completions.disposable.dispose(), 100);
        }
    }
    finally {
        ref.dispose();
    }
});
export function showSimpleSuggestions(editor, provider) {
    editor.getContribution('editor.contrib.suggestController')?.triggerSuggest(new Set().add(provider), undefined, true);
}
export class QuickSuggestionsOptions {
    static isAllOff(config) {
        return config.other === 'off' && config.comments === 'off' && config.strings === 'off';
    }
    static isAllOn(config) {
        return config.other === 'on' && config.comments === 'on' && config.strings === 'on';
    }
    static valueFor(config, tokenType) {
        switch (tokenType) {
            case 1: return config.comments;
            case 2: return config.strings;
            default: return config.other;
        }
    }
}
