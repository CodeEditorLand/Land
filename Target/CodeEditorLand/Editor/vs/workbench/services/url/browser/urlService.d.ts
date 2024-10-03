import { URI, UriComponents } from '../../../../base/common/uri.js';
import { AbstractURLService } from '../../../../platform/url/common/urlService.js';
import { Event } from '../../../../base/common/event.js';
import { IBrowserWorkbenchEnvironmentService } from '../../environment/browser/environmentService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
export interface IURLCallbackProvider {
    readonly onCallback: Event<URI>;
    create(options?: Partial<UriComponents>): URI;
}
export declare class BrowserURLService extends AbstractURLService {
    private provider;
    constructor(environmentService: IBrowserWorkbenchEnvironmentService, openerService: IOpenerService, productService: IProductService);
    create(options?: Partial<UriComponents>): URI;
}
