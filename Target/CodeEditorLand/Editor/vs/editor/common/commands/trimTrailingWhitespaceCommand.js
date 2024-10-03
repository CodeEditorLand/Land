import * as strings from '../../../base/common/strings.js';
import { EditOperation } from '../core/editOperation.js';
import { Range } from '../core/range.js';
export class TrimTrailingWhitespaceCommand {
    constructor(selection, cursors, trimInRegexesAndStrings) {
        this._selection = selection;
        this._cursors = cursors;
        this._selectionId = null;
        this._trimInRegexesAndStrings = trimInRegexesAndStrings;
    }
    getEditOperations(model, builder) {
        const ops = trimTrailingWhitespace(model, this._cursors, this._trimInRegexesAndStrings);
        for (let i = 0, len = ops.length; i < len; i++) {
            const op = ops[i];
            builder.addEditOperation(op.range, op.text);
        }
        this._selectionId = builder.trackSelection(this._selection);
    }
    computeCursorState(model, helper) {
        return helper.getTrackedSelection(this._selectionId);
    }
}
export function trimTrailingWhitespace(model, cursors, trimInRegexesAndStrings) {
    cursors.sort((a, b) => {
        if (a.lineNumber === b.lineNumber) {
            return a.column - b.column;
        }
        return a.lineNumber - b.lineNumber;
    });
    for (let i = cursors.length - 2; i >= 0; i--) {
        if (cursors[i].lineNumber === cursors[i + 1].lineNumber) {
            cursors.splice(i, 1);
        }
    }
    const r = [];
    let rLen = 0;
    let cursorIndex = 0;
    const cursorLen = cursors.length;
    for (let lineNumber = 1, lineCount = model.getLineCount(); lineNumber <= lineCount; lineNumber++) {
        const lineContent = model.getLineContent(lineNumber);
        const maxLineColumn = lineContent.length + 1;
        let minEditColumn = 0;
        if (cursorIndex < cursorLen && cursors[cursorIndex].lineNumber === lineNumber) {
            minEditColumn = cursors[cursorIndex].column;
            cursorIndex++;
            if (minEditColumn === maxLineColumn) {
                continue;
            }
        }
        if (lineContent.length === 0) {
            continue;
        }
        const lastNonWhitespaceIndex = strings.lastNonWhitespaceIndex(lineContent);
        let fromColumn = 0;
        if (lastNonWhitespaceIndex === -1) {
            fromColumn = 1;
        }
        else if (lastNonWhitespaceIndex !== lineContent.length - 1) {
            fromColumn = lastNonWhitespaceIndex + 2;
        }
        else {
            continue;
        }
        if (!trimInRegexesAndStrings) {
            if (!model.tokenization.hasAccurateTokensForLine(lineNumber)) {
                continue;
            }
            const lineTokens = model.tokenization.getLineTokens(lineNumber);
            const fromColumnType = lineTokens.getStandardTokenType(lineTokens.findTokenIndexAtOffset(fromColumn));
            if (fromColumnType === 2 || fromColumnType === 3) {
                continue;
            }
        }
        fromColumn = Math.max(minEditColumn, fromColumn);
        r[rLen++] = EditOperation.delete(new Range(lineNumber, fromColumn, lineNumber, maxLineColumn));
    }
    return r;
}
