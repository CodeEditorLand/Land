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
import * as dom from '../../../../base/browser/dom.js';
import { Button } from '../../../../base/browser/ui/button/button.js';
import { getDefaultHoverDelegate } from '../../../../base/browser/ui/hover/hoverDelegateFactory.js';
import { toErrorMessage } from '../../../../base/common/errorMessage.js';
import { Lazy } from '../../../../base/common/lazy.js';
import { Disposable, DisposableStore } from '../../../../base/common/lifecycle.js';
import { revive } from '../../../../base/common/marshalling.js';
import { URI } from '../../../../base/common/uri.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IHoverService } from '../../../../platform/hover/browser/hover.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { asCssVariable } from '../../../../platform/theme/common/colorUtils.js';
import { contentRefUrl } from '../common/annotations.js';
import { getFullyQualifiedId, IChatAgentNameService, IChatAgentService } from '../common/chatAgents.js';
import { chatSlashCommandBackground, chatSlashCommandForeground } from '../common/chatColors.js';
import { chatAgentLeader, ChatRequestAgentPart, ChatRequestAgentSubcommandPart, ChatRequestDynamicVariablePart, ChatRequestSlashCommandPart, ChatRequestTextPart, ChatRequestToolPart, ChatRequestVariablePart, chatSubcommandLeader } from '../common/chatParserTypes.js';
import { IChatService } from '../common/chatService.js';
import { IChatVariablesService } from '../common/chatVariables.js';
import { ILanguageModelToolsService } from '../common/languageModelToolsService.js';
import { IChatWidgetService } from './chat.js';
import { ChatAgentHover, getChatAgentHoverOptions } from './chatAgentHover.js';
import { InlineAnchorWidget } from './chatInlineAnchorWidget.js';
import './media/chatInlineAnchorWidget.css';
const decorationRefUrl = `http://_vscodedecoration_`;
const agentRefUrl = `http://_chatagent_`;
const agentSlashRefUrl = `http://_chatslash_`;
export function agentToMarkdown(agent, isClickable, accessor) {
    const chatAgentNameService = accessor.get(IChatAgentNameService);
    const chatAgentService = accessor.get(IChatAgentService);
    const isAllowed = chatAgentNameService.getAgentNameRestriction(agent);
    let name = `${isAllowed ? agent.name : getFullyQualifiedId(agent)}`;
    const isDupe = isAllowed && chatAgentService.agentHasDupeName(agent.id);
    if (isDupe) {
        name += ` (${agent.publisherDisplayName})`;
    }
    const args = { agentId: agent.id, name, isClickable };
    return `[${agent.name}](${agentRefUrl}?${encodeURIComponent(JSON.stringify(args))})`;
}
export function agentSlashCommandToMarkdown(agent, command) {
    const text = `${chatSubcommandLeader}${command.name}`;
    const args = { agentId: agent.id, command: command.name };
    return `[${text}](${agentSlashRefUrl}?${encodeURIComponent(JSON.stringify(args))})`;
}
let ChatMarkdownDecorationsRenderer = class ChatMarkdownDecorationsRenderer extends Disposable {
    constructor(keybindingService, logService, chatAgentService, instantiationService, hoverService, chatService, chatWidgetService, commandService, chatVariablesService, labelService, toolsService) {
        super();
        this.keybindingService = keybindingService;
        this.logService = logService;
        this.chatAgentService = chatAgentService;
        this.instantiationService = instantiationService;
        this.hoverService = hoverService;
        this.chatService = chatService;
        this.chatWidgetService = chatWidgetService;
        this.commandService = commandService;
        this.chatVariablesService = chatVariablesService;
        this.labelService = labelService;
        this.toolsService = toolsService;
    }
    convertParsedRequestToMarkdown(parsedRequest) {
        let result = '';
        for (const part of parsedRequest.parts) {
            if (part instanceof ChatRequestTextPart) {
                result += part.text;
            }
            else if (part instanceof ChatRequestAgentPart) {
                result += this.instantiationService.invokeFunction(accessor => agentToMarkdown(part.agent, false, accessor));
            }
            else {
                result += this.genericDecorationToMarkdown(part);
            }
        }
        return result;
    }
    genericDecorationToMarkdown(part) {
        const uri = part instanceof ChatRequestDynamicVariablePart && part.data instanceof URI ?
            part.data :
            undefined;
        const title = uri ? this.labelService.getUriLabel(uri, { relative: true }) :
            part instanceof ChatRequestSlashCommandPart ? part.slashCommand.detail :
                part instanceof ChatRequestAgentSubcommandPart ? part.command.description :
                    part instanceof ChatRequestVariablePart ? (this.chatVariablesService.getVariable(part.variableName)?.description) :
                        part instanceof ChatRequestToolPart ? (this.toolsService.getTool(part.toolId)?.userDescription) :
                            '';
        const args = { title };
        const text = part.text;
        return `[${text}](${decorationRefUrl}?${encodeURIComponent(JSON.stringify(args))})`;
    }
    walkTreeAndAnnotateReferenceLinks(element) {
        const store = new DisposableStore();
        element.querySelectorAll('a').forEach(a => {
            const href = a.getAttribute('data-href');
            if (href) {
                if (href.startsWith(agentRefUrl)) {
                    let args;
                    try {
                        args = JSON.parse(decodeURIComponent(href.slice(agentRefUrl.length + 1)));
                    }
                    catch (e) {
                        this.logService.error('Invalid chat widget render data JSON', toErrorMessage(e));
                    }
                    if (args) {
                        a.parentElement.replaceChild(this.renderAgentWidget(args, store), a);
                    }
                }
                else if (href.startsWith(agentSlashRefUrl)) {
                    let args;
                    try {
                        args = JSON.parse(decodeURIComponent(href.slice(agentRefUrl.length + 1)));
                    }
                    catch (e) {
                        this.logService.error('Invalid chat slash command render data JSON', toErrorMessage(e));
                    }
                    if (args) {
                        a.parentElement.replaceChild(this.renderSlashCommandWidget(a.textContent, args, store), a);
                    }
                }
                else if (href.startsWith(decorationRefUrl)) {
                    let args;
                    try {
                        args = JSON.parse(decodeURIComponent(href.slice(decorationRefUrl.length + 1)));
                    }
                    catch (e) { }
                    a.parentElement.replaceChild(this.renderResourceWidget(a.textContent, args, store), a);
                }
                else if (href.startsWith(contentRefUrl)) {
                    this.renderFileWidget(href, a, store);
                }
                else if (href.startsWith('command:')) {
                    this.injectKeybindingHint(a, href, this.keybindingService);
                }
            }
        });
        return store;
    }
    renderAgentWidget(args, store) {
        const nameWithLeader = `${chatAgentLeader}${args.name}`;
        let container;
        if (args.isClickable) {
            container = dom.$('span.chat-agent-widget');
            const button = store.add(new Button(container, {
                buttonBackground: asCssVariable(chatSlashCommandBackground),
                buttonForeground: asCssVariable(chatSlashCommandForeground),
                buttonHoverBackground: undefined
            }));
            button.label = nameWithLeader;
            store.add(button.onDidClick(() => {
                const agent = this.chatAgentService.getAgent(args.agentId);
                const widget = this.chatWidgetService.lastFocusedWidget;
                if (!widget || !agent) {
                    return;
                }
                this.chatService.sendRequest(widget.viewModel.sessionId, agent.metadata.sampleRequest ?? '', { location: widget.location, agentId: agent.id });
            }));
        }
        else {
            container = this.renderResourceWidget(nameWithLeader, undefined, store);
        }
        const agent = this.chatAgentService.getAgent(args.agentId);
        const hover = new Lazy(() => store.add(this.instantiationService.createInstance(ChatAgentHover)));
        store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate('element'), container, () => {
            hover.value.setAgent(args.agentId);
            return hover.value.domNode;
        }, agent && getChatAgentHoverOptions(() => agent, this.commandService)));
        return container;
    }
    renderSlashCommandWidget(name, args, store) {
        const container = dom.$('span.chat-agent-widget.chat-command-widget');
        const agent = this.chatAgentService.getAgent(args.agentId);
        const button = store.add(new Button(container, {
            buttonBackground: asCssVariable(chatSlashCommandBackground),
            buttonForeground: asCssVariable(chatSlashCommandForeground),
            buttonHoverBackground: undefined
        }));
        button.label = name;
        store.add(button.onDidClick(() => {
            const widget = this.chatWidgetService.lastFocusedWidget;
            if (!widget || !agent) {
                return;
            }
            const command = agent.slashCommands.find(c => c.name === args.command);
            this.chatService.sendRequest(widget.viewModel.sessionId, command?.sampleRequest ?? '', { location: widget.location, agentId: agent.id, slashCommand: args.command });
        }));
        return container;
    }
    renderFileWidget(href, a, store) {
        const fullUri = URI.parse(href);
        let data;
        try {
            data = revive(JSON.parse(fullUri.fragment));
        }
        catch (err) {
            this.logService.error('Invalid chat widget render data JSON', toErrorMessage(err));
            return;
        }
        if (data.kind !== 'symbol' && !URI.isUri(data.uri)) {
            this.logService.error(`Invalid chat widget render data: ${fullUri.fragment}`);
            return;
        }
        store.add(this.instantiationService.createInstance(InlineAnchorWidget, a, data, undefined));
    }
    renderResourceWidget(name, args, store) {
        const container = dom.$('span.chat-resource-widget');
        const alias = dom.$('span', undefined, name);
        if (args?.title) {
            store.add(this.hoverService.setupManagedHover(getDefaultHoverDelegate('element'), container, args.title));
        }
        container.appendChild(alias);
        return container;
    }
    injectKeybindingHint(a, href, keybindingService) {
        const command = href.match(/command:([^\)]+)/)?.[1];
        if (command) {
            const kb = keybindingService.lookupKeybinding(command);
            if (kb) {
                const keybinding = kb.getLabel();
                if (keybinding) {
                    a.textContent = `${a.textContent} (${keybinding})`;
                }
            }
        }
    }
};
ChatMarkdownDecorationsRenderer = __decorate([
    __param(0, IKeybindingService),
    __param(1, ILogService),
    __param(2, IChatAgentService),
    __param(3, IInstantiationService),
    __param(4, IHoverService),
    __param(5, IChatService),
    __param(6, IChatWidgetService),
    __param(7, ICommandService),
    __param(8, IChatVariablesService),
    __param(9, ILabelService),
    __param(10, ILanguageModelToolsService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], ChatMarkdownDecorationsRenderer);
export { ChatMarkdownDecorationsRenderer };
