var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { IURLService } from '../../../../platform/url/common/url.js';
import { URI } from '../../../../base/common/uri.js';
import { registerSingleton } from '../../../../platform/instantiation/common/extensions.js';
import { AbstractURLService } from '../../../../platform/url/common/urlService.js';
import { IBrowserWorkbenchEnvironmentService } from '../../environment/browser/environmentService.js';
import { IOpenerService } from '../../../../platform/opener/common/opener.js';
import { matchesScheme } from '../../../../base/common/network.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
class BrowserURLOpener {
    constructor(urlService, productService) {
        this.urlService = urlService;
        this.productService = productService;
    }
    async open(resource, options) {
        if (options?.openExternal) {
            return false;
        }
        if (!matchesScheme(resource, this.productService.urlProtocol)) {
            return false;
        }
        if (typeof resource === 'string') {
            resource = URI.parse(resource);
        }
        return this.urlService.open(resource, { trusted: true });
    }
}
let BrowserURLService = class BrowserURLService extends AbstractURLService {
    constructor(environmentService, openerService, productService) {
        super();
        this.provider = environmentService.options?.urlCallbackProvider;
        if (this.provider) {
            this._register(this.provider.onCallback(uri => this.open(uri, { trusted: true })));
        }
        this._register(openerService.registerOpener(new BrowserURLOpener(this, productService)));
    }
    create(options) {
        if (this.provider) {
            return this.provider.create(options);
        }
        return URI.parse('unsupported://');
    }
};
BrowserURLService = __decorate([
    __param(0, IBrowserWorkbenchEnvironmentService),
    __param(1, IOpenerService),
    __param(2, IProductService),
    __metadata("design:paramtypes", [Object, Object, Object])
], BrowserURLService);
export { BrowserURLService };
registerSingleton(IURLService, BrowserURLService, 1);
