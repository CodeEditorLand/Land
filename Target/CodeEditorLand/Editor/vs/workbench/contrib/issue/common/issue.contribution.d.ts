import { IProductService } from '../../../../platform/product/common/productService.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export declare class BaseIssueContribution extends Disposable implements IWorkbenchContribution {
    constructor(productService: IProductService, configurationService: IConfigurationService);
}
