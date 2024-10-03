import { Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { LanguageId } from '../../../../../editor/common/encodedTokenAttributes.js';
import { EncodedTokenizationResult, IBackgroundTokenizationStore, IBackgroundTokenizer, IState, ITokenizationSupport, TokenizationResult } from '../../../../../editor/common/languages.js';
import { ITextModel } from '../../../../../editor/common/model.js';
import type { IGrammar, StateStack } from 'vscode-textmate';
export declare class TextMateTokenizationSupport extends Disposable implements ITokenizationSupport {
    private readonly _grammar;
    private readonly _initialState;
    private readonly _containsEmbeddedLanguages;
    private readonly _createBackgroundTokenizer;
    private readonly _backgroundTokenizerShouldOnlyVerifyTokens;
    private readonly _reportTokenizationTime;
    private readonly _reportSlowTokenization;
    private readonly _seenLanguages;
    private readonly _onDidEncounterLanguage;
    readonly onDidEncounterLanguage: Event<LanguageId>;
    constructor(_grammar: IGrammar, _initialState: StateStack, _containsEmbeddedLanguages: boolean, _createBackgroundTokenizer: ((textModel: ITextModel, tokenStore: IBackgroundTokenizationStore) => IBackgroundTokenizer | undefined) | undefined, _backgroundTokenizerShouldOnlyVerifyTokens: () => boolean, _reportTokenizationTime: (timeMs: number, lineLength: number, isRandomSample: boolean) => void, _reportSlowTokenization: boolean);
    get backgroundTokenizerShouldOnlyVerifyTokens(): boolean | undefined;
    getInitialState(): IState;
    tokenize(line: string, hasEOL: boolean, state: IState): TokenizationResult;
    createBackgroundTokenizer(textModel: ITextModel, store: IBackgroundTokenizationStore): IBackgroundTokenizer | undefined;
    tokenizeEncoded(line: string, hasEOL: boolean, state: StateStack): EncodedTokenizationResult;
}
