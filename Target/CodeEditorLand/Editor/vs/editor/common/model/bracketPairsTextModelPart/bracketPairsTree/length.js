import { splitLines } from '../../../../../base/common/strings.js';
import { Position } from '../../../core/position.js';
import { Range } from '../../../core/range.js';
import { TextLength } from '../../../core/textLength.js';
export function lengthDiff(startLineCount, startColumnCount, endLineCount, endColumnCount) {
    return (startLineCount !== endLineCount)
        ? toLength(endLineCount - startLineCount, endColumnCount)
        : toLength(0, endColumnCount - startColumnCount);
}
export const lengthZero = 0;
export function lengthIsZero(length) {
    return length === 0;
}
const factor = 2 ** 26;
export function toLength(lineCount, columnCount) {
    return (lineCount * factor + columnCount);
}
export function lengthToObj(length) {
    const l = length;
    const lineCount = Math.floor(l / factor);
    const columnCount = l - lineCount * factor;
    return new TextLength(lineCount, columnCount);
}
export function lengthGetLineCount(length) {
    return Math.floor(length / factor);
}
export function lengthGetColumnCountIfZeroLineCount(length) {
    return length;
}
export function lengthAdd(l1, l2) {
    let r = l1 + l2;
    if (l2 >= factor) {
        r = r - (l1 % factor);
    }
    return r;
}
export function sumLengths(items, lengthFn) {
    return items.reduce((a, b) => lengthAdd(a, lengthFn(b)), lengthZero);
}
export function lengthEquals(length1, length2) {
    return length1 === length2;
}
export function lengthDiffNonNegative(length1, length2) {
    const l1 = length1;
    const l2 = length2;
    const diff = l2 - l1;
    if (diff <= 0) {
        return lengthZero;
    }
    const lineCount1 = Math.floor(l1 / factor);
    const lineCount2 = Math.floor(l2 / factor);
    const colCount2 = l2 - lineCount2 * factor;
    if (lineCount1 === lineCount2) {
        const colCount1 = l1 - lineCount1 * factor;
        return toLength(0, colCount2 - colCount1);
    }
    else {
        return toLength(lineCount2 - lineCount1, colCount2);
    }
}
export function lengthLessThan(length1, length2) {
    return length1 < length2;
}
export function lengthLessThanEqual(length1, length2) {
    return length1 <= length2;
}
export function lengthGreaterThanEqual(length1, length2) {
    return length1 >= length2;
}
export function lengthToPosition(length) {
    const l = length;
    const lineCount = Math.floor(l / factor);
    const colCount = l - lineCount * factor;
    return new Position(lineCount + 1, colCount + 1);
}
export function positionToLength(position) {
    return toLength(position.lineNumber - 1, position.column - 1);
}
export function lengthsToRange(lengthStart, lengthEnd) {
    const l = lengthStart;
    const lineCount = Math.floor(l / factor);
    const colCount = l - lineCount * factor;
    const l2 = lengthEnd;
    const lineCount2 = Math.floor(l2 / factor);
    const colCount2 = l2 - lineCount2 * factor;
    return new Range(lineCount + 1, colCount + 1, lineCount2 + 1, colCount2 + 1);
}
export function lengthOfRange(range) {
    if (range.startLineNumber === range.endLineNumber) {
        return new TextLength(0, range.endColumn - range.startColumn);
    }
    else {
        return new TextLength(range.endLineNumber - range.startLineNumber, range.endColumn - 1);
    }
}
export function lengthCompare(length1, length2) {
    const l1 = length1;
    const l2 = length2;
    return l1 - l2;
}
export function lengthOfString(str) {
    const lines = splitLines(str);
    return toLength(lines.length - 1, lines[lines.length - 1].length);
}
export function lengthOfStringObj(str) {
    const lines = splitLines(str);
    return new TextLength(lines.length - 1, lines[lines.length - 1].length);
}
export function lengthHash(length) {
    return length;
}
export function lengthMax(length1, length2) {
    return length1 > length2 ? length1 : length2;
}
