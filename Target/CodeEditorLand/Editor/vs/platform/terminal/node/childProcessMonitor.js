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
import { parse } from '../../../base/common/path.js';
import { debounce, throttle } from '../../../base/common/decorators.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { listProcesses } from '../../../base/node/ps.js';
import { ILogService } from '../../log/common/log.js';
export const ignoreProcessNames = [];
let ChildProcessMonitor = class ChildProcessMonitor extends Disposable {
    set hasChildProcesses(value) {
        if (this._hasChildProcesses !== value) {
            this._hasChildProcesses = value;
            this._logService.debug('ChildProcessMonitor: Has child processes changed', value);
            this._onDidChangeHasChildProcesses.fire(value);
        }
    }
    get hasChildProcesses() { return this._hasChildProcesses; }
    constructor(_pid, _logService) {
        super();
        this._pid = _pid;
        this._logService = _logService;
        this._hasChildProcesses = false;
        this._onDidChangeHasChildProcesses = this._register(new Emitter());
        this.onDidChangeHasChildProcesses = this._onDidChangeHasChildProcesses.event;
    }
    handleInput() {
        this._refreshActive();
    }
    handleOutput() {
        this._refreshInactive();
    }
    async _refreshActive() {
        if (this._store.isDisposed) {
            return;
        }
        try {
            const processItem = await listProcesses(this._pid);
            this.hasChildProcesses = this._processContainsChildren(processItem);
        }
        catch (e) {
            this._logService.debug('ChildProcessMonitor: Fetching process tree failed', e);
        }
    }
    _refreshInactive() {
        this._refreshActive();
    }
    _processContainsChildren(processItem) {
        if (!processItem.children) {
            return false;
        }
        if (processItem.children.length === 1) {
            const item = processItem.children[0];
            let cmd;
            if (item.cmd.startsWith(`"`)) {
                cmd = item.cmd.substring(1, item.cmd.indexOf(`"`, 1));
            }
            else {
                const spaceIndex = item.cmd.indexOf(` `);
                if (spaceIndex === -1) {
                    cmd = item.cmd;
                }
                else {
                    cmd = item.cmd.substring(0, spaceIndex);
                }
            }
            return ignoreProcessNames.indexOf(parse(cmd).name) === -1;
        }
        return processItem.children.length > 0;
    }
};
__decorate([
    debounce(1000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ChildProcessMonitor.prototype, "_refreshActive", null);
__decorate([
    throttle(5000),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ChildProcessMonitor.prototype, "_refreshInactive", null);
ChildProcessMonitor = __decorate([
    __param(1, ILogService),
    __metadata("design:paramtypes", [Number, Object])
], ChildProcessMonitor);
export { ChildProcessMonitor };
