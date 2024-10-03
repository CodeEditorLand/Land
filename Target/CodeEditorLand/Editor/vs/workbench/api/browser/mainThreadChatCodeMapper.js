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
var MainThreadChatCodemapper_1;
import { Disposable, DisposableMap } from '../../../base/common/lifecycle.js';
import { URI } from '../../../base/common/uri.js';
import { ICodeMapperService } from '../../contrib/chat/common/chatCodeMapperService.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
let MainThreadChatCodemapper = class MainThreadChatCodemapper extends Disposable {
    static { MainThreadChatCodemapper_1 = this; }
    static { this._requestHandlePool = 0; }
    constructor(extHostContext, codeMapperService) {
        super();
        this.codeMapperService = codeMapperService;
        this.providers = this._register(new DisposableMap());
        this._responseMap = new Map();
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostCodeMapper);
    }
    $registerCodeMapperProvider(handle) {
        const impl = {
            mapCode: async (uiRequest, response, token) => {
                const requestId = String(MainThreadChatCodemapper_1._requestHandlePool++);
                this._responseMap.set(requestId, response);
                const extHostRequest = {
                    requestId,
                    codeBlocks: uiRequest.codeBlocks,
                    conversation: uiRequest.conversation
                };
                try {
                    return await this._proxy.$mapCode(handle, extHostRequest, token).then((result) => result ?? undefined);
                }
                finally {
                    this._responseMap.delete(requestId);
                }
            }
        };
        const disposable = this.codeMapperService.registerCodeMapperProvider(handle, impl);
        this.providers.set(handle, disposable);
    }
    $unregisterCodeMapperProvider(handle) {
        this.providers.deleteAndDispose(handle);
    }
    $handleProgress(requestId, data) {
        const response = this._responseMap.get(requestId);
        if (response) {
            const resource = URI.revive(data.uri);
            response.textEdit(resource, data.edits);
        }
        return Promise.resolve();
    }
};
MainThreadChatCodemapper = MainThreadChatCodemapper_1 = __decorate([
    extHostNamedCustomer(MainContext.MainThreadCodeMapper),
    __param(1, ICodeMapperService),
    __metadata("design:paramtypes", [Object, Object])
], MainThreadChatCodemapper);
export { MainThreadChatCodemapper };
