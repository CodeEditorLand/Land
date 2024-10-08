import { Disposable } from '../../../../base/common/lifecycle.js';
import { IExtensionGalleryService, IGlobalExtensionEnablementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IExtensionStorageService } from '../../../../platform/extensionManagement/common/extensionStorage.js';
import { INativeServerExtensionManagementService } from '../../../../platform/extensionManagement/node/extensionManagementService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare class ExtensionsContributions extends Disposable {
    constructor(extensionManagementService: INativeServerExtensionManagementService, extensionGalleryService: IExtensionGalleryService, extensionStorageService: IExtensionStorageService, extensionEnablementService: IGlobalExtensionEnablementService, storageService: IStorageService, logService: ILogService);
}
