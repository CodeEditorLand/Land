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
import { Disposable } from '../../../../base/common/lifecycle.js';
import { getDelayedChannel, IPCLogger } from '../../../../base/parts/ipc/common/ipc.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { connectRemoteAgentManagement } from '../../../../platform/remote/common/remoteAgentConnection.js';
import { IRemoteAuthorityResolverService } from '../../../../platform/remote/common/remoteAuthorityResolver.js';
import { RemoteExtensionEnvironmentChannelClient } from './remoteAgentEnvironmentChannel.js';
import { Emitter } from '../../../../base/common/event.js';
import { ISignService } from '../../../../platform/sign/common/sign.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
import { IRemoteSocketFactoryService } from '../../../../platform/remote/common/remoteSocketFactoryService.js';
let AbstractRemoteAgentService = class AbstractRemoteAgentService extends Disposable {
    constructor(remoteSocketFactoryService, userDataProfileService, _environmentService, productService, _remoteAuthorityResolverService, signService, logService) {
        super();
        this.remoteSocketFactoryService = remoteSocketFactoryService;
        this.userDataProfileService = userDataProfileService;
        this._environmentService = _environmentService;
        this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
        if (this._environmentService.remoteAuthority) {
            this._connection = this._register(new RemoteAgentConnection(this._environmentService.remoteAuthority, productService.commit, productService.quality, this.remoteSocketFactoryService, this._remoteAuthorityResolverService, signService, logService));
        }
        else {
            this._connection = null;
        }
        this._environment = null;
    }
    getConnection() {
        return this._connection;
    }
    getEnvironment() {
        return this.getRawEnvironment().then(undefined, () => null);
    }
    getRawEnvironment() {
        if (!this._environment) {
            this._environment = this._withChannel(async (channel, connection) => {
                const env = await RemoteExtensionEnvironmentChannelClient.getEnvironmentData(channel, connection.remoteAuthority, this.userDataProfileService.currentProfile.isDefault ? undefined : this.userDataProfileService.currentProfile.id);
                this._remoteAuthorityResolverService._setAuthorityConnectionToken(connection.remoteAuthority, env.connectionToken);
                return env;
            }, null);
        }
        return this._environment;
    }
    getExtensionHostExitInfo(reconnectionToken) {
        return this._withChannel((channel, connection) => RemoteExtensionEnvironmentChannelClient.getExtensionHostExitInfo(channel, connection.remoteAuthority, reconnectionToken), null);
    }
    getDiagnosticInfo(options) {
        return this._withChannel(channel => RemoteExtensionEnvironmentChannelClient.getDiagnosticInfo(channel, options), undefined);
    }
    updateTelemetryLevel(telemetryLevel) {
        return this._withTelemetryChannel(channel => RemoteExtensionEnvironmentChannelClient.updateTelemetryLevel(channel, telemetryLevel), undefined);
    }
    logTelemetry(eventName, data) {
        return this._withTelemetryChannel(channel => RemoteExtensionEnvironmentChannelClient.logTelemetry(channel, eventName, data), undefined);
    }
    flushTelemetry() {
        return this._withTelemetryChannel(channel => RemoteExtensionEnvironmentChannelClient.flushTelemetry(channel), undefined);
    }
    getRoundTripTime() {
        return this._withTelemetryChannel(async (channel) => {
            const start = Date.now();
            await RemoteExtensionEnvironmentChannelClient.ping(channel);
            return Date.now() - start;
        }, undefined);
    }
    async endConnection() {
        if (this._connection) {
            await this._connection.end();
            this._connection.dispose();
        }
    }
    _withChannel(callback, fallback) {
        const connection = this.getConnection();
        if (!connection) {
            return Promise.resolve(fallback);
        }
        return connection.withChannel('remoteextensionsenvironment', (channel) => callback(channel, connection));
    }
    _withTelemetryChannel(callback, fallback) {
        const connection = this.getConnection();
        if (!connection) {
            return Promise.resolve(fallback);
        }
        return connection.withChannel('telemetry', (channel) => callback(channel, connection));
    }
};
AbstractRemoteAgentService = __decorate([
    __param(0, IRemoteSocketFactoryService),
    __param(1, IUserDataProfileService),
    __param(2, IWorkbenchEnvironmentService),
    __param(3, IProductService),
    __param(4, IRemoteAuthorityResolverService),
    __param(5, ISignService),
    __param(6, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], AbstractRemoteAgentService);
export { AbstractRemoteAgentService };
class RemoteAgentConnection extends Disposable {
    constructor(remoteAuthority, _commit, _quality, _remoteSocketFactoryService, _remoteAuthorityResolverService, _signService, _logService) {
        super();
        this._commit = _commit;
        this._quality = _quality;
        this._remoteSocketFactoryService = _remoteSocketFactoryService;
        this._remoteAuthorityResolverService = _remoteAuthorityResolverService;
        this._signService = _signService;
        this._logService = _logService;
        this._onReconnecting = this._register(new Emitter());
        this.onReconnecting = this._onReconnecting.event;
        this._onDidStateChange = this._register(new Emitter());
        this.onDidStateChange = this._onDidStateChange.event;
        this.end = () => Promise.resolve();
        this.remoteAuthority = remoteAuthority;
        this._connection = null;
    }
    getChannel(channelName) {
        return getDelayedChannel(this._getOrCreateConnection().then(c => c.getChannel(channelName)));
    }
    withChannel(channelName, callback) {
        const channel = this.getChannel(channelName);
        const result = callback(channel);
        return result;
    }
    registerChannel(channelName, channel) {
        this._getOrCreateConnection().then(client => client.registerChannel(channelName, channel));
    }
    async getInitialConnectionTimeMs() {
        try {
            await this._getOrCreateConnection();
        }
        catch {
            // ignored -- time is measured even if connection fails
        }
        return this._initialConnectionMs;
    }
    _getOrCreateConnection() {
        if (!this._connection) {
            this._connection = this._createConnection();
        }
        return this._connection;
    }
    async _createConnection() {
        let firstCall = true;
        const options = {
            commit: this._commit,
            quality: this._quality,
            addressProvider: {
                getAddress: async () => {
                    if (firstCall) {
                        firstCall = false;
                    }
                    else {
                        this._onReconnecting.fire(undefined);
                    }
                    const { authority } = await this._remoteAuthorityResolverService.resolveAuthority(this.remoteAuthority);
                    return { connectTo: authority.connectTo, connectionToken: authority.connectionToken };
                }
            },
            remoteSocketFactoryService: this._remoteSocketFactoryService,
            signService: this._signService,
            logService: this._logService,
            ipcLogger: false ? new IPCLogger(`Local \u2192 Remote`, `Remote \u2192 Local`) : null
        };
        let connection;
        const start = Date.now();
        try {
            connection = this._register(await connectRemoteAgentManagement(options, this.remoteAuthority, `renderer`));
        }
        finally {
            this._initialConnectionMs = Date.now() - start;
        }
        connection.protocol.onDidDispose(() => {
            connection.dispose();
        });
        this.end = () => {
            connection.protocol.sendDisconnect();
            return connection.protocol.drain();
        };
        this._register(connection.onDidStateChange(e => this._onDidStateChange.fire(e)));
        return connection.client;
    }
}
