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
import { IExtensionGalleryService, IGlobalExtensionEnablementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { ExtensionStorageService, IExtensionStorageService } from '../../../../platform/extensionManagement/common/extensionStorage.js';
import { migrateUnsupportedExtensions } from '../../../../platform/extensionManagement/common/unsupportedExtensionsMigration.js';
import { INativeServerExtensionManagementService } from '../../../../platform/extensionManagement/node/extensionManagementService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
let ExtensionsContributions = class ExtensionsContributions extends Disposable {
    constructor(extensionManagementService, extensionGalleryService, extensionStorageService, extensionEnablementService, storageService, logService) {
        super();
        extensionManagementService.cleanUp();
        migrateUnsupportedExtensions(extensionManagementService, extensionGalleryService, extensionStorageService, extensionEnablementService, logService);
        ExtensionStorageService.removeOutdatedExtensionVersions(extensionManagementService, storageService);
    }
};
ExtensionsContributions = __decorate([
    __param(0, INativeServerExtensionManagementService),
    __param(1, IExtensionGalleryService),
    __param(2, IExtensionStorageService),
    __param(3, IGlobalExtensionEnablementService),
    __param(4, IStorageService),
    __param(5, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], ExtensionsContributions);
export { ExtensionsContributions };
