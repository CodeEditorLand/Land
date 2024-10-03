import { Disposable } from '../../../base/common/lifecycle.js';
import { IEnvironmentMainService } from '../../environment/electron-main/environmentMainService.js';
import { ILogService } from '../../log/common/log.js';
import { IProductService } from '../../product/common/productService.js';
import { IURLService } from '../common/url.js';
import { IProtocolUrl } from './url.js';
import { IWindowsMainService } from '../../windows/electron-main/windows.js';
export declare class ElectronURLListener extends Disposable {
    private readonly urlService;
    private readonly logService;
    private uris;
    private retryCount;
    constructor(initialProtocolUrls: IProtocolUrl[] | undefined, urlService: IURLService, windowsMainService: IWindowsMainService, environmentMainService: IEnvironmentMainService, productService: IProductService, logService: ILogService);
    private uriFromRawUrl;
    private flush;
}
