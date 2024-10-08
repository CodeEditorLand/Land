import { IExtensionGalleryService, IGlobalExtensionEnablementService } from '../../../../platform/extensionManagement/common/extensionManagement.js';
import { IExtensionStorageService } from '../../../../platform/extensionManagement/common/extensionStorage.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IExtensionManagementServerService } from '../../../services/extensionManagement/common/extensionManagement.js';
export declare class UnsupportedExtensionsMigrationContrib implements IWorkbenchContribution {
    constructor(extensionManagementServerService: IExtensionManagementServerService, extensionGalleryService: IExtensionGalleryService, extensionStorageService: IExtensionStorageService, extensionEnablementService: IGlobalExtensionEnablementService, logService: ILogService);
}
