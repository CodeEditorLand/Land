import * as strings from '../../../base/common/strings.js';
export class CursorColumns {
    static _nextVisibleColumn(codePoint, visibleColumn, tabSize) {
        if (codePoint === 9) {
            return CursorColumns.nextRenderTabStop(visibleColumn, tabSize);
        }
        if (strings.isFullWidthCharacter(codePoint) || strings.isEmojiImprecise(codePoint)) {
            return visibleColumn + 2;
        }
        return visibleColumn + 1;
    }
    static visibleColumnFromColumn(lineContent, column, tabSize) {
        const textLen = Math.min(column - 1, lineContent.length);
        const text = lineContent.substring(0, textLen);
        const iterator = new strings.GraphemeIterator(text);
        let result = 0;
        while (!iterator.eol()) {
            const codePoint = strings.getNextCodePoint(text, textLen, iterator.offset);
            iterator.nextGraphemeLength();
            result = this._nextVisibleColumn(codePoint, result, tabSize);
        }
        return result;
    }
    static toStatusbarColumn(lineContent, column, tabSize) {
        const text = lineContent.substring(0, Math.min(column - 1, lineContent.length));
        const iterator = new strings.CodePointIterator(text);
        let result = 0;
        while (!iterator.eol()) {
            const codePoint = iterator.nextCodePoint();
            if (codePoint === 9) {
                result = CursorColumns.nextRenderTabStop(result, tabSize);
            }
            else {
                result = result + 1;
            }
        }
        return result + 1;
    }
    static columnFromVisibleColumn(lineContent, visibleColumn, tabSize) {
        if (visibleColumn <= 0) {
            return 1;
        }
        const lineContentLength = lineContent.length;
        const iterator = new strings.GraphemeIterator(lineContent);
        let beforeVisibleColumn = 0;
        let beforeColumn = 1;
        while (!iterator.eol()) {
            const codePoint = strings.getNextCodePoint(lineContent, lineContentLength, iterator.offset);
            iterator.nextGraphemeLength();
            const afterVisibleColumn = this._nextVisibleColumn(codePoint, beforeVisibleColumn, tabSize);
            const afterColumn = iterator.offset + 1;
            if (afterVisibleColumn >= visibleColumn) {
                const beforeDelta = visibleColumn - beforeVisibleColumn;
                const afterDelta = afterVisibleColumn - visibleColumn;
                if (afterDelta < beforeDelta) {
                    return afterColumn;
                }
                else {
                    return beforeColumn;
                }
            }
            beforeVisibleColumn = afterVisibleColumn;
            beforeColumn = afterColumn;
        }
        return lineContentLength + 1;
    }
    static nextRenderTabStop(visibleColumn, tabSize) {
        return visibleColumn + tabSize - visibleColumn % tabSize;
    }
    static nextIndentTabStop(visibleColumn, indentSize) {
        return CursorColumns.nextRenderTabStop(visibleColumn, indentSize);
    }
    static prevRenderTabStop(column, tabSize) {
        return Math.max(0, column - 1 - (column - 1) % tabSize);
    }
    static prevIndentTabStop(column, indentSize) {
        return CursorColumns.prevRenderTabStop(column, indentSize);
    }
}
