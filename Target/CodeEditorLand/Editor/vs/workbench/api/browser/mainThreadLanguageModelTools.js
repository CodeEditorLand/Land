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
import { Disposable, DisposableMap } from '../../../base/common/lifecycle.js';
import { ILanguageModelToolsService } from '../../contrib/chat/common/languageModelToolsService.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
let MainThreadLanguageModelTools = class MainThreadLanguageModelTools extends Disposable {
    constructor(extHostContext, _languageModelToolsService) {
        super();
        this._languageModelToolsService = _languageModelToolsService;
        this._tools = this._register(new DisposableMap());
        this._countTokenCallbacks = new Map();
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostLanguageModelTools);
        this._register(this._languageModelToolsService.onDidChangeTools(e => this._proxy.$onDidChangeTools([...this._languageModelToolsService.getTools()])));
    }
    async $getTools() {
        return Array.from(this._languageModelToolsService.getTools());
    }
    async $invokeTool(dto, token) {
        return await this._languageModelToolsService.invokeTool(dto, (input, token) => this._proxy.$countTokensForInvocation(dto.callId, input, token), token);
    }
    $countTokensForInvocation(callId, input, token) {
        const fn = this._countTokenCallbacks.get(callId);
        if (!fn) {
            throw new Error(`Tool invocation call ${callId} not found`);
        }
        return fn(input, token);
    }
    $registerTool(id) {
        const disposable = this._languageModelToolsService.registerToolImplementation(id, {
            invoke: async (dto, countTokens, token) => {
                try {
                    this._countTokenCallbacks.set(dto.callId, countTokens);
                    return await this._proxy.$invokeTool(dto, token);
                }
                finally {
                    this._countTokenCallbacks.delete(dto.callId);
                }
            },
            provideToolConfirmationMessages: (participantName, parameters, token) => this._proxy.$provideToolConfirmationMessages(id, participantName, parameters, token),
            provideToolInvocationMessage: (parameters, token) => this._proxy.$provideToolInvocationMessage(id, parameters, token),
        });
        this._tools.set(id, disposable);
    }
    $unregisterTool(name) {
        this._tools.deleteAndDispose(name);
    }
};
MainThreadLanguageModelTools = __decorate([
    extHostNamedCustomer(MainContext.MainThreadLanguageModelTools),
    __param(1, ILanguageModelToolsService),
    __metadata("design:paramtypes", [Object, Object])
], MainThreadLanguageModelTools);
export { MainThreadLanguageModelTools };
