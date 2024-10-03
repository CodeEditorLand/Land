import { IURLHandler, IOpenURLOptions } from '../../../../platform/url/common/url.js';
import { URI, UriComponents } from '../../../../base/common/uri.js';
import { IMainProcessService } from '../../../../platform/ipc/common/mainProcessService.js';
import { IOpenerService, IOpener } from '../../../../platform/opener/common/opener.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { NativeURLService } from '../../../../platform/url/common/urlService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export interface IRelayOpenURLOptions extends IOpenURLOptions {
    openToSide?: boolean;
    openExternal?: boolean;
}
export declare class RelayURLService extends NativeURLService implements IURLHandler, IOpener {
    private readonly nativeHostService;
    private readonly logService;
    private urlService;
    constructor(mainProcessService: IMainProcessService, openerService: IOpenerService, nativeHostService: INativeHostService, productService: IProductService, logService: ILogService);
    create(options?: Partial<UriComponents>): URI;
    open(resource: URI | string, options?: IRelayOpenURLOptions): Promise<boolean>;
    handleURL(uri: URI, options?: IOpenURLOptions): Promise<boolean>;
}
