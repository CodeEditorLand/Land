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
import { Barrier } from '../../../../base/common/async.js';
import { ITerminalLogService } from '../../../../platform/terminal/common/terminal.js';
import { BasePty } from '../common/basePty.js';
import { RemoteTerminalChannelClient } from '../common/remote/remoteTerminalChannel.js';
import { IRemoteAgentService } from '../../../services/remote/common/remoteAgentService.js';
let RemotePty = class RemotePty extends BasePty {
    constructor(id, shouldPersist, _remoteTerminalChannel, _remoteAgentService, _logService) {
        super(id, shouldPersist);
        this._remoteTerminalChannel = _remoteTerminalChannel;
        this._remoteAgentService = _remoteAgentService;
        this._logService = _logService;
        this._startBarrier = new Barrier();
    }
    async start() {
        const env = await this._remoteAgentService.getEnvironment();
        if (!env) {
            throw new Error('Could not fetch remote environment');
        }
        this._logService.trace('Spawning remote agent process', { terminalId: this.id });
        const startResult = await this._remoteTerminalChannel.start(this.id);
        if (startResult && 'message' in startResult) {
            return startResult;
        }
        this._startBarrier.open();
        return startResult;
    }
    async detach(forcePersist) {
        await this._startBarrier.wait();
        return this._remoteTerminalChannel.detachFromProcess(this.id, forcePersist);
    }
    shutdown(immediate) {
        this._startBarrier.wait().then(_ => {
            this._remoteTerminalChannel.shutdown(this.id, immediate);
        });
    }
    input(data) {
        if (this._inReplay) {
            return;
        }
        this._startBarrier.wait().then(_ => {
            this._remoteTerminalChannel.input(this.id, data);
        });
    }
    processBinary(e) {
        return this._remoteTerminalChannel.processBinary(this.id, e);
    }
    resize(cols, rows) {
        if (this._inReplay || this._lastDimensions.cols === cols && this._lastDimensions.rows === rows) {
            return;
        }
        this._startBarrier.wait().then(_ => {
            this._lastDimensions.cols = cols;
            this._lastDimensions.rows = rows;
            this._remoteTerminalChannel.resize(this.id, cols, rows);
        });
    }
    async clearBuffer() {
        await this._remoteTerminalChannel.clearBuffer(this.id);
    }
    freePortKillProcess(port) {
        if (!this._remoteTerminalChannel.freePortKillProcess) {
            throw new Error('freePortKillProcess does not exist on the local pty service');
        }
        return this._remoteTerminalChannel.freePortKillProcess(port);
    }
    acknowledgeDataEvent(charCount) {
        if (this._inReplay) {
            return;
        }
        this._startBarrier.wait().then(_ => {
            this._remoteTerminalChannel.acknowledgeDataEvent(this.id, charCount);
        });
    }
    async setUnicodeVersion(version) {
        return this._remoteTerminalChannel.setUnicodeVersion(this.id, version);
    }
    async refreshProperty(type) {
        return this._remoteTerminalChannel.refreshProperty(this.id, type);
    }
    async updateProperty(type, value) {
        return this._remoteTerminalChannel.updateProperty(this.id, type, value);
    }
    handleOrphanQuestion() {
        this._remoteTerminalChannel.orphanQuestionReply(this.id);
    }
};
RemotePty = __decorate([
    __param(3, IRemoteAgentService),
    __param(4, ITerminalLogService),
    __metadata("design:paramtypes", [Number, Boolean, RemoteTerminalChannelClient, Object, Object])
], RemotePty);
export { RemotePty };
