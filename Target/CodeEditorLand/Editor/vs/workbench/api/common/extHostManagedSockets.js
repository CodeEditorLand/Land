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
import { MainContext } from './extHost.protocol.js';
import { createDecorator } from '../../../platform/instantiation/common/instantiation.js';
import { Disposable, DisposableStore, toDisposable } from '../../../base/common/lifecycle.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { VSBuffer } from '../../../base/common/buffer.js';
export const IExtHostManagedSockets = createDecorator('IExtHostManagedSockets');
let ExtHostManagedSockets = class ExtHostManagedSockets {
    constructor(extHostRpc) {
        this._remoteSocketIdCounter = 0;
        this._factory = null;
        this._managedRemoteSockets = new Map();
        this._proxy = extHostRpc.getProxy(MainContext.MainThreadManagedSockets);
    }
    setFactory(socketFactoryId, makeConnection) {
        for (const socket of this._managedRemoteSockets.values()) {
            socket.dispose();
        }
        if (this._factory) {
            this._proxy.$unregisterSocketFactory(this._factory.socketFactoryId);
        }
        this._factory = new ManagedSocketFactory(socketFactoryId, makeConnection);
        this._proxy.$registerSocketFactory(this._factory.socketFactoryId);
    }
    async $openRemoteSocket(socketFactoryId) {
        if (!this._factory || this._factory.socketFactoryId !== socketFactoryId) {
            throw new Error(`No socket factory with id ${socketFactoryId}`);
        }
        const id = (++this._remoteSocketIdCounter);
        const socket = await this._factory.makeConnection();
        const disposable = new DisposableStore();
        this._managedRemoteSockets.set(id, new ManagedSocket(id, socket, disposable));
        disposable.add(toDisposable(() => this._managedRemoteSockets.delete(id)));
        disposable.add(socket.onDidEnd(() => {
            this._proxy.$onDidManagedSocketEnd(id);
            disposable.dispose();
        }));
        disposable.add(socket.onDidClose(e => {
            this._proxy.$onDidManagedSocketClose(id, e?.stack ?? e?.message);
            disposable.dispose();
        }));
        disposable.add(socket.onDidReceiveMessage(e => this._proxy.$onDidManagedSocketHaveData(id, VSBuffer.wrap(e))));
        return id;
    }
    $remoteSocketWrite(socketId, buffer) {
        this._managedRemoteSockets.get(socketId)?.actual.send(buffer.buffer);
    }
    $remoteSocketEnd(socketId) {
        const socket = this._managedRemoteSockets.get(socketId);
        if (socket) {
            socket.actual.end();
            socket.dispose();
        }
    }
    async $remoteSocketDrain(socketId) {
        await this._managedRemoteSockets.get(socketId)?.actual.drain?.();
    }
};
ExtHostManagedSockets = __decorate([
    __param(0, IExtHostRpcService),
    __metadata("design:paramtypes", [Object])
], ExtHostManagedSockets);
export { ExtHostManagedSockets };
class ManagedSocketFactory {
    constructor(socketFactoryId, makeConnection) {
        this.socketFactoryId = socketFactoryId;
        this.makeConnection = makeConnection;
    }
}
class ManagedSocket extends Disposable {
    constructor(socketId, actual, disposer) {
        super();
        this.socketId = socketId;
        this.actual = actual;
        this._register(disposer);
    }
}
