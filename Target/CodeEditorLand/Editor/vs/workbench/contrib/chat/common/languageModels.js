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
import { Emitter } from '../../../../base/common/event.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { DisposableStore, toDisposable } from '../../../../base/common/lifecycle.js';
import { isFalsyOrWhitespace } from '../../../../base/common/strings.js';
import { localize } from '../../../../nls.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IExtensionService, isProposedApiEnabled } from '../../../services/extensions/common/extensions.js';
import { ExtensionsRegistry } from '../../../services/extensions/common/extensionsRegistry.js';
import { CONTEXT_LANGUAGE_MODELS_ARE_USER_SELECTABLE } from './chatContextKeys.js';
export const ILanguageModelsService = createDecorator('ILanguageModelsService');
const languageModelType = {
    type: 'object',
    properties: {
        vendor: {
            type: 'string',
            description: localize('vscode.extension.contributes.languageModels.vendor', "A globally unique vendor of language models.")
        }
    }
};
export const languageModelExtensionPoint = ExtensionsRegistry.registerExtensionPoint({
    extensionPoint: 'languageModels',
    jsonSchema: {
        description: localize('vscode.extension.contributes.languageModels', "Contribute language models of a specific vendor."),
        oneOf: [
            languageModelType,
            {
                type: 'array',
                items: languageModelType
            }
        ]
    },
    activationEventsGenerator: (contribs, result) => {
        for (const contrib of contribs) {
            result.push(`onLanguageModelChat:${contrib.vendor}`);
        }
    }
});
let LanguageModelsService = class LanguageModelsService {
    constructor(_extensionService, _logService, _contextKeyService) {
        this._extensionService = _extensionService;
        this._logService = _logService;
        this._contextKeyService = _contextKeyService;
        this._store = new DisposableStore();
        this._providers = new Map();
        this._vendors = new Set();
        this._onDidChangeProviders = this._store.add(new Emitter());
        this.onDidChangeLanguageModels = this._onDidChangeProviders.event;
        this._hasUserSelectableModels = CONTEXT_LANGUAGE_MODELS_ARE_USER_SELECTABLE.bindTo(this._contextKeyService);
        this._store.add(languageModelExtensionPoint.setHandler((extensions) => {
            this._vendors.clear();
            for (const extension of extensions) {
                if (!isProposedApiEnabled(extension.description, 'chatProvider')) {
                    extension.collector.error(localize('vscode.extension.contributes.languageModels.chatProviderRequired', "This contribution point requires the 'chatProvider' proposal."));
                    continue;
                }
                for (const item of Iterable.wrap(extension.value)) {
                    if (this._vendors.has(item.vendor)) {
                        extension.collector.error(localize('vscode.extension.contributes.languageModels.vendorAlreadyRegistered', "The vendor '{0}' is already registered and cannot be registered twice", item.vendor));
                        continue;
                    }
                    if (isFalsyOrWhitespace(item.vendor)) {
                        extension.collector.error(localize('vscode.extension.contributes.languageModels.emptyVendor', "The vendor field cannot be empty."));
                        continue;
                    }
                    if (item.vendor.trim() !== item.vendor) {
                        extension.collector.error(localize('vscode.extension.contributes.languageModels.whitespaceVendor', "The vendor field cannot start or end with whitespace."));
                        continue;
                    }
                    this._vendors.add(item.vendor);
                }
            }
            const removed = [];
            for (const [identifier, value] of this._providers) {
                if (!this._vendors.has(value.metadata.vendor)) {
                    this._providers.delete(identifier);
                    removed.push(identifier);
                }
            }
            if (removed.length > 0) {
                this._onDidChangeProviders.fire({ removed });
            }
        }));
    }
    dispose() {
        this._store.dispose();
        this._providers.clear();
    }
    getLanguageModelIds() {
        return Array.from(this._providers.keys());
    }
    lookupLanguageModel(identifier) {
        return this._providers.get(identifier)?.metadata;
    }
    async selectLanguageModels(selector) {
        if (selector.vendor) {
            await this._extensionService.activateByEvent(`onLanguageModelChat:${selector.vendor}}`);
        }
        else {
            const all = Array.from(this._vendors).map(vendor => this._extensionService.activateByEvent(`onLanguageModelChat:${vendor}`));
            await Promise.all(all);
        }
        const result = [];
        for (const [identifier, model] of this._providers) {
            if ((selector.vendor === undefined || model.metadata.vendor === selector.vendor)
                && (selector.family === undefined || model.metadata.family === selector.family)
                && (selector.version === undefined || model.metadata.version === selector.version)
                && (selector.identifier === undefined || model.metadata.id === selector.identifier)
                && (!model.metadata.targetExtensions || model.metadata.targetExtensions.some(candidate => ExtensionIdentifier.equals(candidate, selector.extension)))) {
                result.push(identifier);
            }
        }
        this._logService.trace('[LM] selected language models', selector, result);
        return result;
    }
    registerLanguageModelChat(identifier, provider) {
        this._logService.trace('[LM] registering language model chat', identifier, provider.metadata);
        if (!this._vendors.has(provider.metadata.vendor)) {
            throw new Error(`Chat response provider uses UNKNOWN vendor ${provider.metadata.vendor}.`);
        }
        if (this._providers.has(identifier)) {
            throw new Error(`Chat response provider with identifier ${identifier} is already registered.`);
        }
        this._providers.set(identifier, provider);
        this._onDidChangeProviders.fire({ added: [{ identifier, metadata: provider.metadata }] });
        this.updateUserSelectableModelsContext();
        return toDisposable(() => {
            this.updateUserSelectableModelsContext();
            if (this._providers.delete(identifier)) {
                this._onDidChangeProviders.fire({ removed: [identifier] });
                this._logService.trace('[LM] UNregistered language model chat', identifier, provider.metadata);
            }
        });
    }
    updateUserSelectableModelsContext() {
        const hasUserSelectableModels = Array.from(this._providers.values()).some(p => p.metadata.isUserSelectable && !p.metadata.isDefault);
        const hasDefaultModel = Array.from(this._providers.values()).some(p => p.metadata.isDefault);
        this._hasUserSelectableModels.set(hasUserSelectableModels && hasDefaultModel);
    }
    async sendChatRequest(identifier, from, messages, options, token) {
        const provider = this._providers.get(identifier);
        if (!provider) {
            throw new Error(`Chat response provider with identifier ${identifier} is not registered.`);
        }
        return provider.sendChatRequest(messages, from, options, token);
    }
    computeTokenLength(identifier, message, token) {
        const provider = this._providers.get(identifier);
        if (!provider) {
            throw new Error(`Chat response provider with identifier ${identifier} is not registered.`);
        }
        return provider.provideTokenCount(message, token);
    }
};
LanguageModelsService = __decorate([
    __param(0, IExtensionService),
    __param(1, ILogService),
    __param(2, IContextKeyService),
    __metadata("design:paramtypes", [Object, Object, Object])
], LanguageModelsService);
export { LanguageModelsService };
