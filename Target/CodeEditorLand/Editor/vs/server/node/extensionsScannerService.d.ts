import { INativeEnvironmentService } from '../../platform/environment/common/environment.js';
import { IExtensionsProfileScannerService } from '../../platform/extensionManagement/common/extensionsProfileScannerService.js';
import { AbstractExtensionsScannerService, IExtensionsScannerService, Translations } from '../../platform/extensionManagement/common/extensionsScannerService.js';
import { IFileService } from '../../platform/files/common/files.js';
import { IInstantiationService } from '../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../platform/log/common/log.js';
import { IProductService } from '../../platform/product/common/productService.js';
import { IUriIdentityService } from '../../platform/uriIdentity/common/uriIdentity.js';
import { IUserDataProfilesService } from '../../platform/userDataProfile/common/userDataProfile.js';
export declare class ExtensionsScannerService extends AbstractExtensionsScannerService implements IExtensionsScannerService {
    private readonly nativeEnvironmentService;
    constructor(userDataProfilesService: IUserDataProfilesService, extensionsProfileScannerService: IExtensionsProfileScannerService, fileService: IFileService, logService: ILogService, nativeEnvironmentService: INativeEnvironmentService, productService: IProductService, uriIdentityService: IUriIdentityService, instantiationService: IInstantiationService);
    protected getTranslations(language: string): Promise<Translations>;
}
