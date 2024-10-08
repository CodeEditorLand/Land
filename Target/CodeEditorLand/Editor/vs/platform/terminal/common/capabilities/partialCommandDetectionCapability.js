/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Emitter } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
/**
 * This capability guesses where commands are based on where the cursor was when enter was pressed.
 * It's very hit or miss but it's often correct and better than nothing.
 */
export class PartialCommandDetectionCapability extends DisposableStore {
    get commands() { return this._commands; }
    constructor(_terminal) {
        super();
        this._terminal = _terminal;
        this.type = 3 /* TerminalCapability.PartialCommandDetection */;
        this._commands = [];
        this._onCommandFinished = this.add(new Emitter());
        this.onCommandFinished = this._onCommandFinished.event;
        this.add(this._terminal.onData(e => this._onData(e)));
        this.add(this._terminal.parser.registerCsiHandler({ final: 'J' }, params => {
            if (params.length >= 1 && (params[0] === 2 || params[0] === 3)) {
                this._clearCommandsInViewport();
            }
            // We don't want to override xterm.js' default behavior, just augment it
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
        if (this._terminal.buffer.active.cursorX >= 2 /* Constants.MinimumPromptLength */) {
            const marker = this._terminal.registerMarker(0);
            if (marker) {
                this._commands.push(marker);
                this._onCommandFinished.fire(marker);
            }
        }
    }
    _clearCommandsInViewport() {
        // Find the number of commands on the tail end of the array that are within the viewport
        let count = 0;
        for (let i = this._commands.length - 1; i >= 0; i--) {
            if (this._commands[i].line < this._terminal.buffer.active.baseY) {
                break;
            }
            count++;
        }
        // Remove them
        this._commands.splice(this._commands.length - count, count);
    }
}
