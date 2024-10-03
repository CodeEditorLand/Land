import { Disposable } from '../../../../base/common/lifecycle.js';
import { INativeEnvironmentService } from '../../../../platform/environment/common/environment.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
export declare class LanguagePackCachedDataCleaner extends Disposable {
    private readonly environmentService;
    private readonly logService;
    private readonly productService;
    private readonly _DataMaxAge;
    constructor(environmentService: INativeEnvironmentService, logService: ILogService, productService: IProductService);
    private cleanUpLanguagePackCache;
}
