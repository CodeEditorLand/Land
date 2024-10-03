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
import { Schemas } from '../../../../base/common/network.js';
import { IExtensionManagementServerService } from '../common/extensionManagement.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
import { ISharedProcessService } from '../../../../platform/ipc/electron-sandbox/services.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { NativeRemoteExtensionManagementService } from './remoteExtensionManagementService.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { NativeExtensionManagementService } from './nativeExtensionManagementService.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
let ExtensionManagementServerService = class ExtensionManagementServerService extends Disposable {
    constructor(sharedProcessService, remoteAgentService, labelService, instantiationService) {
        super();
        this.remoteExtensionManagementServer = null;
        this.webExtensionManagementServer = null;
        const localExtensionManagementService = this._register(instantiationService.createInstance(NativeExtensionManagementService, sharedProcessService.getChannel('extensions')));
        this.localExtensionManagementServer = { extensionManagementService: localExtensionManagementService, id: 'local', label: localize('local', "Local") };
        const remoteAgentConnection = remoteAgentService.getConnection();
        if (remoteAgentConnection) {
            const extensionManagementService = instantiationService.createInstance(NativeRemoteExtensionManagementService, remoteAgentConnection.getChannel('extensions'), this.localExtensionManagementServer);
            this.remoteExtensionManagementServer = {
                id: 'remote',
                extensionManagementService,
                get label() { return labelService.getHostLabel(Schemas.vscodeRemote, remoteAgentConnection.remoteAuthority) || localize('remote', "Remote"); },
            };
        }
    }
    getExtensionManagementServer(extension) {
        if (extension.location.scheme === Schemas.file) {
            return this.localExtensionManagementServer;
        }
        if (this.remoteExtensionManagementServer && extension.location.scheme === Schemas.vscodeRemote) {
            return this.remoteExtensionManagementServer;
        }
        throw new Error(`Invalid Extension ${extension.location}`);
    }
    getExtensionInstallLocation(extension) {
        const server = this.getExtensionManagementServer(extension);
        return server === this.remoteExtensionManagementServer ? 2 : 1;
    }
};
ExtensionManagementServerService = __decorate([
    __param(0, ISharedProcessService),
    __param(1, IRemoteAgentService),
    __param(2, ILabelService),
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ExtensionManagementServerService);
export { ExtensionManagementServerService };
registerSingleton(IExtensionManagementServerService, ExtensionManagementServerService, 1);
