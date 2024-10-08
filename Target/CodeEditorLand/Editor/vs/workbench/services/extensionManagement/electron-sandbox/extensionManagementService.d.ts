import { ILocalExtension, IExtensionGalleryService, InstallOptions } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { URI } from '../../../../base/common/uri.js';
import { ExtensionManagementService as BaseExtensionManagementService } from '../common/extensionManagementService.js';
import { IExtensionManagementServer, IExtensionManagementServerService } from '../common/extensionManagement.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDownloadService } from '../../../../platform/download/common/download.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { INativeWorkbenchEnvironmentService } from '../../environment/electron-sandbox/environmentService.js';
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
import { IUserDataProfilesService } from '../../../../platform/userDataProfile/common/userDataProfile.js';
export declare class ExtensionManagementService extends BaseExtensionManagementService {
    private readonly environmentService;
    constructor(environmentService: INativeWorkbenchEnvironmentService, extensionManagementServerService: IExtensionManagementServerService, extensionGalleryService: IExtensionGalleryService, userDataProfileService: IUserDataProfileService, userDataProfilesService: IUserDataProfilesService, configurationService: IConfigurationService, productService: IProductService, downloadService: IDownloadService, userDataSyncEnablementService: IUserDataSyncEnablementService, dialogService: IDialogService, workspaceTrustRequestService: IWorkspaceTrustRequestService, extensionManifestPropertiesService: IExtensionManifestPropertiesService, fileService: IFileService, logService: ILogService, instantiationService: IInstantiationService, extensionsScannerService: IExtensionsScannerService, telemetryService: ITelemetryService);
    protected installVSIXInServer(vsix: URI, server: IExtensionManagementServer, options: InstallOptions | undefined): Promise<ILocalExtension>;
}
