import { IExtensionManagementService } from '../common/extensionManagement.js';
import { IFileService } from '../../files/common/files.js';
import { IProductService } from '../../product/common/productService.js';
import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { IExtensionRecommendationNotificationService } from '../../extensionRecommendations/common/extensionRecommendations.js';
import { INativeHostService } from '../../native/common/native.js';
import { IStorageService } from '../../storage/common/storage.js';
import { ITelemetryService } from '../../telemetry/common/telemetry.js';
import { AbstractNativeExtensionTipsService } from '../common/extensionTipsService.js';
export declare class ExtensionTipsService extends AbstractNativeExtensionTipsService {
    constructor(environmentService: INativeEnvironmentService, telemetryService: ITelemetryService, extensionManagementService: IExtensionManagementService, storageService: IStorageService, nativeHostService: INativeHostService, extensionRecommendationNotificationService: IExtensionRecommendationNotificationService, fileService: IFileService, productService: IProductService);
}
