import { IExtensionGalleryService, IExtensionManagementService, IGlobalExtensionEnablementService } from './extensionManagement.js';
import { IExtensionStorageService } from './extensionStorage.js';
import { ILogService } from '../../log/common/log.js';
/**
 * Migrates the installed unsupported nightly extension to a supported pre-release extension. It includes following:
 * 	- Uninstall the Unsupported extension
 * 	- Install (with optional storage migration) the Pre-release extension only if
 * 		- the extension is not installed
 * 		- or it is a release version and the unsupported extension is enabled.
 */
export declare function migrateUnsupportedExtensions(extensionManagementService: IExtensionManagementService, galleryService: IExtensionGalleryService, extensionStorageService: IExtensionStorageService, extensionEnablementService: IGlobalExtensionEnablementService, logService: ILogService): Promise<void>;
