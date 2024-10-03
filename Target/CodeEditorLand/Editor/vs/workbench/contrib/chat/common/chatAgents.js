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
var ChatAgentNameService_1;
import { findLast } from '../../../../base/common/arraysFind.js';
import { timeout } from '../../../../base/common/async.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { Emitter } from '../../../../base/common/event.js';
import { isMarkdownString } from '../../../../base/common/htmlContent.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { toDisposable } from '../../../../base/common/lifecycle.js';
import { revive } from '../../../../base/common/marshalling.js';
import { observableValue } from '../../../../base/common/observable.js';
import { equalsIgnoreCase } from '../../../../base/common/strings.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { ContextKeyExpr, IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { ExtensionIdentifier } from '../../../../platform/extensions/common/extensions.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { asJson, IRequestService } from '../../../../platform/request/common/request.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { CONTEXT_CHAT_EDITING_PARTICIPANT_REGISTERED, CONTEXT_CHAT_ENABLED, CONTEXT_CHAT_PANEL_PARTICIPANT_REGISTERED } from './chatContextKeys.js';
export var ChatAgentLocation;
(function (ChatAgentLocation) {
    ChatAgentLocation["Panel"] = "panel";
    ChatAgentLocation["Terminal"] = "terminal";
    ChatAgentLocation["Notebook"] = "notebook";
    ChatAgentLocation["Editor"] = "editor";
    ChatAgentLocation["EditingSession"] = "editing-session";
})(ChatAgentLocation || (ChatAgentLocation = {}));
(function (ChatAgentLocation) {
    function fromRaw(value) {
        switch (value) {
            case 'panel': return ChatAgentLocation.Panel;
            case 'terminal': return ChatAgentLocation.Terminal;
            case 'notebook': return ChatAgentLocation.Notebook;
            case 'editor': return ChatAgentLocation.Editor;
            case 'editing-session': return ChatAgentLocation.EditingSession;
        }
        return ChatAgentLocation.Panel;
    }
    ChatAgentLocation.fromRaw = fromRaw;
})(ChatAgentLocation || (ChatAgentLocation = {}));
export function isChatWelcomeMessageContent(obj) {
    return obj &&
        ThemeIcon.isThemeIcon(obj.icon) &&
        typeof obj.title === 'string' &&
        isMarkdownString(obj.message);
}
export const IChatAgentService = createDecorator('chatAgentService');
let ChatAgentService = class ChatAgentService {
    static { this.AGENT_LEADER = '@'; }
    constructor(contextKeyService) {
        this.contextKeyService = contextKeyService;
        this._agents = new Map();
        this._onDidChangeAgents = new Emitter();
        this.onDidChangeAgents = this._onDidChangeAgents.event;
        this._agentCompletionProviders = new Map();
        this._chatParticipantDetectionProviders = new Map();
        this._hasDefaultAgent = CONTEXT_CHAT_ENABLED.bindTo(this.contextKeyService);
        this._defaultAgentRegistered = CONTEXT_CHAT_PANEL_PARTICIPANT_REGISTERED.bindTo(this.contextKeyService);
        this._editingAgentRegistered = CONTEXT_CHAT_EDITING_PARTICIPANT_REGISTERED.bindTo(this.contextKeyService);
    }
    registerAgent(id, data) {
        const existingAgent = this.getAgent(id);
        if (existingAgent) {
            throw new Error(`Agent already registered: ${JSON.stringify(id)}`);
        }
        if (data.isDefault && data.locations.includes(ChatAgentLocation.EditingSession)) {
            this._editingAgentRegistered.set(true);
        }
        else if (data.isDefault) {
            this._defaultAgentRegistered.set(true);
        }
        const that = this;
        const commands = data.slashCommands;
        data = {
            ...data,
            get slashCommands() {
                return commands.filter(c => !c.when || that.contextKeyService.contextMatchesRules(ContextKeyExpr.deserialize(c.when)));
            }
        };
        const entry = { data };
        this._agents.set(id, entry);
        this._onDidChangeAgents.fire(undefined);
        return toDisposable(() => {
            this._agents.delete(id);
            if (data.isDefault && data.locations.includes(ChatAgentLocation.EditingSession)) {
                this._editingAgentRegistered.set(false);
            }
            else if (data.isDefault) {
                this._defaultAgentRegistered.set(false);
            }
            this._onDidChangeAgents.fire(undefined);
        });
    }
    registerAgentImplementation(id, agentImpl) {
        const entry = this._agents.get(id);
        if (!entry) {
            throw new Error(`Unknown agent: ${JSON.stringify(id)}`);
        }
        if (entry.impl) {
            throw new Error(`Agent already has implementation: ${JSON.stringify(id)}`);
        }
        if (entry.data.isDefault) {
            this._hasDefaultAgent.set(true);
        }
        entry.impl = agentImpl;
        this._onDidChangeAgents.fire(new MergedChatAgent(entry.data, agentImpl));
        return toDisposable(() => {
            entry.impl = undefined;
            this._onDidChangeAgents.fire(undefined);
            if (entry.data.isDefault) {
                this._hasDefaultAgent.set(false);
            }
        });
    }
    registerDynamicAgent(data, agentImpl) {
        data.isDynamic = true;
        const agent = { data, impl: agentImpl };
        this._agents.set(data.id, agent);
        this._onDidChangeAgents.fire(new MergedChatAgent(data, agentImpl));
        return toDisposable(() => {
            this._agents.delete(data.id);
            this._onDidChangeAgents.fire(undefined);
        });
    }
    registerAgentCompletionProvider(id, provider) {
        this._agentCompletionProviders.set(id, provider);
        return {
            dispose: () => { this._agentCompletionProviders.delete(id); }
        };
    }
    async getAgentCompletionItems(id, query, token) {
        return await this._agentCompletionProviders.get(id)?.(query, token) ?? [];
    }
    updateAgent(id, updateMetadata) {
        const agent = this._agents.get(id);
        if (!agent?.impl) {
            throw new Error(`No activated agent with id ${JSON.stringify(id)} registered`);
        }
        agent.data.metadata = { ...agent.data.metadata, ...updateMetadata };
        this._onDidChangeAgents.fire(new MergedChatAgent(agent.data, agent.impl));
    }
    getDefaultAgent(location) {
        return findLast(this.getActivatedAgents(), a => !!a.isDefault && a.locations.includes(location));
    }
    getContributedDefaultAgent(location) {
        return this.getAgents().find(a => !!a.isDefault && a.locations.includes(location));
    }
    getSecondaryAgent() {
        return Iterable.find(this._agents.values(), a => !!a.data.metadata.isSecondary)?.data;
    }
    getAgent(id) {
        if (!this._agentIsEnabled(id)) {
            return;
        }
        return this._agents.get(id)?.data;
    }
    _agentIsEnabled(id) {
        const entry = this._agents.get(id);
        return !entry?.data.when || this.contextKeyService.contextMatchesRules(ContextKeyExpr.deserialize(entry.data.when));
    }
    getAgentByFullyQualifiedId(id) {
        const agent = Iterable.find(this._agents.values(), a => getFullyQualifiedId(a.data) === id)?.data;
        if (agent && !this._agentIsEnabled(agent.id)) {
            return;
        }
        return agent;
    }
    getAgents() {
        return Array.from(this._agents.values())
            .map(entry => entry.data)
            .filter(a => this._agentIsEnabled(a.id));
    }
    getActivatedAgents() {
        return Array.from(this._agents.values())
            .filter(a => !!a.impl)
            .filter(a => this._agentIsEnabled(a.data.id))
            .map(a => new MergedChatAgent(a.data, a.impl));
    }
    getAgentsByName(name) {
        return this.getAgents().filter(a => a.name === name);
    }
    agentHasDupeName(id) {
        const agent = this.getAgent(id);
        if (!agent) {
            return false;
        }
        return this.getAgentsByName(agent.name)
            .filter(a => a.extensionId.value !== agent.extensionId.value).length > 0;
    }
    async invokeAgent(id, request, progress, history, token) {
        const data = this._agents.get(id);
        if (!data?.impl) {
            throw new Error(`No activated agent with id "${id}"`);
        }
        return await data.impl.invoke(request, progress, history, token);
    }
    async getFollowups(id, request, result, history, token) {
        const data = this._agents.get(id);
        if (!data?.impl) {
            throw new Error(`No activated agent with id "${id}"`);
        }
        if (!data.impl?.provideFollowups) {
            return [];
        }
        return data.impl.provideFollowups(request, result, history, token);
    }
    async getChatTitle(id, history, token) {
        const data = this._agents.get(id);
        if (!data?.impl) {
            throw new Error(`No activated agent with id "${id}"`);
        }
        if (!data.impl?.provideChatTitle) {
            return undefined;
        }
        return data.impl.provideChatTitle(history, token);
    }
    registerChatParticipantDetectionProvider(handle, provider) {
        this._chatParticipantDetectionProviders.set(handle, provider);
        return toDisposable(() => {
            this._chatParticipantDetectionProviders.delete(handle);
        });
    }
    hasChatParticipantDetectionProviders() {
        return this._chatParticipantDetectionProviders.size > 0;
    }
    async detectAgentOrCommand(request, history, options, token) {
        const provider = Iterable.first(this._chatParticipantDetectionProviders.values());
        if (!provider) {
            return;
        }
        const participants = this.getAgents().reduce((acc, a) => {
            acc.push({ participant: a.id, disambiguation: a.disambiguation ?? [] });
            for (const command of a.slashCommands) {
                acc.push({ participant: a.id, command: command.name, disambiguation: command.disambiguation ?? [] });
            }
            return acc;
        }, []);
        const result = await provider.provideParticipantDetection(request, history, { ...options, participants }, token);
        if (!result) {
            return;
        }
        const agent = this.getAgent(result.participant);
        if (!agent) {
            return;
        }
        if (!result.command) {
            return { agent };
        }
        const command = agent?.slashCommands.find(c => c.name === result.command);
        if (!command) {
            return;
        }
        return { agent, command };
    }
};
ChatAgentService = __decorate([
    __param(0, IContextKeyService),
    __metadata("design:paramtypes", [Object])
], ChatAgentService);
export { ChatAgentService };
export class MergedChatAgent {
    constructor(data, impl) {
        this.data = data;
        this.impl = impl;
    }
    get id() { return this.data.id; }
    get name() { return this.data.name ?? ''; }
    get fullName() { return this.data.fullName ?? ''; }
    get description() { return this.data.description ?? ''; }
    get extensionId() { return this.data.extensionId; }
    get extensionPublisherId() { return this.data.extensionPublisherId; }
    get extensionPublisherDisplayName() { return this.data.publisherDisplayName; }
    get extensionDisplayName() { return this.data.extensionDisplayName; }
    get isDefault() { return this.data.isDefault; }
    get metadata() { return this.data.metadata; }
    get slashCommands() { return this.data.slashCommands; }
    get locations() { return this.data.locations; }
    get disambiguation() { return this.data.disambiguation; }
    async invoke(request, progress, history, token) {
        return this.impl.invoke(request, progress, history, token);
    }
    async provideFollowups(request, result, history, token) {
        if (this.impl.provideFollowups) {
            return this.impl.provideFollowups(request, result, history, token);
        }
        return [];
    }
    provideWelcomeMessage(token) {
        if (this.impl.provideWelcomeMessage) {
            return this.impl.provideWelcomeMessage(token);
        }
        return undefined;
    }
    provideSampleQuestions(location, token) {
        if (this.impl.provideSampleQuestions) {
            return this.impl.provideSampleQuestions(location, token);
        }
        return undefined;
    }
    toJSON() {
        return this.data;
    }
}
export const IChatAgentNameService = createDecorator('chatAgentNameService');
let ChatAgentNameService = class ChatAgentNameService {
    static { ChatAgentNameService_1 = this; }
    static { this.StorageKey = 'chat.participantNameRegistry'; }
    constructor(productService, requestService, logService, storageService) {
        this.requestService = requestService;
        this.logService = logService;
        this.storageService = storageService;
        this.registry = observableValue(this, Object.create(null));
        this.disposed = false;
        if (!productService.chatParticipantRegistry) {
            return;
        }
        this.url = productService.chatParticipantRegistry;
        const raw = storageService.get(ChatAgentNameService_1.StorageKey, -1);
        try {
            this.registry.set(JSON.parse(raw ?? '{}'), undefined);
        }
        catch (err) {
            storageService.remove(ChatAgentNameService_1.StorageKey, -1);
        }
        this.refresh();
    }
    refresh() {
        if (this.disposed) {
            return;
        }
        this.update()
            .catch(err => this.logService.warn('Failed to fetch chat participant registry', err))
            .then(() => timeout(5 * 60 * 1000))
            .then(() => this.refresh());
    }
    async update() {
        const context = await this.requestService.request({ type: 'GET', url: this.url }, CancellationToken.None);
        if (context.res.statusCode !== 200) {
            throw new Error('Could not get extensions report.');
        }
        const result = await asJson(context);
        if (!result || result.version !== 1) {
            throw new Error('Unexpected chat participant registry response.');
        }
        const registry = result.restrictedChatParticipants;
        this.registry.set(registry, undefined);
        this.storageService.store(ChatAgentNameService_1.StorageKey, JSON.stringify(registry), -1, 1);
    }
    getAgentNameRestriction(chatAgentData) {
        const nameAllowed = this.checkAgentNameRestriction(chatAgentData.name, chatAgentData).get();
        const fullNameAllowed = !chatAgentData.fullName || this.checkAgentNameRestriction(chatAgentData.fullName.replace(/\s/g, ''), chatAgentData).get();
        return nameAllowed && fullNameAllowed;
    }
    checkAgentNameRestriction(name, chatAgentData) {
        const allowList = this.registry.map(registry => registry[name.toLowerCase()]);
        return allowList.map(allowList => {
            if (!allowList) {
                return true;
            }
            return allowList.some(id => equalsIgnoreCase(id, id.includes('.') ? chatAgentData.extensionId.value : chatAgentData.extensionPublisherId));
        });
    }
    dispose() {
        this.disposed = true;
    }
};
ChatAgentNameService = ChatAgentNameService_1 = __decorate([
    __param(0, IProductService),
    __param(1, IRequestService),
    __param(2, ILogService),
    __param(3, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ChatAgentNameService);
export { ChatAgentNameService };
export function getFullyQualifiedId(chatAgentData) {
    return `${chatAgentData.extensionId.value}.${chatAgentData.id}`;
}
export function reviveSerializedAgent(raw) {
    const agent = 'name' in raw ?
        raw :
        {
            ...raw,
            name: raw.id,
        };
    if (!('extensionPublisherId' in agent)) {
        agent.extensionPublisherId = agent.extensionPublisher ?? '';
    }
    if (!('extensionDisplayName' in agent)) {
        agent.extensionDisplayName = '';
    }
    if (!('extensionId' in agent)) {
        agent.extensionId = new ExtensionIdentifier('');
    }
    return revive(agent);
}
