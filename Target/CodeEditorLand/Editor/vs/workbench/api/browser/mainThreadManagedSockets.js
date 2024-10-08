/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { Emitter } from '../../../base/common/event.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { ManagedSocket, connectManagedSocket } from '../../../platform/remote/common/managedSocket.js';
import { IRemoteSocketFactoryService } from '../../../platform/remote/common/remoteSocketFactoryService.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
let MainThreadManagedSockets = class MainThreadManagedSockets extends Disposable {
    constructor(extHostContext, _remoteSocketFactoryService) {
        super();
        this._remoteSocketFactoryService = _remoteSocketFactoryService;
        this._registrations = new Map();
        this._remoteSockets = new Map();
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostManagedSockets);
    }
    async $registerSocketFactory(socketFactoryId) {
        const that = this;
        const socketFactory = new class {
            supports(connectTo) {
                return (connectTo.id === socketFactoryId);
            }
            connect(connectTo, path, query, debugLabel) {
                return new Promise((resolve, reject) => {
                    if (connectTo.id !== socketFactoryId) {
                        return reject(new Error('Invalid connectTo'));
                    }
                    const factoryId = connectTo.id;
                    that._proxy.$openRemoteSocket(factoryId).then(socketId => {
                        const half = {
                            onClose: new Emitter(),
                            onData: new Emitter(),
                            onEnd: new Emitter(),
                        };
                        that._remoteSockets.set(socketId, half);
                        MainThreadManagedSocket.connect(socketId, that._proxy, path, query, debugLabel, half)
                            .then(socket => {
                            socket.onDidDispose(() => that._remoteSockets.delete(socketId));
                            resolve(socket);
                        }, err => {
                            that._remoteSockets.delete(socketId);
                            reject(err);
                        });
                    }).catch(reject);
                });
            }
        };
        this._registrations.set(socketFactoryId, this._remoteSocketFactoryService.register(1 /* RemoteConnectionType.Managed */, socketFactory));
    }
    async $unregisterSocketFactory(socketFactoryId) {
        this._registrations.get(socketFactoryId)?.dispose();
    }
    $onDidManagedSocketHaveData(socketId, data) {
        this._remoteSockets.get(socketId)?.onData.fire(data);
    }
    $onDidManagedSocketClose(socketId, error) {
        this._remoteSockets.get(socketId)?.onClose.fire({
            type: 0 /* SocketCloseEventType.NodeSocketCloseEvent */,
            error: error ? new Error(error) : undefined,
            hadError: !!error
        });
        this._remoteSockets.delete(socketId);
    }
    $onDidManagedSocketEnd(socketId) {
        this._remoteSockets.get(socketId)?.onEnd.fire();
    }
};
MainThreadManagedSockets = __decorate([
    extHostNamedCustomer(MainContext.MainThreadManagedSockets),
    __param(1, IRemoteSocketFactoryService),
    __metadata("design:paramtypes", [Object, Object])
], MainThreadManagedSockets);
export { MainThreadManagedSockets };
export class MainThreadManagedSocket extends ManagedSocket {
    static connect(socketId, proxy, path, query, debugLabel, half) {
        const socket = new MainThreadManagedSocket(socketId, proxy, debugLabel, half);
        return connectManagedSocket(socket, path, query, debugLabel, half);
    }
    constructor(socketId, proxy, debugLabel, half) {
        super(debugLabel, half);
        this.socketId = socketId;
        this.proxy = proxy;
    }
    write(buffer) {
        this.proxy.$remoteSocketWrite(this.socketId, buffer);
    }
    closeRemote() {
        this.proxy.$remoteSocketEnd(this.socketId);
    }
    drain() {
        return this.proxy.$remoteSocketDrain(this.socketId);
    }
}
