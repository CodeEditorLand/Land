import { ExtensionRecommendations, ExtensionRecommendation } from './extensionRecommendations.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IExtensionManagementServerService } from '../../../services/extensionManagement/common/extensionManagement.js';
export declare class WebRecommendations extends ExtensionRecommendations {
    private readonly productService;
    private readonly extensionManagementServerService;
    private _recommendations;
    get recommendations(): ReadonlyArray<ExtensionRecommendation>;
    constructor(productService: IProductService, extensionManagementServerService: IExtensionManagementServerService);
    protected doActivate(): Promise<void>;
}
