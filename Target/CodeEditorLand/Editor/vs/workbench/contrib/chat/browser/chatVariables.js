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
import { coalesce } from '../../../../base/common/arrays.js';
import { onUnexpectedExternalError } from '../../../../base/common/errors.js';
import { Iterable } from '../../../../base/common/iterator.js';
import { toDisposable } from '../../../../base/common/lifecycle.js';
import { basename } from '../../../../base/common/path.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { URI } from '../../../../base/common/uri.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { ChatAgentLocation } from '../common/chatAgents.js';
import { ChatRequestDynamicVariablePart, ChatRequestToolPart, ChatRequestVariablePart } from '../common/chatParserTypes.js';
import { IChatWidgetService, showChatView } from './chat.js';
import { ChatContextAttachments } from './contrib/chatContextAttachments.js';
import { ChatDynamicVariableModel } from './contrib/chatDynamicVariables.js';
let ChatVariablesService = class ChatVariablesService {
    constructor(chatWidgetService, viewsService) {
        this.chatWidgetService = chatWidgetService;
        this.viewsService = viewsService;
        this._resolver = new Map();
    }
    async resolveVariables(prompt, attachedContextVariables, model, progress, token) {
        let resolvedVariables = [];
        const jobs = [];
        prompt.parts
            .forEach((part, i) => {
            if (part instanceof ChatRequestVariablePart) {
                const data = this._resolver.get(part.variableName.toLowerCase());
                if (data) {
                    const references = [];
                    const variableProgressCallback = (item) => {
                        if (item.kind === 'reference') {
                            references.push(item);
                            return;
                        }
                        progress(item);
                    };
                    jobs.push(data.resolver(prompt.text, part.variableArg, model, variableProgressCallback, token).then(value => {
                        if (value) {
                            resolvedVariables[i] = { id: data.data.id, modelDescription: data.data.modelDescription, name: part.variableName, range: part.range, value, references, fullName: data.data.fullName, icon: data.data.icon };
                        }
                    }).catch(onUnexpectedExternalError));
                }
            }
            else if (part instanceof ChatRequestDynamicVariablePart) {
                resolvedVariables[i] = { id: part.id, name: part.referenceText, range: part.range, value: part.data, fullName: part.fullName, icon: part.icon };
            }
            else if (part instanceof ChatRequestToolPart) {
                resolvedVariables[i] = { id: part.toolId, name: part.toolName, range: part.range, value: undefined, isTool: true, icon: ThemeIcon.isThemeIcon(part.icon) ? part.icon : undefined, fullName: part.displayName };
            }
        });
        const resolvedAttachedContext = [];
        attachedContextVariables
            ?.forEach((attachment, i) => {
            const data = this._resolver.get(attachment.name?.toLowerCase());
            if (data) {
                const references = [];
                const variableProgressCallback = (item) => {
                    if (item.kind === 'reference') {
                        references.push(item);
                        return;
                    }
                    progress(item);
                };
                jobs.push(data.resolver(prompt.text, '', model, variableProgressCallback, token).then(value => {
                    if (value) {
                        resolvedAttachedContext[i] = { id: data.data.id, modelDescription: data.data.modelDescription, name: attachment.name, fullName: attachment.fullName, range: attachment.range, value, references, icon: attachment.icon };
                    }
                }).catch(onUnexpectedExternalError));
            }
            else if (attachment.isDynamic || attachment.isTool) {
                resolvedAttachedContext[i] = { ...attachment };
            }
        });
        await Promise.allSettled(jobs);
        resolvedVariables = coalesce(resolvedVariables);
        resolvedVariables.sort((a, b) => b.range.start - a.range.start);
        resolvedVariables.push(...coalesce(resolvedAttachedContext));
        return {
            variables: resolvedVariables,
        };
    }
    async resolveVariable(variableName, promptText, model, progress, token) {
        const data = this._resolver.get(variableName.toLowerCase());
        if (!data) {
            return undefined;
        }
        return (await data.resolver(promptText, undefined, model, progress, token));
    }
    hasVariable(name) {
        return this._resolver.has(name.toLowerCase());
    }
    getVariable(name) {
        return this._resolver.get(name.toLowerCase())?.data;
    }
    getVariables(location) {
        const all = Iterable.map(this._resolver.values(), data => data.data);
        return Iterable.filter(all, data => {
            return location !== ChatAgentLocation.Editor || !new Set(['selection', 'editor']).has(data.name);
        });
    }
    getDynamicVariables(sessionId) {
        const widget = this.chatWidgetService.getWidgetBySessionId(sessionId);
        if (!widget || !widget.viewModel || !widget.supportsFileReferences) {
            return [];
        }
        const model = widget.getContrib(ChatDynamicVariableModel.ID);
        if (!model) {
            return [];
        }
        return model.variables;
    }
    registerVariable(data, resolver) {
        const key = data.name.toLowerCase();
        if (this._resolver.has(key)) {
            throw new Error(`A chat variable with the name '${data.name}' already exists.`);
        }
        this._resolver.set(key, { data, resolver });
        return toDisposable(() => {
            this._resolver.delete(key);
        });
    }
    async attachContext(name, value, location) {
        if (location !== ChatAgentLocation.Panel) {
            return;
        }
        const widget = this.chatWidgetService.lastFocusedWidget ?? await showChatView(this.viewsService);
        if (!widget || !widget.viewModel) {
            return;
        }
        const key = name.toLowerCase();
        if (key === 'file' && typeof value !== 'string') {
            const uri = URI.isUri(value) ? value : value.uri;
            const range = 'range' in value ? value.range : undefined;
            widget.getContrib(ChatContextAttachments.ID)?.setContext(false, { value, id: uri.toString() + (range?.toString() ?? ''), name: basename(uri.path), isFile: true, isDynamic: true });
            return;
        }
        const resolved = this._resolver.get(key);
        if (!resolved) {
            return;
        }
        widget.getContrib(ChatContextAttachments.ID)?.setContext(false, { ...resolved.data, value });
    }
};
ChatVariablesService = __decorate([
    __param(0, IChatWidgetService),
    __param(1, IViewsService),
    __metadata("design:paramtypes", [Object, Object])
], ChatVariablesService);
export { ChatVariablesService };
