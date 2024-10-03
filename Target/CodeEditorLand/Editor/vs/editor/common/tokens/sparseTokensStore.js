import * as arrays from '../../../base/common/arrays.js';
import { LineTokens } from './lineTokens.js';
export class SparseTokensStore {
    constructor(languageIdCodec) {
        this._pieces = [];
        this._isComplete = false;
        this._languageIdCodec = languageIdCodec;
    }
    flush() {
        this._pieces = [];
        this._isComplete = false;
    }
    isEmpty() {
        return (this._pieces.length === 0);
    }
    set(pieces, isComplete) {
        this._pieces = pieces || [];
        this._isComplete = isComplete;
    }
    setPartial(_range, pieces) {
        let range = _range;
        if (pieces.length > 0) {
            const _firstRange = pieces[0].getRange();
            const _lastRange = pieces[pieces.length - 1].getRange();
            if (!_firstRange || !_lastRange) {
                return _range;
            }
            range = _range.plusRange(_firstRange).plusRange(_lastRange);
        }
        let insertPosition = null;
        for (let i = 0, len = this._pieces.length; i < len; i++) {
            const piece = this._pieces[i];
            if (piece.endLineNumber < range.startLineNumber) {
                continue;
            }
            if (piece.startLineNumber > range.endLineNumber) {
                insertPosition = insertPosition || { index: i };
                break;
            }
            piece.removeTokens(range);
            if (piece.isEmpty()) {
                this._pieces.splice(i, 1);
                i--;
                len--;
                continue;
            }
            if (piece.endLineNumber < range.startLineNumber) {
                continue;
            }
            if (piece.startLineNumber > range.endLineNumber) {
                insertPosition = insertPosition || { index: i };
                continue;
            }
            const [a, b] = piece.split(range);
            if (a.isEmpty()) {
                insertPosition = insertPosition || { index: i };
                continue;
            }
            if (b.isEmpty()) {
                continue;
            }
            this._pieces.splice(i, 1, a, b);
            i++;
            len++;
            insertPosition = insertPosition || { index: i };
        }
        insertPosition = insertPosition || { index: this._pieces.length };
        if (pieces.length > 0) {
            this._pieces = arrays.arrayInsert(this._pieces, insertPosition.index, pieces);
        }
        return range;
    }
    isComplete() {
        return this._isComplete;
    }
    addSparseTokens(lineNumber, aTokens) {
        if (aTokens.getLineContent().length === 0) {
            return aTokens;
        }
        const pieces = this._pieces;
        if (pieces.length === 0) {
            return aTokens;
        }
        const pieceIndex = SparseTokensStore._findFirstPieceWithLine(pieces, lineNumber);
        const bTokens = pieces[pieceIndex].getLineTokens(lineNumber);
        if (!bTokens) {
            return aTokens;
        }
        const aLen = aTokens.getCount();
        const bLen = bTokens.getCount();
        let aIndex = 0;
        const result = [];
        let resultLen = 0;
        let lastEndOffset = 0;
        const emitToken = (endOffset, metadata) => {
            if (endOffset === lastEndOffset) {
                return;
            }
            lastEndOffset = endOffset;
            result[resultLen++] = endOffset;
            result[resultLen++] = metadata;
        };
        for (let bIndex = 0; bIndex < bLen; bIndex++) {
            const bStartCharacter = bTokens.getStartCharacter(bIndex);
            const bEndCharacter = bTokens.getEndCharacter(bIndex);
            const bMetadata = bTokens.getMetadata(bIndex);
            const bMask = (((bMetadata & 1) ? 2048 : 0)
                | ((bMetadata & 2) ? 4096 : 0)
                | ((bMetadata & 4) ? 8192 : 0)
                | ((bMetadata & 8) ? 16384 : 0)
                | ((bMetadata & 16) ? 16744448 : 0)
                | ((bMetadata & 32) ? 4278190080 : 0)) >>> 0;
            const aMask = (~bMask) >>> 0;
            while (aIndex < aLen && aTokens.getEndOffset(aIndex) <= bStartCharacter) {
                emitToken(aTokens.getEndOffset(aIndex), aTokens.getMetadata(aIndex));
                aIndex++;
            }
            if (aIndex < aLen && aTokens.getStartOffset(aIndex) < bStartCharacter) {
                emitToken(bStartCharacter, aTokens.getMetadata(aIndex));
            }
            while (aIndex < aLen && aTokens.getEndOffset(aIndex) < bEndCharacter) {
                emitToken(aTokens.getEndOffset(aIndex), (aTokens.getMetadata(aIndex) & aMask) | (bMetadata & bMask));
                aIndex++;
            }
            if (aIndex < aLen) {
                emitToken(bEndCharacter, (aTokens.getMetadata(aIndex) & aMask) | (bMetadata & bMask));
                if (aTokens.getEndOffset(aIndex) === bEndCharacter) {
                    aIndex++;
                }
            }
            else {
                const aMergeIndex = Math.min(Math.max(0, aIndex - 1), aLen - 1);
                emitToken(bEndCharacter, (aTokens.getMetadata(aMergeIndex) & aMask) | (bMetadata & bMask));
            }
        }
        while (aIndex < aLen) {
            emitToken(aTokens.getEndOffset(aIndex), aTokens.getMetadata(aIndex));
            aIndex++;
        }
        return new LineTokens(new Uint32Array(result), aTokens.getLineContent(), this._languageIdCodec);
    }
    static _findFirstPieceWithLine(pieces, lineNumber) {
        let low = 0;
        let high = pieces.length - 1;
        while (low < high) {
            let mid = low + Math.floor((high - low) / 2);
            if (pieces[mid].endLineNumber < lineNumber) {
                low = mid + 1;
            }
            else if (pieces[mid].startLineNumber > lineNumber) {
                high = mid - 1;
            }
            else {
                while (mid > low && pieces[mid - 1].startLineNumber <= lineNumber && lineNumber <= pieces[mid - 1].endLineNumber) {
                    mid--;
                }
                return mid;
            }
        }
        return low;
    }
    acceptEdit(range, eolCount, firstLineLength, lastLineLength, firstCharCode) {
        for (const piece of this._pieces) {
            piece.acceptEdit(range, eolCount, firstLineLength, lastLineLength, firstCharCode);
        }
    }
}
