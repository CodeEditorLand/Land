import { Disposable, IDisposable } from '../../../../../base/common/lifecycle.js';
import { IObservable, IReader, ITransaction } from '../../../../../base/common/observable.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { ILogService } from '../../../../../platform/log/common/log.js';
import { Position } from '../../../../common/core/position.js';
import { Range } from '../../../../common/core/range.js';
import { SingleTextEdit } from '../../../../common/core/textEdit.js';
import { InlineCompletionContext } from '../../../../common/languages.js';
import { ILanguageConfigurationService } from '../../../../common/languages/languageConfigurationRegistry.js';
import { ITextModel } from '../../../../common/model.js';
import { IFeatureDebounceInformation } from '../../../../common/services/languageFeatureDebounce.js';
import { ILanguageFeaturesService } from '../../../../common/services/languageFeatures.js';
import { InlineCompletionItem, InlineCompletionProviderResult } from './provideInlineCompletions.js';
export declare class InlineCompletionsSource extends Disposable {
    private readonly _textModel;
    private readonly _versionId;
    private readonly _debounceValue;
    private readonly _languageFeaturesService;
    private readonly _languageConfigurationService;
    private readonly _logService;
    private readonly _configurationService;
    private static _requestId;
    private readonly _updateOperation;
    readonly inlineCompletions: import("../../../../../base/common/observable.js").ISettableObservable<UpToDateInlineCompletions | undefined, void> & IDisposable;
    readonly suggestWidgetInlineCompletions: import("../../../../../base/common/observable.js").ISettableObservable<UpToDateInlineCompletions | undefined, void> & IDisposable;
    private readonly _loggingEnabled;
    constructor(_textModel: ITextModel, _versionId: IObservable<number | null>, _debounceValue: IFeatureDebounceInformation, _languageFeaturesService: ILanguageFeaturesService, _languageConfigurationService: ILanguageConfigurationService, _logService: ILogService, _configurationService: IConfigurationService);
    private _log;
    fetch(position: Position, context: InlineCompletionContext, activeInlineCompletion: InlineCompletionWithUpdatedRange | undefined): Promise<boolean>;
    clear(tx: ITransaction): void;
    clearSuggestWidgetInlineCompletions(tx: ITransaction): void;
    cancelUpdate(): void;
}
declare class UpdateRequest {
    readonly position: Position;
    readonly context: InlineCompletionContext;
    readonly versionId: number;
    constructor(position: Position, context: InlineCompletionContext, versionId: number);
    satisfies(other: UpdateRequest): boolean;
}
export declare class UpToDateInlineCompletions implements IDisposable {
    private readonly inlineCompletionProviderResult;
    readonly request: UpdateRequest;
    private readonly _textModel;
    private readonly _versionId;
    private readonly _inlineCompletions;
    get inlineCompletions(): ReadonlyArray<InlineCompletionWithUpdatedRange>;
    private _refCount;
    private readonly _prependedInlineCompletionItems;
    constructor(inlineCompletionProviderResult: InlineCompletionProviderResult, request: UpdateRequest, _textModel: ITextModel, _versionId: IObservable<number | null>);
    clone(): this;
    dispose(): void;
    prepend(inlineCompletion: InlineCompletionItem, range: Range, addRefToSource: boolean): void;
}
export declare class InlineCompletionWithUpdatedRange {
    readonly inlineCompletion: InlineCompletionItem;
    readonly decorationId: string;
    private readonly _textModel;
    private readonly _modelVersion;
    readonly semanticId: string;
    get forwardStable(): boolean;
    private readonly _updatedRange;
    constructor(inlineCompletion: InlineCompletionItem, decorationId: string, _textModel: ITextModel, _modelVersion: IObservable<number | null>);
    toInlineCompletion(reader: IReader | undefined): InlineCompletionItem;
    toSingleTextEdit(reader: IReader | undefined): SingleTextEdit;
    isVisible(model: ITextModel, cursorPosition: Position, reader: IReader | undefined): boolean;
    canBeReused(model: ITextModel, position: Position): boolean;
    private _toFilterTextReplacement;
}
export {};
