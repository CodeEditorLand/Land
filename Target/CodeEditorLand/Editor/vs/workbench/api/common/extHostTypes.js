var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var Disposable_1, Position_1, Range_1, Selection_1, TextEdit_1, NotebookEdit_1, SnippetString_1, Location_1, SymbolInformation_1, DocumentSymbol_1, CodeActionKind_1, MarkdownString_1, TaskGroup_1, Task_1, TreeItem_1, FileSystemError_1, TestMessage_1;
import { asArray, coalesceInPlace, equals } from '../../../base/common/arrays.js';
import { illegalArgument } from '../../../base/common/errors.js';
import { MarkdownString as BaseMarkdownString } from '../../../base/common/htmlContent.js';
import { ResourceMap } from '../../../base/common/map.js';
import { Mimes, normalizeMimeType } from '../../../base/common/mime.js';
import { nextCharLength } from '../../../base/common/strings.js';
import { isNumber, isObject, isString, isStringArray } from '../../../base/common/types.js';
import { URI } from '../../../base/common/uri.js';
import { generateUuid } from '../../../base/common/uuid.js';
import { ExtensionIdentifier } from '../../../platform/extensions/common/extensions.js';
import { FileSystemProviderErrorCode, markAsFileSystemProviderError } from '../../../platform/files/common/files.js';
import { RemoteAuthorityResolverErrorCode } from '../../../platform/remote/common/remoteAuthorityResolver.js';
import { isTextStreamMime } from '../../contrib/notebook/common/notebookCommon.js';
function es5ClassCompat(target) {
    const interceptFunctions = {
        apply: function (...args) {
            if (args.length === 0) {
                return Reflect.construct(target, []);
            }
            else {
                const argsList = args.length === 1 ? [] : args[1];
                return Reflect.construct(target, argsList, args[0].constructor);
            }
        },
        call: function (...args) {
            if (args.length === 0) {
                return Reflect.construct(target, []);
            }
            else {
                const [thisArg, ...restArgs] = args;
                return Reflect.construct(target, restArgs, thisArg.constructor);
            }
        }
    };
    return Object.assign(target, interceptFunctions);
}
export var TerminalOutputAnchor;
(function (TerminalOutputAnchor) {
    TerminalOutputAnchor[TerminalOutputAnchor["Top"] = 0] = "Top";
    TerminalOutputAnchor[TerminalOutputAnchor["Bottom"] = 1] = "Bottom";
})(TerminalOutputAnchor || (TerminalOutputAnchor = {}));
export var TerminalQuickFixType;
(function (TerminalQuickFixType) {
    TerminalQuickFixType[TerminalQuickFixType["TerminalCommand"] = 0] = "TerminalCommand";
    TerminalQuickFixType[TerminalQuickFixType["Opener"] = 1] = "Opener";
    TerminalQuickFixType[TerminalQuickFixType["Command"] = 3] = "Command";
})(TerminalQuickFixType || (TerminalQuickFixType = {}));
let Disposable = Disposable_1 = class Disposable {
    static from(...inDisposables) {
        let disposables = inDisposables;
        return new Disposable_1(function () {
            if (disposables) {
                for (const disposable of disposables) {
                    if (disposable && typeof disposable.dispose === 'function') {
                        disposable.dispose();
                    }
                }
                disposables = undefined;
            }
        });
    }
    #callOnDispose;
    constructor(callOnDispose) {
        this.#callOnDispose = callOnDispose;
    }
    dispose() {
        if (typeof this.#callOnDispose === 'function') {
            this.#callOnDispose();
            this.#callOnDispose = undefined;
        }
    }
};
Disposable = Disposable_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Function])
], Disposable);
export { Disposable };
let Position = Position_1 = class Position {
    static Min(...positions) {
        if (positions.length === 0) {
            throw new TypeError();
        }
        let result = positions[0];
        for (let i = 1; i < positions.length; i++) {
            const p = positions[i];
            if (p.isBefore(result)) {
                result = p;
            }
        }
        return result;
    }
    static Max(...positions) {
        if (positions.length === 0) {
            throw new TypeError();
        }
        let result = positions[0];
        for (let i = 1; i < positions.length; i++) {
            const p = positions[i];
            if (p.isAfter(result)) {
                result = p;
            }
        }
        return result;
    }
    static isPosition(other) {
        if (!other) {
            return false;
        }
        if (other instanceof Position_1) {
            return true;
        }
        const { line, character } = other;
        if (typeof line === 'number' && typeof character === 'number') {
            return true;
        }
        return false;
    }
    static of(obj) {
        if (obj instanceof Position_1) {
            return obj;
        }
        else if (this.isPosition(obj)) {
            return new Position_1(obj.line, obj.character);
        }
        throw new Error('Invalid argument, is NOT a position-like object');
    }
    get line() {
        return this._line;
    }
    get character() {
        return this._character;
    }
    constructor(line, character) {
        if (line < 0) {
            throw illegalArgument('line must be non-negative');
        }
        if (character < 0) {
            throw illegalArgument('character must be non-negative');
        }
        this._line = line;
        this._character = character;
    }
    isBefore(other) {
        if (this._line < other._line) {
            return true;
        }
        if (other._line < this._line) {
            return false;
        }
        return this._character < other._character;
    }
    isBeforeOrEqual(other) {
        if (this._line < other._line) {
            return true;
        }
        if (other._line < this._line) {
            return false;
        }
        return this._character <= other._character;
    }
    isAfter(other) {
        return !this.isBeforeOrEqual(other);
    }
    isAfterOrEqual(other) {
        return !this.isBefore(other);
    }
    isEqual(other) {
        return this._line === other._line && this._character === other._character;
    }
    compareTo(other) {
        if (this._line < other._line) {
            return -1;
        }
        else if (this._line > other.line) {
            return 1;
        }
        else {
            if (this._character < other._character) {
                return -1;
            }
            else if (this._character > other._character) {
                return 1;
            }
            else {
                return 0;
            }
        }
    }
    translate(lineDeltaOrChange, characterDelta = 0) {
        if (lineDeltaOrChange === null || characterDelta === null) {
            throw illegalArgument();
        }
        let lineDelta;
        if (typeof lineDeltaOrChange === 'undefined') {
            lineDelta = 0;
        }
        else if (typeof lineDeltaOrChange === 'number') {
            lineDelta = lineDeltaOrChange;
        }
        else {
            lineDelta = typeof lineDeltaOrChange.lineDelta === 'number' ? lineDeltaOrChange.lineDelta : 0;
            characterDelta = typeof lineDeltaOrChange.characterDelta === 'number' ? lineDeltaOrChange.characterDelta : 0;
        }
        if (lineDelta === 0 && characterDelta === 0) {
            return this;
        }
        return new Position_1(this.line + lineDelta, this.character + characterDelta);
    }
    with(lineOrChange, character = this.character) {
        if (lineOrChange === null || character === null) {
            throw illegalArgument();
        }
        let line;
        if (typeof lineOrChange === 'undefined') {
            line = this.line;
        }
        else if (typeof lineOrChange === 'number') {
            line = lineOrChange;
        }
        else {
            line = typeof lineOrChange.line === 'number' ? lineOrChange.line : this.line;
            character = typeof lineOrChange.character === 'number' ? lineOrChange.character : this.character;
        }
        if (line === this.line && character === this.character) {
            return this;
        }
        return new Position_1(line, character);
    }
    toJSON() {
        return { line: this.line, character: this.character };
    }
    [Symbol.for('debug.description')]() {
        return `(${this.line}:${this.character})`;
    }
};
Position = Position_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Number, Number])
], Position);
export { Position };
let Range = Range_1 = class Range {
    static isRange(thing) {
        if (thing instanceof Range_1) {
            return true;
        }
        if (!thing) {
            return false;
        }
        return Position.isPosition(thing.start)
            && Position.isPosition(thing.end);
    }
    static of(obj) {
        if (obj instanceof Range_1) {
            return obj;
        }
        if (this.isRange(obj)) {
            return new Range_1(obj.start, obj.end);
        }
        throw new Error('Invalid argument, is NOT a range-like object');
    }
    get start() {
        return this._start;
    }
    get end() {
        return this._end;
    }
    constructor(startLineOrStart, startColumnOrEnd, endLine, endColumn) {
        let start;
        let end;
        if (typeof startLineOrStart === 'number' && typeof startColumnOrEnd === 'number' && typeof endLine === 'number' && typeof endColumn === 'number') {
            start = new Position(startLineOrStart, startColumnOrEnd);
            end = new Position(endLine, endColumn);
        }
        else if (Position.isPosition(startLineOrStart) && Position.isPosition(startColumnOrEnd)) {
            start = Position.of(startLineOrStart);
            end = Position.of(startColumnOrEnd);
        }
        if (!start || !end) {
            throw new Error('Invalid arguments');
        }
        if (start.isBefore(end)) {
            this._start = start;
            this._end = end;
        }
        else {
            this._start = end;
            this._end = start;
        }
    }
    contains(positionOrRange) {
        if (Range_1.isRange(positionOrRange)) {
            return this.contains(positionOrRange.start)
                && this.contains(positionOrRange.end);
        }
        else if (Position.isPosition(positionOrRange)) {
            if (Position.of(positionOrRange).isBefore(this._start)) {
                return false;
            }
            if (this._end.isBefore(positionOrRange)) {
                return false;
            }
            return true;
        }
        return false;
    }
    isEqual(other) {
        return this._start.isEqual(other._start) && this._end.isEqual(other._end);
    }
    intersection(other) {
        const start = Position.Max(other.start, this._start);
        const end = Position.Min(other.end, this._end);
        if (start.isAfter(end)) {
            return undefined;
        }
        return new Range_1(start, end);
    }
    union(other) {
        if (this.contains(other)) {
            return this;
        }
        else if (other.contains(this)) {
            return other;
        }
        const start = Position.Min(other.start, this._start);
        const end = Position.Max(other.end, this.end);
        return new Range_1(start, end);
    }
    get isEmpty() {
        return this._start.isEqual(this._end);
    }
    get isSingleLine() {
        return this._start.line === this._end.line;
    }
    with(startOrChange, end = this.end) {
        if (startOrChange === null || end === null) {
            throw illegalArgument();
        }
        let start;
        if (!startOrChange) {
            start = this.start;
        }
        else if (Position.isPosition(startOrChange)) {
            start = startOrChange;
        }
        else {
            start = startOrChange.start || this.start;
            end = startOrChange.end || this.end;
        }
        if (start.isEqual(this._start) && end.isEqual(this.end)) {
            return this;
        }
        return new Range_1(start, end);
    }
    toJSON() {
        return [this.start, this.end];
    }
    [Symbol.for('debug.description')]() {
        return getDebugDescriptionOfRange(this);
    }
};
Range = Range_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object, Object, Number, Number])
], Range);
export { Range };
let Selection = Selection_1 = class Selection extends Range {
    static isSelection(thing) {
        if (thing instanceof Selection_1) {
            return true;
        }
        if (!thing) {
            return false;
        }
        return Range.isRange(thing)
            && Position.isPosition(thing.anchor)
            && Position.isPosition(thing.active)
            && typeof thing.isReversed === 'boolean';
    }
    get anchor() {
        return this._anchor;
    }
    get active() {
        return this._active;
    }
    constructor(anchorLineOrAnchor, anchorColumnOrActive, activeLine, activeColumn) {
        let anchor;
        let active;
        if (typeof anchorLineOrAnchor === 'number' && typeof anchorColumnOrActive === 'number' && typeof activeLine === 'number' && typeof activeColumn === 'number') {
            anchor = new Position(anchorLineOrAnchor, anchorColumnOrActive);
            active = new Position(activeLine, activeColumn);
        }
        else if (Position.isPosition(anchorLineOrAnchor) && Position.isPosition(anchorColumnOrActive)) {
            anchor = Position.of(anchorLineOrAnchor);
            active = Position.of(anchorColumnOrActive);
        }
        if (!anchor || !active) {
            throw new Error('Invalid arguments');
        }
        super(anchor, active);
        this._anchor = anchor;
        this._active = active;
    }
    get isReversed() {
        return this._anchor === this._end;
    }
    toJSON() {
        return {
            start: this.start,
            end: this.end,
            active: this.active,
            anchor: this.anchor
        };
    }
    [Symbol.for('debug.description')]() {
        return getDebugDescriptionOfSelection(this);
    }
};
Selection = Selection_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object, Object, Number, Number])
], Selection);
export { Selection };
export function getDebugDescriptionOfRange(range) {
    return range.isEmpty
        ? `[${range.start.line}:${range.start.character})`
        : `[${range.start.line}:${range.start.character} -> ${range.end.line}:${range.end.character})`;
}
export function getDebugDescriptionOfSelection(selection) {
    let rangeStr = getDebugDescriptionOfRange(selection);
    if (!selection.isEmpty) {
        if (selection.active.isEqual(selection.start)) {
            rangeStr = `|${rangeStr}`;
        }
        else {
            rangeStr = `${rangeStr}|`;
        }
    }
    return rangeStr;
}
const validateConnectionToken = (connectionToken) => {
    if (typeof connectionToken !== 'string' || connectionToken.length === 0 || !/^[0-9A-Za-z_\-]+$/.test(connectionToken)) {
        throw illegalArgument('connectionToken');
    }
};
export class ResolvedAuthority {
    static isResolvedAuthority(resolvedAuthority) {
        return resolvedAuthority
            && typeof resolvedAuthority === 'object'
            && typeof resolvedAuthority.host === 'string'
            && typeof resolvedAuthority.port === 'number'
            && (resolvedAuthority.connectionToken === undefined || typeof resolvedAuthority.connectionToken === 'string');
    }
    constructor(host, port, connectionToken) {
        if (typeof host !== 'string' || host.length === 0) {
            throw illegalArgument('host');
        }
        if (typeof port !== 'number' || port === 0 || Math.round(port) !== port) {
            throw illegalArgument('port');
        }
        if (typeof connectionToken !== 'undefined') {
            validateConnectionToken(connectionToken);
        }
        this.host = host;
        this.port = Math.round(port);
        this.connectionToken = connectionToken;
    }
}
export class ManagedResolvedAuthority {
    static isManagedResolvedAuthority(resolvedAuthority) {
        return resolvedAuthority
            && typeof resolvedAuthority === 'object'
            && typeof resolvedAuthority.makeConnection === 'function'
            && (resolvedAuthority.connectionToken === undefined || typeof resolvedAuthority.connectionToken === 'string');
    }
    constructor(makeConnection, connectionToken) {
        this.makeConnection = makeConnection;
        this.connectionToken = connectionToken;
        if (typeof connectionToken !== 'undefined') {
            validateConnectionToken(connectionToken);
        }
    }
}
export class RemoteAuthorityResolverError extends Error {
    static NotAvailable(message, handled) {
        return new RemoteAuthorityResolverError(message, RemoteAuthorityResolverErrorCode.NotAvailable, handled);
    }
    static TemporarilyNotAvailable(message) {
        return new RemoteAuthorityResolverError(message, RemoteAuthorityResolverErrorCode.TemporarilyNotAvailable);
    }
    constructor(message, code = RemoteAuthorityResolverErrorCode.Unknown, detail) {
        super(message);
        this._message = message;
        this._code = code;
        this._detail = detail;
        Object.setPrototypeOf(this, RemoteAuthorityResolverError.prototype);
    }
}
export var EndOfLine;
(function (EndOfLine) {
    EndOfLine[EndOfLine["LF"] = 1] = "LF";
    EndOfLine[EndOfLine["CRLF"] = 2] = "CRLF";
})(EndOfLine || (EndOfLine = {}));
export var EnvironmentVariableMutatorType;
(function (EnvironmentVariableMutatorType) {
    EnvironmentVariableMutatorType[EnvironmentVariableMutatorType["Replace"] = 1] = "Replace";
    EnvironmentVariableMutatorType[EnvironmentVariableMutatorType["Append"] = 2] = "Append";
    EnvironmentVariableMutatorType[EnvironmentVariableMutatorType["Prepend"] = 3] = "Prepend";
})(EnvironmentVariableMutatorType || (EnvironmentVariableMutatorType = {}));
let TextEdit = TextEdit_1 = class TextEdit {
    static isTextEdit(thing) {
        if (thing instanceof TextEdit_1) {
            return true;
        }
        if (!thing) {
            return false;
        }
        return Range.isRange(thing)
            && typeof thing.newText === 'string';
    }
    static replace(range, newText) {
        return new TextEdit_1(range, newText);
    }
    static insert(position, newText) {
        return TextEdit_1.replace(new Range(position, position), newText);
    }
    static delete(range) {
        return TextEdit_1.replace(range, '');
    }
    static setEndOfLine(eol) {
        const ret = new TextEdit_1(new Range(new Position(0, 0), new Position(0, 0)), '');
        ret.newEol = eol;
        return ret;
    }
    get range() {
        return this._range;
    }
    set range(value) {
        if (value && !Range.isRange(value)) {
            throw illegalArgument('range');
        }
        this._range = value;
    }
    get newText() {
        return this._newText || '';
    }
    set newText(value) {
        if (value && typeof value !== 'string') {
            throw illegalArgument('newText');
        }
        this._newText = value;
    }
    get newEol() {
        return this._newEol;
    }
    set newEol(value) {
        if (value && typeof value !== 'number') {
            throw illegalArgument('newEol');
        }
        this._newEol = value;
    }
    constructor(range, newText) {
        this._range = range;
        this._newText = newText;
    }
    toJSON() {
        return {
            range: this.range,
            newText: this.newText,
            newEol: this._newEol
        };
    }
};
TextEdit = TextEdit_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Range, Object])
], TextEdit);
export { TextEdit };
let NotebookEdit = NotebookEdit_1 = class NotebookEdit {
    static isNotebookCellEdit(thing) {
        if (thing instanceof NotebookEdit_1) {
            return true;
        }
        if (!thing) {
            return false;
        }
        return NotebookRange.isNotebookRange(thing)
            && Array.isArray(thing.newCells);
    }
    static replaceCells(range, newCells) {
        return new NotebookEdit_1(range, newCells);
    }
    static insertCells(index, newCells) {
        return new NotebookEdit_1(new NotebookRange(index, index), newCells);
    }
    static deleteCells(range) {
        return new NotebookEdit_1(range, []);
    }
    static updateCellMetadata(index, newMetadata) {
        const edit = new NotebookEdit_1(new NotebookRange(index, index), []);
        edit.newCellMetadata = newMetadata;
        return edit;
    }
    static updateNotebookMetadata(newMetadata) {
        const edit = new NotebookEdit_1(new NotebookRange(0, 0), []);
        edit.newNotebookMetadata = newMetadata;
        return edit;
    }
    constructor(range, newCells) {
        this.range = range;
        this.newCells = newCells;
    }
};
NotebookEdit = NotebookEdit_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [NotebookRange, Array])
], NotebookEdit);
export { NotebookEdit };
export class SnippetTextEdit {
    static isSnippetTextEdit(thing) {
        if (thing instanceof SnippetTextEdit) {
            return true;
        }
        if (!thing) {
            return false;
        }
        return Range.isRange(thing.range)
            && SnippetString.isSnippetString(thing.snippet);
    }
    static replace(range, snippet) {
        return new SnippetTextEdit(range, snippet);
    }
    static insert(position, snippet) {
        return SnippetTextEdit.replace(new Range(position, position), snippet);
    }
    constructor(range, snippet) {
        this.range = range;
        this.snippet = snippet;
    }
}
let WorkspaceEdit = class WorkspaceEdit {
    constructor() {
        this._edits = [];
    }
    _allEntries() {
        return this._edits;
    }
    renameFile(from, to, options, metadata) {
        this._edits.push({ _type: 1, from, to, options, metadata });
    }
    createFile(uri, options, metadata) {
        this._edits.push({ _type: 1, from: undefined, to: uri, options, metadata });
    }
    deleteFile(uri, options, metadata) {
        this._edits.push({ _type: 1, from: uri, to: undefined, options, metadata });
    }
    replaceNotebookMetadata(uri, value, metadata) {
        this._edits.push({ _type: 3, metadata, uri, edit: { editType: 5, metadata: value }, notebookMetadata: value });
    }
    replaceNotebookCells(uri, startOrRange, cellData, metadata) {
        const start = startOrRange.start;
        const end = startOrRange.end;
        if (start !== end || cellData.length > 0) {
            this._edits.push({ _type: 5, uri, index: start, count: end - start, cells: cellData, metadata });
        }
    }
    replaceNotebookCellMetadata(uri, index, cellMetadata, metadata) {
        this._edits.push({ _type: 3, metadata, uri, edit: { editType: 3, index, metadata: cellMetadata } });
    }
    replace(uri, range, newText, metadata) {
        this._edits.push({ _type: 2, uri, edit: new TextEdit(range, newText), metadata });
    }
    insert(resource, position, newText, metadata) {
        this.replace(resource, new Range(position, position), newText, metadata);
    }
    delete(resource, range, metadata) {
        this.replace(resource, range, '', metadata);
    }
    has(uri) {
        return this._edits.some(edit => edit._type === 2 && edit.uri.toString() === uri.toString());
    }
    set(uri, edits) {
        if (!edits) {
            for (let i = 0; i < this._edits.length; i++) {
                const element = this._edits[i];
                switch (element._type) {
                    case 2:
                    case 6:
                    case 3:
                    case 5:
                        if (element.uri.toString() === uri.toString()) {
                            this._edits[i] = undefined;
                        }
                        break;
                }
            }
            coalesceInPlace(this._edits);
        }
        else {
            for (const editOrTuple of edits) {
                if (!editOrTuple) {
                    continue;
                }
                let edit;
                let metadata;
                if (Array.isArray(editOrTuple)) {
                    edit = editOrTuple[0];
                    metadata = editOrTuple[1];
                }
                else {
                    edit = editOrTuple;
                }
                if (NotebookEdit.isNotebookCellEdit(edit)) {
                    if (edit.newCellMetadata) {
                        this.replaceNotebookCellMetadata(uri, edit.range.start, edit.newCellMetadata, metadata);
                    }
                    else if (edit.newNotebookMetadata) {
                        this.replaceNotebookMetadata(uri, edit.newNotebookMetadata, metadata);
                    }
                    else {
                        this.replaceNotebookCells(uri, edit.range, edit.newCells, metadata);
                    }
                }
                else if (SnippetTextEdit.isSnippetTextEdit(edit)) {
                    this._edits.push({ _type: 6, uri, range: edit.range, edit: edit.snippet, metadata });
                }
                else {
                    this._edits.push({ _type: 2, uri, edit, metadata });
                }
            }
        }
    }
    get(uri) {
        const res = [];
        for (const candidate of this._edits) {
            if (candidate._type === 2 && candidate.uri.toString() === uri.toString()) {
                res.push(candidate.edit);
            }
        }
        return res;
    }
    entries() {
        const textEdits = new ResourceMap();
        for (const candidate of this._edits) {
            if (candidate._type === 2) {
                let textEdit = textEdits.get(candidate.uri);
                if (!textEdit) {
                    textEdit = [candidate.uri, []];
                    textEdits.set(candidate.uri, textEdit);
                }
                textEdit[1].push(candidate.edit);
            }
        }
        return [...textEdits.values()];
    }
    get size() {
        return this.entries().length;
    }
    toJSON() {
        return this.entries();
    }
};
WorkspaceEdit = __decorate([
    es5ClassCompat
], WorkspaceEdit);
export { WorkspaceEdit };
let SnippetString = SnippetString_1 = class SnippetString {
    static isSnippetString(thing) {
        if (thing instanceof SnippetString_1) {
            return true;
        }
        if (!thing) {
            return false;
        }
        return typeof thing.value === 'string';
    }
    static _escape(value) {
        return value.replace(/\$|}|\\/g, '\\$&');
    }
    constructor(value) {
        this._tabstop = 1;
        this.value = value || '';
    }
    appendText(string) {
        this.value += SnippetString_1._escape(string);
        return this;
    }
    appendTabstop(number = this._tabstop++) {
        this.value += '$';
        this.value += number;
        return this;
    }
    appendPlaceholder(value, number = this._tabstop++) {
        if (typeof value === 'function') {
            const nested = new SnippetString_1();
            nested._tabstop = this._tabstop;
            value(nested);
            this._tabstop = nested._tabstop;
            value = nested.value;
        }
        else {
            value = SnippetString_1._escape(value);
        }
        this.value += '${';
        this.value += number;
        this.value += ':';
        this.value += value;
        this.value += '}';
        return this;
    }
    appendChoice(values, number = this._tabstop++) {
        const value = values.map(s => s.replaceAll(/[|\\,]/g, '\\$&')).join(',');
        this.value += '${';
        this.value += number;
        this.value += '|';
        this.value += value;
        this.value += '|}';
        return this;
    }
    appendVariable(name, defaultValue) {
        if (typeof defaultValue === 'function') {
            const nested = new SnippetString_1();
            nested._tabstop = this._tabstop;
            defaultValue(nested);
            this._tabstop = nested._tabstop;
            defaultValue = nested.value;
        }
        else if (typeof defaultValue === 'string') {
            defaultValue = defaultValue.replace(/\$|}/g, '\\$&');
        }
        this.value += '${';
        this.value += name;
        if (defaultValue) {
            this.value += ':';
            this.value += defaultValue;
        }
        this.value += '}';
        return this;
    }
};
SnippetString = SnippetString_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String])
], SnippetString);
export { SnippetString };
export var DiagnosticTag;
(function (DiagnosticTag) {
    DiagnosticTag[DiagnosticTag["Unnecessary"] = 1] = "Unnecessary";
    DiagnosticTag[DiagnosticTag["Deprecated"] = 2] = "Deprecated";
})(DiagnosticTag || (DiagnosticTag = {}));
export var DiagnosticSeverity;
(function (DiagnosticSeverity) {
    DiagnosticSeverity[DiagnosticSeverity["Hint"] = 3] = "Hint";
    DiagnosticSeverity[DiagnosticSeverity["Information"] = 2] = "Information";
    DiagnosticSeverity[DiagnosticSeverity["Warning"] = 1] = "Warning";
    DiagnosticSeverity[DiagnosticSeverity["Error"] = 0] = "Error";
})(DiagnosticSeverity || (DiagnosticSeverity = {}));
let Location = Location_1 = class Location {
    static isLocation(thing) {
        if (thing instanceof Location_1) {
            return true;
        }
        if (!thing) {
            return false;
        }
        return Range.isRange(thing.range)
            && URI.isUri(thing.uri);
    }
    constructor(uri, rangeOrPosition) {
        this.uri = uri;
        if (!rangeOrPosition) {
        }
        else if (Range.isRange(rangeOrPosition)) {
            this.range = Range.of(rangeOrPosition);
        }
        else if (Position.isPosition(rangeOrPosition)) {
            this.range = new Range(rangeOrPosition, rangeOrPosition);
        }
        else {
            throw new Error('Illegal argument');
        }
    }
    toJSON() {
        return {
            uri: this.uri,
            range: this.range
        };
    }
};
Location = Location_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [URI, Object])
], Location);
export { Location };
let DiagnosticRelatedInformation = class DiagnosticRelatedInformation {
    static is(thing) {
        if (!thing) {
            return false;
        }
        return typeof thing.message === 'string'
            && thing.location
            && Range.isRange(thing.location.range)
            && URI.isUri(thing.location.uri);
    }
    constructor(location, message) {
        this.location = location;
        this.message = message;
    }
    static isEqual(a, b) {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return a.message === b.message
            && a.location.range.isEqual(b.location.range)
            && a.location.uri.toString() === b.location.uri.toString();
    }
};
DiagnosticRelatedInformation = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Location, String])
], DiagnosticRelatedInformation);
export { DiagnosticRelatedInformation };
let Diagnostic = class Diagnostic {
    constructor(range, message, severity = DiagnosticSeverity.Error) {
        if (!Range.isRange(range)) {
            throw new TypeError('range must be set');
        }
        if (!message) {
            throw new TypeError('message must be set');
        }
        this.range = range;
        this.message = message;
        this.severity = severity;
    }
    toJSON() {
        return {
            severity: DiagnosticSeverity[this.severity],
            message: this.message,
            range: this.range,
            source: this.source,
            code: this.code,
        };
    }
    static isEqual(a, b) {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return a.message === b.message
            && a.severity === b.severity
            && a.code === b.code
            && a.severity === b.severity
            && a.source === b.source
            && a.range.isEqual(b.range)
            && equals(a.tags, b.tags)
            && equals(a.relatedInformation, b.relatedInformation, DiagnosticRelatedInformation.isEqual);
    }
};
Diagnostic = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Range, String, Number])
], Diagnostic);
export { Diagnostic };
let Hover = class Hover {
    constructor(contents, range) {
        if (!contents) {
            throw new Error('Illegal argument, contents must be defined');
        }
        if (Array.isArray(contents)) {
            this.contents = contents;
        }
        else {
            this.contents = [contents];
        }
        this.range = range;
    }
};
Hover = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object, Range])
], Hover);
export { Hover };
let VerboseHover = class VerboseHover extends Hover {
    constructor(contents, range, canIncreaseVerbosity, canDecreaseVerbosity) {
        super(contents, range);
        this.canIncreaseVerbosity = canIncreaseVerbosity;
        this.canDecreaseVerbosity = canDecreaseVerbosity;
    }
};
VerboseHover = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object, Range, Boolean, Boolean])
], VerboseHover);
export { VerboseHover };
export var HoverVerbosityAction;
(function (HoverVerbosityAction) {
    HoverVerbosityAction[HoverVerbosityAction["Increase"] = 0] = "Increase";
    HoverVerbosityAction[HoverVerbosityAction["Decrease"] = 1] = "Decrease";
})(HoverVerbosityAction || (HoverVerbosityAction = {}));
export var DocumentHighlightKind;
(function (DocumentHighlightKind) {
    DocumentHighlightKind[DocumentHighlightKind["Text"] = 0] = "Text";
    DocumentHighlightKind[DocumentHighlightKind["Read"] = 1] = "Read";
    DocumentHighlightKind[DocumentHighlightKind["Write"] = 2] = "Write";
})(DocumentHighlightKind || (DocumentHighlightKind = {}));
let DocumentHighlight = class DocumentHighlight {
    constructor(range, kind = DocumentHighlightKind.Text) {
        this.range = range;
        this.kind = kind;
    }
    toJSON() {
        return {
            range: this.range,
            kind: DocumentHighlightKind[this.kind]
        };
    }
};
DocumentHighlight = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Range, Number])
], DocumentHighlight);
export { DocumentHighlight };
let MultiDocumentHighlight = class MultiDocumentHighlight {
    constructor(uri, highlights) {
        this.uri = uri;
        this.highlights = highlights;
    }
    toJSON() {
        return {
            uri: this.uri,
            highlights: this.highlights.map(h => h.toJSON())
        };
    }
};
MultiDocumentHighlight = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [URI, Array])
], MultiDocumentHighlight);
export { MultiDocumentHighlight };
export var SymbolKind;
(function (SymbolKind) {
    SymbolKind[SymbolKind["File"] = 0] = "File";
    SymbolKind[SymbolKind["Module"] = 1] = "Module";
    SymbolKind[SymbolKind["Namespace"] = 2] = "Namespace";
    SymbolKind[SymbolKind["Package"] = 3] = "Package";
    SymbolKind[SymbolKind["Class"] = 4] = "Class";
    SymbolKind[SymbolKind["Method"] = 5] = "Method";
    SymbolKind[SymbolKind["Property"] = 6] = "Property";
    SymbolKind[SymbolKind["Field"] = 7] = "Field";
    SymbolKind[SymbolKind["Constructor"] = 8] = "Constructor";
    SymbolKind[SymbolKind["Enum"] = 9] = "Enum";
    SymbolKind[SymbolKind["Interface"] = 10] = "Interface";
    SymbolKind[SymbolKind["Function"] = 11] = "Function";
    SymbolKind[SymbolKind["Variable"] = 12] = "Variable";
    SymbolKind[SymbolKind["Constant"] = 13] = "Constant";
    SymbolKind[SymbolKind["String"] = 14] = "String";
    SymbolKind[SymbolKind["Number"] = 15] = "Number";
    SymbolKind[SymbolKind["Boolean"] = 16] = "Boolean";
    SymbolKind[SymbolKind["Array"] = 17] = "Array";
    SymbolKind[SymbolKind["Object"] = 18] = "Object";
    SymbolKind[SymbolKind["Key"] = 19] = "Key";
    SymbolKind[SymbolKind["Null"] = 20] = "Null";
    SymbolKind[SymbolKind["EnumMember"] = 21] = "EnumMember";
    SymbolKind[SymbolKind["Struct"] = 22] = "Struct";
    SymbolKind[SymbolKind["Event"] = 23] = "Event";
    SymbolKind[SymbolKind["Operator"] = 24] = "Operator";
    SymbolKind[SymbolKind["TypeParameter"] = 25] = "TypeParameter";
})(SymbolKind || (SymbolKind = {}));
export var SymbolTag;
(function (SymbolTag) {
    SymbolTag[SymbolTag["Deprecated"] = 1] = "Deprecated";
})(SymbolTag || (SymbolTag = {}));
let SymbolInformation = SymbolInformation_1 = class SymbolInformation {
    static validate(candidate) {
        if (!candidate.name) {
            throw new Error('name must not be falsy');
        }
    }
    constructor(name, kind, rangeOrContainer, locationOrUri, containerName) {
        this.name = name;
        this.kind = kind;
        this.containerName = containerName;
        if (typeof rangeOrContainer === 'string') {
            this.containerName = rangeOrContainer;
        }
        if (locationOrUri instanceof Location) {
            this.location = locationOrUri;
        }
        else if (rangeOrContainer instanceof Range) {
            this.location = new Location(locationOrUri, rangeOrContainer);
        }
        SymbolInformation_1.validate(this);
    }
    toJSON() {
        return {
            name: this.name,
            kind: SymbolKind[this.kind],
            location: this.location,
            containerName: this.containerName
        };
    }
};
SymbolInformation = SymbolInformation_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String, Number, Object, Object, String])
], SymbolInformation);
export { SymbolInformation };
let DocumentSymbol = DocumentSymbol_1 = class DocumentSymbol {
    static validate(candidate) {
        if (!candidate.name) {
            throw new Error('name must not be falsy');
        }
        if (!candidate.range.contains(candidate.selectionRange)) {
            throw new Error('selectionRange must be contained in fullRange');
        }
        candidate.children?.forEach(DocumentSymbol_1.validate);
    }
    constructor(name, detail, kind, range, selectionRange) {
        this.name = name;
        this.detail = detail;
        this.kind = kind;
        this.range = range;
        this.selectionRange = selectionRange;
        this.children = [];
        DocumentSymbol_1.validate(this);
    }
};
DocumentSymbol = DocumentSymbol_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String, String, Number, Range, Range])
], DocumentSymbol);
export { DocumentSymbol };
export var CodeActionTriggerKind;
(function (CodeActionTriggerKind) {
    CodeActionTriggerKind[CodeActionTriggerKind["Invoke"] = 1] = "Invoke";
    CodeActionTriggerKind[CodeActionTriggerKind["Automatic"] = 2] = "Automatic";
})(CodeActionTriggerKind || (CodeActionTriggerKind = {}));
let CodeAction = class CodeAction {
    constructor(title, kind) {
        this.title = title;
        this.kind = kind;
    }
};
CodeAction = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String, CodeActionKind])
], CodeAction);
export { CodeAction };
let CodeActionKind = class CodeActionKind {
    static { CodeActionKind_1 = this; }
    static { this.sep = '.'; }
    constructor(value) {
        this.value = value;
    }
    append(parts) {
        return new CodeActionKind_1(this.value ? this.value + CodeActionKind_1.sep + parts : parts);
    }
    intersects(other) {
        return this.contains(other) || other.contains(this);
    }
    contains(other) {
        return this.value === other.value || other.value.startsWith(this.value + CodeActionKind_1.sep);
    }
};
CodeActionKind = CodeActionKind_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String])
], CodeActionKind);
export { CodeActionKind };
CodeActionKind.Empty = new CodeActionKind('');
CodeActionKind.QuickFix = CodeActionKind.Empty.append('quickfix');
CodeActionKind.Refactor = CodeActionKind.Empty.append('refactor');
CodeActionKind.RefactorExtract = CodeActionKind.Refactor.append('extract');
CodeActionKind.RefactorInline = CodeActionKind.Refactor.append('inline');
CodeActionKind.RefactorMove = CodeActionKind.Refactor.append('move');
CodeActionKind.RefactorRewrite = CodeActionKind.Refactor.append('rewrite');
CodeActionKind.Source = CodeActionKind.Empty.append('source');
CodeActionKind.SourceOrganizeImports = CodeActionKind.Source.append('organizeImports');
CodeActionKind.SourceFixAll = CodeActionKind.Source.append('fixAll');
CodeActionKind.Notebook = CodeActionKind.Empty.append('notebook');
let SelectionRange = class SelectionRange {
    constructor(range, parent) {
        this.range = range;
        this.parent = parent;
        if (parent && !parent.range.contains(this.range)) {
            throw new Error('Invalid argument: parent must contain this range');
        }
    }
};
SelectionRange = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Range, SelectionRange])
], SelectionRange);
export { SelectionRange };
export class CallHierarchyItem {
    constructor(kind, name, detail, uri, range, selectionRange) {
        this.kind = kind;
        this.name = name;
        this.detail = detail;
        this.uri = uri;
        this.range = range;
        this.selectionRange = selectionRange;
    }
}
export class CallHierarchyIncomingCall {
    constructor(item, fromRanges) {
        this.fromRanges = fromRanges;
        this.from = item;
    }
}
export class CallHierarchyOutgoingCall {
    constructor(item, fromRanges) {
        this.fromRanges = fromRanges;
        this.to = item;
    }
}
export var LanguageStatusSeverity;
(function (LanguageStatusSeverity) {
    LanguageStatusSeverity[LanguageStatusSeverity["Information"] = 0] = "Information";
    LanguageStatusSeverity[LanguageStatusSeverity["Warning"] = 1] = "Warning";
    LanguageStatusSeverity[LanguageStatusSeverity["Error"] = 2] = "Error";
})(LanguageStatusSeverity || (LanguageStatusSeverity = {}));
let CodeLens = class CodeLens {
    constructor(range, command) {
        this.range = range;
        this.command = command;
    }
    get isResolved() {
        return !!this.command;
    }
};
CodeLens = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Range, Object])
], CodeLens);
export { CodeLens };
let MarkdownString = MarkdownString_1 = class MarkdownString {
    #delegate;
    static isMarkdownString(thing) {
        if (thing instanceof MarkdownString_1) {
            return true;
        }
        return thing && thing.appendCodeblock && thing.appendMarkdown && thing.appendText && (thing.value !== undefined);
    }
    constructor(value, supportThemeIcons = false) {
        this.#delegate = new BaseMarkdownString(value, { supportThemeIcons });
    }
    get value() {
        return this.#delegate.value;
    }
    set value(value) {
        this.#delegate.value = value;
    }
    get isTrusted() {
        return this.#delegate.isTrusted;
    }
    set isTrusted(value) {
        this.#delegate.isTrusted = value;
    }
    get supportThemeIcons() {
        return this.#delegate.supportThemeIcons;
    }
    set supportThemeIcons(value) {
        this.#delegate.supportThemeIcons = value;
    }
    get supportHtml() {
        return this.#delegate.supportHtml;
    }
    set supportHtml(value) {
        this.#delegate.supportHtml = value;
    }
    get baseUri() {
        return this.#delegate.baseUri;
    }
    set baseUri(value) {
        this.#delegate.baseUri = value;
    }
    appendText(value) {
        this.#delegate.appendText(value);
        return this;
    }
    appendMarkdown(value) {
        this.#delegate.appendMarkdown(value);
        return this;
    }
    appendCodeblock(value, language) {
        this.#delegate.appendCodeblock(language ?? '', value);
        return this;
    }
};
MarkdownString = MarkdownString_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String, Boolean])
], MarkdownString);
export { MarkdownString };
let ParameterInformation = class ParameterInformation {
    constructor(label, documentation) {
        this.label = label;
        this.documentation = documentation;
    }
};
ParameterInformation = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object, Object])
], ParameterInformation);
export { ParameterInformation };
let SignatureInformation = class SignatureInformation {
    constructor(label, documentation) {
        this.label = label;
        this.documentation = documentation;
        this.parameters = [];
    }
};
SignatureInformation = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String, Object])
], SignatureInformation);
export { SignatureInformation };
let SignatureHelp = class SignatureHelp {
    constructor() {
        this.activeSignature = 0;
        this.activeParameter = 0;
        this.signatures = [];
    }
};
SignatureHelp = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [])
], SignatureHelp);
export { SignatureHelp };
export var SignatureHelpTriggerKind;
(function (SignatureHelpTriggerKind) {
    SignatureHelpTriggerKind[SignatureHelpTriggerKind["Invoke"] = 1] = "Invoke";
    SignatureHelpTriggerKind[SignatureHelpTriggerKind["TriggerCharacter"] = 2] = "TriggerCharacter";
    SignatureHelpTriggerKind[SignatureHelpTriggerKind["ContentChange"] = 3] = "ContentChange";
})(SignatureHelpTriggerKind || (SignatureHelpTriggerKind = {}));
export var InlayHintKind;
(function (InlayHintKind) {
    InlayHintKind[InlayHintKind["Type"] = 1] = "Type";
    InlayHintKind[InlayHintKind["Parameter"] = 2] = "Parameter";
})(InlayHintKind || (InlayHintKind = {}));
let InlayHintLabelPart = class InlayHintLabelPart {
    constructor(value) {
        this.value = value;
    }
};
InlayHintLabelPart = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String])
], InlayHintLabelPart);
export { InlayHintLabelPart };
let InlayHint = class InlayHint {
    constructor(position, label, kind) {
        this.position = position;
        this.label = label;
        this.kind = kind;
    }
};
InlayHint = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Position, Object, Number])
], InlayHint);
export { InlayHint };
export var CompletionTriggerKind;
(function (CompletionTriggerKind) {
    CompletionTriggerKind[CompletionTriggerKind["Invoke"] = 0] = "Invoke";
    CompletionTriggerKind[CompletionTriggerKind["TriggerCharacter"] = 1] = "TriggerCharacter";
    CompletionTriggerKind[CompletionTriggerKind["TriggerForIncompleteCompletions"] = 2] = "TriggerForIncompleteCompletions";
})(CompletionTriggerKind || (CompletionTriggerKind = {}));
export var CompletionItemKind;
(function (CompletionItemKind) {
    CompletionItemKind[CompletionItemKind["Text"] = 0] = "Text";
    CompletionItemKind[CompletionItemKind["Method"] = 1] = "Method";
    CompletionItemKind[CompletionItemKind["Function"] = 2] = "Function";
    CompletionItemKind[CompletionItemKind["Constructor"] = 3] = "Constructor";
    CompletionItemKind[CompletionItemKind["Field"] = 4] = "Field";
    CompletionItemKind[CompletionItemKind["Variable"] = 5] = "Variable";
    CompletionItemKind[CompletionItemKind["Class"] = 6] = "Class";
    CompletionItemKind[CompletionItemKind["Interface"] = 7] = "Interface";
    CompletionItemKind[CompletionItemKind["Module"] = 8] = "Module";
    CompletionItemKind[CompletionItemKind["Property"] = 9] = "Property";
    CompletionItemKind[CompletionItemKind["Unit"] = 10] = "Unit";
    CompletionItemKind[CompletionItemKind["Value"] = 11] = "Value";
    CompletionItemKind[CompletionItemKind["Enum"] = 12] = "Enum";
    CompletionItemKind[CompletionItemKind["Keyword"] = 13] = "Keyword";
    CompletionItemKind[CompletionItemKind["Snippet"] = 14] = "Snippet";
    CompletionItemKind[CompletionItemKind["Color"] = 15] = "Color";
    CompletionItemKind[CompletionItemKind["File"] = 16] = "File";
    CompletionItemKind[CompletionItemKind["Reference"] = 17] = "Reference";
    CompletionItemKind[CompletionItemKind["Folder"] = 18] = "Folder";
    CompletionItemKind[CompletionItemKind["EnumMember"] = 19] = "EnumMember";
    CompletionItemKind[CompletionItemKind["Constant"] = 20] = "Constant";
    CompletionItemKind[CompletionItemKind["Struct"] = 21] = "Struct";
    CompletionItemKind[CompletionItemKind["Event"] = 22] = "Event";
    CompletionItemKind[CompletionItemKind["Operator"] = 23] = "Operator";
    CompletionItemKind[CompletionItemKind["TypeParameter"] = 24] = "TypeParameter";
    CompletionItemKind[CompletionItemKind["User"] = 25] = "User";
    CompletionItemKind[CompletionItemKind["Issue"] = 26] = "Issue";
})(CompletionItemKind || (CompletionItemKind = {}));
export var CompletionItemTag;
(function (CompletionItemTag) {
    CompletionItemTag[CompletionItemTag["Deprecated"] = 1] = "Deprecated";
})(CompletionItemTag || (CompletionItemTag = {}));
let CompletionItem = class CompletionItem {
    constructor(label, kind) {
        this.label = label;
        this.kind = kind;
    }
    toJSON() {
        return {
            label: this.label,
            kind: this.kind && CompletionItemKind[this.kind],
            detail: this.detail,
            documentation: this.documentation,
            sortText: this.sortText,
            filterText: this.filterText,
            preselect: this.preselect,
            insertText: this.insertText,
            textEdit: this.textEdit
        };
    }
};
CompletionItem = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object, Number])
], CompletionItem);
export { CompletionItem };
let CompletionList = class CompletionList {
    constructor(items = [], isIncomplete = false) {
        this.items = items;
        this.isIncomplete = isIncomplete;
    }
};
CompletionList = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Array, Boolean])
], CompletionList);
export { CompletionList };
let InlineSuggestion = class InlineSuggestion {
    constructor(insertText, range, command) {
        this.insertText = insertText;
        this.range = range;
        this.command = command;
    }
};
InlineSuggestion = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String, Range, Object])
], InlineSuggestion);
export { InlineSuggestion };
let InlineSuggestionList = class InlineSuggestionList {
    constructor(items) {
        this.commands = undefined;
        this.suppressSuggestions = undefined;
        this.items = items;
    }
};
InlineSuggestionList = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Array])
], InlineSuggestionList);
export { InlineSuggestionList };
export var PartialAcceptTriggerKind;
(function (PartialAcceptTriggerKind) {
    PartialAcceptTriggerKind[PartialAcceptTriggerKind["Unknown"] = 0] = "Unknown";
    PartialAcceptTriggerKind[PartialAcceptTriggerKind["Word"] = 1] = "Word";
    PartialAcceptTriggerKind[PartialAcceptTriggerKind["Line"] = 2] = "Line";
    PartialAcceptTriggerKind[PartialAcceptTriggerKind["Suggest"] = 3] = "Suggest";
})(PartialAcceptTriggerKind || (PartialAcceptTriggerKind = {}));
export var ViewColumn;
(function (ViewColumn) {
    ViewColumn[ViewColumn["Active"] = -1] = "Active";
    ViewColumn[ViewColumn["Beside"] = -2] = "Beside";
    ViewColumn[ViewColumn["One"] = 1] = "One";
    ViewColumn[ViewColumn["Two"] = 2] = "Two";
    ViewColumn[ViewColumn["Three"] = 3] = "Three";
    ViewColumn[ViewColumn["Four"] = 4] = "Four";
    ViewColumn[ViewColumn["Five"] = 5] = "Five";
    ViewColumn[ViewColumn["Six"] = 6] = "Six";
    ViewColumn[ViewColumn["Seven"] = 7] = "Seven";
    ViewColumn[ViewColumn["Eight"] = 8] = "Eight";
    ViewColumn[ViewColumn["Nine"] = 9] = "Nine";
})(ViewColumn || (ViewColumn = {}));
export var StatusBarAlignment;
(function (StatusBarAlignment) {
    StatusBarAlignment[StatusBarAlignment["Left"] = 1] = "Left";
    StatusBarAlignment[StatusBarAlignment["Right"] = 2] = "Right";
})(StatusBarAlignment || (StatusBarAlignment = {}));
export function asStatusBarItemIdentifier(extension, id) {
    return `${ExtensionIdentifier.toKey(extension)}.${id}`;
}
export var TextEditorLineNumbersStyle;
(function (TextEditorLineNumbersStyle) {
    TextEditorLineNumbersStyle[TextEditorLineNumbersStyle["Off"] = 0] = "Off";
    TextEditorLineNumbersStyle[TextEditorLineNumbersStyle["On"] = 1] = "On";
    TextEditorLineNumbersStyle[TextEditorLineNumbersStyle["Relative"] = 2] = "Relative";
    TextEditorLineNumbersStyle[TextEditorLineNumbersStyle["Interval"] = 3] = "Interval";
})(TextEditorLineNumbersStyle || (TextEditorLineNumbersStyle = {}));
export var TextDocumentSaveReason;
(function (TextDocumentSaveReason) {
    TextDocumentSaveReason[TextDocumentSaveReason["Manual"] = 1] = "Manual";
    TextDocumentSaveReason[TextDocumentSaveReason["AfterDelay"] = 2] = "AfterDelay";
    TextDocumentSaveReason[TextDocumentSaveReason["FocusOut"] = 3] = "FocusOut";
})(TextDocumentSaveReason || (TextDocumentSaveReason = {}));
export var TextEditorRevealType;
(function (TextEditorRevealType) {
    TextEditorRevealType[TextEditorRevealType["Default"] = 0] = "Default";
    TextEditorRevealType[TextEditorRevealType["InCenter"] = 1] = "InCenter";
    TextEditorRevealType[TextEditorRevealType["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
    TextEditorRevealType[TextEditorRevealType["AtTop"] = 3] = "AtTop";
})(TextEditorRevealType || (TextEditorRevealType = {}));
export var TextEditorSelectionChangeKind;
(function (TextEditorSelectionChangeKind) {
    TextEditorSelectionChangeKind[TextEditorSelectionChangeKind["Keyboard"] = 1] = "Keyboard";
    TextEditorSelectionChangeKind[TextEditorSelectionChangeKind["Mouse"] = 2] = "Mouse";
    TextEditorSelectionChangeKind[TextEditorSelectionChangeKind["Command"] = 3] = "Command";
})(TextEditorSelectionChangeKind || (TextEditorSelectionChangeKind = {}));
export var TextDocumentChangeReason;
(function (TextDocumentChangeReason) {
    TextDocumentChangeReason[TextDocumentChangeReason["Undo"] = 1] = "Undo";
    TextDocumentChangeReason[TextDocumentChangeReason["Redo"] = 2] = "Redo";
})(TextDocumentChangeReason || (TextDocumentChangeReason = {}));
export var DecorationRangeBehavior;
(function (DecorationRangeBehavior) {
    DecorationRangeBehavior[DecorationRangeBehavior["OpenOpen"] = 0] = "OpenOpen";
    DecorationRangeBehavior[DecorationRangeBehavior["ClosedClosed"] = 1] = "ClosedClosed";
    DecorationRangeBehavior[DecorationRangeBehavior["OpenClosed"] = 2] = "OpenClosed";
    DecorationRangeBehavior[DecorationRangeBehavior["ClosedOpen"] = 3] = "ClosedOpen";
})(DecorationRangeBehavior || (DecorationRangeBehavior = {}));
(function (TextEditorSelectionChangeKind) {
    function fromValue(s) {
        switch (s) {
            case 'keyboard': return TextEditorSelectionChangeKind.Keyboard;
            case 'mouse': return TextEditorSelectionChangeKind.Mouse;
            case 'api': return TextEditorSelectionChangeKind.Command;
        }
        return undefined;
    }
    TextEditorSelectionChangeKind.fromValue = fromValue;
})(TextEditorSelectionChangeKind || (TextEditorSelectionChangeKind = {}));
export var SyntaxTokenType;
(function (SyntaxTokenType) {
    SyntaxTokenType[SyntaxTokenType["Other"] = 0] = "Other";
    SyntaxTokenType[SyntaxTokenType["Comment"] = 1] = "Comment";
    SyntaxTokenType[SyntaxTokenType["String"] = 2] = "String";
    SyntaxTokenType[SyntaxTokenType["RegEx"] = 3] = "RegEx";
})(SyntaxTokenType || (SyntaxTokenType = {}));
(function (SyntaxTokenType) {
    function toString(v) {
        switch (v) {
            case SyntaxTokenType.Other: return 'other';
            case SyntaxTokenType.Comment: return 'comment';
            case SyntaxTokenType.String: return 'string';
            case SyntaxTokenType.RegEx: return 'regex';
        }
        return 'other';
    }
    SyntaxTokenType.toString = toString;
})(SyntaxTokenType || (SyntaxTokenType = {}));
let DocumentLink = class DocumentLink {
    constructor(range, target) {
        if (target && !(URI.isUri(target))) {
            throw illegalArgument('target');
        }
        if (!Range.isRange(range) || range.isEmpty) {
            throw illegalArgument('range');
        }
        this.range = range;
        this.target = target;
    }
};
DocumentLink = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Range, Object])
], DocumentLink);
export { DocumentLink };
let Color = class Color {
    constructor(red, green, blue, alpha) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }
};
Color = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Number, Number, Number, Number])
], Color);
export { Color };
let ColorInformation = class ColorInformation {
    constructor(range, color) {
        if (color && !(color instanceof Color)) {
            throw illegalArgument('color');
        }
        if (!Range.isRange(range) || range.isEmpty) {
            throw illegalArgument('range');
        }
        this.range = range;
        this.color = color;
    }
};
ColorInformation = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Range, Color])
], ColorInformation);
export { ColorInformation };
let ColorPresentation = class ColorPresentation {
    constructor(label) {
        if (!label || typeof label !== 'string') {
            throw illegalArgument('label');
        }
        this.label = label;
    }
};
ColorPresentation = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String])
], ColorPresentation);
export { ColorPresentation };
export var ColorFormat;
(function (ColorFormat) {
    ColorFormat[ColorFormat["RGB"] = 0] = "RGB";
    ColorFormat[ColorFormat["HEX"] = 1] = "HEX";
    ColorFormat[ColorFormat["HSL"] = 2] = "HSL";
})(ColorFormat || (ColorFormat = {}));
export var SourceControlInputBoxValidationType;
(function (SourceControlInputBoxValidationType) {
    SourceControlInputBoxValidationType[SourceControlInputBoxValidationType["Error"] = 0] = "Error";
    SourceControlInputBoxValidationType[SourceControlInputBoxValidationType["Warning"] = 1] = "Warning";
    SourceControlInputBoxValidationType[SourceControlInputBoxValidationType["Information"] = 2] = "Information";
})(SourceControlInputBoxValidationType || (SourceControlInputBoxValidationType = {}));
export var TerminalExitReason;
(function (TerminalExitReason) {
    TerminalExitReason[TerminalExitReason["Unknown"] = 0] = "Unknown";
    TerminalExitReason[TerminalExitReason["Shutdown"] = 1] = "Shutdown";
    TerminalExitReason[TerminalExitReason["Process"] = 2] = "Process";
    TerminalExitReason[TerminalExitReason["User"] = 3] = "User";
    TerminalExitReason[TerminalExitReason["Extension"] = 4] = "Extension";
})(TerminalExitReason || (TerminalExitReason = {}));
export var TerminalShellExecutionCommandLineConfidence;
(function (TerminalShellExecutionCommandLineConfidence) {
    TerminalShellExecutionCommandLineConfidence[TerminalShellExecutionCommandLineConfidence["Low"] = 0] = "Low";
    TerminalShellExecutionCommandLineConfidence[TerminalShellExecutionCommandLineConfidence["Medium"] = 1] = "Medium";
    TerminalShellExecutionCommandLineConfidence[TerminalShellExecutionCommandLineConfidence["High"] = 2] = "High";
})(TerminalShellExecutionCommandLineConfidence || (TerminalShellExecutionCommandLineConfidence = {}));
export class TerminalLink {
    constructor(startIndex, length, tooltip) {
        this.startIndex = startIndex;
        this.length = length;
        this.tooltip = tooltip;
        if (typeof startIndex !== 'number' || startIndex < 0) {
            throw illegalArgument('startIndex');
        }
        if (typeof length !== 'number' || length < 1) {
            throw illegalArgument('length');
        }
        if (tooltip !== undefined && typeof tooltip !== 'string') {
            throw illegalArgument('tooltip');
        }
    }
}
export class TerminalQuickFixOpener {
    constructor(uri) {
        this.uri = uri;
    }
}
export class TerminalQuickFixCommand {
    constructor(terminalCommand) {
        this.terminalCommand = terminalCommand;
    }
}
export var TerminalLocation;
(function (TerminalLocation) {
    TerminalLocation[TerminalLocation["Panel"] = 1] = "Panel";
    TerminalLocation[TerminalLocation["Editor"] = 2] = "Editor";
})(TerminalLocation || (TerminalLocation = {}));
export class TerminalProfile {
    constructor(options) {
        this.options = options;
        if (typeof options !== 'object') {
            throw illegalArgument('options');
        }
    }
}
export var TaskRevealKind;
(function (TaskRevealKind) {
    TaskRevealKind[TaskRevealKind["Always"] = 1] = "Always";
    TaskRevealKind[TaskRevealKind["Silent"] = 2] = "Silent";
    TaskRevealKind[TaskRevealKind["Never"] = 3] = "Never";
})(TaskRevealKind || (TaskRevealKind = {}));
export var TaskPanelKind;
(function (TaskPanelKind) {
    TaskPanelKind[TaskPanelKind["Shared"] = 1] = "Shared";
    TaskPanelKind[TaskPanelKind["Dedicated"] = 2] = "Dedicated";
    TaskPanelKind[TaskPanelKind["New"] = 3] = "New";
})(TaskPanelKind || (TaskPanelKind = {}));
let TaskGroup = class TaskGroup {
    static { TaskGroup_1 = this; }
    static { this.Clean = new TaskGroup_1('clean', 'Clean'); }
    static { this.Build = new TaskGroup_1('build', 'Build'); }
    static { this.Rebuild = new TaskGroup_1('rebuild', 'Rebuild'); }
    static { this.Test = new TaskGroup_1('test', 'Test'); }
    static from(value) {
        switch (value) {
            case 'clean':
                return TaskGroup_1.Clean;
            case 'build':
                return TaskGroup_1.Build;
            case 'rebuild':
                return TaskGroup_1.Rebuild;
            case 'test':
                return TaskGroup_1.Test;
            default:
                return undefined;
        }
    }
    constructor(id, label) {
        this.label = label;
        if (typeof id !== 'string') {
            throw illegalArgument('name');
        }
        if (typeof label !== 'string') {
            throw illegalArgument('name');
        }
        this._id = id;
    }
    get id() {
        return this._id;
    }
};
TaskGroup = TaskGroup_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String, String])
], TaskGroup);
export { TaskGroup };
function computeTaskExecutionId(values) {
    let id = '';
    for (let i = 0; i < values.length; i++) {
        id += values[i].replace(/,/g, ',,') + ',';
    }
    return id;
}
let ProcessExecution = class ProcessExecution {
    constructor(process, varg1, varg2) {
        if (typeof process !== 'string') {
            throw illegalArgument('process');
        }
        this._args = [];
        this._process = process;
        if (varg1 !== undefined) {
            if (Array.isArray(varg1)) {
                this._args = varg1;
                this._options = varg2;
            }
            else {
                this._options = varg1;
            }
        }
    }
    get process() {
        return this._process;
    }
    set process(value) {
        if (typeof value !== 'string') {
            throw illegalArgument('process');
        }
        this._process = value;
    }
    get args() {
        return this._args;
    }
    set args(value) {
        if (!Array.isArray(value)) {
            value = [];
        }
        this._args = value;
    }
    get options() {
        return this._options;
    }
    set options(value) {
        this._options = value;
    }
    computeId() {
        const props = [];
        props.push('process');
        if (this._process !== undefined) {
            props.push(this._process);
        }
        if (this._args && this._args.length > 0) {
            for (const arg of this._args) {
                props.push(arg);
            }
        }
        return computeTaskExecutionId(props);
    }
};
ProcessExecution = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String, Object, Object])
], ProcessExecution);
export { ProcessExecution };
let ShellExecution = class ShellExecution {
    constructor(arg0, arg1, arg2) {
        this._args = [];
        if (Array.isArray(arg1)) {
            if (!arg0) {
                throw illegalArgument('command can\'t be undefined or null');
            }
            if (typeof arg0 !== 'string' && typeof arg0.value !== 'string') {
                throw illegalArgument('command');
            }
            this._command = arg0;
            this._args = arg1;
            this._options = arg2;
        }
        else {
            if (typeof arg0 !== 'string') {
                throw illegalArgument('commandLine');
            }
            this._commandLine = arg0;
            this._options = arg1;
        }
    }
    get commandLine() {
        return this._commandLine;
    }
    set commandLine(value) {
        if (typeof value !== 'string') {
            throw illegalArgument('commandLine');
        }
        this._commandLine = value;
    }
    get command() {
        return this._command ? this._command : '';
    }
    set command(value) {
        if (typeof value !== 'string' && typeof value.value !== 'string') {
            throw illegalArgument('command');
        }
        this._command = value;
    }
    get args() {
        return this._args;
    }
    set args(value) {
        this._args = value || [];
    }
    get options() {
        return this._options;
    }
    set options(value) {
        this._options = value;
    }
    computeId() {
        const props = [];
        props.push('shell');
        if (this._commandLine !== undefined) {
            props.push(this._commandLine);
        }
        if (this._command !== undefined) {
            props.push(typeof this._command === 'string' ? this._command : this._command.value);
        }
        if (this._args && this._args.length > 0) {
            for (const arg of this._args) {
                props.push(typeof arg === 'string' ? arg : arg.value);
            }
        }
        return computeTaskExecutionId(props);
    }
};
ShellExecution = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object, Object, Object])
], ShellExecution);
export { ShellExecution };
export var ShellQuoting;
(function (ShellQuoting) {
    ShellQuoting[ShellQuoting["Escape"] = 1] = "Escape";
    ShellQuoting[ShellQuoting["Strong"] = 2] = "Strong";
    ShellQuoting[ShellQuoting["Weak"] = 3] = "Weak";
})(ShellQuoting || (ShellQuoting = {}));
export var TaskScope;
(function (TaskScope) {
    TaskScope[TaskScope["Global"] = 1] = "Global";
    TaskScope[TaskScope["Workspace"] = 2] = "Workspace";
})(TaskScope || (TaskScope = {}));
export class CustomExecution {
    constructor(callback) {
        this._callback = callback;
    }
    computeId() {
        return 'customExecution' + generateUuid();
    }
    set callback(value) {
        this._callback = value;
    }
    get callback() {
        return this._callback;
    }
}
let Task = class Task {
    static { Task_1 = this; }
    static { this.ExtensionCallbackType = 'customExecution'; }
    static { this.ProcessType = 'process'; }
    static { this.ShellType = 'shell'; }
    static { this.EmptyType = '$empty'; }
    constructor(definition, arg2, arg3, arg4, arg5, arg6) {
        this.__deprecated = false;
        this._definition = this.definition = definition;
        let problemMatchers;
        if (typeof arg2 === 'string') {
            this._name = this.name = arg2;
            this._source = this.source = arg3;
            this.execution = arg4;
            problemMatchers = arg5;
            this.__deprecated = true;
        }
        else if (arg2 === TaskScope.Global || arg2 === TaskScope.Workspace) {
            this.target = arg2;
            this._name = this.name = arg3;
            this._source = this.source = arg4;
            this.execution = arg5;
            problemMatchers = arg6;
        }
        else {
            this.target = arg2;
            this._name = this.name = arg3;
            this._source = this.source = arg4;
            this.execution = arg5;
            problemMatchers = arg6;
        }
        if (typeof problemMatchers === 'string') {
            this._problemMatchers = [problemMatchers];
            this._hasDefinedMatchers = true;
        }
        else if (Array.isArray(problemMatchers)) {
            this._problemMatchers = problemMatchers;
            this._hasDefinedMatchers = true;
        }
        else {
            this._problemMatchers = [];
            this._hasDefinedMatchers = false;
        }
        this._isBackground = false;
        this._presentationOptions = Object.create(null);
        this._runOptions = Object.create(null);
    }
    get _id() {
        return this.__id;
    }
    set _id(value) {
        this.__id = value;
    }
    get _deprecated() {
        return this.__deprecated;
    }
    clear() {
        if (this.__id === undefined) {
            return;
        }
        this.__id = undefined;
        this._scope = undefined;
        this.computeDefinitionBasedOnExecution();
    }
    computeDefinitionBasedOnExecution() {
        if (this._execution instanceof ProcessExecution) {
            this._definition = {
                type: Task_1.ProcessType,
                id: this._execution.computeId()
            };
        }
        else if (this._execution instanceof ShellExecution) {
            this._definition = {
                type: Task_1.ShellType,
                id: this._execution.computeId()
            };
        }
        else if (this._execution instanceof CustomExecution) {
            this._definition = {
                type: Task_1.ExtensionCallbackType,
                id: this._execution.computeId()
            };
        }
        else {
            this._definition = {
                type: Task_1.EmptyType,
                id: generateUuid()
            };
        }
    }
    get definition() {
        return this._definition;
    }
    set definition(value) {
        if (value === undefined || value === null) {
            throw illegalArgument('Kind can\'t be undefined or null');
        }
        this.clear();
        this._definition = value;
    }
    get scope() {
        return this._scope;
    }
    set target(value) {
        this.clear();
        this._scope = value;
    }
    get name() {
        return this._name;
    }
    set name(value) {
        if (typeof value !== 'string') {
            throw illegalArgument('name');
        }
        this.clear();
        this._name = value;
    }
    get execution() {
        return this._execution;
    }
    set execution(value) {
        if (value === null) {
            value = undefined;
        }
        this.clear();
        this._execution = value;
        const type = this._definition.type;
        if (Task_1.EmptyType === type || Task_1.ProcessType === type || Task_1.ShellType === type || Task_1.ExtensionCallbackType === type) {
            this.computeDefinitionBasedOnExecution();
        }
    }
    get problemMatchers() {
        return this._problemMatchers;
    }
    set problemMatchers(value) {
        if (!Array.isArray(value)) {
            this.clear();
            this._problemMatchers = [];
            this._hasDefinedMatchers = false;
            return;
        }
        else {
            this.clear();
            this._problemMatchers = value;
            this._hasDefinedMatchers = true;
        }
    }
    get hasDefinedMatchers() {
        return this._hasDefinedMatchers;
    }
    get isBackground() {
        return this._isBackground;
    }
    set isBackground(value) {
        if (value !== true && value !== false) {
            value = false;
        }
        this.clear();
        this._isBackground = value;
    }
    get source() {
        return this._source;
    }
    set source(value) {
        if (typeof value !== 'string' || value.length === 0) {
            throw illegalArgument('source must be a string of length > 0');
        }
        this.clear();
        this._source = value;
    }
    get group() {
        return this._group;
    }
    set group(value) {
        if (value === null) {
            value = undefined;
        }
        this.clear();
        this._group = value;
    }
    get detail() {
        return this._detail;
    }
    set detail(value) {
        if (value === null) {
            value = undefined;
        }
        this._detail = value;
    }
    get presentationOptions() {
        return this._presentationOptions;
    }
    set presentationOptions(value) {
        if (value === null || value === undefined) {
            value = Object.create(null);
        }
        this.clear();
        this._presentationOptions = value;
    }
    get runOptions() {
        return this._runOptions;
    }
    set runOptions(value) {
        if (value === null || value === undefined) {
            value = Object.create(null);
        }
        this.clear();
        this._runOptions = value;
    }
};
Task = Task_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], Task);
export { Task };
export var ProgressLocation;
(function (ProgressLocation) {
    ProgressLocation[ProgressLocation["SourceControl"] = 1] = "SourceControl";
    ProgressLocation[ProgressLocation["Window"] = 10] = "Window";
    ProgressLocation[ProgressLocation["Notification"] = 15] = "Notification";
})(ProgressLocation || (ProgressLocation = {}));
export var ViewBadge;
(function (ViewBadge) {
    function isViewBadge(thing) {
        const viewBadgeThing = thing;
        if (!isNumber(viewBadgeThing.value)) {
            console.log('INVALID view badge, invalid value', viewBadgeThing.value);
            return false;
        }
        if (viewBadgeThing.tooltip && !isString(viewBadgeThing.tooltip)) {
            console.log('INVALID view badge, invalid tooltip', viewBadgeThing.tooltip);
            return false;
        }
        return true;
    }
    ViewBadge.isViewBadge = isViewBadge;
})(ViewBadge || (ViewBadge = {}));
let TreeItem = TreeItem_1 = class TreeItem {
    static isTreeItem(thing, extension) {
        const treeItemThing = thing;
        if (treeItemThing.checkboxState !== undefined) {
            const checkbox = isNumber(treeItemThing.checkboxState) ? treeItemThing.checkboxState :
                isObject(treeItemThing.checkboxState) && isNumber(treeItemThing.checkboxState.state) ? treeItemThing.checkboxState.state : undefined;
            const tooltip = !isNumber(treeItemThing.checkboxState) && isObject(treeItemThing.checkboxState) ? treeItemThing.checkboxState.tooltip : undefined;
            if (checkbox === undefined || (checkbox !== TreeItemCheckboxState.Checked && checkbox !== TreeItemCheckboxState.Unchecked) || (tooltip !== undefined && !isString(tooltip))) {
                console.log('INVALID tree item, invalid checkboxState', treeItemThing.checkboxState);
                return false;
            }
        }
        if (thing instanceof TreeItem_1) {
            return true;
        }
        if (treeItemThing.label !== undefined && !isString(treeItemThing.label) && !(treeItemThing.label?.label)) {
            console.log('INVALID tree item, invalid label', treeItemThing.label);
            return false;
        }
        if ((treeItemThing.id !== undefined) && !isString(treeItemThing.id)) {
            console.log('INVALID tree item, invalid id', treeItemThing.id);
            return false;
        }
        if ((treeItemThing.iconPath !== undefined) && !isString(treeItemThing.iconPath) && !URI.isUri(treeItemThing.iconPath) && (!treeItemThing.iconPath || !isString(treeItemThing.iconPath.id))) {
            const asLightAndDarkThing = treeItemThing.iconPath;
            if (!asLightAndDarkThing || (!isString(asLightAndDarkThing.light) && !URI.isUri(asLightAndDarkThing.light) && !isString(asLightAndDarkThing.dark) && !URI.isUri(asLightAndDarkThing.dark))) {
                console.log('INVALID tree item, invalid iconPath', treeItemThing.iconPath);
                return false;
            }
        }
        if ((treeItemThing.description !== undefined) && !isString(treeItemThing.description) && (typeof treeItemThing.description !== 'boolean')) {
            console.log('INVALID tree item, invalid description', treeItemThing.description);
            return false;
        }
        if ((treeItemThing.resourceUri !== undefined) && !URI.isUri(treeItemThing.resourceUri)) {
            console.log('INVALID tree item, invalid resourceUri', treeItemThing.resourceUri);
            return false;
        }
        if ((treeItemThing.tooltip !== undefined) && !isString(treeItemThing.tooltip) && !(treeItemThing.tooltip instanceof MarkdownString)) {
            console.log('INVALID tree item, invalid tooltip', treeItemThing.tooltip);
            return false;
        }
        if ((treeItemThing.command !== undefined) && !treeItemThing.command.command) {
            console.log('INVALID tree item, invalid command', treeItemThing.command);
            return false;
        }
        if ((treeItemThing.collapsibleState !== undefined) && (treeItemThing.collapsibleState < TreeItemCollapsibleState.None) && (treeItemThing.collapsibleState > TreeItemCollapsibleState.Expanded)) {
            console.log('INVALID tree item, invalid collapsibleState', treeItemThing.collapsibleState);
            return false;
        }
        if ((treeItemThing.contextValue !== undefined) && !isString(treeItemThing.contextValue)) {
            console.log('INVALID tree item, invalid contextValue', treeItemThing.contextValue);
            return false;
        }
        if ((treeItemThing.accessibilityInformation !== undefined) && !treeItemThing.accessibilityInformation?.label) {
            console.log('INVALID tree item, invalid accessibilityInformation', treeItemThing.accessibilityInformation);
            return false;
        }
        return true;
    }
    constructor(arg1, collapsibleState = TreeItemCollapsibleState.None) {
        this.collapsibleState = collapsibleState;
        if (URI.isUri(arg1)) {
            this.resourceUri = arg1;
        }
        else {
            this.label = arg1;
        }
    }
};
TreeItem = TreeItem_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object, Number])
], TreeItem);
export { TreeItem };
export var TreeItemCollapsibleState;
(function (TreeItemCollapsibleState) {
    TreeItemCollapsibleState[TreeItemCollapsibleState["None"] = 0] = "None";
    TreeItemCollapsibleState[TreeItemCollapsibleState["Collapsed"] = 1] = "Collapsed";
    TreeItemCollapsibleState[TreeItemCollapsibleState["Expanded"] = 2] = "Expanded";
})(TreeItemCollapsibleState || (TreeItemCollapsibleState = {}));
export var TreeItemCheckboxState;
(function (TreeItemCheckboxState) {
    TreeItemCheckboxState[TreeItemCheckboxState["Unchecked"] = 0] = "Unchecked";
    TreeItemCheckboxState[TreeItemCheckboxState["Checked"] = 1] = "Checked";
})(TreeItemCheckboxState || (TreeItemCheckboxState = {}));
let DataTransferItem = class DataTransferItem {
    async asString() {
        return typeof this.value === 'string' ? this.value : JSON.stringify(this.value);
    }
    asFile() {
        return undefined;
    }
    constructor(value) {
        this.value = value;
    }
};
DataTransferItem = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object])
], DataTransferItem);
export { DataTransferItem };
export class InternalDataTransferItem extends DataTransferItem {
}
export class InternalFileDataTransferItem extends InternalDataTransferItem {
    #file;
    constructor(file) {
        super('');
        this.#file = file;
    }
    asFile() {
        return this.#file;
    }
}
export class DataTransferFile {
    constructor(name, uri, itemId, getData) {
        this.name = name;
        this.uri = uri;
        this._itemId = itemId;
        this._getData = getData;
    }
    data() {
        return this._getData();
    }
}
let DataTransfer = class DataTransfer {
    #items = new Map();
    constructor(init) {
        for (const [mime, item] of init ?? []) {
            const existing = this.#items.get(this.#normalizeMime(mime));
            if (existing) {
                existing.push(item);
            }
            else {
                this.#items.set(this.#normalizeMime(mime), [item]);
            }
        }
    }
    get(mimeType) {
        return this.#items.get(this.#normalizeMime(mimeType))?.[0];
    }
    set(mimeType, value) {
        this.#items.set(this.#normalizeMime(mimeType), [value]);
    }
    forEach(callbackfn, thisArg) {
        for (const [mime, items] of this.#items) {
            for (const item of items) {
                callbackfn.call(thisArg, item, mime, this);
            }
        }
    }
    *[Symbol.iterator]() {
        for (const [mime, items] of this.#items) {
            for (const item of items) {
                yield [mime, item];
            }
        }
    }
    #normalizeMime(mimeType) {
        return mimeType.toLowerCase();
    }
};
DataTransfer = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object])
], DataTransfer);
export { DataTransfer };
let DocumentDropEdit = class DocumentDropEdit {
    constructor(insertText, title, kind) {
        this.insertText = insertText;
        this.title = title;
        this.kind = kind;
    }
};
DocumentDropEdit = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object, String, DocumentDropOrPasteEditKind])
], DocumentDropEdit);
export { DocumentDropEdit };
export var DocumentPasteTriggerKind;
(function (DocumentPasteTriggerKind) {
    DocumentPasteTriggerKind[DocumentPasteTriggerKind["Automatic"] = 0] = "Automatic";
    DocumentPasteTriggerKind[DocumentPasteTriggerKind["PasteAs"] = 1] = "PasteAs";
})(DocumentPasteTriggerKind || (DocumentPasteTriggerKind = {}));
export class DocumentDropOrPasteEditKind {
    static { this.sep = '.'; }
    constructor(value) {
        this.value = value;
    }
    append(...parts) {
        return new DocumentDropOrPasteEditKind((this.value ? [this.value, ...parts] : parts).join(DocumentDropOrPasteEditKind.sep));
    }
    intersects(other) {
        return this.contains(other) || other.contains(this);
    }
    contains(other) {
        return this.value === other.value || other.value.startsWith(this.value + DocumentDropOrPasteEditKind.sep);
    }
}
DocumentDropOrPasteEditKind.Empty = new DocumentDropOrPasteEditKind('');
export class DocumentPasteEdit {
    constructor(insertText, title, kind) {
        this.title = title;
        this.insertText = insertText;
        this.kind = kind;
    }
}
let ThemeIcon = class ThemeIcon {
    constructor(id, color) {
        this.id = id;
        this.color = color;
    }
    static isThemeIcon(thing) {
        if (typeof thing.id !== 'string') {
            console.log('INVALID ThemeIcon, invalid id', thing.id);
            return false;
        }
        return true;
    }
};
ThemeIcon = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String, ThemeColor])
], ThemeIcon);
export { ThemeIcon };
ThemeIcon.File = new ThemeIcon('file');
ThemeIcon.Folder = new ThemeIcon('folder');
let ThemeColor = class ThemeColor {
    constructor(id) {
        this.id = id;
    }
};
ThemeColor = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String])
], ThemeColor);
export { ThemeColor };
export var ConfigurationTarget;
(function (ConfigurationTarget) {
    ConfigurationTarget[ConfigurationTarget["Global"] = 1] = "Global";
    ConfigurationTarget[ConfigurationTarget["Workspace"] = 2] = "Workspace";
    ConfigurationTarget[ConfigurationTarget["WorkspaceFolder"] = 3] = "WorkspaceFolder";
})(ConfigurationTarget || (ConfigurationTarget = {}));
let RelativePattern = class RelativePattern {
    get base() {
        return this._base;
    }
    set base(base) {
        this._base = base;
        this._baseUri = URI.file(base);
    }
    get baseUri() {
        return this._baseUri;
    }
    set baseUri(baseUri) {
        this._baseUri = baseUri;
        this._base = baseUri.fsPath;
    }
    constructor(base, pattern) {
        if (typeof base !== 'string') {
            if (!base || !URI.isUri(base) && !URI.isUri(base.uri)) {
                throw illegalArgument('base');
            }
        }
        if (typeof pattern !== 'string') {
            throw illegalArgument('pattern');
        }
        if (typeof base === 'string') {
            this.baseUri = URI.file(base);
        }
        else if (URI.isUri(base)) {
            this.baseUri = base;
        }
        else {
            this.baseUri = base.uri;
        }
        this.pattern = pattern;
    }
    toJSON() {
        return {
            pattern: this.pattern,
            base: this.base,
            baseUri: this.baseUri.toJSON()
        };
    }
};
RelativePattern = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object, String])
], RelativePattern);
export { RelativePattern };
const breakpointIds = new WeakMap();
export function setBreakpointId(bp, id) {
    breakpointIds.set(bp, id);
}
let Breakpoint = class Breakpoint {
    constructor(enabled, condition, hitCondition, logMessage, mode) {
        this.enabled = typeof enabled === 'boolean' ? enabled : true;
        if (typeof condition === 'string') {
            this.condition = condition;
        }
        if (typeof hitCondition === 'string') {
            this.hitCondition = hitCondition;
        }
        if (typeof logMessage === 'string') {
            this.logMessage = logMessage;
        }
        if (typeof mode === 'string') {
            this.mode = mode;
        }
    }
    get id() {
        if (!this._id) {
            this._id = breakpointIds.get(this) ?? generateUuid();
        }
        return this._id;
    }
};
Breakpoint = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Boolean, String, String, String, String])
], Breakpoint);
export { Breakpoint };
let SourceBreakpoint = class SourceBreakpoint extends Breakpoint {
    constructor(location, enabled, condition, hitCondition, logMessage, mode) {
        super(enabled, condition, hitCondition, logMessage, mode);
        if (location === null) {
            throw illegalArgument('location');
        }
        this.location = location;
    }
};
SourceBreakpoint = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Location, Boolean, String, String, String, String])
], SourceBreakpoint);
export { SourceBreakpoint };
let FunctionBreakpoint = class FunctionBreakpoint extends Breakpoint {
    constructor(functionName, enabled, condition, hitCondition, logMessage, mode) {
        super(enabled, condition, hitCondition, logMessage, mode);
        this.functionName = functionName;
    }
};
FunctionBreakpoint = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String, Boolean, String, String, String, String])
], FunctionBreakpoint);
export { FunctionBreakpoint };
let DataBreakpoint = class DataBreakpoint extends Breakpoint {
    constructor(label, dataId, canPersist, enabled, condition, hitCondition, logMessage, mode) {
        super(enabled, condition, hitCondition, logMessage, mode);
        if (!dataId) {
            throw illegalArgument('dataId');
        }
        this.label = label;
        this.dataId = dataId;
        this.canPersist = canPersist;
    }
};
DataBreakpoint = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String, String, Boolean, Boolean, String, String, String, String])
], DataBreakpoint);
export { DataBreakpoint };
let DebugAdapterExecutable = class DebugAdapterExecutable {
    constructor(command, args, options) {
        this.command = command;
        this.args = args || [];
        this.options = options;
    }
};
DebugAdapterExecutable = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String, Array, Object])
], DebugAdapterExecutable);
export { DebugAdapterExecutable };
let DebugAdapterServer = class DebugAdapterServer {
    constructor(port, host) {
        this.port = port;
        this.host = host;
    }
};
DebugAdapterServer = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Number, String])
], DebugAdapterServer);
export { DebugAdapterServer };
let DebugAdapterNamedPipeServer = class DebugAdapterNamedPipeServer {
    constructor(path) {
        this.path = path;
    }
};
DebugAdapterNamedPipeServer = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String])
], DebugAdapterNamedPipeServer);
export { DebugAdapterNamedPipeServer };
let DebugAdapterInlineImplementation = class DebugAdapterInlineImplementation {
    constructor(impl) {
        this.implementation = impl;
    }
};
DebugAdapterInlineImplementation = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object])
], DebugAdapterInlineImplementation);
export { DebugAdapterInlineImplementation };
export class DebugStackFrame {
    constructor(session, threadId, frameId) {
        this.session = session;
        this.threadId = threadId;
        this.frameId = frameId;
    }
}
export class DebugThread {
    constructor(session, threadId) {
        this.session = session;
        this.threadId = threadId;
    }
}
let EvaluatableExpression = class EvaluatableExpression {
    constructor(range, expression) {
        this.range = range;
        this.expression = expression;
    }
};
EvaluatableExpression = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Function, String])
], EvaluatableExpression);
export { EvaluatableExpression };
export var InlineCompletionTriggerKind;
(function (InlineCompletionTriggerKind) {
    InlineCompletionTriggerKind[InlineCompletionTriggerKind["Invoke"] = 0] = "Invoke";
    InlineCompletionTriggerKind[InlineCompletionTriggerKind["Automatic"] = 1] = "Automatic";
})(InlineCompletionTriggerKind || (InlineCompletionTriggerKind = {}));
let InlineValueText = class InlineValueText {
    constructor(range, text) {
        this.range = range;
        this.text = text;
    }
};
InlineValueText = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Range, String])
], InlineValueText);
export { InlineValueText };
let InlineValueVariableLookup = class InlineValueVariableLookup {
    constructor(range, variableName, caseSensitiveLookup = true) {
        this.range = range;
        this.variableName = variableName;
        this.caseSensitiveLookup = caseSensitiveLookup;
    }
};
InlineValueVariableLookup = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Range, String, Boolean])
], InlineValueVariableLookup);
export { InlineValueVariableLookup };
let InlineValueEvaluatableExpression = class InlineValueEvaluatableExpression {
    constructor(range, expression) {
        this.range = range;
        this.expression = expression;
    }
};
InlineValueEvaluatableExpression = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Range, String])
], InlineValueEvaluatableExpression);
export { InlineValueEvaluatableExpression };
let InlineValueContext = class InlineValueContext {
    constructor(frameId, range) {
        this.frameId = frameId;
        this.stoppedLocation = range;
    }
};
InlineValueContext = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Number, Function])
], InlineValueContext);
export { InlineValueContext };
export var NewSymbolNameTag;
(function (NewSymbolNameTag) {
    NewSymbolNameTag[NewSymbolNameTag["AIGenerated"] = 1] = "AIGenerated";
})(NewSymbolNameTag || (NewSymbolNameTag = {}));
export var NewSymbolNameTriggerKind;
(function (NewSymbolNameTriggerKind) {
    NewSymbolNameTriggerKind[NewSymbolNameTriggerKind["Invoke"] = 0] = "Invoke";
    NewSymbolNameTriggerKind[NewSymbolNameTriggerKind["Automatic"] = 1] = "Automatic";
})(NewSymbolNameTriggerKind || (NewSymbolNameTriggerKind = {}));
export class NewSymbolName {
    constructor(newSymbolName, tags) {
        this.newSymbolName = newSymbolName;
        this.tags = tags;
    }
}
export var FileChangeType;
(function (FileChangeType) {
    FileChangeType[FileChangeType["Changed"] = 1] = "Changed";
    FileChangeType[FileChangeType["Created"] = 2] = "Created";
    FileChangeType[FileChangeType["Deleted"] = 3] = "Deleted";
})(FileChangeType || (FileChangeType = {}));
let FileSystemError = FileSystemError_1 = class FileSystemError extends Error {
    static FileExists(messageOrUri) {
        return new FileSystemError_1(messageOrUri, FileSystemProviderErrorCode.FileExists, FileSystemError_1.FileExists);
    }
    static FileNotFound(messageOrUri) {
        return new FileSystemError_1(messageOrUri, FileSystemProviderErrorCode.FileNotFound, FileSystemError_1.FileNotFound);
    }
    static FileNotADirectory(messageOrUri) {
        return new FileSystemError_1(messageOrUri, FileSystemProviderErrorCode.FileNotADirectory, FileSystemError_1.FileNotADirectory);
    }
    static FileIsADirectory(messageOrUri) {
        return new FileSystemError_1(messageOrUri, FileSystemProviderErrorCode.FileIsADirectory, FileSystemError_1.FileIsADirectory);
    }
    static NoPermissions(messageOrUri) {
        return new FileSystemError_1(messageOrUri, FileSystemProviderErrorCode.NoPermissions, FileSystemError_1.NoPermissions);
    }
    static Unavailable(messageOrUri) {
        return new FileSystemError_1(messageOrUri, FileSystemProviderErrorCode.Unavailable, FileSystemError_1.Unavailable);
    }
    constructor(uriOrMessage, code = FileSystemProviderErrorCode.Unknown, terminator) {
        super(URI.isUri(uriOrMessage) ? uriOrMessage.toString(true) : uriOrMessage);
        this.code = terminator?.name ?? 'Unknown';
        markAsFileSystemProviderError(this, code);
        Object.setPrototypeOf(this, FileSystemError_1.prototype);
        if (typeof Error.captureStackTrace === 'function' && typeof terminator === 'function') {
            Error.captureStackTrace(this, terminator);
        }
    }
};
FileSystemError = FileSystemError_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object, String, Function])
], FileSystemError);
export { FileSystemError };
let FoldingRange = class FoldingRange {
    constructor(start, end, kind) {
        this.start = start;
        this.end = end;
        this.kind = kind;
    }
};
FoldingRange = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Number, Number, Number])
], FoldingRange);
export { FoldingRange };
export var FoldingRangeKind;
(function (FoldingRangeKind) {
    FoldingRangeKind[FoldingRangeKind["Comment"] = 1] = "Comment";
    FoldingRangeKind[FoldingRangeKind["Imports"] = 2] = "Imports";
    FoldingRangeKind[FoldingRangeKind["Region"] = 3] = "Region";
})(FoldingRangeKind || (FoldingRangeKind = {}));
export var CommentThreadCollapsibleState;
(function (CommentThreadCollapsibleState) {
    CommentThreadCollapsibleState[CommentThreadCollapsibleState["Collapsed"] = 0] = "Collapsed";
    CommentThreadCollapsibleState[CommentThreadCollapsibleState["Expanded"] = 1] = "Expanded";
})(CommentThreadCollapsibleState || (CommentThreadCollapsibleState = {}));
export var CommentMode;
(function (CommentMode) {
    CommentMode[CommentMode["Editing"] = 0] = "Editing";
    CommentMode[CommentMode["Preview"] = 1] = "Preview";
})(CommentMode || (CommentMode = {}));
export var CommentState;
(function (CommentState) {
    CommentState[CommentState["Published"] = 0] = "Published";
    CommentState[CommentState["Draft"] = 1] = "Draft";
})(CommentState || (CommentState = {}));
export var CommentThreadState;
(function (CommentThreadState) {
    CommentThreadState[CommentThreadState["Unresolved"] = 0] = "Unresolved";
    CommentThreadState[CommentThreadState["Resolved"] = 1] = "Resolved";
})(CommentThreadState || (CommentThreadState = {}));
export var CommentThreadApplicability;
(function (CommentThreadApplicability) {
    CommentThreadApplicability[CommentThreadApplicability["Current"] = 0] = "Current";
    CommentThreadApplicability[CommentThreadApplicability["Outdated"] = 1] = "Outdated";
})(CommentThreadApplicability || (CommentThreadApplicability = {}));
export var CommentThreadFocus;
(function (CommentThreadFocus) {
    CommentThreadFocus[CommentThreadFocus["Reply"] = 1] = "Reply";
    CommentThreadFocus[CommentThreadFocus["Comment"] = 2] = "Comment";
})(CommentThreadFocus || (CommentThreadFocus = {}));
export class SemanticTokensLegend {
    constructor(tokenTypes, tokenModifiers = []) {
        this.tokenTypes = tokenTypes;
        this.tokenModifiers = tokenModifiers;
    }
}
function isStrArrayOrUndefined(arg) {
    return ((typeof arg === 'undefined') || isStringArray(arg));
}
export class SemanticTokensBuilder {
    constructor(legend) {
        this._prevLine = 0;
        this._prevChar = 0;
        this._dataIsSortedAndDeltaEncoded = true;
        this._data = [];
        this._dataLen = 0;
        this._tokenTypeStrToInt = new Map();
        this._tokenModifierStrToInt = new Map();
        this._hasLegend = false;
        if (legend) {
            this._hasLegend = true;
            for (let i = 0, len = legend.tokenTypes.length; i < len; i++) {
                this._tokenTypeStrToInt.set(legend.tokenTypes[i], i);
            }
            for (let i = 0, len = legend.tokenModifiers.length; i < len; i++) {
                this._tokenModifierStrToInt.set(legend.tokenModifiers[i], i);
            }
        }
    }
    push(arg0, arg1, arg2, arg3, arg4) {
        if (typeof arg0 === 'number' && typeof arg1 === 'number' && typeof arg2 === 'number' && typeof arg3 === 'number' && (typeof arg4 === 'number' || typeof arg4 === 'undefined')) {
            if (typeof arg4 === 'undefined') {
                arg4 = 0;
            }
            return this._pushEncoded(arg0, arg1, arg2, arg3, arg4);
        }
        if (Range.isRange(arg0) && typeof arg1 === 'string' && isStrArrayOrUndefined(arg2)) {
            return this._push(arg0, arg1, arg2);
        }
        throw illegalArgument();
    }
    _push(range, tokenType, tokenModifiers) {
        if (!this._hasLegend) {
            throw new Error('Legend must be provided in constructor');
        }
        if (range.start.line !== range.end.line) {
            throw new Error('`range` cannot span multiple lines');
        }
        if (!this._tokenTypeStrToInt.has(tokenType)) {
            throw new Error('`tokenType` is not in the provided legend');
        }
        const line = range.start.line;
        const char = range.start.character;
        const length = range.end.character - range.start.character;
        const nTokenType = this._tokenTypeStrToInt.get(tokenType);
        let nTokenModifiers = 0;
        if (tokenModifiers) {
            for (const tokenModifier of tokenModifiers) {
                if (!this._tokenModifierStrToInt.has(tokenModifier)) {
                    throw new Error('`tokenModifier` is not in the provided legend');
                }
                const nTokenModifier = this._tokenModifierStrToInt.get(tokenModifier);
                nTokenModifiers |= (1 << nTokenModifier) >>> 0;
            }
        }
        this._pushEncoded(line, char, length, nTokenType, nTokenModifiers);
    }
    _pushEncoded(line, char, length, tokenType, tokenModifiers) {
        if (this._dataIsSortedAndDeltaEncoded && (line < this._prevLine || (line === this._prevLine && char < this._prevChar))) {
            this._dataIsSortedAndDeltaEncoded = false;
            const tokenCount = (this._data.length / 5) | 0;
            let prevLine = 0;
            let prevChar = 0;
            for (let i = 0; i < tokenCount; i++) {
                let line = this._data[5 * i];
                let char = this._data[5 * i + 1];
                if (line === 0) {
                    line = prevLine;
                    char += prevChar;
                }
                else {
                    line += prevLine;
                }
                this._data[5 * i] = line;
                this._data[5 * i + 1] = char;
                prevLine = line;
                prevChar = char;
            }
        }
        let pushLine = line;
        let pushChar = char;
        if (this._dataIsSortedAndDeltaEncoded && this._dataLen > 0) {
            pushLine -= this._prevLine;
            if (pushLine === 0) {
                pushChar -= this._prevChar;
            }
        }
        this._data[this._dataLen++] = pushLine;
        this._data[this._dataLen++] = pushChar;
        this._data[this._dataLen++] = length;
        this._data[this._dataLen++] = tokenType;
        this._data[this._dataLen++] = tokenModifiers;
        this._prevLine = line;
        this._prevChar = char;
    }
    static _sortAndDeltaEncode(data) {
        const pos = [];
        const tokenCount = (data.length / 5) | 0;
        for (let i = 0; i < tokenCount; i++) {
            pos[i] = i;
        }
        pos.sort((a, b) => {
            const aLine = data[5 * a];
            const bLine = data[5 * b];
            if (aLine === bLine) {
                const aChar = data[5 * a + 1];
                const bChar = data[5 * b + 1];
                return aChar - bChar;
            }
            return aLine - bLine;
        });
        const result = new Uint32Array(data.length);
        let prevLine = 0;
        let prevChar = 0;
        for (let i = 0; i < tokenCount; i++) {
            const srcOffset = 5 * pos[i];
            const line = data[srcOffset + 0];
            const char = data[srcOffset + 1];
            const length = data[srcOffset + 2];
            const tokenType = data[srcOffset + 3];
            const tokenModifiers = data[srcOffset + 4];
            const pushLine = line - prevLine;
            const pushChar = (pushLine === 0 ? char - prevChar : char);
            const dstOffset = 5 * i;
            result[dstOffset + 0] = pushLine;
            result[dstOffset + 1] = pushChar;
            result[dstOffset + 2] = length;
            result[dstOffset + 3] = tokenType;
            result[dstOffset + 4] = tokenModifiers;
            prevLine = line;
            prevChar = char;
        }
        return result;
    }
    build(resultId) {
        if (!this._dataIsSortedAndDeltaEncoded) {
            return new SemanticTokens(SemanticTokensBuilder._sortAndDeltaEncode(this._data), resultId);
        }
        return new SemanticTokens(new Uint32Array(this._data), resultId);
    }
}
export class SemanticTokens {
    constructor(data, resultId) {
        this.resultId = resultId;
        this.data = data;
    }
}
export class SemanticTokensEdit {
    constructor(start, deleteCount, data) {
        this.start = start;
        this.deleteCount = deleteCount;
        this.data = data;
    }
}
export class SemanticTokensEdits {
    constructor(edits, resultId) {
        this.resultId = resultId;
        this.edits = edits;
    }
}
export var DebugConsoleMode;
(function (DebugConsoleMode) {
    DebugConsoleMode[DebugConsoleMode["Separate"] = 0] = "Separate";
    DebugConsoleMode[DebugConsoleMode["MergeWithParent"] = 1] = "MergeWithParent";
})(DebugConsoleMode || (DebugConsoleMode = {}));
export class DebugVisualization {
    constructor(name) {
        this.name = name;
    }
}
export var QuickInputButtonLocation;
(function (QuickInputButtonLocation) {
    QuickInputButtonLocation[QuickInputButtonLocation["Title"] = 1] = "Title";
    QuickInputButtonLocation[QuickInputButtonLocation["Inline"] = 2] = "Inline";
})(QuickInputButtonLocation || (QuickInputButtonLocation = {}));
let QuickInputButtons = class QuickInputButtons {
    static { this.Back = { iconPath: new ThemeIcon('arrow-left') }; }
    constructor() { }
};
QuickInputButtons = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [])
], QuickInputButtons);
export { QuickInputButtons };
export var QuickPickItemKind;
(function (QuickPickItemKind) {
    QuickPickItemKind[QuickPickItemKind["Separator"] = -1] = "Separator";
    QuickPickItemKind[QuickPickItemKind["Default"] = 0] = "Default";
})(QuickPickItemKind || (QuickPickItemKind = {}));
export var InputBoxValidationSeverity;
(function (InputBoxValidationSeverity) {
    InputBoxValidationSeverity[InputBoxValidationSeverity["Info"] = 1] = "Info";
    InputBoxValidationSeverity[InputBoxValidationSeverity["Warning"] = 2] = "Warning";
    InputBoxValidationSeverity[InputBoxValidationSeverity["Error"] = 3] = "Error";
})(InputBoxValidationSeverity || (InputBoxValidationSeverity = {}));
export var ExtensionKind;
(function (ExtensionKind) {
    ExtensionKind[ExtensionKind["UI"] = 1] = "UI";
    ExtensionKind[ExtensionKind["Workspace"] = 2] = "Workspace";
})(ExtensionKind || (ExtensionKind = {}));
export class FileDecoration {
    static validate(d) {
        if (typeof d.badge === 'string') {
            let len = nextCharLength(d.badge, 0);
            if (len < d.badge.length) {
                len += nextCharLength(d.badge, len);
            }
            if (d.badge.length > len) {
                throw new Error(`The 'badge'-property must be undefined or a short character`);
            }
        }
        else if (d.badge) {
            if (!ThemeIcon.isThemeIcon(d.badge)) {
                throw new Error(`The 'badge'-property is not a valid ThemeIcon`);
            }
        }
        if (!d.color && !d.badge && !d.tooltip) {
            throw new Error(`The decoration is empty`);
        }
        return true;
    }
    constructor(badge, tooltip, color) {
        this.badge = badge;
        this.tooltip = tooltip;
        this.color = color;
    }
}
let ColorTheme = class ColorTheme {
    constructor(kind) {
        this.kind = kind;
    }
};
ColorTheme = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Number])
], ColorTheme);
export { ColorTheme };
export var ColorThemeKind;
(function (ColorThemeKind) {
    ColorThemeKind[ColorThemeKind["Light"] = 1] = "Light";
    ColorThemeKind[ColorThemeKind["Dark"] = 2] = "Dark";
    ColorThemeKind[ColorThemeKind["HighContrast"] = 3] = "HighContrast";
    ColorThemeKind[ColorThemeKind["HighContrastLight"] = 4] = "HighContrastLight";
})(ColorThemeKind || (ColorThemeKind = {}));
export class NotebookRange {
    static isNotebookRange(thing) {
        if (thing instanceof NotebookRange) {
            return true;
        }
        if (!thing) {
            return false;
        }
        return typeof thing.start === 'number'
            && typeof thing.end === 'number';
    }
    get start() {
        return this._start;
    }
    get end() {
        return this._end;
    }
    get isEmpty() {
        return this._start === this._end;
    }
    constructor(start, end) {
        if (start < 0) {
            throw illegalArgument('start must be positive');
        }
        if (end < 0) {
            throw illegalArgument('end must be positive');
        }
        if (start <= end) {
            this._start = start;
            this._end = end;
        }
        else {
            this._start = end;
            this._end = start;
        }
    }
    with(change) {
        let start = this._start;
        let end = this._end;
        if (change.start !== undefined) {
            start = change.start;
        }
        if (change.end !== undefined) {
            end = change.end;
        }
        if (start === this._start && end === this._end) {
            return this;
        }
        return new NotebookRange(start, end);
    }
}
export class NotebookCellData {
    static validate(data) {
        if (typeof data.kind !== 'number') {
            throw new Error('NotebookCellData MUST have \'kind\' property');
        }
        if (typeof data.value !== 'string') {
            throw new Error('NotebookCellData MUST have \'value\' property');
        }
        if (typeof data.languageId !== 'string') {
            throw new Error('NotebookCellData MUST have \'languageId\' property');
        }
    }
    static isNotebookCellDataArray(value) {
        return Array.isArray(value) && value.every(elem => NotebookCellData.isNotebookCellData(elem));
    }
    static isNotebookCellData(value) {
        return true;
    }
    constructor(kind, value, languageId, mime, outputs, metadata, executionSummary) {
        this.kind = kind;
        this.value = value;
        this.languageId = languageId;
        this.mime = mime;
        this.outputs = outputs ?? [];
        this.metadata = metadata;
        this.executionSummary = executionSummary;
        NotebookCellData.validate(this);
    }
}
export class NotebookData {
    constructor(cells) {
        this.cells = cells;
    }
}
export class NotebookCellOutputItem {
    static isNotebookCellOutputItem(obj) {
        if (obj instanceof NotebookCellOutputItem) {
            return true;
        }
        if (!obj) {
            return false;
        }
        return typeof obj.mime === 'string'
            && obj.data instanceof Uint8Array;
    }
    static error(err) {
        const obj = {
            name: err.name,
            message: err.message,
            stack: err.stack
        };
        return NotebookCellOutputItem.json(obj, 'application/vnd.code.notebook.error');
    }
    static stdout(value) {
        return NotebookCellOutputItem.text(value, 'application/vnd.code.notebook.stdout');
    }
    static stderr(value) {
        return NotebookCellOutputItem.text(value, 'application/vnd.code.notebook.stderr');
    }
    static bytes(value, mime = 'application/octet-stream') {
        return new NotebookCellOutputItem(value, mime);
    }
    static #encoder = new TextEncoder();
    static text(value, mime = Mimes.text) {
        const bytes = NotebookCellOutputItem.#encoder.encode(String(value));
        return new NotebookCellOutputItem(bytes, mime);
    }
    static json(value, mime = 'text/x-json') {
        const rawStr = JSON.stringify(value, undefined, '\t');
        return NotebookCellOutputItem.text(rawStr, mime);
    }
    constructor(data, mime) {
        this.data = data;
        this.mime = mime;
        const mimeNormalized = normalizeMimeType(mime, true);
        if (!mimeNormalized) {
            throw new Error(`INVALID mime type: ${mime}. Must be in the format "type/subtype[;optionalparameter]"`);
        }
        this.mime = mimeNormalized;
    }
}
export class NotebookCellOutput {
    static isNotebookCellOutput(candidate) {
        if (candidate instanceof NotebookCellOutput) {
            return true;
        }
        if (!candidate || typeof candidate !== 'object') {
            return false;
        }
        return typeof candidate.id === 'string' && Array.isArray(candidate.items);
    }
    static ensureUniqueMimeTypes(items, warn = false) {
        const seen = new Set();
        const removeIdx = new Set();
        for (let i = 0; i < items.length; i++) {
            const item = items[i];
            const normalMime = normalizeMimeType(item.mime);
            if (!seen.has(normalMime) || isTextStreamMime(normalMime)) {
                seen.add(normalMime);
                continue;
            }
            removeIdx.add(i);
            if (warn) {
                console.warn(`DUPLICATED mime type '${item.mime}' will be dropped`);
            }
        }
        if (removeIdx.size === 0) {
            return items;
        }
        return items.filter((_item, index) => !removeIdx.has(index));
    }
    constructor(items, idOrMetadata, metadata) {
        this.items = NotebookCellOutput.ensureUniqueMimeTypes(items, true);
        if (typeof idOrMetadata === 'string') {
            this.id = idOrMetadata;
            this.metadata = metadata;
        }
        else {
            this.id = generateUuid();
            this.metadata = idOrMetadata ?? metadata;
        }
    }
}
export var NotebookCellKind;
(function (NotebookCellKind) {
    NotebookCellKind[NotebookCellKind["Markup"] = 1] = "Markup";
    NotebookCellKind[NotebookCellKind["Code"] = 2] = "Code";
})(NotebookCellKind || (NotebookCellKind = {}));
export var NotebookCellExecutionState;
(function (NotebookCellExecutionState) {
    NotebookCellExecutionState[NotebookCellExecutionState["Idle"] = 1] = "Idle";
    NotebookCellExecutionState[NotebookCellExecutionState["Pending"] = 2] = "Pending";
    NotebookCellExecutionState[NotebookCellExecutionState["Executing"] = 3] = "Executing";
})(NotebookCellExecutionState || (NotebookCellExecutionState = {}));
export var NotebookCellStatusBarAlignment;
(function (NotebookCellStatusBarAlignment) {
    NotebookCellStatusBarAlignment[NotebookCellStatusBarAlignment["Left"] = 1] = "Left";
    NotebookCellStatusBarAlignment[NotebookCellStatusBarAlignment["Right"] = 2] = "Right";
})(NotebookCellStatusBarAlignment || (NotebookCellStatusBarAlignment = {}));
export var NotebookEditorRevealType;
(function (NotebookEditorRevealType) {
    NotebookEditorRevealType[NotebookEditorRevealType["Default"] = 0] = "Default";
    NotebookEditorRevealType[NotebookEditorRevealType["InCenter"] = 1] = "InCenter";
    NotebookEditorRevealType[NotebookEditorRevealType["InCenterIfOutsideViewport"] = 2] = "InCenterIfOutsideViewport";
    NotebookEditorRevealType[NotebookEditorRevealType["AtTop"] = 3] = "AtTop";
})(NotebookEditorRevealType || (NotebookEditorRevealType = {}));
export class NotebookCellStatusBarItem {
    constructor(text, alignment) {
        this.text = text;
        this.alignment = alignment;
    }
}
export var NotebookControllerAffinity;
(function (NotebookControllerAffinity) {
    NotebookControllerAffinity[NotebookControllerAffinity["Default"] = 1] = "Default";
    NotebookControllerAffinity[NotebookControllerAffinity["Preferred"] = 2] = "Preferred";
})(NotebookControllerAffinity || (NotebookControllerAffinity = {}));
export var NotebookControllerAffinity2;
(function (NotebookControllerAffinity2) {
    NotebookControllerAffinity2[NotebookControllerAffinity2["Default"] = 1] = "Default";
    NotebookControllerAffinity2[NotebookControllerAffinity2["Preferred"] = 2] = "Preferred";
    NotebookControllerAffinity2[NotebookControllerAffinity2["Hidden"] = -1] = "Hidden";
})(NotebookControllerAffinity2 || (NotebookControllerAffinity2 = {}));
export class NotebookRendererScript {
    constructor(uri, provides = []) {
        this.uri = uri;
        this.provides = asArray(provides);
    }
}
export class NotebookKernelSourceAction {
    constructor(label) {
        this.label = label;
    }
}
export var NotebookVariablesRequestKind;
(function (NotebookVariablesRequestKind) {
    NotebookVariablesRequestKind[NotebookVariablesRequestKind["Named"] = 1] = "Named";
    NotebookVariablesRequestKind[NotebookVariablesRequestKind["Indexed"] = 2] = "Indexed";
})(NotebookVariablesRequestKind || (NotebookVariablesRequestKind = {}));
let TimelineItem = class TimelineItem {
    constructor(label, timestamp) {
        this.label = label;
        this.timestamp = timestamp;
    }
};
TimelineItem = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String, Number])
], TimelineItem);
export { TimelineItem };
export var ExtensionMode;
(function (ExtensionMode) {
    ExtensionMode[ExtensionMode["Production"] = 1] = "Production";
    ExtensionMode[ExtensionMode["Development"] = 2] = "Development";
    ExtensionMode[ExtensionMode["Test"] = 3] = "Test";
})(ExtensionMode || (ExtensionMode = {}));
export var ExtensionRuntime;
(function (ExtensionRuntime) {
    ExtensionRuntime[ExtensionRuntime["Node"] = 1] = "Node";
    ExtensionRuntime[ExtensionRuntime["Webworker"] = 2] = "Webworker";
})(ExtensionRuntime || (ExtensionRuntime = {}));
export var StandardTokenType;
(function (StandardTokenType) {
    StandardTokenType[StandardTokenType["Other"] = 0] = "Other";
    StandardTokenType[StandardTokenType["Comment"] = 1] = "Comment";
    StandardTokenType[StandardTokenType["String"] = 2] = "String";
    StandardTokenType[StandardTokenType["RegEx"] = 3] = "RegEx";
})(StandardTokenType || (StandardTokenType = {}));
export class LinkedEditingRanges {
    constructor(ranges, wordPattern) {
        this.ranges = ranges;
        this.wordPattern = wordPattern;
    }
}
export class PortAttributes {
    constructor(autoForwardAction) {
        this._autoForwardAction = autoForwardAction;
    }
    get autoForwardAction() {
        return this._autoForwardAction;
    }
}
export var TestResultState;
(function (TestResultState) {
    TestResultState[TestResultState["Queued"] = 1] = "Queued";
    TestResultState[TestResultState["Running"] = 2] = "Running";
    TestResultState[TestResultState["Passed"] = 3] = "Passed";
    TestResultState[TestResultState["Failed"] = 4] = "Failed";
    TestResultState[TestResultState["Skipped"] = 5] = "Skipped";
    TestResultState[TestResultState["Errored"] = 6] = "Errored";
})(TestResultState || (TestResultState = {}));
export var TestRunProfileKind;
(function (TestRunProfileKind) {
    TestRunProfileKind[TestRunProfileKind["Run"] = 1] = "Run";
    TestRunProfileKind[TestRunProfileKind["Debug"] = 2] = "Debug";
    TestRunProfileKind[TestRunProfileKind["Coverage"] = 3] = "Coverage";
})(TestRunProfileKind || (TestRunProfileKind = {}));
let TestRunRequest = class TestRunRequest {
    constructor(include = undefined, exclude = undefined, profile = undefined, continuous = false, preserveFocus = true) {
        this.include = include;
        this.exclude = exclude;
        this.profile = profile;
        this.continuous = continuous;
        this.preserveFocus = preserveFocus;
    }
};
TestRunRequest = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], TestRunRequest);
export { TestRunRequest };
let TestMessage = TestMessage_1 = class TestMessage {
    static diff(message, expected, actual) {
        const msg = new TestMessage_1(message);
        msg.expectedOutput = expected;
        msg.actualOutput = actual;
        return msg;
    }
    constructor(message) {
        this.message = message;
    }
};
TestMessage = TestMessage_1 = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [Object])
], TestMessage);
export { TestMessage };
let TestTag = class TestTag {
    constructor(id) {
        this.id = id;
    }
};
TestTag = __decorate([
    es5ClassCompat,
    __metadata("design:paramtypes", [String])
], TestTag);
export { TestTag };
export class TestMessageStackFrame {
    constructor(label, uri, position) {
        this.label = label;
        this.uri = uri;
        this.position = position;
    }
}
export class TestCoverageCount {
    constructor(covered, total) {
        this.covered = covered;
        this.total = total;
        validateTestCoverageCount(this);
    }
}
export function validateTestCoverageCount(cc) {
    if (!cc) {
        return;
    }
    if (cc.covered > cc.total) {
        throw new Error(`The total number of covered items (${cc.covered}) cannot be greater than the total (${cc.total})`);
    }
    if (cc.total < 0) {
        throw new Error(`The number of covered items (${cc.total}) cannot be negative`);
    }
}
export class FileCoverage {
    static fromDetails(uri, details) {
        const statements = new TestCoverageCount(0, 0);
        const branches = new TestCoverageCount(0, 0);
        const decl = new TestCoverageCount(0, 0);
        for (const detail of details) {
            if ('branches' in detail) {
                statements.total += 1;
                statements.covered += detail.executed ? 1 : 0;
                for (const branch of detail.branches) {
                    branches.total += 1;
                    branches.covered += branch.executed ? 1 : 0;
                }
            }
            else {
                decl.total += 1;
                decl.covered += detail.executed ? 1 : 0;
            }
        }
        const coverage = new FileCoverage(uri, statements, branches.total > 0 ? branches : undefined, decl.total > 0 ? decl : undefined);
        coverage.detailedCoverage = details;
        return coverage;
    }
    constructor(uri, statementCoverage, branchCoverage, declarationCoverage, fromTests = []) {
        this.uri = uri;
        this.statementCoverage = statementCoverage;
        this.branchCoverage = branchCoverage;
        this.declarationCoverage = declarationCoverage;
        this.fromTests = fromTests;
    }
}
export class StatementCoverage {
    get executionCount() { return +this.executed; }
    set executionCount(n) { this.executed = n; }
    constructor(executed, location, branches = []) {
        this.executed = executed;
        this.location = location;
        this.branches = branches;
    }
}
export class BranchCoverage {
    get executionCount() { return +this.executed; }
    set executionCount(n) { this.executed = n; }
    constructor(executed, location, label) {
        this.executed = executed;
        this.location = location;
        this.label = label;
    }
}
export class DeclarationCoverage {
    get executionCount() { return +this.executed; }
    set executionCount(n) { this.executed = n; }
    constructor(name, executed, location) {
        this.name = name;
        this.executed = executed;
        this.location = location;
    }
}
export var ExternalUriOpenerPriority;
(function (ExternalUriOpenerPriority) {
    ExternalUriOpenerPriority[ExternalUriOpenerPriority["None"] = 0] = "None";
    ExternalUriOpenerPriority[ExternalUriOpenerPriority["Option"] = 1] = "Option";
    ExternalUriOpenerPriority[ExternalUriOpenerPriority["Default"] = 2] = "Default";
    ExternalUriOpenerPriority[ExternalUriOpenerPriority["Preferred"] = 3] = "Preferred";
})(ExternalUriOpenerPriority || (ExternalUriOpenerPriority = {}));
export var WorkspaceTrustState;
(function (WorkspaceTrustState) {
    WorkspaceTrustState[WorkspaceTrustState["Untrusted"] = 0] = "Untrusted";
    WorkspaceTrustState[WorkspaceTrustState["Trusted"] = 1] = "Trusted";
    WorkspaceTrustState[WorkspaceTrustState["Unspecified"] = 2] = "Unspecified";
})(WorkspaceTrustState || (WorkspaceTrustState = {}));
export var PortAutoForwardAction;
(function (PortAutoForwardAction) {
    PortAutoForwardAction[PortAutoForwardAction["Notify"] = 1] = "Notify";
    PortAutoForwardAction[PortAutoForwardAction["OpenBrowser"] = 2] = "OpenBrowser";
    PortAutoForwardAction[PortAutoForwardAction["OpenPreview"] = 3] = "OpenPreview";
    PortAutoForwardAction[PortAutoForwardAction["Silent"] = 4] = "Silent";
    PortAutoForwardAction[PortAutoForwardAction["Ignore"] = 5] = "Ignore";
    PortAutoForwardAction[PortAutoForwardAction["OpenBrowserOnce"] = 6] = "OpenBrowserOnce";
})(PortAutoForwardAction || (PortAutoForwardAction = {}));
export class TypeHierarchyItem {
    constructor(kind, name, detail, uri, range, selectionRange) {
        this.kind = kind;
        this.name = name;
        this.detail = detail;
        this.uri = uri;
        this.range = range;
        this.selectionRange = selectionRange;
    }
}
export class TextTabInput {
    constructor(uri) {
        this.uri = uri;
    }
}
export class TextDiffTabInput {
    constructor(original, modified) {
        this.original = original;
        this.modified = modified;
    }
}
export class TextMergeTabInput {
    constructor(base, input1, input2, result) {
        this.base = base;
        this.input1 = input1;
        this.input2 = input2;
        this.result = result;
    }
}
export class CustomEditorTabInput {
    constructor(uri, viewType) {
        this.uri = uri;
        this.viewType = viewType;
    }
}
export class WebviewEditorTabInput {
    constructor(viewType) {
        this.viewType = viewType;
    }
}
export class NotebookEditorTabInput {
    constructor(uri, notebookType) {
        this.uri = uri;
        this.notebookType = notebookType;
    }
}
export class NotebookDiffEditorTabInput {
    constructor(original, modified, notebookType) {
        this.original = original;
        this.modified = modified;
        this.notebookType = notebookType;
    }
}
export class TerminalEditorTabInput {
    constructor() { }
}
export class InteractiveWindowInput {
    constructor(uri, inputBoxUri) {
        this.uri = uri;
        this.inputBoxUri = inputBoxUri;
    }
}
export class ChatEditorTabInput {
    constructor() { }
}
export class TextMultiDiffTabInput {
    constructor(textDiffs) {
        this.textDiffs = textDiffs;
    }
}
export var InteractiveSessionVoteDirection;
(function (InteractiveSessionVoteDirection) {
    InteractiveSessionVoteDirection[InteractiveSessionVoteDirection["Down"] = 0] = "Down";
    InteractiveSessionVoteDirection[InteractiveSessionVoteDirection["Up"] = 1] = "Up";
})(InteractiveSessionVoteDirection || (InteractiveSessionVoteDirection = {}));
export var ChatCopyKind;
(function (ChatCopyKind) {
    ChatCopyKind[ChatCopyKind["Action"] = 1] = "Action";
    ChatCopyKind[ChatCopyKind["Toolbar"] = 2] = "Toolbar";
})(ChatCopyKind || (ChatCopyKind = {}));
export var ChatVariableLevel;
(function (ChatVariableLevel) {
    ChatVariableLevel[ChatVariableLevel["Short"] = 1] = "Short";
    ChatVariableLevel[ChatVariableLevel["Medium"] = 2] = "Medium";
    ChatVariableLevel[ChatVariableLevel["Full"] = 3] = "Full";
})(ChatVariableLevel || (ChatVariableLevel = {}));
export class ChatCompletionItem {
    constructor(id, label, values) {
        this.id = id;
        this.label = label;
        this.values = values;
    }
}
export var InteractiveEditorResponseFeedbackKind;
(function (InteractiveEditorResponseFeedbackKind) {
    InteractiveEditorResponseFeedbackKind[InteractiveEditorResponseFeedbackKind["Unhelpful"] = 0] = "Unhelpful";
    InteractiveEditorResponseFeedbackKind[InteractiveEditorResponseFeedbackKind["Helpful"] = 1] = "Helpful";
    InteractiveEditorResponseFeedbackKind[InteractiveEditorResponseFeedbackKind["Undone"] = 2] = "Undone";
    InteractiveEditorResponseFeedbackKind[InteractiveEditorResponseFeedbackKind["Accepted"] = 3] = "Accepted";
    InteractiveEditorResponseFeedbackKind[InteractiveEditorResponseFeedbackKind["Bug"] = 4] = "Bug";
})(InteractiveEditorResponseFeedbackKind || (InteractiveEditorResponseFeedbackKind = {}));
export var ChatResultFeedbackKind;
(function (ChatResultFeedbackKind) {
    ChatResultFeedbackKind[ChatResultFeedbackKind["Unhelpful"] = 0] = "Unhelpful";
    ChatResultFeedbackKind[ChatResultFeedbackKind["Helpful"] = 1] = "Helpful";
})(ChatResultFeedbackKind || (ChatResultFeedbackKind = {}));
export class ChatResponseMarkdownPart {
    constructor(value) {
        if (typeof value !== 'string' && value.isTrusted === true) {
            throw new Error('The boolean form of MarkdownString.isTrusted is NOT supported for chat participants.');
        }
        this.value = typeof value === 'string' ? new MarkdownString(value) : value;
    }
}
export class ChatResponseMarkdownWithVulnerabilitiesPart {
    constructor(value, vulnerabilities) {
        if (typeof value !== 'string' && value.isTrusted === true) {
            throw new Error('The boolean form of MarkdownString.isTrusted is NOT supported for chat participants.');
        }
        this.value = typeof value === 'string' ? new MarkdownString(value) : value;
        this.vulnerabilities = vulnerabilities;
    }
}
export class ChatResponseDetectedParticipantPart {
    constructor(participant, command) {
        this.participant = participant;
        this.command = command;
    }
}
export class ChatResponseConfirmationPart {
    constructor(title, message, data, buttons) {
        this.title = title;
        this.message = message;
        this.data = data;
        this.buttons = buttons;
    }
}
export class ChatResponseFileTreePart {
    constructor(value, baseUri) {
        this.value = value;
        this.baseUri = baseUri;
    }
}
export class ChatResponseAnchorPart {
    constructor(value, title) {
        this.value = value;
        this.value2 = value;
        this.title = title;
    }
}
export class ChatResponseProgressPart {
    constructor(value) {
        this.value = value;
    }
}
export class ChatResponseProgressPart2 {
    constructor(value, task) {
        this.value = value;
        this.task = task;
    }
}
export class ChatResponseWarningPart {
    constructor(value) {
        if (typeof value !== 'string' && value.isTrusted === true) {
            throw new Error('The boolean form of MarkdownString.isTrusted is NOT supported for chat participants.');
        }
        this.value = typeof value === 'string' ? new MarkdownString(value) : value;
    }
}
export class ChatResponseCommandButtonPart {
    constructor(value) {
        this.value = value;
    }
}
export class ChatResponseReferencePart {
    constructor(value, iconPath, options) {
        this.value = value;
        this.iconPath = iconPath;
        this.options = options;
    }
}
export class ChatResponseCodeblockUriPart {
    constructor(value) {
        this.value = value;
    }
}
export class ChatResponseCodeCitationPart {
    constructor(value, license, snippet) {
        this.value = value;
        this.license = license;
        this.snippet = snippet;
    }
}
export class ChatResponseMovePart {
    constructor(uri, range) {
        this.uri = uri;
        this.range = range;
    }
}
export class ChatResponseTextEditPart {
    constructor(uri, edits) {
        this.uri = uri;
        this.edits = Array.isArray(edits) ? edits : [edits];
    }
}
export class ChatRequestTurn {
    constructor(prompt, command, references, participant) {
        this.prompt = prompt;
        this.command = command;
        this.references = references;
        this.participant = participant;
    }
}
export class ChatResponseTurn {
    constructor(response, result, participant, command) {
        this.response = response;
        this.result = result;
        this.participant = participant;
        this.command = command;
    }
}
export var ChatLocation;
(function (ChatLocation) {
    ChatLocation[ChatLocation["Panel"] = 1] = "Panel";
    ChatLocation[ChatLocation["Terminal"] = 2] = "Terminal";
    ChatLocation[ChatLocation["Notebook"] = 3] = "Notebook";
    ChatLocation[ChatLocation["Editor"] = 4] = "Editor";
    ChatLocation[ChatLocation["EditingSession"] = 5] = "EditingSession";
})(ChatLocation || (ChatLocation = {}));
export var ChatResponseReferencePartStatusKind;
(function (ChatResponseReferencePartStatusKind) {
    ChatResponseReferencePartStatusKind[ChatResponseReferencePartStatusKind["Complete"] = 1] = "Complete";
    ChatResponseReferencePartStatusKind[ChatResponseReferencePartStatusKind["Partial"] = 2] = "Partial";
    ChatResponseReferencePartStatusKind[ChatResponseReferencePartStatusKind["Omitted"] = 3] = "Omitted";
})(ChatResponseReferencePartStatusKind || (ChatResponseReferencePartStatusKind = {}));
export class ChatRequestEditorData {
    constructor(document, selection, wholeRange) {
        this.document = document;
        this.selection = selection;
        this.wholeRange = wholeRange;
    }
}
export class ChatRequestNotebookData {
    constructor(cell) {
        this.cell = cell;
    }
}
export var LanguageModelChatMessageRole;
(function (LanguageModelChatMessageRole) {
    LanguageModelChatMessageRole[LanguageModelChatMessageRole["User"] = 1] = "User";
    LanguageModelChatMessageRole[LanguageModelChatMessageRole["Assistant"] = 2] = "Assistant";
    LanguageModelChatMessageRole[LanguageModelChatMessageRole["System"] = 3] = "System";
})(LanguageModelChatMessageRole || (LanguageModelChatMessageRole = {}));
export class LanguageModelToolResultPart {
    constructor(toolCallId, content, isError) {
        this.toolCallId = toolCallId;
        this.content = content;
        this.isError = isError ?? false;
    }
}
export class LanguageModelChatMessage {
    static User(content, name) {
        const value = new LanguageModelChatMessage(LanguageModelChatMessageRole.User, typeof content === 'string' ? content : '', name);
        value.content2 = [content];
        return value;
    }
    static Assistant(content, name) {
        return new LanguageModelChatMessage(LanguageModelChatMessageRole.Assistant, content, name);
    }
    constructor(role, content, name) {
        this.role = role;
        this.content = content;
        this.content2 = [content];
        this.name = name;
    }
}
export class LanguageModelToolCallPart {
    constructor(name, toolCallId, parameters) {
        this.name = name;
        this.toolCallId = toolCallId;
        this.parameters = parameters;
    }
}
export class LanguageModelTextPart {
    constructor(value) {
        this.value = value;
    }
}
export class LanguageModelChatSystemMessage {
    constructor(content) {
        this.content = content;
    }
}
export class LanguageModelChatUserMessage {
    constructor(content, name) {
        this.content = content;
        this.name = name;
    }
}
export class LanguageModelChatAssistantMessage {
    constructor(content, name) {
        this.content = content;
        this.name = name;
    }
}
export class LanguageModelError extends Error {
    static NotFound(message) {
        return new LanguageModelError(message, LanguageModelError.NotFound.name);
    }
    static NoPermissions(message) {
        return new LanguageModelError(message, LanguageModelError.NoPermissions.name);
    }
    static Blocked(message) {
        return new LanguageModelError(message, LanguageModelError.Blocked.name);
    }
    constructor(message, code, cause) {
        super(message, { cause });
        this.name = 'LanguageModelError';
        this.code = code ?? '';
    }
}
export var RelatedInformationType;
(function (RelatedInformationType) {
    RelatedInformationType[RelatedInformationType["SymbolInformation"] = 1] = "SymbolInformation";
    RelatedInformationType[RelatedInformationType["CommandInformation"] = 2] = "CommandInformation";
    RelatedInformationType[RelatedInformationType["SearchInformation"] = 3] = "SearchInformation";
    RelatedInformationType[RelatedInformationType["SettingInformation"] = 4] = "SettingInformation";
})(RelatedInformationType || (RelatedInformationType = {}));
export var SpeechToTextStatus;
(function (SpeechToTextStatus) {
    SpeechToTextStatus[SpeechToTextStatus["Started"] = 1] = "Started";
    SpeechToTextStatus[SpeechToTextStatus["Recognizing"] = 2] = "Recognizing";
    SpeechToTextStatus[SpeechToTextStatus["Recognized"] = 3] = "Recognized";
    SpeechToTextStatus[SpeechToTextStatus["Stopped"] = 4] = "Stopped";
    SpeechToTextStatus[SpeechToTextStatus["Error"] = 5] = "Error";
})(SpeechToTextStatus || (SpeechToTextStatus = {}));
export var TextToSpeechStatus;
(function (TextToSpeechStatus) {
    TextToSpeechStatus[TextToSpeechStatus["Started"] = 1] = "Started";
    TextToSpeechStatus[TextToSpeechStatus["Stopped"] = 2] = "Stopped";
    TextToSpeechStatus[TextToSpeechStatus["Error"] = 3] = "Error";
})(TextToSpeechStatus || (TextToSpeechStatus = {}));
export var KeywordRecognitionStatus;
(function (KeywordRecognitionStatus) {
    KeywordRecognitionStatus[KeywordRecognitionStatus["Recognized"] = 1] = "Recognized";
    KeywordRecognitionStatus[KeywordRecognitionStatus["Stopped"] = 2] = "Stopped";
})(KeywordRecognitionStatus || (KeywordRecognitionStatus = {}));
export class InlineEdit {
    constructor(text, range) {
        this.text = text;
        this.range = range;
    }
}
export var InlineEditTriggerKind;
(function (InlineEditTriggerKind) {
    InlineEditTriggerKind[InlineEditTriggerKind["Invoke"] = 0] = "Invoke";
    InlineEditTriggerKind[InlineEditTriggerKind["Automatic"] = 1] = "Automatic";
})(InlineEditTriggerKind || (InlineEditTriggerKind = {}));
