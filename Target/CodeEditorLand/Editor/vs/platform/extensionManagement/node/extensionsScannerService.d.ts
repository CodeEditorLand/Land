import { INativeEnvironmentService } from '../../environment/common/environment.js';
import { IExtensionsProfileScannerService } from '../common/extensionsProfileScannerService.js';
import { IExtensionsScannerService, NativeExtensionsScannerService } from '../common/extensionsScannerService.js';
import { IFileService } from '../../files/common/files.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { IUriIdentityService } from '../../uriIdentity/common/uriIdentity.js';
import { IUserDataProfilesService } from '../../userDataProfile/common/userDataProfile.js';
export declare class ExtensionsScannerService extends NativeExtensionsScannerService implements IExtensionsScannerService {
    constructor(userDataProfilesService: IUserDataProfilesService, extensionsProfileScannerService: IExtensionsProfileScannerService, fileService: IFileService, logService: ILogService, environmentService: INativeEnvironmentService, productService: IProductService, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
}
