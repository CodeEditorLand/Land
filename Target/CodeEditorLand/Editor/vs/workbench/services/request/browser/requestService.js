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
import { RequestChannelClient } from '../../../../platform/request/common/requestIpc.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { AbstractRequestService } from '../../../../platform/request/common/request.js';
import { request } from '../../../../base/parts/request/browser/request.js';
import { ILogService } from '../../../../platform/log/common/log.js';
let BrowserRequestService = class BrowserRequestService extends AbstractRequestService {
    constructor(remoteAgentService, configurationService, logService) {
        super(logService);
        this.remoteAgentService = remoteAgentService;
        this.configurationService = configurationService;
    }
    async request(options, token) {
        try {
            if (!options.proxyAuthorization) {
                options.proxyAuthorization = this.configurationService.getValue('http.proxyAuthorization');
            }
            const context = await this.logAndRequest(options, () => request(options, token));
            const connection = this.remoteAgentService.getConnection();
            if (connection && context.res.statusCode === 405) {
                return this._makeRemoteRequest(connection, options, token);
            }
            return context;
        }
        catch (error) {
            const connection = this.remoteAgentService.getConnection();
            if (connection) {
                return this._makeRemoteRequest(connection, options, token);
            }
            throw error;
        }
    }
    async resolveProxy(url) {
        return undefined; // not implemented in the web
    }
    async lookupAuthorization(authInfo) {
        return undefined; // not implemented in the web
    }
    async lookupKerberosAuthorization(url) {
        return undefined; // not implemented in the web
    }
    async loadCertificates() {
        return []; // not implemented in the web
    }
    _makeRemoteRequest(connection, options, token) {
        return connection.withChannel('request', channel => new RequestChannelClient(channel).request(options, token));
    }
};
BrowserRequestService = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, IConfigurationService),
    __param(2, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object])
], BrowserRequestService);
export { BrowserRequestService };
// --- Internal commands to help authentication for extensions
CommandsRegistry.registerCommand('_workbench.fetchJSON', async function (accessor, url, method) {
    const result = await fetch(url, { method, headers: { Accept: 'application/json' } });
    if (result.ok) {
        return result.json();
    }
    else {
        throw new Error(result.statusText);
    }
});
