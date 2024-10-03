import { Disposable, IDisposable } from '../../../base/common/lifecycle.js';
import { URI, UriComponents } from '../../../base/common/uri.js';
import { IProductService } from '../../product/common/productService.js';
import { IOpenURLOptions, IURLHandler, IURLService } from './url.js';
export declare abstract class AbstractURLService extends Disposable implements IURLService {
    readonly _serviceBrand: undefined;
    private handlers;
    abstract create(options?: Partial<UriComponents>): URI;
    open(uri: URI, options?: IOpenURLOptions): Promise<boolean>;
    registerHandler(handler: IURLHandler): IDisposable;
}
export declare class NativeURLService extends AbstractURLService {
    protected readonly productService: IProductService;
    constructor(productService: IProductService);
    create(options?: Partial<UriComponents>): URI;
}
