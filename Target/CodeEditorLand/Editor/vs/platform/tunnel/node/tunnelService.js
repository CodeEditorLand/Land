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
import * as net from 'net';
import * as os from 'os';
import { BROWSER_RESTRICTED_PORTS, findFreePortFaster } from '../../../base/node/ports.js';
import { NodeSocket } from '../../../base/parts/ipc/node/ipc.net.js';
import { Barrier } from '../../../base/common/async.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { OS } from '../../../base/common/platform.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { connectRemoteAgentTunnel } from '../../remote/common/remoteAgentConnection.js';
import { IRemoteSocketFactoryService } from '../../remote/common/remoteSocketFactoryService.js';
import { ISignService } from '../../sign/common/sign.js';
import { AbstractTunnelService, TunnelPrivacyId, isAllInterfaces, isLocalhost, isPortPrivileged, isTunnelProvider } from '../common/tunnel.js';
import { VSBuffer } from '../../../base/common/buffer.js';
async function createRemoteTunnel(options, defaultTunnelHost, tunnelRemoteHost, tunnelRemotePort, tunnelLocalPort) {
    let readyTunnel;
    for (let attempts = 3; attempts; attempts--) {
        readyTunnel?.dispose();
        const tunnel = new NodeRemoteTunnel(options, defaultTunnelHost, tunnelRemoteHost, tunnelRemotePort, tunnelLocalPort);
        readyTunnel = await tunnel.waitForReady();
        if ((tunnelLocalPort && BROWSER_RESTRICTED_PORTS[tunnelLocalPort]) || !BROWSER_RESTRICTED_PORTS[readyTunnel.tunnelLocalPort]) {
            break;
        }
    }
    return readyTunnel;
}
export class NodeRemoteTunnel extends Disposable {
    constructor(options, defaultTunnelHost, tunnelRemoteHost, tunnelRemotePort, suggestedLocalPort) {
        super();
        this.defaultTunnelHost = defaultTunnelHost;
        this.suggestedLocalPort = suggestedLocalPort;
        this.privacy = TunnelPrivacyId.Private;
        this._socketsDispose = new Map();
        this._options = options;
        this._server = net.createServer();
        this._barrier = new Barrier();
        this._listeningListener = () => this._barrier.open();
        this._server.on('listening', this._listeningListener);
        this._connectionListener = (socket) => this._onConnection(socket);
        this._server.on('connection', this._connectionListener);
        // If there is no error listener and there is an error it will crash the whole window
        this._errorListener = () => { };
        this._server.on('error', this._errorListener);
        this.tunnelRemotePort = tunnelRemotePort;
        this.tunnelRemoteHost = tunnelRemoteHost;
    }
    async dispose() {
        super.dispose();
        this._server.removeListener('listening', this._listeningListener);
        this._server.removeListener('connection', this._connectionListener);
        this._server.removeListener('error', this._errorListener);
        this._server.close();
        const disposers = Array.from(this._socketsDispose.values());
        disposers.forEach(disposer => {
            disposer();
        });
    }
    async waitForReady() {
        const startPort = this.suggestedLocalPort ?? this.tunnelRemotePort;
        const hostname = isAllInterfaces(this.defaultTunnelHost) ? '0.0.0.0' : '127.0.0.1';
        // try to get the same port number as the remote port number...
        let localPort = await findFreePortFaster(startPort, 2, 1000, hostname);
        // if that fails, the method above returns 0, which works out fine below...
        let address = null;
        this._server.listen(localPort, this.defaultTunnelHost);
        await this._barrier.wait();
        address = this._server.address();
        // It is possible for findFreePortFaster to return a port that there is already a server listening on. This causes the previous listen call to error out.
        if (!address) {
            localPort = 0;
            this._server.listen(localPort, this.defaultTunnelHost);
            await this._barrier.wait();
            address = this._server.address();
        }
        this.tunnelLocalPort = address.port;
        this.localAddress = `${this.tunnelRemoteHost === '127.0.0.1' ? '127.0.0.1' : 'localhost'}:${address.port}`;
        return this;
    }
    async _onConnection(localSocket) {
        // pause reading on the socket until we have a chance to forward its data
        localSocket.pause();
        const tunnelRemoteHost = (isLocalhost(this.tunnelRemoteHost) || isAllInterfaces(this.tunnelRemoteHost)) ? 'localhost' : this.tunnelRemoteHost;
        const protocol = await connectRemoteAgentTunnel(this._options, tunnelRemoteHost, this.tunnelRemotePort);
        const remoteSocket = protocol.getSocket();
        const dataChunk = protocol.readEntireBuffer();
        protocol.dispose();
        if (dataChunk.byteLength > 0) {
            localSocket.write(dataChunk.buffer);
        }
        localSocket.on('end', () => {
            if (localSocket.localAddress) {
                this._socketsDispose.delete(localSocket.localAddress);
            }
            remoteSocket.end();
        });
        localSocket.on('close', () => remoteSocket.end());
        localSocket.on('error', () => {
            if (localSocket.localAddress) {
                this._socketsDispose.delete(localSocket.localAddress);
            }
            if (remoteSocket instanceof NodeSocket) {
                remoteSocket.socket.destroy();
            }
            else {
                remoteSocket.end();
            }
        });
        if (remoteSocket instanceof NodeSocket) {
            this._mirrorNodeSocket(localSocket, remoteSocket);
        }
        else {
            this._mirrorGenericSocket(localSocket, remoteSocket);
        }
        if (localSocket.localAddress) {
            this._socketsDispose.set(localSocket.localAddress, () => {
                // Need to end instead of unpipe, otherwise whatever is connected locally could end up "stuck" with whatever state it had until manually exited.
                localSocket.end();
                remoteSocket.end();
            });
        }
    }
    _mirrorGenericSocket(localSocket, remoteSocket) {
        remoteSocket.onClose(() => localSocket.destroy());
        remoteSocket.onEnd(() => localSocket.end());
        remoteSocket.onData(d => localSocket.write(d.buffer));
        localSocket.on('data', d => remoteSocket.write(VSBuffer.wrap(d)));
        localSocket.resume();
    }
    _mirrorNodeSocket(localSocket, remoteNodeSocket) {
        const remoteSocket = remoteNodeSocket.socket;
        remoteSocket.on('end', () => localSocket.end());
        remoteSocket.on('close', () => localSocket.end());
        remoteSocket.on('error', () => {
            localSocket.destroy();
        });
        remoteSocket.pipe(localSocket);
        localSocket.pipe(remoteSocket);
    }
}
let BaseTunnelService = class BaseTunnelService extends AbstractTunnelService {
    constructor(remoteSocketFactoryService, logService, signService, productService, configurationService) {
        super(logService, configurationService);
        this.remoteSocketFactoryService = remoteSocketFactoryService;
        this.signService = signService;
        this.productService = productService;
    }
    isPortPrivileged(port) {
        return isPortPrivileged(port, this.defaultTunnelHost, OS, os.release());
    }
    retainOrCreateTunnel(addressOrTunnelProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol) {
        const existing = this.getTunnelFromMap(remoteHost, remotePort);
        if (existing) {
            ++existing.refcount;
            return existing.value;
        }
        if (isTunnelProvider(addressOrTunnelProvider)) {
            return this.createWithProvider(addressOrTunnelProvider, remoteHost, remotePort, localPort, elevateIfNeeded, privacy, protocol);
        }
        else {
            this.logService.trace(`ForwardedPorts: (TunnelService) Creating tunnel without provider ${remoteHost}:${remotePort} on local port ${localPort}.`);
            const options = {
                commit: this.productService.commit,
                quality: this.productService.quality,
                addressProvider: addressOrTunnelProvider,
                remoteSocketFactoryService: this.remoteSocketFactoryService,
                signService: this.signService,
                logService: this.logService,
                ipcLogger: null
            };
            const tunnel = createRemoteTunnel(options, localHost, remoteHost, remotePort, localPort);
            this.logService.trace('ForwardedPorts: (TunnelService) Tunnel created without provider.');
            this.addTunnelToMap(remoteHost, remotePort, tunnel);
            return tunnel;
        }
    }
};
BaseTunnelService = __decorate([
    __param(0, IRemoteSocketFactoryService),
    __param(1, ILogService),
    __param(2, ISignService),
    __param(3, IProductService),
    __param(4, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], BaseTunnelService);
export { BaseTunnelService };
let TunnelService = class TunnelService extends BaseTunnelService {
    constructor(remoteSocketFactoryService, logService, signService, productService, configurationService) {
        super(remoteSocketFactoryService, logService, signService, productService, configurationService);
    }
};
TunnelService = __decorate([
    __param(0, IRemoteSocketFactoryService),
    __param(1, ILogService),
    __param(2, ISignService),
    __param(3, IProductService),
    __param(4, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], TunnelService);
export { TunnelService };
let SharedTunnelsService = class SharedTunnelsService extends Disposable {
    constructor(remoteSocketFactoryService, logService, productService, signService, configurationService) {
        super();
        this.remoteSocketFactoryService = remoteSocketFactoryService;
        this.logService = logService;
        this.productService = productService;
        this.signService = signService;
        this.configurationService = configurationService;
        this._tunnelServices = new Map();
    }
    async openTunnel(authority, addressProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol) {
        this.logService.trace(`ForwardedPorts: (SharedTunnelService) openTunnel request for ${remoteHost}:${remotePort} on local port ${localPort}.`);
        if (!this._tunnelServices.has(authority)) {
            const tunnelService = new TunnelService(this.remoteSocketFactoryService, this.logService, this.signService, this.productService, this.configurationService);
            this._register(tunnelService);
            this._tunnelServices.set(authority, tunnelService);
            tunnelService.onTunnelClosed(async () => {
                if ((await tunnelService.tunnels).length === 0) {
                    tunnelService.dispose();
                    this._tunnelServices.delete(authority);
                }
            });
        }
        return this._tunnelServices.get(authority).openTunnel(addressProvider, remoteHost, remotePort, localHost, localPort, elevateIfNeeded, privacy, protocol);
    }
};
SharedTunnelsService = __decorate([
    __param(0, IRemoteSocketFactoryService),
    __param(1, ILogService),
    __param(2, IProductService),
    __param(3, ISignService),
    __param(4, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], SharedTunnelsService);
export { SharedTunnelsService };
