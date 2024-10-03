import * as strings from '../../../../base/common/strings.js';
import { EditOperation } from '../../../common/core/editOperation.js';
import { Position } from '../../../common/core/position.js';
import { Range } from '../../../common/core/range.js';
import { Selection } from '../../../common/core/selection.js';
import { BlockCommentCommand } from './blockCommentCommand.js';
export class LineCommentCommand {
    constructor(languageConfigurationService, selection, indentSize, type, insertSpace, ignoreEmptyLines, ignoreFirstLine) {
        this.languageConfigurationService = languageConfigurationService;
        this._selection = selection;
        this._indentSize = indentSize;
        this._type = type;
        this._insertSpace = insertSpace;
        this._selectionId = null;
        this._deltaColumn = 0;
        this._moveEndPositionDown = false;
        this._ignoreEmptyLines = ignoreEmptyLines;
        this._ignoreFirstLine = ignoreFirstLine || false;
    }
    static _gatherPreflightCommentStrings(model, startLineNumber, endLineNumber, languageConfigurationService) {
        model.tokenization.tokenizeIfCheap(startLineNumber);
        const languageId = model.getLanguageIdAtPosition(startLineNumber, 1);
        const config = languageConfigurationService.getLanguageConfiguration(languageId).comments;
        const commentStr = (config ? config.lineCommentToken : null);
        if (!commentStr) {
            return null;
        }
        const lines = [];
        for (let i = 0, lineCount = endLineNumber - startLineNumber + 1; i < lineCount; i++) {
            lines[i] = {
                ignore: false,
                commentStr: commentStr,
                commentStrOffset: 0,
                commentStrLength: commentStr.length
            };
        }
        return lines;
    }
    static _analyzeLines(type, insertSpace, model, lines, startLineNumber, ignoreEmptyLines, ignoreFirstLine, languageConfigurationService) {
        let onlyWhitespaceLines = true;
        let shouldRemoveComments;
        if (type === 0) {
            shouldRemoveComments = true;
        }
        else if (type === 1) {
            shouldRemoveComments = false;
        }
        else {
            shouldRemoveComments = true;
        }
        for (let i = 0, lineCount = lines.length; i < lineCount; i++) {
            const lineData = lines[i];
            const lineNumber = startLineNumber + i;
            if (lineNumber === startLineNumber && ignoreFirstLine) {
                lineData.ignore = true;
                continue;
            }
            const lineContent = model.getLineContent(lineNumber);
            const lineContentStartOffset = strings.firstNonWhitespaceIndex(lineContent);
            if (lineContentStartOffset === -1) {
                lineData.ignore = ignoreEmptyLines;
                lineData.commentStrOffset = lineContent.length;
                continue;
            }
            onlyWhitespaceLines = false;
            lineData.ignore = false;
            lineData.commentStrOffset = lineContentStartOffset;
            if (shouldRemoveComments && !BlockCommentCommand._haystackHasNeedleAtOffset(lineContent, lineData.commentStr, lineContentStartOffset)) {
                if (type === 0) {
                    shouldRemoveComments = false;
                }
                else if (type === 1) {
                }
                else {
                    lineData.ignore = true;
                }
            }
            if (shouldRemoveComments && insertSpace) {
                const commentStrEndOffset = lineContentStartOffset + lineData.commentStrLength;
                if (commentStrEndOffset < lineContent.length && lineContent.charCodeAt(commentStrEndOffset) === 32) {
                    lineData.commentStrLength += 1;
                }
            }
        }
        if (type === 0 && onlyWhitespaceLines) {
            shouldRemoveComments = false;
            for (let i = 0, lineCount = lines.length; i < lineCount; i++) {
                lines[i].ignore = false;
            }
        }
        return {
            supported: true,
            shouldRemoveComments: shouldRemoveComments,
            lines: lines
        };
    }
    static _gatherPreflightData(type, insertSpace, model, startLineNumber, endLineNumber, ignoreEmptyLines, ignoreFirstLine, languageConfigurationService) {
        const lines = LineCommentCommand._gatherPreflightCommentStrings(model, startLineNumber, endLineNumber, languageConfigurationService);
        if (lines === null) {
            return {
                supported: false
            };
        }
        return LineCommentCommand._analyzeLines(type, insertSpace, model, lines, startLineNumber, ignoreEmptyLines, ignoreFirstLine, languageConfigurationService);
    }
    _executeLineComments(model, builder, data, s) {
        let ops;
        if (data.shouldRemoveComments) {
            ops = LineCommentCommand._createRemoveLineCommentsOperations(data.lines, s.startLineNumber);
        }
        else {
            LineCommentCommand._normalizeInsertionPoint(model, data.lines, s.startLineNumber, this._indentSize);
            ops = this._createAddLineCommentsOperations(data.lines, s.startLineNumber);
        }
        const cursorPosition = new Position(s.positionLineNumber, s.positionColumn);
        for (let i = 0, len = ops.length; i < len; i++) {
            builder.addEditOperation(ops[i].range, ops[i].text);
            if (Range.isEmpty(ops[i].range) && Range.getStartPosition(ops[i].range).equals(cursorPosition)) {
                const lineContent = model.getLineContent(cursorPosition.lineNumber);
                if (lineContent.length + 1 === cursorPosition.column) {
                    this._deltaColumn = (ops[i].text || '').length;
                }
            }
        }
        this._selectionId = builder.trackSelection(s);
    }
    _attemptRemoveBlockComment(model, s, startToken, endToken) {
        let startLineNumber = s.startLineNumber;
        let endLineNumber = s.endLineNumber;
        const startTokenAllowedBeforeColumn = endToken.length + Math.max(model.getLineFirstNonWhitespaceColumn(s.startLineNumber), s.startColumn);
        let startTokenIndex = model.getLineContent(startLineNumber).lastIndexOf(startToken, startTokenAllowedBeforeColumn - 1);
        let endTokenIndex = model.getLineContent(endLineNumber).indexOf(endToken, s.endColumn - 1 - startToken.length);
        if (startTokenIndex !== -1 && endTokenIndex === -1) {
            endTokenIndex = model.getLineContent(startLineNumber).indexOf(endToken, startTokenIndex + startToken.length);
            endLineNumber = startLineNumber;
        }
        if (startTokenIndex === -1 && endTokenIndex !== -1) {
            startTokenIndex = model.getLineContent(endLineNumber).lastIndexOf(startToken, endTokenIndex);
            startLineNumber = endLineNumber;
        }
        if (s.isEmpty() && (startTokenIndex === -1 || endTokenIndex === -1)) {
            startTokenIndex = model.getLineContent(startLineNumber).indexOf(startToken);
            if (startTokenIndex !== -1) {
                endTokenIndex = model.getLineContent(startLineNumber).indexOf(endToken, startTokenIndex + startToken.length);
            }
        }
        if (startTokenIndex !== -1 && model.getLineContent(startLineNumber).charCodeAt(startTokenIndex + startToken.length) === 32) {
            startToken += ' ';
        }
        if (endTokenIndex !== -1 && model.getLineContent(endLineNumber).charCodeAt(endTokenIndex - 1) === 32) {
            endToken = ' ' + endToken;
            endTokenIndex -= 1;
        }
        if (startTokenIndex !== -1 && endTokenIndex !== -1) {
            return BlockCommentCommand._createRemoveBlockCommentOperations(new Range(startLineNumber, startTokenIndex + startToken.length + 1, endLineNumber, endTokenIndex + 1), startToken, endToken);
        }
        return null;
    }
    _executeBlockComment(model, builder, s) {
        model.tokenization.tokenizeIfCheap(s.startLineNumber);
        const languageId = model.getLanguageIdAtPosition(s.startLineNumber, 1);
        const config = this.languageConfigurationService.getLanguageConfiguration(languageId).comments;
        if (!config || !config.blockCommentStartToken || !config.blockCommentEndToken) {
            return;
        }
        const startToken = config.blockCommentStartToken;
        const endToken = config.blockCommentEndToken;
        let ops = this._attemptRemoveBlockComment(model, s, startToken, endToken);
        if (!ops) {
            if (s.isEmpty()) {
                const lineContent = model.getLineContent(s.startLineNumber);
                let firstNonWhitespaceIndex = strings.firstNonWhitespaceIndex(lineContent);
                if (firstNonWhitespaceIndex === -1) {
                    firstNonWhitespaceIndex = lineContent.length;
                }
                ops = BlockCommentCommand._createAddBlockCommentOperations(new Range(s.startLineNumber, firstNonWhitespaceIndex + 1, s.startLineNumber, lineContent.length + 1), startToken, endToken, this._insertSpace);
            }
            else {
                ops = BlockCommentCommand._createAddBlockCommentOperations(new Range(s.startLineNumber, model.getLineFirstNonWhitespaceColumn(s.startLineNumber), s.endLineNumber, model.getLineMaxColumn(s.endLineNumber)), startToken, endToken, this._insertSpace);
            }
            if (ops.length === 1) {
                this._deltaColumn = startToken.length + 1;
            }
        }
        this._selectionId = builder.trackSelection(s);
        for (const op of ops) {
            builder.addEditOperation(op.range, op.text);
        }
    }
    getEditOperations(model, builder) {
        let s = this._selection;
        this._moveEndPositionDown = false;
        if (s.startLineNumber === s.endLineNumber && this._ignoreFirstLine) {
            builder.addEditOperation(new Range(s.startLineNumber, model.getLineMaxColumn(s.startLineNumber), s.startLineNumber + 1, 1), s.startLineNumber === model.getLineCount() ? '' : '\n');
            this._selectionId = builder.trackSelection(s);
            return;
        }
        if (s.startLineNumber < s.endLineNumber && s.endColumn === 1) {
            this._moveEndPositionDown = true;
            s = s.setEndPosition(s.endLineNumber - 1, model.getLineMaxColumn(s.endLineNumber - 1));
        }
        const data = LineCommentCommand._gatherPreflightData(this._type, this._insertSpace, model, s.startLineNumber, s.endLineNumber, this._ignoreEmptyLines, this._ignoreFirstLine, this.languageConfigurationService);
        if (data.supported) {
            return this._executeLineComments(model, builder, data, s);
        }
        return this._executeBlockComment(model, builder, s);
    }
    computeCursorState(model, helper) {
        let result = helper.getTrackedSelection(this._selectionId);
        if (this._moveEndPositionDown) {
            result = result.setEndPosition(result.endLineNumber + 1, 1);
        }
        return new Selection(result.selectionStartLineNumber, result.selectionStartColumn + this._deltaColumn, result.positionLineNumber, result.positionColumn + this._deltaColumn);
    }
    static _createRemoveLineCommentsOperations(lines, startLineNumber) {
        const res = [];
        for (let i = 0, len = lines.length; i < len; i++) {
            const lineData = lines[i];
            if (lineData.ignore) {
                continue;
            }
            res.push(EditOperation.delete(new Range(startLineNumber + i, lineData.commentStrOffset + 1, startLineNumber + i, lineData.commentStrOffset + lineData.commentStrLength + 1)));
        }
        return res;
    }
    _createAddLineCommentsOperations(lines, startLineNumber) {
        const res = [];
        const afterCommentStr = this._insertSpace ? ' ' : '';
        for (let i = 0, len = lines.length; i < len; i++) {
            const lineData = lines[i];
            if (lineData.ignore) {
                continue;
            }
            res.push(EditOperation.insert(new Position(startLineNumber + i, lineData.commentStrOffset + 1), lineData.commentStr + afterCommentStr));
        }
        return res;
    }
    static nextVisibleColumn(currentVisibleColumn, indentSize, isTab, columnSize) {
        if (isTab) {
            return currentVisibleColumn + (indentSize - (currentVisibleColumn % indentSize));
        }
        return currentVisibleColumn + columnSize;
    }
    static _normalizeInsertionPoint(model, lines, startLineNumber, indentSize) {
        let minVisibleColumn = 1073741824;
        let j;
        let lenJ;
        for (let i = 0, len = lines.length; i < len; i++) {
            if (lines[i].ignore) {
                continue;
            }
            const lineContent = model.getLineContent(startLineNumber + i);
            let currentVisibleColumn = 0;
            for (let j = 0, lenJ = lines[i].commentStrOffset; currentVisibleColumn < minVisibleColumn && j < lenJ; j++) {
                currentVisibleColumn = LineCommentCommand.nextVisibleColumn(currentVisibleColumn, indentSize, lineContent.charCodeAt(j) === 9, 1);
            }
            if (currentVisibleColumn < minVisibleColumn) {
                minVisibleColumn = currentVisibleColumn;
            }
        }
        minVisibleColumn = Math.floor(minVisibleColumn / indentSize) * indentSize;
        for (let i = 0, len = lines.length; i < len; i++) {
            if (lines[i].ignore) {
                continue;
            }
            const lineContent = model.getLineContent(startLineNumber + i);
            let currentVisibleColumn = 0;
            for (j = 0, lenJ = lines[i].commentStrOffset; currentVisibleColumn < minVisibleColumn && j < lenJ; j++) {
                currentVisibleColumn = LineCommentCommand.nextVisibleColumn(currentVisibleColumn, indentSize, lineContent.charCodeAt(j) === 9, 1);
            }
            if (currentVisibleColumn > minVisibleColumn) {
                lines[i].commentStrOffset = j - 1;
            }
            else {
                lines[i].commentStrOffset = j;
            }
        }
    }
}
