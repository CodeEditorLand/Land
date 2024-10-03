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
import { generateUuid } from '../../../../base/common/uuid.js';
import { IExtensionGalleryService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { ExtensionManagementService as BaseExtensionManagementService } from '../common/extensionManagementService.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { IExtensionManagementServerService, IWorkbenchExtensionManagementService } from '../common/extensionManagement.js';
import { Schemas } from '../../../../base/common/network.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDownloadService } from '../../../../platform/download/common/download.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
import { joinPath } from '../../../../base/common/resources.js';
import { IUserDataSyncEnablementService } from '../../../../platform/userDataSync/common/userDataSync.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IWorkspaceTrustRequestService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IExtensionManifestPropertiesService } from '../../extensions/common/extensionManifestPropertiesService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IFileService } from '../../../../platform/files/common/files.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IUserDataProfileService } from '../../userDataProfile/common/userDataProfile.js';
import { IExtensionsScannerService } from '../../../../platform/extensionManagement/common/extensionsScannerService.js';
import { ITelemetryService } from '../../../../platform/telemetry/common/telemetry.js';
let ExtensionManagementService = class ExtensionManagementService extends BaseExtensionManagementService {
    constructor(environmentService, extensionManagementServerService, extensionGalleryService, userDataProfileService, configurationService, productService, downloadService, userDataSyncEnablementService, dialogService, workspaceTrustRequestService, extensionManifestPropertiesService, fileService, logService, instantiationService, extensionsScannerService, telemetryService) {
        super(extensionManagementServerService, extensionGalleryService, userDataProfileService, configurationService, productService, downloadService, userDataSyncEnablementService, dialogService, workspaceTrustRequestService, extensionManifestPropertiesService, fileService, logService, instantiationService, extensionsScannerService, telemetryService);
        this.environmentService = environmentService;
    }
    async installVSIXInServer(vsix, server, options) {
        if (vsix.scheme === Schemas.vscodeRemote && server === this.extensionManagementServerService.localExtensionManagementServer) {
            const downloadedLocation = joinPath(this.environmentService.tmpDir, generateUuid());
            await this.downloadService.download(vsix, downloadedLocation);
            vsix = downloadedLocation;
        }
        return super.installVSIXInServer(vsix, server, options);
    }
};
ExtensionManagementService = __decorate([
    __param(0, INativeWorkbenchEnvironmentService),
    __param(1, IExtensionManagementServerService),
    __param(2, IExtensionGalleryService),
    __param(3, IUserDataProfileService),
    __param(4, IConfigurationService),
    __param(5, IProductService),
    __param(6, IDownloadService),
    __param(7, IUserDataSyncEnablementService),
    __param(8, IDialogService),
    __param(9, IWorkspaceTrustRequestService),
    __param(10, IExtensionManifestPropertiesService),
    __param(11, IFileService),
    __param(12, ILogService),
    __param(13, IInstantiationService),
    __param(14, IExtensionsScannerService),
    __param(15, ITelemetryService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ExtensionManagementService);
export { ExtensionManagementService };
registerSingleton(IWorkbenchExtensionManagementService, ExtensionManagementService, 1);
