import { quickSelect } from '../../../../base/common/arrays.js';
import { FuzzyScore, fuzzyScore, fuzzyScoreGracefulAggressive, FuzzyScoreOptions } from '../../../../base/common/filters.js';
import { isWindows } from '../../../../base/common/platform.js';
export class LineContext {
    constructor(leadingLineContent, characterCountDelta) {
        this.leadingLineContent = leadingLineContent;
        this.characterCountDelta = characterCountDelta;
    }
}
export class SimpleCompletionModel {
    constructor(_items, _lineContext, replacementIndex, replacementLength) {
        this._items = _items;
        this._lineContext = _lineContext;
        this.replacementIndex = replacementIndex;
        this.replacementLength = replacementLength;
        this._refilterKind = 1;
        this._fuzzyScoreOptions = FuzzyScoreOptions.default;
        this._options = {};
    }
    get items() {
        this._ensureCachedState();
        return this._filteredItems;
    }
    get stats() {
        this._ensureCachedState();
        return this._stats;
    }
    get lineContext() {
        return this._lineContext;
    }
    set lineContext(value) {
        if (this._lineContext.leadingLineContent !== value.leadingLineContent
            || this._lineContext.characterCountDelta !== value.characterCountDelta) {
            this._refilterKind = this._lineContext.characterCountDelta < value.characterCountDelta && this._filteredItems ? 2 : 1;
            this._lineContext = value;
        }
    }
    _ensureCachedState() {
        if (this._refilterKind !== 0) {
            this._createCachedState();
        }
    }
    _createCachedState() {
        const labelLengths = [];
        const { leadingLineContent, characterCountDelta } = this._lineContext;
        let word = '';
        let wordLow = '';
        const source = this._refilterKind === 1 ? this._items : this._filteredItems;
        const target = [];
        const scoreFn = (!this._options.filterGraceful || source.length > 2000) ? fuzzyScore : fuzzyScoreGracefulAggressive;
        for (let i = 0; i < source.length; i++) {
            const item = source[i];
            const overwriteBefore = this.replacementLength;
            const wordLen = overwriteBefore + characterCountDelta;
            if (word.length !== wordLen) {
                word = wordLen === 0 ? '' : leadingLineContent.slice(-wordLen);
                wordLow = word.toLowerCase();
            }
            item.word = word;
            if (wordLen === 0) {
                item.score = FuzzyScore.Default;
            }
            else {
                let wordPos = 0;
                while (wordPos < overwriteBefore) {
                    const ch = word.charCodeAt(wordPos);
                    if (ch === 32 || ch === 9) {
                        wordPos += 1;
                    }
                    else {
                        break;
                    }
                }
                if (wordPos >= wordLen) {
                    item.score = FuzzyScore.Default;
                }
                else {
                    const match = scoreFn(word, wordLow, wordPos, item.completion.label, item.labelLow, 0, this._fuzzyScoreOptions);
                    if (!match) {
                        continue;
                    }
                    item.score = match;
                }
            }
            item.idx = i;
            target.push(item);
            labelLengths.push(item.completion.label.length);
        }
        this._filteredItems = target.sort((a, b) => {
            let score = 0;
            if (a.completion.isKeyword && a.labelLow !== wordLow || b.completion.isKeyword && b.labelLow !== wordLow) {
                score = (a.completion.isKeyword ? 1 : 0) - (b.completion.isKeyword ? 1 : 0);
                if (score !== 0) {
                    return score;
                }
            }
            score = b.score[0] - a.score[0];
            if (score !== 0) {
                return score;
            }
            const isArg = leadingLineContent.includes(' ');
            if (!isArg && a.fileExtLow.length > 0 && b.fileExtLow.length > 0) {
                score = a.labelLowExcludeFileExt.length - b.labelLowExcludeFileExt.length;
                if (score !== 0) {
                    return score;
                }
                score = fileExtScore(b.fileExtLow) - fileExtScore(a.fileExtLow);
                if (score !== 0) {
                    return score;
                }
                score = a.fileExtLow.length - b.fileExtLow.length;
            }
            return score;
        });
        this._refilterKind = 0;
        this._stats = {
            pLabelLen: labelLengths.length ?
                quickSelect(labelLengths.length - .85, labelLengths, (a, b) => a - b)
                : 0
        };
    }
}
const fileExtScores = new Map(isWindows ? [
    ['ps1', 0.09],
    ['exe', 0.08],
    ['bat', 0.07],
    ['cmd', 0.07],
    ['sh', -0.05],
    ['bash', -0.05],
    ['zsh', -0.05],
    ['fish', -0.05],
    ['csh', -0.06],
    ['ksh', -0.06],
] : [
    ['ps1', 0.05],
    ['bat', -0.05],
    ['cmd', -0.05],
    ['exe', -0.05],
    ['sh', 0.05],
    ['bash', 0.05],
    ['zsh', 0.05],
    ['fish', 0.05],
    ['csh', 0.04],
    ['ksh', 0.04],
    ['py', 0.05],
    ['pl', 0.05],
]);
function fileExtScore(ext) {
    return fileExtScores.get(ext) || 0;
}
