import { Emitter } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
export class PartialCommandDetectionCapability extends DisposableStore {
    get commands() { return this._commands; }
    constructor(_terminal) {
        super();
        this._terminal = _terminal;
        this.type = 3;
        this._commands = [];
        this._onCommandFinished = this.add(new Emitter());
        this.onCommandFinished = this._onCommandFinished.event;
        this.add(this._terminal.onData(e => this._onData(e)));
        this.add(this._terminal.parser.registerCsiHandler({ final: 'J' }, params => {
            if (params.length >= 1 && (params[0] === 2 || params[0] === 3)) {
                this._clearCommandsInViewport();
            }
            return false;
        }));
    }
    _onData(data) {
        if (data === '\x0d') {
            this._onEnter();
        }
    }
    _onEnter() {
        if (!this._terminal) {
            return;
        }
        if (this._terminal.buffer.active.cursorX >= 2) {
            const marker = this._terminal.registerMarker(0);
            if (marker) {
                this._commands.push(marker);
                this._onCommandFinished.fire(marker);
            }
        }
    }
    _clearCommandsInViewport() {
        let count = 0;
        for (let i = this._commands.length - 1; i >= 0; i--) {
            if (this._commands[i].line < this._terminal.buffer.active.baseY) {
                break;
            }
            count++;
        }
        this._commands.splice(this._commands.length - count, count);
    }
}
