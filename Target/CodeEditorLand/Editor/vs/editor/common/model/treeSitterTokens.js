import { TreeSitterTokenizationRegistry } from '../languages.js';
import { LineTokens } from '../tokens/lineTokens.js';
import { AbstractTokens } from './tokens.js';
import { MutableDisposable } from '../../../base/common/lifecycle.js';
export class TreeSitterTokens extends AbstractTokens {
    constructor(_treeSitterService, languageIdCodec, textModel, languageId) {
        super(languageIdCodec, textModel, languageId);
        this._treeSitterService = _treeSitterService;
        this._tokenizationSupport = null;
        this._tokensChangedListener = this._register(new MutableDisposable());
        this._initialize();
    }
    _initialize() {
        const newLanguage = this.getLanguageId();
        if (!this._tokenizationSupport || this._lastLanguageId !== newLanguage) {
            this._lastLanguageId = newLanguage;
            this._tokenizationSupport = TreeSitterTokenizationRegistry.get(newLanguage);
            this._tokensChangedListener.value = this._tokenizationSupport?.onDidChangeTokens((e) => {
                if (e.textModel === this._textModel) {
                    this._onDidChangeTokens.fire(e.changes);
                }
            });
        }
    }
    getLineTokens(lineNumber) {
        const content = this._textModel.getLineContent(lineNumber);
        if (this._tokenizationSupport) {
            const rawTokens = this._tokenizationSupport.tokenizeEncoded(lineNumber, this._textModel);
            if (rawTokens) {
                return new LineTokens(rawTokens, content, this._languageIdCodec);
            }
        }
        return LineTokens.createEmpty(content, this._languageIdCodec);
    }
    resetTokenization(fireTokenChangeEvent = true) {
        if (fireTokenChangeEvent) {
            this._onDidChangeTokens.fire({
                semanticTokensApplied: false,
                ranges: [
                    {
                        fromLineNumber: 1,
                        toLineNumber: this._textModel.getLineCount(),
                    },
                ],
            });
        }
        this._initialize();
    }
    handleDidChangeAttached() {
    }
    handleDidChangeContent(e) {
        if (e.isFlush) {
            this.resetTokenization(false);
        }
    }
    forceTokenization(lineNumber) {
    }
    hasAccurateTokensForLine(lineNumber) {
        return true;
    }
    isCheapToTokenize(lineNumber) {
        return true;
    }
    getTokenTypeIfInsertingCharacter(lineNumber, column, character) {
        return 0;
    }
    tokenizeLineWithEdit(lineNumber, edit) {
        return { mainLineTokens: null, additionalLines: null };
    }
    get hasTokens() {
        const hasTree = this._treeSitterService.getParseResult(this._textModel) !== undefined;
        return hasTree;
    }
}
