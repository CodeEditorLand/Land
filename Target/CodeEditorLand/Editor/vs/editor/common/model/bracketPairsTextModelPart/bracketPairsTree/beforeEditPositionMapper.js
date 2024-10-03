import { Range } from '../../../core/range.js';
import { lengthAdd, lengthDiffNonNegative, lengthLessThanEqual, lengthOfString, lengthToObj, positionToLength, toLength } from './length.js';
export class TextEditInfo {
    static fromModelContentChanges(changes) {
        const edits = changes.map(c => {
            const range = Range.lift(c.range);
            return new TextEditInfo(positionToLength(range.getStartPosition()), positionToLength(range.getEndPosition()), lengthOfString(c.text));
        }).reverse();
        return edits;
    }
    constructor(startOffset, endOffset, newLength) {
        this.startOffset = startOffset;
        this.endOffset = endOffset;
        this.newLength = newLength;
    }
    toString() {
        return `[${lengthToObj(this.startOffset)}...${lengthToObj(this.endOffset)}) -> ${lengthToObj(this.newLength)}`;
    }
}
export class BeforeEditPositionMapper {
    constructor(edits) {
        this.nextEditIdx = 0;
        this.deltaOldToNewLineCount = 0;
        this.deltaOldToNewColumnCount = 0;
        this.deltaLineIdxInOld = -1;
        this.edits = edits.map(edit => TextEditInfoCache.from(edit));
    }
    getOffsetBeforeChange(offset) {
        this.adjustNextEdit(offset);
        return this.translateCurToOld(offset);
    }
    getDistanceToNextChange(offset) {
        this.adjustNextEdit(offset);
        const nextEdit = this.edits[this.nextEditIdx];
        const nextChangeOffset = nextEdit ? this.translateOldToCur(nextEdit.offsetObj) : null;
        if (nextChangeOffset === null) {
            return null;
        }
        return lengthDiffNonNegative(offset, nextChangeOffset);
    }
    translateOldToCur(oldOffsetObj) {
        if (oldOffsetObj.lineCount === this.deltaLineIdxInOld) {
            return toLength(oldOffsetObj.lineCount + this.deltaOldToNewLineCount, oldOffsetObj.columnCount + this.deltaOldToNewColumnCount);
        }
        else {
            return toLength(oldOffsetObj.lineCount + this.deltaOldToNewLineCount, oldOffsetObj.columnCount);
        }
    }
    translateCurToOld(newOffset) {
        const offsetObj = lengthToObj(newOffset);
        if (offsetObj.lineCount - this.deltaOldToNewLineCount === this.deltaLineIdxInOld) {
            return toLength(offsetObj.lineCount - this.deltaOldToNewLineCount, offsetObj.columnCount - this.deltaOldToNewColumnCount);
        }
        else {
            return toLength(offsetObj.lineCount - this.deltaOldToNewLineCount, offsetObj.columnCount);
        }
    }
    adjustNextEdit(offset) {
        while (this.nextEditIdx < this.edits.length) {
            const nextEdit = this.edits[this.nextEditIdx];
            const nextEditEndOffsetInCur = this.translateOldToCur(nextEdit.endOffsetAfterObj);
            if (lengthLessThanEqual(nextEditEndOffsetInCur, offset)) {
                this.nextEditIdx++;
                const nextEditEndOffsetInCurObj = lengthToObj(nextEditEndOffsetInCur);
                const nextEditEndOffsetBeforeInCurObj = lengthToObj(this.translateOldToCur(nextEdit.endOffsetBeforeObj));
                const lineDelta = nextEditEndOffsetInCurObj.lineCount - nextEditEndOffsetBeforeInCurObj.lineCount;
                this.deltaOldToNewLineCount += lineDelta;
                const previousColumnDelta = this.deltaLineIdxInOld === nextEdit.endOffsetBeforeObj.lineCount ? this.deltaOldToNewColumnCount : 0;
                const columnDelta = nextEditEndOffsetInCurObj.columnCount - nextEditEndOffsetBeforeInCurObj.columnCount;
                this.deltaOldToNewColumnCount = previousColumnDelta + columnDelta;
                this.deltaLineIdxInOld = nextEdit.endOffsetBeforeObj.lineCount;
            }
            else {
                break;
            }
        }
    }
}
class TextEditInfoCache {
    static from(edit) {
        return new TextEditInfoCache(edit.startOffset, edit.endOffset, edit.newLength);
    }
    constructor(startOffset, endOffset, textLength) {
        this.endOffsetBeforeObj = lengthToObj(endOffset);
        this.endOffsetAfterObj = lengthToObj(lengthAdd(startOffset, textLength));
        this.offsetObj = lengthToObj(startOffset);
    }
}
