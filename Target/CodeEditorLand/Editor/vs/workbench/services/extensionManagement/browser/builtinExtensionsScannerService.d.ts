import { IBuiltinExtensionsScannerService, IExtension } from '../../../../platform/extensions/common/extensions.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
import { IExtensionResourceLoaderService } from '../../../../platform/extensionResourceLoader/common/extensionResourceLoader.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare class BuiltinExtensionsScannerService implements IBuiltinExtensionsScannerService {
    private readonly extensionResourceLoaderService;
    private readonly logService;
    readonly _serviceBrand: undefined;
    private readonly builtinExtensionsPromises;
    private nlsUrl;
    constructor(environmentService: IWorkbenchEnvironmentService, uriIdentityService: IUriIdentityService, extensionResourceLoaderService: IExtensionResourceLoaderService, productService: IProductService, logService: ILogService);
    scanBuiltinExtensions(): Promise<IExtension[]>;
    private localizeManifest;
}
