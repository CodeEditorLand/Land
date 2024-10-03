import { IExtensionGalleryService, IExtensionManagementService, IGlobalExtensionEnablementService } from './extensionManagement.js';
import { IExtensionStorageService } from './extensionStorage.js';
import { ILogService } from '../../log/common/log.js';
export declare function migrateUnsupportedExtensions(extensionManagementService: IExtensionManagementService, galleryService: IExtensionGalleryService, extensionStorageService: IExtensionStorageService, extensionEnablementService: IGlobalExtensionEnablementService, logService: ILogService): Promise<void>;
