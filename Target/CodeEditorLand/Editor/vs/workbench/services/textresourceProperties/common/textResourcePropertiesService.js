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
import { ITextResourcePropertiesService } from '../../../../editor/common/services/textResourceConfiguration.js';
import { OS } from '../../../../base/common/platform.js';
import { Schemas } from '../../../../base/common/network.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IRemoteAgentService } from '../../remote/common/remoteAgentService.js';
let TextResourcePropertiesService = class TextResourcePropertiesService {
    constructor(configurationService, remoteAgentService, environmentService, storageService) {
        this.configurationService = configurationService;
        this.environmentService = environmentService;
        this.storageService = storageService;
        this.remoteEnvironment = null;
        remoteAgentService.getEnvironment().then(remoteEnv => this.remoteEnvironment = remoteEnv);
    }
    getEOL(resource, language) {
        const eol = this.configurationService.getValue('files.eol', { overrideIdentifier: language, resource });
        if (eol && typeof eol === 'string' && eol !== 'auto') {
            return eol;
        }
        const os = this.getOS(resource);
        return os === 3 || os === 2 ? '\n' : '\r\n';
    }
    getOS(resource) {
        let os = OS;
        const remoteAuthority = this.environmentService.remoteAuthority;
        if (remoteAuthority) {
            if (resource && resource.scheme !== Schemas.file) {
                const osCacheKey = `resource.authority.os.${remoteAuthority}`;
                os = this.remoteEnvironment ? this.remoteEnvironment.os : this.storageService.getNumber(osCacheKey, 1, OS);
                this.storageService.store(osCacheKey, os, 1, 1);
            }
        }
        return os;
    }
};
TextResourcePropertiesService = __decorate([
    __param(0, IConfigurationService),
    __param(1, IRemoteAgentService),
    __param(2, IWorkbenchEnvironmentService),
    __param(3, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], TextResourcePropertiesService);
export { TextResourcePropertiesService };
registerSingleton(ITextResourcePropertiesService, TextResourcePropertiesService, 1);
