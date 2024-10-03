import * as arrays from '../../../base/common/arrays.js';
import { readUInt32BE, writeUInt32BE } from '../../../base/common/buffer.js';
import { Position } from '../core/position.js';
import { countEOL } from '../core/eolCounter.js';
import { ContiguousTokensEditing } from './contiguousTokensEditing.js';
import { LineRange } from '../core/lineRange.js';
export class ContiguousMultilineTokens {
    static deserialize(buff, offset, result) {
        const view32 = new Uint32Array(buff.buffer);
        const startLineNumber = readUInt32BE(buff, offset);
        offset += 4;
        const count = readUInt32BE(buff, offset);
        offset += 4;
        const tokens = [];
        for (let i = 0; i < count; i++) {
            const byteCount = readUInt32BE(buff, offset);
            offset += 4;
            tokens.push(view32.subarray(offset / 4, offset / 4 + byteCount / 4));
            offset += byteCount;
        }
        result.push(new ContiguousMultilineTokens(startLineNumber, tokens));
        return offset;
    }
    get startLineNumber() {
        return this._startLineNumber;
    }
    get endLineNumber() {
        return this._startLineNumber + this._tokens.length - 1;
    }
    constructor(startLineNumber, tokens) {
        this._startLineNumber = startLineNumber;
        this._tokens = tokens;
    }
    getLineRange() {
        return new LineRange(this._startLineNumber, this._startLineNumber + this._tokens.length);
    }
    getLineTokens(lineNumber) {
        return this._tokens[lineNumber - this._startLineNumber];
    }
    appendLineTokens(lineTokens) {
        this._tokens.push(lineTokens);
    }
    serializeSize() {
        let result = 0;
        result += 4;
        result += 4;
        for (let i = 0; i < this._tokens.length; i++) {
            const lineTokens = this._tokens[i];
            if (!(lineTokens instanceof Uint32Array)) {
                throw new Error(`Not supported!`);
            }
            result += 4;
            result += lineTokens.byteLength;
        }
        return result;
    }
    serialize(destination, offset) {
        writeUInt32BE(destination, this._startLineNumber, offset);
        offset += 4;
        writeUInt32BE(destination, this._tokens.length, offset);
        offset += 4;
        for (let i = 0; i < this._tokens.length; i++) {
            const lineTokens = this._tokens[i];
            if (!(lineTokens instanceof Uint32Array)) {
                throw new Error(`Not supported!`);
            }
            writeUInt32BE(destination, lineTokens.byteLength, offset);
            offset += 4;
            destination.set(new Uint8Array(lineTokens.buffer), offset);
            offset += lineTokens.byteLength;
        }
        return offset;
    }
    applyEdit(range, text) {
        const [eolCount, firstLineLength] = countEOL(text);
        this._acceptDeleteRange(range);
        this._acceptInsertText(new Position(range.startLineNumber, range.startColumn), eolCount, firstLineLength);
    }
    _acceptDeleteRange(range) {
        if (range.startLineNumber === range.endLineNumber && range.startColumn === range.endColumn) {
            return;
        }
        const firstLineIndex = range.startLineNumber - this._startLineNumber;
        const lastLineIndex = range.endLineNumber - this._startLineNumber;
        if (lastLineIndex < 0) {
            const deletedLinesCount = lastLineIndex - firstLineIndex;
            this._startLineNumber -= deletedLinesCount;
            return;
        }
        if (firstLineIndex >= this._tokens.length) {
            return;
        }
        if (firstLineIndex < 0 && lastLineIndex >= this._tokens.length) {
            this._startLineNumber = 0;
            this._tokens = [];
            return;
        }
        if (firstLineIndex === lastLineIndex) {
            this._tokens[firstLineIndex] = ContiguousTokensEditing.delete(this._tokens[firstLineIndex], range.startColumn - 1, range.endColumn - 1);
            return;
        }
        if (firstLineIndex >= 0) {
            this._tokens[firstLineIndex] = ContiguousTokensEditing.deleteEnding(this._tokens[firstLineIndex], range.startColumn - 1);
            if (lastLineIndex < this._tokens.length) {
                const lastLineTokens = ContiguousTokensEditing.deleteBeginning(this._tokens[lastLineIndex], range.endColumn - 1);
                this._tokens[firstLineIndex] = ContiguousTokensEditing.append(this._tokens[firstLineIndex], lastLineTokens);
                this._tokens.splice(firstLineIndex + 1, lastLineIndex - firstLineIndex);
            }
            else {
                this._tokens[firstLineIndex] = ContiguousTokensEditing.append(this._tokens[firstLineIndex], null);
                this._tokens = this._tokens.slice(0, firstLineIndex + 1);
            }
        }
        else {
            const deletedBefore = -firstLineIndex;
            this._startLineNumber -= deletedBefore;
            this._tokens[lastLineIndex] = ContiguousTokensEditing.deleteBeginning(this._tokens[lastLineIndex], range.endColumn - 1);
            this._tokens = this._tokens.slice(lastLineIndex);
        }
    }
    _acceptInsertText(position, eolCount, firstLineLength) {
        if (eolCount === 0 && firstLineLength === 0) {
            return;
        }
        const lineIndex = position.lineNumber - this._startLineNumber;
        if (lineIndex < 0) {
            this._startLineNumber += eolCount;
            return;
        }
        if (lineIndex >= this._tokens.length) {
            return;
        }
        if (eolCount === 0) {
            this._tokens[lineIndex] = ContiguousTokensEditing.insert(this._tokens[lineIndex], position.column - 1, firstLineLength);
            return;
        }
        this._tokens[lineIndex] = ContiguousTokensEditing.deleteEnding(this._tokens[lineIndex], position.column - 1);
        this._tokens[lineIndex] = ContiguousTokensEditing.insert(this._tokens[lineIndex], position.column - 1, firstLineLength);
        this._insertLines(position.lineNumber, eolCount);
    }
    _insertLines(insertIndex, insertCount) {
        if (insertCount === 0) {
            return;
        }
        const lineTokens = [];
        for (let i = 0; i < insertCount; i++) {
            lineTokens[i] = null;
        }
        this._tokens = arrays.arrayInsert(this._tokens, insertIndex, lineTokens);
    }
}
