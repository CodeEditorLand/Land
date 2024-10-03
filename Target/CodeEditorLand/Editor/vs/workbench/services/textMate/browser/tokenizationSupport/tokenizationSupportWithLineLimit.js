import { nullTokenizeEncoded } from '../../../../../editor/common/languages/nullTokenize.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { keepObserved } from '../../../../../base/common/observable.js';
export class TokenizationSupportWithLineLimit extends Disposable {
    get backgroundTokenizerShouldOnlyVerifyTokens() {
        return this._actual.backgroundTokenizerShouldOnlyVerifyTokens;
    }
    constructor(_encodedLanguageId, _actual, disposable, _maxTokenizationLineLength) {
        super();
        this._encodedLanguageId = _encodedLanguageId;
        this._actual = _actual;
        this._maxTokenizationLineLength = _maxTokenizationLineLength;
        this._register(keepObserved(this._maxTokenizationLineLength));
        this._register(disposable);
    }
    getInitialState() {
        return this._actual.getInitialState();
    }
    tokenize(line, hasEOL, state) {
        throw new Error('Not supported!');
    }
    tokenizeEncoded(line, hasEOL, state) {
        if (line.length >= this._maxTokenizationLineLength.get()) {
            return nullTokenizeEncoded(this._encodedLanguageId, state);
        }
        return this._actual.tokenizeEncoded(line, hasEOL, state);
    }
    createBackgroundTokenizer(textModel, store) {
        if (this._actual.createBackgroundTokenizer) {
            return this._actual.createBackgroundTokenizer(textModel, store);
        }
        else {
            return undefined;
        }
    }
}
