/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { assert, assertFn, checkAdjacentItems } from '../../../base/common/assert.js';
import { BugIndicatingError } from '../../../base/common/errors.js';
import { Position } from './position.js';
import { PositionOffsetTransformer } from './positionToOffset.js';
import { Range } from './range.js';
import { TextLength } from './textLength.js';
export class TextEdit {
    static single(originalRange, newText) {
        return new TextEdit([new SingleTextEdit(originalRange, newText)]);
    }
    static insert(position, newText) {
        return new TextEdit([new SingleTextEdit(Range.fromPositions(position, position), newText)]);
    }
    constructor(edits) {
        this.edits = edits;
        assertFn(() => checkAdjacentItems(edits, (a, b) => a.range.getEndPosition().isBeforeOrEqual(b.range.getStartPosition())));
    }
    /**
     * Joins touching edits and removes empty edits.
     */
    normalize() {
        const edits = [];
        for (const edit of this.edits) {
            if (edits.length > 0 && edits[edits.length - 1].range.getEndPosition().equals(edit.range.getStartPosition())) {
                const last = edits[edits.length - 1];
                edits[edits.length - 1] = new SingleTextEdit(last.range.plusRange(edit.range), last.text + edit.text);
            }
            else if (!edit.isEmpty) {
                edits.push(edit);
            }
        }
        return new TextEdit(edits);
    }
    mapPosition(position) {
        let lineDelta = 0;
        let curLine = 0;
        let columnDeltaInCurLine = 0;
        for (const edit of this.edits) {
            const start = edit.range.getStartPosition();
            if (position.isBeforeOrEqual(start)) {
                break;
            }
            const end = edit.range.getEndPosition();
            const len = TextLength.ofText(edit.text);
            if (position.isBefore(end)) {
                const startPos = new Position(start.lineNumber + lineDelta, start.column + (start.lineNumber + lineDelta === curLine ? columnDeltaInCurLine : 0));
                const endPos = len.addToPosition(startPos);
                return rangeFromPositions(startPos, endPos);
            }
            if (start.lineNumber + lineDelta !== curLine) {
                columnDeltaInCurLine = 0;
            }
            lineDelta += len.lineCount - (edit.range.endLineNumber - edit.range.startLineNumber);
            if (len.lineCount === 0) {
                if (end.lineNumber !== start.lineNumber) {
                    columnDeltaInCurLine += len.columnCount - (end.column - 1);
                }
                else {
                    columnDeltaInCurLine += len.columnCount - (end.column - start.column);
                }
            }
            else {
                columnDeltaInCurLine = len.columnCount;
            }
            curLine = end.lineNumber + lineDelta;
        }
        return new Position(position.lineNumber + lineDelta, position.column + (position.lineNumber + lineDelta === curLine ? columnDeltaInCurLine : 0));
    }
    mapRange(range) {
        function getStart(p) {
            return p instanceof Position ? p : p.getStartPosition();
        }
        function getEnd(p) {
            return p instanceof Position ? p : p.getEndPosition();
        }
        const start = getStart(this.mapPosition(range.getStartPosition()));
        const end = getEnd(this.mapPosition(range.getEndPosition()));
        return rangeFromPositions(start, end);
    }
    // TODO: `doc` is not needed for this!
    inverseMapPosition(positionAfterEdit, doc) {
        const reversed = this.inverse(doc);
        return reversed.mapPosition(positionAfterEdit);
    }
    inverseMapRange(range, doc) {
        const reversed = this.inverse(doc);
        return reversed.mapRange(range);
    }
    apply(text) {
        let result = '';
        let lastEditEnd = new Position(1, 1);
        for (const edit of this.edits) {
            const editRange = edit.range;
            const editStart = editRange.getStartPosition();
            const editEnd = editRange.getEndPosition();
            const r = rangeFromPositions(lastEditEnd, editStart);
            if (!r.isEmpty()) {
                result += text.getValueOfRange(r);
            }
            result += edit.text;
            lastEditEnd = editEnd;
        }
        const r = rangeFromPositions(lastEditEnd, text.endPositionExclusive);
        if (!r.isEmpty()) {
            result += text.getValueOfRange(r);
        }
        return result;
    }
    applyToString(str) {
        const strText = new StringText(str);
        return this.apply(strText);
    }
    inverse(doc) {
        const ranges = this.getNewRanges();
        return new TextEdit(this.edits.map((e, idx) => new SingleTextEdit(ranges[idx], doc.getValueOfRange(e.range))));
    }
    getNewRanges() {
        const newRanges = [];
        let previousEditEndLineNumber = 0;
        let lineOffset = 0;
        let columnOffset = 0;
        for (const edit of this.edits) {
            const textLength = TextLength.ofText(edit.text);
            const newRangeStart = Position.lift({
                lineNumber: edit.range.startLineNumber + lineOffset,
                column: edit.range.startColumn + (edit.range.startLineNumber === previousEditEndLineNumber ? columnOffset : 0)
            });
            const newRange = textLength.createRange(newRangeStart);
            newRanges.push(newRange);
            lineOffset = newRange.endLineNumber - edit.range.endLineNumber;
            columnOffset = newRange.endColumn - edit.range.endColumn;
            previousEditEndLineNumber = edit.range.endLineNumber;
        }
        return newRanges;
    }
}
export class SingleTextEdit {
    constructor(range, text) {
        this.range = range;
        this.text = text;
    }
    get isEmpty() {
        return this.range.isEmpty() && this.text.length === 0;
    }
    static equals(first, second) {
        return first.range.equalsRange(second.range) && first.text === second.text;
    }
    toSingleEditOperation() {
        return {
            range: this.range,
            text: this.text,
        };
    }
    toEdit() {
        return new TextEdit([this]);
    }
    equals(other) {
        return SingleTextEdit.equals(this, other);
    }
}
function rangeFromPositions(start, end) {
    if (start.lineNumber === end.lineNumber && start.column === Number.MAX_SAFE_INTEGER) {
        return Range.fromPositions(end, end);
    }
    else if (!start.isBeforeOrEqual(end)) {
        throw new BugIndicatingError('start must be before end');
    }
    return new Range(start.lineNumber, start.column, end.lineNumber, end.column);
}
export class AbstractText {
    get endPositionExclusive() {
        return this.length.addToPosition(new Position(1, 1));
    }
    getValue() {
        return this.getValueOfRange(this.length.toRange());
    }
    getLineLength(lineNumber) {
        return this.getValueOfRange(new Range(lineNumber, 1, lineNumber, Number.MAX_SAFE_INTEGER)).length;
    }
}
export class LineBasedText extends AbstractText {
    constructor(_getLineContent, _lineCount) {
        assert(_lineCount >= 1);
        super();
        this._getLineContent = _getLineContent;
        this._lineCount = _lineCount;
    }
    getValueOfRange(range) {
        if (range.startLineNumber === range.endLineNumber) {
            return this._getLineContent(range.startLineNumber).substring(range.startColumn - 1, range.endColumn - 1);
        }
        let result = this._getLineContent(range.startLineNumber).substring(range.startColumn - 1);
        for (let i = range.startLineNumber + 1; i < range.endLineNumber; i++) {
            result += '\n' + this._getLineContent(i);
        }
        result += '\n' + this._getLineContent(range.endLineNumber).substring(0, range.endColumn - 1);
        return result;
    }
    getLineLength(lineNumber) {
        return this._getLineContent(lineNumber).length;
    }
    get length() {
        const lastLine = this._getLineContent(this._lineCount);
        return new TextLength(this._lineCount - 1, lastLine.length);
    }
}
export class ArrayText extends LineBasedText {
    constructor(lines) {
        super(lineNumber => lines[lineNumber - 1], lines.length);
    }
}
export class StringText extends AbstractText {
    constructor(value) {
        super();
        this.value = value;
        this._t = new PositionOffsetTransformer(this.value);
    }
    getValueOfRange(range) {
        return this._t.getOffsetRange(range).substring(this.value);
    }
    get length() {
        return this._t.textLength;
    }
}
