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
import { localize } from '../../../../nls.js';
import { IExtensionManagementServerService } from './extensionManagement.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { Schemas } from '../../../../base/common/network.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { isWeb } from '../../../../base/common/platform.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { WebExtensionManagementService } from './webExtensionManagementService.js';
import { RemoteExtensionManagementService } from './remoteExtensionManagementService.js';
let ExtensionManagementServerService = class ExtensionManagementServerService {
    constructor(remoteAgentService, labelService, instantiationService) {
        this.localExtensionManagementServer = null;
        this.remoteExtensionManagementServer = null;
        this.webExtensionManagementServer = null;
        const remoteAgentConnection = remoteAgentService.getConnection();
        if (remoteAgentConnection) {
            const extensionManagementService = instantiationService.createInstance(RemoteExtensionManagementService, remoteAgentConnection.getChannel('extensions'));
            this.remoteExtensionManagementServer = {
                id: 'remote',
                extensionManagementService,
                get label() { return labelService.getHostLabel(Schemas.vscodeRemote, remoteAgentConnection.remoteAuthority) || localize('remote', "Remote"); },
            };
        }
        if (isWeb) {
            const extensionManagementService = instantiationService.createInstance(WebExtensionManagementService);
            this.webExtensionManagementServer = {
                id: 'web',
                extensionManagementService,
                label: localize('browser', "Browser"),
            };
        }
    }
    getExtensionManagementServer(extension) {
        if (extension.location.scheme === Schemas.vscodeRemote) {
            return this.remoteExtensionManagementServer;
        }
        if (this.webExtensionManagementServer) {
            return this.webExtensionManagementServer;
        }
        throw new Error(`Invalid Extension ${extension.location}`);
    }
    getExtensionInstallLocation(extension) {
        const server = this.getExtensionManagementServer(extension);
        return server === this.remoteExtensionManagementServer ? 2 : 3;
    }
};
ExtensionManagementServerService = __decorate([
    __param(0, IRemoteAgentService),
    __param(1, ILabelService),
    __param(2, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ExtensionManagementServerService);
export { ExtensionManagementServerService };
registerSingleton(IExtensionManagementServerService, ExtensionManagementServerService, 1);
