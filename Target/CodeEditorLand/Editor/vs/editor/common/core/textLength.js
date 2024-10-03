import { Position } from './position.js';
import { Range } from './range.js';
export class TextLength {
    static { this.zero = new TextLength(0, 0); }
    static lengthDiffNonNegative(start, end) {
        if (end.isLessThan(start)) {
            return TextLength.zero;
        }
        if (start.lineCount === end.lineCount) {
            return new TextLength(0, end.columnCount - start.columnCount);
        }
        else {
            return new TextLength(end.lineCount - start.lineCount, end.columnCount);
        }
    }
    static betweenPositions(position1, position2) {
        if (position1.lineNumber === position2.lineNumber) {
            return new TextLength(0, position2.column - position1.column);
        }
        else {
            return new TextLength(position2.lineNumber - position1.lineNumber, position2.column - 1);
        }
    }
    static fromPosition(pos) {
        return new TextLength(pos.lineNumber - 1, pos.column - 1);
    }
    static ofRange(range) {
        return TextLength.betweenPositions(range.getStartPosition(), range.getEndPosition());
    }
    static ofText(text) {
        let line = 0;
        let column = 0;
        for (const c of text) {
            if (c === '\n') {
                line++;
                column = 0;
            }
            else {
                column++;
            }
        }
        return new TextLength(line, column);
    }
    constructor(lineCount, columnCount) {
        this.lineCount = lineCount;
        this.columnCount = columnCount;
    }
    isZero() {
        return this.lineCount === 0 && this.columnCount === 0;
    }
    isLessThan(other) {
        if (this.lineCount !== other.lineCount) {
            return this.lineCount < other.lineCount;
        }
        return this.columnCount < other.columnCount;
    }
    isGreaterThan(other) {
        if (this.lineCount !== other.lineCount) {
            return this.lineCount > other.lineCount;
        }
        return this.columnCount > other.columnCount;
    }
    isGreaterThanOrEqualTo(other) {
        if (this.lineCount !== other.lineCount) {
            return this.lineCount > other.lineCount;
        }
        return this.columnCount >= other.columnCount;
    }
    equals(other) {
        return this.lineCount === other.lineCount && this.columnCount === other.columnCount;
    }
    compare(other) {
        if (this.lineCount !== other.lineCount) {
            return this.lineCount - other.lineCount;
        }
        return this.columnCount - other.columnCount;
    }
    add(other) {
        if (other.lineCount === 0) {
            return new TextLength(this.lineCount, this.columnCount + other.columnCount);
        }
        else {
            return new TextLength(this.lineCount + other.lineCount, other.columnCount);
        }
    }
    createRange(startPosition) {
        if (this.lineCount === 0) {
            return new Range(startPosition.lineNumber, startPosition.column, startPosition.lineNumber, startPosition.column + this.columnCount);
        }
        else {
            return new Range(startPosition.lineNumber, startPosition.column, startPosition.lineNumber + this.lineCount, this.columnCount + 1);
        }
    }
    toRange() {
        return new Range(1, 1, this.lineCount + 1, this.columnCount + 1);
    }
    addToPosition(position) {
        if (this.lineCount === 0) {
            return new Position(position.lineNumber, position.column + this.columnCount);
        }
        else {
            return new Position(position.lineNumber + this.lineCount, this.columnCount + 1);
        }
    }
    addToRange(range) {
        return Range.fromPositions(this.addToPosition(range.getStartPosition()), this.addToPosition(range.getEndPosition()));
    }
    toString() {
        return `${this.lineCount},${this.columnCount}`;
    }
}
