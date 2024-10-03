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
import { DisposableMap } from '../../../base/common/lifecycle.js';
import { revive } from '../../../base/common/marshalling.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
import { IChatVariablesService } from '../../contrib/chat/common/chatVariables.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
let MainThreadChatVariables = class MainThreadChatVariables {
    constructor(extHostContext, _chatVariablesService) {
        this._chatVariablesService = _chatVariablesService;
        this._variables = new DisposableMap();
        this._pendingProgress = new Map();
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostChatVariables);
    }
    dispose() {
        this._variables.clearAndDisposeAll();
    }
    $registerVariable(handle, data) {
        const registration = this._chatVariablesService.registerVariable(data, async (messageText, _arg, model, progress, token) => {
            const varRequestId = `${model.sessionId}-${handle}`;
            this._pendingProgress.set(varRequestId, progress);
            const result = revive(await this._proxy.$resolveVariable(handle, varRequestId, messageText, token));
            this._pendingProgress.delete(varRequestId);
            return result;
        });
        this._variables.set(handle, registration);
    }
    async $handleProgressChunk(requestId, progress) {
        const revivedProgress = revive(progress);
        this._pendingProgress.get(requestId)?.(revivedProgress);
    }
    $unregisterVariable(handle) {
        this._variables.deleteAndDispose(handle);
    }
};
MainThreadChatVariables = __decorate([
    extHostNamedCustomer(MainContext.MainThreadChatVariables),
    __param(1, IChatVariablesService),
    __metadata("design:paramtypes", [Object, Object])
], MainThreadChatVariables);
export { MainThreadChatVariables };
