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
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { IURLService } from '../../../platform/url/common/url.js';
import { IExtensionUrlHandler } from '../../services/extensions/browser/extensionUrlHandler.js';
import { ExtensionIdentifier } from '../../../platform/extensions/common/extensions.js';
class ExtensionUrlHandler {
    constructor(proxy, handle, extensionId, extensionDisplayName) {
        this.proxy = proxy;
        this.handle = handle;
        this.extensionId = extensionId;
        this.extensionDisplayName = extensionDisplayName;
    }
    handleURL(uri, options) {
        if (!ExtensionIdentifier.equals(this.extensionId, uri.authority)) {
            return Promise.resolve(false);
        }
        return Promise.resolve(this.proxy.$handleExternalUri(this.handle, uri)).then(() => true);
    }
}
let MainThreadUrls = class MainThreadUrls {
    constructor(context, urlService, extensionUrlHandler) {
        this.urlService = urlService;
        this.extensionUrlHandler = extensionUrlHandler;
        this.handlers = new Map();
        this.proxy = context.getProxy(ExtHostContext.ExtHostUrls);
    }
    $registerUriHandler(handle, extensionId, extensionDisplayName) {
        const handler = new ExtensionUrlHandler(this.proxy, handle, extensionId, extensionDisplayName);
        const disposable = this.urlService.registerHandler(handler);
        this.handlers.set(handle, { extensionId, disposable });
        this.extensionUrlHandler.registerExtensionHandler(extensionId, handler);
        return Promise.resolve(undefined);
    }
    $unregisterUriHandler(handle) {
        const tuple = this.handlers.get(handle);
        if (!tuple) {
            return Promise.resolve(undefined);
        }
        const { extensionId, disposable } = tuple;
        this.extensionUrlHandler.unregisterExtensionHandler(extensionId);
        this.handlers.delete(handle);
        disposable.dispose();
        return Promise.resolve(undefined);
    }
    async $createAppUri(uri) {
        return this.urlService.create(uri);
    }
    dispose() {
        this.handlers.forEach(({ disposable }) => disposable.dispose());
        this.handlers.clear();
    }
};
MainThreadUrls = __decorate([
    extHostNamedCustomer(MainContext.MainThreadUrls),
    __param(1, IURLService),
    __param(2, IExtensionUrlHandler),
    __metadata("design:paramtypes", [Object, Object, Object])
], MainThreadUrls);
export { MainThreadUrls };
