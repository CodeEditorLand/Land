import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { Position } from '../../../../editor/common/core/position.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { ITextModel } from '../../../../editor/common/model.js';
import { CompletionItem, CompletionItemKind, CompletionItemProvider, CompletionList, CompletionItemInsertTextRule, CompletionContext, CompletionItemLabel, Command } from '../../../../editor/common/languages.js';
import { ILanguageService } from '../../../../editor/common/languages/language.js';
import { ISnippetsService } from './snippets.js';
import { Snippet } from './snippetsFile.js';
import { ILanguageConfigurationService } from '../../../../editor/common/languages/languageConfigurationRegistry.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
export declare class SnippetCompletion implements CompletionItem {
    readonly snippet: Snippet;
    label: CompletionItemLabel;
    detail: string;
    insertText: string;
    documentation?: MarkdownString;
    range: IRange | {
        insert: IRange;
        replace: IRange;
    };
    sortText: string;
    kind: CompletionItemKind;
    insertTextRules: CompletionItemInsertTextRule;
    extensionId?: ExtensionIdentifier;
    command?: Command;
    constructor(snippet: Snippet, range: IRange | {
        insert: IRange;
        replace: IRange;
    });
    resolve(): this;
    static compareByLabel(a: SnippetCompletion, b: SnippetCompletion): number;
}
export declare class SnippetCompletionProvider implements CompletionItemProvider {
    private readonly _languageService;
    private readonly _snippets;
    private readonly _languageConfigurationService;
    readonly _debugDisplayName = "snippetCompletions";
    constructor(_languageService: ILanguageService, _snippets: ISnippetsService, _languageConfigurationService: ILanguageConfigurationService);
    provideCompletionItems(model: ITextModel, position: Position, context: CompletionContext): Promise<CompletionList>;
    private _disambiguateSnippets;
    resolveCompletionItem(item: CompletionItem): CompletionItem;
    private _computeSnippetPositions;
    private _getLanguageIdAtPosition;
}
