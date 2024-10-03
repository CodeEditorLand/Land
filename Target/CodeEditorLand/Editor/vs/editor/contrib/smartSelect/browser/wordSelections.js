import { isLowerAsciiLetter, isUpperAsciiLetter } from '../../../../base/common/strings.js';
import { Range } from '../../../common/core/range.js';
export class WordSelectionRangeProvider {
    constructor(selectSubwords = true) {
        this.selectSubwords = selectSubwords;
    }
    provideSelectionRanges(model, positions) {
        const result = [];
        for (const position of positions) {
            const bucket = [];
            result.push(bucket);
            if (this.selectSubwords) {
                this._addInWordRanges(bucket, model, position);
            }
            this._addWordRanges(bucket, model, position);
            this._addWhitespaceLine(bucket, model, position);
            bucket.push({ range: model.getFullModelRange() });
        }
        return result;
    }
    _addInWordRanges(bucket, model, pos) {
        const obj = model.getWordAtPosition(pos);
        if (!obj) {
            return;
        }
        const { word, startColumn } = obj;
        const offset = pos.column - startColumn;
        let start = offset;
        let end = offset;
        let lastCh = 0;
        for (; start >= 0; start--) {
            const ch = word.charCodeAt(start);
            if ((start !== offset) && (ch === 95 || ch === 45)) {
                break;
            }
            else if (isLowerAsciiLetter(ch) && isUpperAsciiLetter(lastCh)) {
                break;
            }
            lastCh = ch;
        }
        start += 1;
        for (; end < word.length; end++) {
            const ch = word.charCodeAt(end);
            if (isUpperAsciiLetter(ch) && isLowerAsciiLetter(lastCh)) {
                break;
            }
            else if (ch === 95 || ch === 45) {
                break;
            }
            lastCh = ch;
        }
        if (start < end) {
            bucket.push({ range: new Range(pos.lineNumber, startColumn + start, pos.lineNumber, startColumn + end) });
        }
    }
    _addWordRanges(bucket, model, pos) {
        const word = model.getWordAtPosition(pos);
        if (word) {
            bucket.push({ range: new Range(pos.lineNumber, word.startColumn, pos.lineNumber, word.endColumn) });
        }
    }
    _addWhitespaceLine(bucket, model, pos) {
        if (model.getLineLength(pos.lineNumber) > 0
            && model.getLineFirstNonWhitespaceColumn(pos.lineNumber) === 0
            && model.getLineLastNonWhitespaceColumn(pos.lineNumber) === 0) {
            bucket.push({ range: new Range(pos.lineNumber, 1, pos.lineNumber, model.getLineMaxColumn(pos.lineNumber)) });
        }
    }
}
