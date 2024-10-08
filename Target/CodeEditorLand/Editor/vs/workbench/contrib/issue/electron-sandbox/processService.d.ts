import { IProcessMainService } from '../../../../platform/issue/common/issue.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { IWorkbenchProcessService } from '../common/issue.js';
export declare class ProcessService implements IWorkbenchProcessService {
    private readonly processMainService;
    private readonly themeService;
    private readonly environmentService;
    private readonly productService;
    readonly _serviceBrand: undefined;
    constructor(processMainService: IProcessMainService, themeService: IThemeService, environmentService: INativeWorkbenchEnvironmentService, productService: IProductService);
    openProcessExplorer(): Promise<void>;
}
