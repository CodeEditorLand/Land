import { CancellationToken } from '../../../../../base/common/cancellation.js';
import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { ISingleEditOperation } from '../../../../common/core/editOperation.js';
import { Position } from '../../../../common/core/position.js';
import { Range } from '../../../../common/core/range.js';
import { LanguageFeatureRegistry } from '../../../../common/languageFeatureRegistry.js';
import { Command, InlineCompletion, InlineCompletionContext, InlineCompletions, InlineCompletionsProvider } from '../../../../common/languages.js';
import { ILanguageConfigurationService } from '../../../../common/languages/languageConfigurationRegistry.js';
import { ITextModel } from '../../../../common/model.js';
import { SingleTextEdit } from '../../../../common/core/textEdit.js';
export declare function provideInlineCompletions(registry: LanguageFeatureRegistry<InlineCompletionsProvider>, positionOrRange: Position | Range, model: ITextModel, context: InlineCompletionContext, token?: CancellationToken, languageConfigurationService?: ILanguageConfigurationService): Promise<InlineCompletionProviderResult>;
export declare class InlineCompletionProviderResult implements IDisposable {
    readonly completions: readonly InlineCompletionItem[];
    private readonly hashs;
    private readonly providerResults;
    constructor(completions: readonly InlineCompletionItem[], hashs: Set<string>, providerResults: readonly InlineCompletionList[]);
    has(item: InlineCompletionItem): boolean;
    dispose(): void;
}
export declare class InlineCompletionList {
    readonly inlineCompletions: InlineCompletions;
    readonly provider: InlineCompletionsProvider;
    private refCount;
    constructor(inlineCompletions: InlineCompletions, provider: InlineCompletionsProvider);
    addRef(): void;
    removeRef(): void;
}
export declare class InlineCompletionItem {
    readonly filterText: string;
    readonly command: Command | undefined;
    readonly range: Range;
    readonly insertText: string;
    readonly snippetInfo: SnippetInfo | undefined;
    readonly additionalTextEdits: readonly ISingleEditOperation[];
    readonly sourceInlineCompletion: InlineCompletion;
    readonly source: InlineCompletionList;
    static from(inlineCompletion: InlineCompletion, source: InlineCompletionList, defaultReplaceRange: Range, textModel: ITextModel, languageConfigurationService: ILanguageConfigurationService | undefined): InlineCompletionItem;
    constructor(filterText: string, command: Command | undefined, range: Range, insertText: string, snippetInfo: SnippetInfo | undefined, additionalTextEdits: readonly ISingleEditOperation[], sourceInlineCompletion: InlineCompletion, source: InlineCompletionList);
    withRange(updatedRange: Range): InlineCompletionItem;
    hash(): string;
    toSingleTextEdit(): SingleTextEdit;
}
export interface SnippetInfo {
    snippet: string;
    range: Range;
}
