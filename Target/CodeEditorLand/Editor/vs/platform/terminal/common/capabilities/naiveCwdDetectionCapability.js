import { Emitter } from '../../../../base/common/event.js';
export class NaiveCwdDetectionCapability {
    constructor(_process) {
        this._process = _process;
        this.type = 1;
        this._cwd = '';
        this._onDidChangeCwd = new Emitter();
        this.onDidChangeCwd = this._onDidChangeCwd.event;
    }
    async getCwd() {
        if (!this._process) {
            return Promise.resolve('');
        }
        const newCwd = await this._process.getCwd();
        if (newCwd !== this._cwd) {
            this._onDidChangeCwd.fire(newCwd);
        }
        this._cwd = newCwd;
        return this._cwd;
    }
}
