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
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { AbstractTunnelService, ITunnelService, isTunnelProvider } from '../../../../platform/tunnel/common/tunnel.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
let TunnelService = class TunnelService extends AbstractTunnelService {
    constructor(logService, environmentService, configurationService) {
        super(logService, configurationService);
        this.environmentService = environmentService;
    }
    isPortPrivileged(_port) {
        return false;
    }
    retainOrCreateTunnel(tunnelProvider, remoteHost, remotePort, _localHost, localPort, elevateIfNeeded, privacy, protocol) {
        const existing = this.getTunnelFromMap(remoteHost, remotePort);
        if (existing) {
            ++existing.refcount;
            return existing.value;
        }
        if (isTunnelProvider(tunnelProvider)) {
            return this.createWithProvider(tunnelProvider, remoteHost, remotePort, localPort, elevateIfNeeded, privacy, protocol);
        }
        return undefined;
    }
    canTunnel(uri) {
        return super.canTunnel(uri) && !!this.environmentService.remoteAuthority;
    }
};
TunnelService = __decorate([
    __param(0, ILogService),
    __param(1, IWorkbenchEnvironmentService),
    __param(2, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], TunnelService);
export { TunnelService };
registerSingleton(ITunnelService, TunnelService, 1 /* InstantiationType.Delayed */);
