import { IExtensionDescription } from '../../../../platform/extensions/common/extensions.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IWorkbenchEnvironmentService } from '../../environment/common/environmentService.js';
export declare class ExtensionsProposedApi {
    private readonly _logService;
    private readonly _environmentService;
    private readonly _envEnablesProposedApiForAll;
    private readonly _envEnabledExtensions;
    private readonly _productEnabledExtensions;
    constructor(_logService: ILogService, _environmentService: IWorkbenchEnvironmentService, productService: IProductService);
    updateEnabledApiProposals(extensions: IExtensionDescription[]): void;
    private doUpdateEnabledApiProposals;
}
