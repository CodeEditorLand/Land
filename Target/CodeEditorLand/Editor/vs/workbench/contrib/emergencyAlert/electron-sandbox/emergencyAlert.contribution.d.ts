import { IWorkbenchContribution } from '../../../common/contributions.js';
import { IBannerService } from '../../../services/banner/browser/bannerService.js';
import { IRequestService } from '../../../../platform/request/common/request.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare class EmergencyAlert implements IWorkbenchContribution {
    private readonly bannerService;
    private readonly requestService;
    private readonly productService;
    private readonly logService;
    static readonly ID = "workbench.contrib.emergencyAlert";
    constructor(bannerService: IBannerService, requestService: IRequestService, productService: IProductService, logService: ILogService);
    private fetchAlerts;
    private doFetchAlerts;
}
