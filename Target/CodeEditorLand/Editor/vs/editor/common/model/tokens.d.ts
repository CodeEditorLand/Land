import { Emitter, Event } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { LineRange } from '../core/lineRange.js';
import { StandardTokenType } from '../encodedTokenAttributes.js';
import { ILanguageIdCodec } from '../languages.js';
import { IAttachedView } from '../model.js';
import { TextModel } from './textModel.js';
import { IModelContentChangedEvent, IModelTokensChangedEvent } from '../textModelEvents.js';
import { BackgroundTokenizationState, ITokenizeLineWithEditResult, LineEditWithAdditionalLines } from '../tokenizationTextModelPart.js';
import { LineTokens } from '../tokens/lineTokens.js';
export declare class AttachedViews {
    private readonly _onDidChangeVisibleRanges;
    readonly onDidChangeVisibleRanges: Event<{
        view: IAttachedView;
        state: IAttachedViewState | undefined;
    }>;
    private readonly _views;
    attachView(): IAttachedView;
    detachView(view: IAttachedView): void;
}
export interface IAttachedViewState {
    readonly visibleLineRanges: readonly LineRange[];
    readonly stabilized: boolean;
}
export declare class AttachedViewHandler extends Disposable {
    private readonly _refreshTokens;
    private readonly runner;
    private _computedLineRanges;
    private _lineRanges;
    get lineRanges(): readonly LineRange[];
    constructor(_refreshTokens: () => void);
    private update;
    handleStateChange(state: IAttachedViewState): void;
}
export declare abstract class AbstractTokens extends Disposable {
    protected readonly _languageIdCodec: ILanguageIdCodec;
    protected readonly _textModel: TextModel;
    protected getLanguageId: () => string;
    protected _backgroundTokenizationState: BackgroundTokenizationState;
    get backgroundTokenizationState(): BackgroundTokenizationState;
    protected readonly _onDidChangeBackgroundTokenizationState: Emitter<void>;
    readonly onDidChangeBackgroundTokenizationState: Event<void>;
    protected readonly _onDidChangeTokens: Emitter<IModelTokensChangedEvent>;
    readonly onDidChangeTokens: Event<IModelTokensChangedEvent>;
    constructor(_languageIdCodec: ILanguageIdCodec, _textModel: TextModel, getLanguageId: () => string);
    abstract resetTokenization(fireTokenChangeEvent?: boolean): void;
    abstract handleDidChangeAttached(): void;
    abstract handleDidChangeContent(e: IModelContentChangedEvent): void;
    abstract forceTokenization(lineNumber: number): void;
    abstract hasAccurateTokensForLine(lineNumber: number): boolean;
    abstract isCheapToTokenize(lineNumber: number): boolean;
    tokenizeIfCheap(lineNumber: number): void;
    abstract getLineTokens(lineNumber: number): LineTokens;
    abstract getTokenTypeIfInsertingCharacter(lineNumber: number, column: number, character: string): StandardTokenType;
    abstract tokenizeLineWithEdit(lineNumber: number, edit: LineEditWithAdditionalLines): ITokenizeLineWithEditResult;
    abstract get hasTokens(): boolean;
}
