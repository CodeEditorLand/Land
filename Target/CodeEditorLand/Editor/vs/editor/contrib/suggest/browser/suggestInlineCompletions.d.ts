import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Disposable, RefCountedDisposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditorService } from '../../../browser/services/codeEditorService.js';
import { ISingleEditOperation } from '../../../common/core/editOperation.js';
import { Position } from '../../../common/core/position.js';
import { IRange } from '../../../common/core/range.js';
import { IWordAtPosition } from '../../../common/core/wordHelper.js';
import { Command, InlineCompletion, InlineCompletionContext, InlineCompletions, InlineCompletionsProvider } from '../../../common/languages.js';
import { ITextModel } from '../../../common/model.js';
import { ILanguageFeaturesService } from '../../../common/services/languageFeatures.js';
import { CompletionModel } from './completionModel.js';
import { CompletionItem, CompletionItemModel } from './suggest.js';
import { ISuggestMemoryService } from './suggestMemory.js';
import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
declare class SuggestInlineCompletion implements InlineCompletion {
    readonly range: IRange;
    readonly insertText: string | {
        snippet: string;
    };
    readonly filterText: string;
    readonly additionalTextEdits: ISingleEditOperation[] | undefined;
    readonly command: Command | undefined;
    readonly completion: CompletionItem;
    constructor(range: IRange, insertText: string | {
        snippet: string;
    }, filterText: string, additionalTextEdits: ISingleEditOperation[] | undefined, command: Command | undefined, completion: CompletionItem);
}
declare class InlineCompletionResults extends RefCountedDisposable implements InlineCompletions<SuggestInlineCompletion> {
    readonly model: ITextModel;
    readonly line: number;
    readonly word: IWordAtPosition;
    readonly completionModel: CompletionModel;
    private readonly _suggestMemoryService;
    constructor(model: ITextModel, line: number, word: IWordAtPosition, completionModel: CompletionModel, completions: CompletionItemModel, _suggestMemoryService: ISuggestMemoryService);
    canBeReused(model: ITextModel, line: number, word: IWordAtPosition): boolean;
    get items(): SuggestInlineCompletion[];
}
export declare class SuggestInlineCompletions extends Disposable implements InlineCompletionsProvider<InlineCompletionResults> {
    private readonly _languageFeatureService;
    private readonly _clipboardService;
    private readonly _suggestMemoryService;
    private readonly _editorService;
    private _lastResult?;
    constructor(_languageFeatureService: ILanguageFeaturesService, _clipboardService: IClipboardService, _suggestMemoryService: ISuggestMemoryService, _editorService: ICodeEditorService);
    provideInlineCompletions(model: ITextModel, position: Position, context: InlineCompletionContext, token: CancellationToken): Promise<InlineCompletionResults | undefined>;
    handleItemDidShow(_completions: InlineCompletionResults, item: SuggestInlineCompletion): void;
    freeInlineCompletions(result: InlineCompletionResults): void;
    private _getTriggerCharacterInfo;
}
export {};
