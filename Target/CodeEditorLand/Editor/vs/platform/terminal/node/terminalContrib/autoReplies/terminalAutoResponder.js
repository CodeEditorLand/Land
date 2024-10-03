import { timeout } from '../../../../../base/common/async.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { isWindows } from '../../../../../base/common/platform.js';
export class TerminalAutoResponder extends Disposable {
    constructor(proc, matchWord, response, logService) {
        super();
        this._pointer = 0;
        this._paused = false;
        this._throttled = false;
        this._register(proc.onProcessData(e => {
            if (this._paused || this._throttled) {
                return;
            }
            const data = typeof e === 'string' ? e : e.data;
            for (let i = 0; i < data.length; i++) {
                if (data[i] === matchWord[this._pointer]) {
                    this._pointer++;
                }
                else {
                    this._reset();
                }
                if (this._pointer === matchWord.length) {
                    logService.debug(`Auto reply match: "${matchWord}", response: "${response}"`);
                    proc.input(response);
                    this._throttled = true;
                    timeout(1000).then(() => this._throttled = false);
                    this._reset();
                }
            }
        }));
    }
    _reset() {
        this._pointer = 0;
    }
    handleResize() {
        if (isWindows) {
            this._paused = true;
        }
    }
    handleInput() {
        this._paused = false;
    }
}
