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
import { AsyncIterableSource, DeferredPromise } from '../../../base/common/async.js';
import { transformErrorForSerialization, transformErrorFromSerialization } from '../../../base/common/errors.js';
import { Emitter } from '../../../base/common/event.js';
import { Disposable, DisposableMap, DisposableStore, toDisposable } from '../../../base/common/lifecycle.js';
import { localize } from '../../../nls.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
import { ILanguageModelStatsService } from '../../contrib/chat/common/languageModelStats.js';
import { ILanguageModelsService } from '../../contrib/chat/common/languageModels.js';
import { IAuthenticationAccessService } from '../../services/authentication/browser/authenticationAccessService.js';
import { IAuthenticationService, INTERNAL_AUTH_PROVIDER_PREFIX } from '../../services/authentication/common/authentication.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { IExtensionService } from '../../services/extensions/common/extensions.js';
let MainThreadLanguageModels = class MainThreadLanguageModels {
    constructor(extHostContext, _chatProviderService, _languageModelStatsService, _logService, _authenticationService, _authenticationAccessService, _extensionService) {
        this._chatProviderService = _chatProviderService;
        this._languageModelStatsService = _languageModelStatsService;
        this._logService = _logService;
        this._authenticationService = _authenticationService;
        this._authenticationAccessService = _authenticationAccessService;
        this._extensionService = _extensionService;
        this._store = new DisposableStore();
        this._providerRegistrations = new DisposableMap();
        this._pendingProgress = new Map();
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostChatProvider);
        this._proxy.$acceptChatModelMetadata({ added: _chatProviderService.getLanguageModelIds().map(id => ({ identifier: id, metadata: _chatProviderService.lookupLanguageModel(id) })) });
        this._store.add(_chatProviderService.onDidChangeLanguageModels(this._proxy.$acceptChatModelMetadata, this._proxy));
    }
    dispose() {
        this._providerRegistrations.dispose();
        this._store.dispose();
    }
    $registerLanguageModelProvider(handle, identifier, metadata) {
        const dipsosables = new DisposableStore();
        dipsosables.add(this._chatProviderService.registerLanguageModelChat(identifier, {
            metadata,
            sendChatRequest: async (messages, from, options, token) => {
                const requestId = (Math.random() * 1e6) | 0;
                const defer = new DeferredPromise();
                const stream = new AsyncIterableSource();
                try {
                    this._pendingProgress.set(requestId, { defer, stream });
                    await this._proxy.$startChatRequest(handle, requestId, from, messages, options, token);
                }
                catch (err) {
                    this._pendingProgress.delete(requestId);
                    throw err;
                }
                return {
                    result: defer.p,
                    stream: stream.asyncIterable
                };
            },
            provideTokenCount: (str, token) => {
                return this._proxy.$provideTokenLength(handle, str, token);
            },
        }));
        if (metadata.auth) {
            dipsosables.add(this._registerAuthenticationProvider(metadata.extension, metadata.auth));
        }
        this._providerRegistrations.set(handle, dipsosables);
    }
    async $reportResponsePart(requestId, chunk) {
        const data = this._pendingProgress.get(requestId);
        this._logService.trace('[LM] report response PART', Boolean(data), requestId, chunk);
        if (data) {
            data.stream.emitOne(chunk);
        }
    }
    async $reportResponseDone(requestId, err) {
        const data = this._pendingProgress.get(requestId);
        this._logService.trace('[LM] report response DONE', Boolean(data), requestId, err);
        if (data) {
            this._pendingProgress.delete(requestId);
            if (err) {
                const error = transformErrorFromSerialization(err);
                data.stream.reject(error);
                data.defer.error(error);
            }
            else {
                data.stream.resolve();
                data.defer.complete(undefined);
            }
        }
    }
    $unregisterProvider(handle) {
        this._providerRegistrations.deleteAndDispose(handle);
    }
    $selectChatModels(selector) {
        return this._chatProviderService.selectLanguageModels(selector);
    }
    $whenLanguageModelChatRequestMade(identifier, extensionId, participant, tokenCount) {
        this._languageModelStatsService.update(identifier, extensionId, participant, tokenCount);
    }
    async $tryStartChatRequest(extension, providerId, requestId, messages, options, token) {
        this._logService.trace('[CHAT] request STARTED', extension.value, requestId);
        const response = await this._chatProviderService.sendChatRequest(providerId, extension, messages, options, token);
        const streaming = (async () => {
            try {
                for await (const part of response.stream) {
                    this._logService.trace('[CHAT] request PART', extension.value, requestId, part);
                    await this._proxy.$acceptResponsePart(requestId, part);
                }
                this._logService.trace('[CHAT] request DONE', extension.value, requestId);
            }
            catch (err) {
                this._logService.error('[CHAT] extension request ERRORED in STREAM', err, extension.value, requestId);
                this._proxy.$acceptResponseDone(requestId, transformErrorForSerialization(err));
            }
        })();
        Promise.allSettled([response.result, streaming]).then(() => {
            this._logService.debug('[CHAT] extension request DONE', extension.value, requestId);
            this._proxy.$acceptResponseDone(requestId, undefined);
        }, err => {
            this._logService.error('[CHAT] extension request ERRORED', err, extension.value, requestId);
            this._proxy.$acceptResponseDone(requestId, transformErrorForSerialization(err));
        });
    }
    $countTokens(provider, value, token) {
        return this._chatProviderService.computeTokenLength(provider, value, token);
    }
    _registerAuthenticationProvider(extension, auth) {
        const authProviderId = INTERNAL_AUTH_PROVIDER_PREFIX + extension.value;
        if (this._authenticationService.getProviderIds().includes(authProviderId)) {
            return Disposable.None;
        }
        const accountLabel = auth.accountLabel ?? localize('languageModelsAccountId', 'Language Models');
        const disposables = new DisposableStore();
        this._authenticationService.registerAuthenticationProvider(authProviderId, new LanguageModelAccessAuthProvider(authProviderId, auth.providerLabel, accountLabel));
        disposables.add(toDisposable(() => {
            this._authenticationService.unregisterAuthenticationProvider(authProviderId);
        }));
        disposables.add(this._authenticationAccessService.onDidChangeExtensionSessionAccess(async (e) => {
            const allowedExtensions = this._authenticationAccessService.readAllowedExtensions(authProviderId, accountLabel);
            const accessList = [];
            for (const allowedExtension of allowedExtensions) {
                const from = await this._extensionService.getExtension(allowedExtension.id);
                if (from) {
                    accessList.push({
                        from: from.identifier,
                        to: extension,
                        enabled: allowedExtension.allowed ?? true
                    });
                }
            }
            this._proxy.$updateModelAccesslist(accessList);
        }));
        return disposables;
    }
};
MainThreadLanguageModels = __decorate([
    extHostNamedCustomer(MainContext.MainThreadLanguageModels),
    __param(1, ILanguageModelsService),
    __param(2, ILanguageModelStatsService),
    __param(3, ILogService),
    __param(4, IAuthenticationService),
    __param(5, IAuthenticationAccessService),
    __param(6, IExtensionService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object])
], MainThreadLanguageModels);
export { MainThreadLanguageModels };
class LanguageModelAccessAuthProvider {
    constructor(id, label, _accountLabel) {
        this.id = id;
        this.label = label;
        this._accountLabel = _accountLabel;
        this.supportsMultipleAccounts = false;
        this._onDidChangeSessions = new Emitter();
        this.onDidChangeSessions = this._onDidChangeSessions.event;
    }
    async getSessions(scopes) {
        if (scopes === undefined && !this._session) {
            return [];
        }
        if (this._session) {
            return [this._session];
        }
        return [await this.createSession(scopes || [])];
    }
    async createSession(scopes) {
        this._session = this._createFakeSession(scopes);
        this._onDidChangeSessions.fire({ added: [this._session], changed: [], removed: [] });
        return this._session;
    }
    removeSession(sessionId) {
        if (this._session) {
            this._onDidChangeSessions.fire({ added: [], changed: [], removed: [this._session] });
            this._session = undefined;
        }
        return Promise.resolve();
    }
    _createFakeSession(scopes) {
        return {
            id: 'fake-session',
            account: {
                id: this.id,
                label: this._accountLabel,
            },
            accessToken: 'fake-access-token',
            scopes,
        };
    }
}
