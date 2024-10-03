var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Emitter, Event } from '../../../../../base/common/event.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { ILogService, LogLevel } from '../../../../log/common/log.js';
import { throttle } from '../../../../../base/common/decorators.js';
let PromptInputModel = class PromptInputModel extends Disposable {
    get value() { return this._value; }
    get prefix() { return this._value.substring(0, this._cursorIndex); }
    get suffix() { return this._value.substring(this._cursorIndex, this._ghostTextIndex === -1 ? undefined : this._ghostTextIndex); }
    get cursorIndex() { return this._cursorIndex; }
    get ghostTextIndex() { return this._ghostTextIndex; }
    constructor(_xterm, onCommandStart, onCommandExecuted, _logService) {
        super();
        this._xterm = _xterm;
        this._logService = _logService;
        this._state = 0;
        this._commandStartX = 0;
        this._lastUserInput = '';
        this._value = '';
        this._cursorIndex = 0;
        this._ghostTextIndex = -1;
        this._onDidStartInput = this._register(new Emitter());
        this.onDidStartInput = this._onDidStartInput.event;
        this._onDidChangeInput = this._register(new Emitter());
        this.onDidChangeInput = this._onDidChangeInput.event;
        this._onDidFinishInput = this._register(new Emitter());
        this.onDidFinishInput = this._onDidFinishInput.event;
        this._onDidInterrupt = this._register(new Emitter());
        this.onDidInterrupt = this._onDidInterrupt.event;
        this._register(Event.any(this._xterm.onCursorMove, this._xterm.onData, this._xterm.onWriteParsed)(() => this._sync()));
        this._register(this._xterm.onData(e => this._handleUserInput(e)));
        this._register(onCommandStart(e => this._handleCommandStart(e)));
        this._register(onCommandExecuted(() => this._handleCommandExecuted()));
        this._register(this.onDidStartInput(() => this._logCombinedStringIfTrace('PromptInputModel#onDidStartInput')));
        this._register(this.onDidChangeInput(() => this._logCombinedStringIfTrace('PromptInputModel#onDidChangeInput')));
        this._register(this.onDidFinishInput(() => this._logCombinedStringIfTrace('PromptInputModel#onDidFinishInput')));
        this._register(this.onDidInterrupt(() => this._logCombinedStringIfTrace('PromptInputModel#onDidInterrupt')));
    }
    _logCombinedStringIfTrace(message) {
        if (this._logService.getLevel() === LogLevel.Trace) {
            this._logService.trace(message, this.getCombinedString());
        }
    }
    setContinuationPrompt(value) {
        this._continuationPrompt = value;
        this._sync();
    }
    setLastPromptLine(value) {
        this._lastPromptLine = value;
        this._sync();
    }
    setConfidentCommandLine(value) {
        if (this._value !== value) {
            this._value = value;
            this._cursorIndex = -1;
            this._ghostTextIndex = -1;
            this._onDidChangeInput.fire(this._createStateObject());
        }
    }
    getCombinedString() {
        const value = this._value.replaceAll('\n', '\u23CE');
        if (this._cursorIndex === -1) {
            return value;
        }
        let result = `${value.substring(0, this.cursorIndex)}|`;
        if (this.ghostTextIndex !== -1) {
            result += `${value.substring(this.cursorIndex, this.ghostTextIndex)}[`;
            result += `${value.substring(this.ghostTextIndex)}]`;
        }
        else {
            result += value.substring(this.cursorIndex);
        }
        return result;
    }
    serialize() {
        return {
            modelState: this._createStateObject(),
            commandStartX: this._commandStartX,
            lastPromptLine: this._lastPromptLine,
            continuationPrompt: this._continuationPrompt,
            lastUserInput: this._lastUserInput
        };
    }
    deserialize(serialized) {
        this._value = serialized.modelState.value;
        this._cursorIndex = serialized.modelState.cursorIndex;
        this._ghostTextIndex = serialized.modelState.ghostTextIndex;
        this._commandStartX = serialized.commandStartX;
        this._lastPromptLine = serialized.lastPromptLine;
        this._continuationPrompt = serialized.continuationPrompt;
        this._lastUserInput = serialized.lastUserInput;
    }
    _handleCommandStart(command) {
        if (this._state === 1) {
            return;
        }
        this._state = 1;
        this._commandStartMarker = command.marker;
        this._commandStartX = this._xterm.buffer.active.cursorX;
        this._value = '';
        this._cursorIndex = 0;
        this._onDidStartInput.fire(this._createStateObject());
        this._onDidChangeInput.fire(this._createStateObject());
        if (this._lastPromptLine) {
            if (this._commandStartX !== this._lastPromptLine.length) {
                const line = this._xterm.buffer.active.getLine(this._commandStartMarker.line);
                if (line?.translateToString(true).startsWith(this._lastPromptLine)) {
                    this._commandStartX = this._lastPromptLine.length;
                    this._sync();
                }
            }
        }
    }
    _handleCommandExecuted() {
        if (this._state === 2) {
            return;
        }
        this._cursorIndex = -1;
        if (this._ghostTextIndex !== -1) {
            this._value = this._value.substring(0, this._ghostTextIndex);
            this._ghostTextIndex = -1;
        }
        const event = this._createStateObject();
        if (this._lastUserInput === '\u0003') {
            this._lastUserInput = '';
            this._onDidInterrupt.fire(event);
        }
        this._state = 2;
        this._onDidFinishInput.fire(event);
        this._onDidChangeInput.fire(event);
    }
    _sync() {
        try {
            this._doSync();
        }
        catch (e) {
            this._logService.error('Error while syncing prompt input model', e);
        }
    }
    _doSync() {
        if (this._state !== 1) {
            return;
        }
        const commandStartY = this._commandStartMarker?.line;
        if (commandStartY === undefined) {
            return;
        }
        const buffer = this._xterm.buffer.active;
        let line = buffer.getLine(commandStartY);
        const commandLine = line?.translateToString(true, this._commandStartX);
        if (!line || commandLine === undefined) {
            this._logService.trace(`PromptInputModel#_sync: no line`);
            return;
        }
        const absoluteCursorY = buffer.baseY + buffer.cursorY;
        let value = commandLine;
        let ghostTextIndex = -1;
        let cursorIndex;
        if (absoluteCursorY === commandStartY) {
            cursorIndex = this._getRelativeCursorIndex(this._commandStartX, buffer, line);
        }
        else {
            cursorIndex = commandLine.trimEnd().length;
        }
        if (absoluteCursorY === commandStartY && buffer.cursorX > 1) {
            ghostTextIndex = this._scanForGhostText(buffer, line, cursorIndex);
        }
        for (let y = commandStartY + 1; y <= absoluteCursorY; y++) {
            line = buffer.getLine(y);
            const lineText = line?.translateToString(true);
            if (lineText && line) {
                if (line.isWrapped) {
                    value += lineText;
                    const relativeCursorIndex = this._getRelativeCursorIndex(0, buffer, line);
                    if (absoluteCursorY === y) {
                        cursorIndex += relativeCursorIndex;
                    }
                    else {
                        cursorIndex += lineText.length;
                    }
                }
                else if (this._continuationPrompt === undefined || this._lineContainsContinuationPrompt(lineText)) {
                    const trimmedLineText = this._trimContinuationPrompt(lineText);
                    value += `\n${trimmedLineText}`;
                    if (absoluteCursorY === y) {
                        const continuationCellWidth = this._getContinuationPromptCellWidth(line, lineText);
                        const relativeCursorIndex = this._getRelativeCursorIndex(continuationCellWidth, buffer, line);
                        cursorIndex += relativeCursorIndex + 1;
                    }
                    else {
                        cursorIndex += trimmedLineText.length + 1;
                    }
                }
                else {
                    break;
                }
            }
        }
        for (let y = absoluteCursorY + 1; y < buffer.baseY + this._xterm.rows; y++) {
            line = buffer.getLine(y);
            const lineText = line?.translateToString(true);
            if (lineText && line) {
                if (this._continuationPrompt === undefined || this._lineContainsContinuationPrompt(lineText)) {
                    value += `\n${this._trimContinuationPrompt(lineText)}`;
                }
                else {
                    break;
                }
            }
            else {
                break;
            }
        }
        if (this._logService.getLevel() === LogLevel.Trace) {
            this._logService.trace(`PromptInputModel#_sync: ${this.getCombinedString()}`);
        }
        {
            let trailingWhitespace = this._value.length - this._value.trimEnd().length;
            if (this._lastUserInput === '\x7F') {
                this._lastUserInput = '';
                if (cursorIndex === this._cursorIndex - 1) {
                    if (this._value.trimEnd().length > value.trimEnd().length && value.trimEnd().length <= cursorIndex) {
                        trailingWhitespace = Math.max((this._value.length - 1) - value.trimEnd().length, 0);
                    }
                    else {
                        trailingWhitespace = Math.max(trailingWhitespace - 1, 0);
                    }
                }
            }
            if (this._lastUserInput === '\x1b[3~') {
                this._lastUserInput = '';
                if (cursorIndex === this._cursorIndex) {
                    trailingWhitespace = Math.max(trailingWhitespace - 1, 0);
                }
            }
            const valueLines = value.split('\n');
            const isMultiLine = valueLines.length > 1;
            const valueEndTrimmed = value.trimEnd();
            if (!isMultiLine) {
                if (valueEndTrimmed.length < value.length) {
                    if (this._lastUserInput === ' ') {
                        this._lastUserInput = '';
                        if (cursorIndex > valueEndTrimmed.length && cursorIndex > this._cursorIndex) {
                            trailingWhitespace++;
                        }
                    }
                    trailingWhitespace = Math.max(cursorIndex - valueEndTrimmed.length, trailingWhitespace, 0);
                }
                const charBeforeCursor = cursorIndex === 0 ? '' : value[cursorIndex - 1];
                if (trailingWhitespace > 0 && cursorIndex === this._cursorIndex + 1 && this._lastUserInput !== '' && charBeforeCursor !== ' ') {
                    trailingWhitespace = this._value.length - this._cursorIndex;
                }
            }
            if (isMultiLine) {
                valueLines[valueLines.length - 1] = valueLines.at(-1)?.trimEnd() ?? '';
                const continuationOffset = (valueLines.length - 1) * (this._continuationPrompt?.length ?? 0);
                trailingWhitespace = Math.max(0, cursorIndex - value.length - continuationOffset);
            }
            value = valueLines.map(e => e.trimEnd()).join('\n') + ' '.repeat(trailingWhitespace);
        }
        if (this._value !== value || this._cursorIndex !== cursorIndex || this._ghostTextIndex !== ghostTextIndex) {
            this._value = value;
            this._cursorIndex = cursorIndex;
            this._ghostTextIndex = ghostTextIndex;
            this._onDidChangeInput.fire(this._createStateObject());
        }
    }
    _handleUserInput(e) {
        this._lastUserInput = e;
    }
    _scanForGhostText(buffer, line, cursorIndex) {
        let ghostTextIndex = -1;
        let proceedWithGhostTextCheck = false;
        let x = buffer.cursorX;
        while (x > 0) {
            const cell = line.getCell(--x);
            if (!cell) {
                break;
            }
            if (cell.getChars().trim().length > 0) {
                proceedWithGhostTextCheck = !this._isCellStyledLikeGhostText(cell);
                break;
            }
        }
        if (proceedWithGhostTextCheck) {
            let potentialGhostIndexOffset = 0;
            let x = buffer.cursorX;
            while (x < line.length) {
                const cell = line.getCell(x++);
                if (!cell || cell.getCode() === 0) {
                    break;
                }
                if (this._isCellStyledLikeGhostText(cell)) {
                    ghostTextIndex = cursorIndex + potentialGhostIndexOffset;
                    break;
                }
                potentialGhostIndexOffset += cell.getChars().length;
            }
        }
        return ghostTextIndex;
    }
    _trimContinuationPrompt(lineText) {
        if (this._lineContainsContinuationPrompt(lineText)) {
            lineText = lineText.substring(this._continuationPrompt.length);
        }
        return lineText;
    }
    _lineContainsContinuationPrompt(lineText) {
        return !!(this._continuationPrompt && lineText.startsWith(this._continuationPrompt));
    }
    _getContinuationPromptCellWidth(line, lineText) {
        if (!this._continuationPrompt || !lineText.startsWith(this._continuationPrompt)) {
            return 0;
        }
        let buffer = '';
        let x = 0;
        while (buffer !== this._continuationPrompt) {
            buffer += line.getCell(x++).getChars();
        }
        return x;
    }
    _getRelativeCursorIndex(startCellX, buffer, line) {
        return line?.translateToString(true, startCellX, buffer.cursorX).length ?? 0;
    }
    _isCellStyledLikeGhostText(cell) {
        return !!(cell.isItalic() || cell.isDim());
    }
    _createStateObject() {
        return Object.freeze({
            value: this._value,
            prefix: this.prefix,
            suffix: this.suffix,
            cursorIndex: this._cursorIndex,
            ghostTextIndex: this._ghostTextIndex
        });
    }
};
__decorate([
    throttle(0),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], PromptInputModel.prototype, "_sync", null);
PromptInputModel = __decorate([
    __param(3, ILogService),
    __metadata("design:paramtypes", [Object, Function, Function, Object])
], PromptInputModel);
export { PromptInputModel };
