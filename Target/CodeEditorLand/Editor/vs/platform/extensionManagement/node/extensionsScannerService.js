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
import { URI } from '../../../base/common/uri.js';
import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { IExtensionsProfileScannerService } from '../common/extensionsProfileScannerService.js';
import { NativeExtensionsScannerService, } from '../common/extensionsScannerService.js';
import { IFileService } from '../../files/common/files.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
let ExtensionsScannerService = class ExtensionsScannerService extends NativeExtensionsScannerService {
    constructor(userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService) {
        super(URI.file(environmentService.builtinExtensionsPath), URI.file(environmentService.extensionsPath), environmentService.userHome, userDataProfilesService.defaultProfile, userDataProfilesService, extensionsProfileScannerService, fileService, logService, environmentService, productService, uriIdentityService, instantiationService);
    }
};
ExtensionsScannerService = __decorate([
    __param(0, IUserDataProfilesService),
    __param(1, IExtensionsProfileScannerService),
    __param(2, IFileService),
    __param(3, ILogService),
    __param(4, INativeEnvironmentService),
    __param(5, IProductService),
    __param(6, IUriIdentityService),
    __param(7, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], ExtensionsScannerService);
export { ExtensionsScannerService };
