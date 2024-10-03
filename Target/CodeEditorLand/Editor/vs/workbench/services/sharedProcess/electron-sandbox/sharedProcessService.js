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
import { Client as MessagePortClient } from '../../../../base/parts/ipc/common/ipc.mp.js';
import { getDelayedChannel } from '../../../../base/parts/ipc/common/ipc.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { SharedProcessChannelConnection, SharedProcessRawConnection } from '../../../../platform/sharedProcess/common/sharedProcess.js';
import { mark } from '../../../../base/common/performance.js';
import { Barrier, timeout } from '../../../../base/common/async.js';
import { acquirePort } from '../../../../base/parts/ipc/electron-sandbox/ipc.mp.js';
let SharedProcessService = class SharedProcessService extends Disposable {
    constructor(windowId, logService) {
        super();
        this.windowId = windowId;
        this.logService = logService;
        this.restoredBarrier = new Barrier();
        this.withSharedProcessConnection = this.connect();
    }
    async connect() {
        this.logService.trace('Renderer->SharedProcess#connect');
        await Promise.race([this.restoredBarrier.wait(), timeout(2000)]);
        mark('code/willConnectSharedProcess');
        this.logService.trace('Renderer->SharedProcess#connect: before acquirePort');
        const port = await acquirePort(SharedProcessChannelConnection.request, SharedProcessChannelConnection.response);
        mark('code/didConnectSharedProcess');
        this.logService.trace('Renderer->SharedProcess#connect: connection established');
        return this._register(new MessagePortClient(port, `window:${this.windowId}`));
    }
    notifyRestored() {
        if (!this.restoredBarrier.isOpen()) {
            this.restoredBarrier.open();
        }
    }
    getChannel(channelName) {
        return getDelayedChannel(this.withSharedProcessConnection.then(connection => connection.getChannel(channelName)));
    }
    registerChannel(channelName, channel) {
        this.withSharedProcessConnection.then(connection => connection.registerChannel(channelName, channel));
    }
    async createRawConnection() {
        await this.withSharedProcessConnection;
        this.logService.trace('Renderer->SharedProcess#createRawConnection: before acquirePort');
        const port = await acquirePort(SharedProcessRawConnection.request, SharedProcessRawConnection.response);
        this.logService.trace('Renderer->SharedProcess#createRawConnection: connection established');
        return port;
    }
};
SharedProcessService = __decorate([
    __param(1, ILogService),
    __metadata("design:paramtypes", [Number, Object])
], SharedProcessService);
export { SharedProcessService };
