import { URI } from '../../../base/common/uri.js';
import { IFileService } from '../../files/common/files.js';
import { IProductService } from '../../product/common/productService.js';
import { IRequestService } from '../../request/common/request.js';
import { IStorageService } from '../../storage/common/storage.js';
import { IEnvironmentService } from '../../environment/common/environment.js';
import { IConfigurationService } from '../../configuration/common/configuration.js';
import { AbstractExtensionResourceLoaderService } from './extensionResourceLoader.js';
export declare class ExtensionResourceLoaderService extends AbstractExtensionResourceLoaderService {
    private readonly _requestService;
    constructor(fileService: IFileService, storageService: IStorageService, productService: IProductService, environmentService: IEnvironmentService, configurationService: IConfigurationService, _requestService: IRequestService);
    readExtensionResource(uri: URI): Promise<string>;
}
