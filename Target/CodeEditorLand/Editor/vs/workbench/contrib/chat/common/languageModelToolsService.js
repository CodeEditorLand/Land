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
import { RunOnceScheduler } from '../../../../base/common/async.js';
import { CancellationError } from '../../../../base/common/errors.js';
import { Emitter } from '../../../../base/common/event.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { Disposable, toDisposable } from '../../../../base/common/lifecycle.js';
import { localize } from '../../../../nls.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { createDecorator } from '../../../../platform/instantiation/common/instantiation.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ChatToolInvocation } from './chatProgressTypes/chatToolInvocation.js';
import { IChatService } from './chatService.js';
export const ILanguageModelToolsService = createDecorator('ILanguageModelToolsService');
let LanguageModelToolsService = class LanguageModelToolsService extends Disposable {
    constructor(_extensionService, _contextKeyService, _chatService) {
        super();
        this._extensionService = _extensionService;
        this._contextKeyService = _contextKeyService;
        this._chatService = _chatService;
        this._onDidChangeTools = new Emitter();
        this.onDidChangeTools = this._onDidChangeTools.event;
        this._onDidChangeToolsScheduler = new RunOnceScheduler(() => this._onDidChangeTools.fire(), 750);
        this._tools = new Map();
        this._toolContextKeys = new Set();
        this._register(this._contextKeyService.onDidChangeContext(e => {
            if (e.affectsSome(this._toolContextKeys)) {
                this._onDidChangeToolsScheduler.schedule();
            }
        }));
    }
    registerToolData(toolData) {
        if (this._tools.has(toolData.id)) {
            throw new Error(`Tool "${toolData.id}" is already registered.`);
        }
        if (!toolData.supportedContentTypes.includes('text/plain')) {
            toolData.supportedContentTypes.push('text/plain');
        }
        this._tools.set(toolData.id, { data: toolData });
        this._onDidChangeToolsScheduler.schedule();
        toolData.when?.keys().forEach(key => this._toolContextKeys.add(key));
        return toDisposable(() => {
            this._tools.delete(toolData.id);
            this._refreshAllToolContextKeys();
            this._onDidChangeToolsScheduler.schedule();
        });
    }
    _refreshAllToolContextKeys() {
        this._toolContextKeys.clear();
        for (const tool of this._tools.values()) {
            tool.data.when?.keys().forEach(key => this._toolContextKeys.add(key));
        }
    }
    registerToolImplementation(id, tool) {
        const entry = this._tools.get(id);
        if (!entry) {
            throw new Error(`Tool "${id}" was not contributed.`);
        }
        if (entry.impl) {
            throw new Error(`Tool "${id}" already has an implementation.`);
        }
        entry.impl = tool;
        return toDisposable(() => {
            entry.impl = undefined;
        });
    }
    getTools() {
        const toolDatas = Iterable.map(this._tools.values(), i => i.data);
        return Iterable.filter(toolDatas, toolData => !toolData.when || this._contextKeyService.contextMatchesRules(toolData.when));
    }
    getTool(id) {
        return this._getToolEntry(id)?.data;
    }
    _getToolEntry(id) {
        const entry = this._tools.get(id);
        if (entry && (!entry.data.when || this._contextKeyService.contextMatchesRules(entry.data.when))) {
            return entry;
        }
        else {
            return undefined;
        }
    }
    getToolByName(name) {
        for (const toolData of this.getTools()) {
            if (toolData.name === name) {
                return toolData;
            }
        }
        return undefined;
    }
    async invokeTool(dto, countTokens, token) {
        let tool = this._tools.get(dto.toolId);
        if (!tool) {
            throw new Error(`Tool ${dto.toolId} was not contributed`);
        }
        if (!tool.impl) {
            await this._extensionService.activateByEvent(`onLanguageModelTool:${dto.toolId}`);
            tool = this._tools.get(dto.toolId);
            if (!tool?.impl) {
                throw new Error(`Tool ${dto.toolId} does not have an implementation registered.`);
            }
        }
        let toolInvocation;
        if (dto.context) {
            const model = this._chatService.getSession(dto.context?.sessionId);
            const request = model.getRequests().at(-1);
            const participantName = request.response?.agent?.fullName ?? '';
            const getConfirmationMessages = async () => {
                if (!tool.data.requiresConfirmation) {
                    return undefined;
                }
                return (await tool.impl.provideToolConfirmationMessages(participantName, dto.parameters, token)) ?? {
                    title: localize('toolConfirmTitle', "Use {0}?", `"${tool.data.displayName ?? tool.data.id}"`),
                    message: localize('toolConfirmMessage', "{0} will use {1}.", participantName, `"${tool.data.displayName ?? tool.data.id}"`),
                };
            };
            const [invocationMessage, confirmationMessages] = await Promise.all([
                tool.impl.provideToolInvocationMessage(dto.parameters, token),
                getConfirmationMessages()
            ]);
            const defaultMessage = localize('toolInvocationMessage', "Using {0}", `"${tool.data.displayName ?? tool.data.id}"`);
            toolInvocation = new ChatToolInvocation(invocationMessage ?? defaultMessage, confirmationMessages);
            token.onCancellationRequested(() => {
                toolInvocation.confirmed.complete(false);
            });
            model.acceptResponseProgress(request, toolInvocation);
            if (tool.data.requiresConfirmation) {
                const userConfirmed = await toolInvocation.confirmed.p;
                if (!userConfirmed) {
                    throw new CancellationError();
                }
            }
        }
        try {
            return tool.impl.invoke(dto, countTokens, token);
        }
        finally {
            toolInvocation?.complete();
        }
    }
};
LanguageModelToolsService = __decorate([
    __param(0, IExtensionService),
    __param(1, IContextKeyService),
    __param(2, IChatService),
    __metadata("design:paramtypes", [Object, Object, Object])
], LanguageModelToolsService);
export { LanguageModelToolsService };
