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
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { HoverParticipantRegistry, RenderedHoverParts } from '../../../../../editor/contrib/hover/browser/hoverTypes.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IChatWidgetService } from '../chat.js';
import { ChatAgentHover, getChatAgentHoverOptions } from '../chatAgentHover.js';
import { ChatEditorHoverWrapper } from './editorHoverWrapper.js';
import { extractAgentAndCommand } from '../../common/chatParserTypes.js';
import * as nls from '../../../../../nls.js';
let ChatAgentHoverParticipant = class ChatAgentHoverParticipant {
    constructor(editor, instantiationService, chatWidgetService, commandService) {
        this.editor = editor;
        this.instantiationService = instantiationService;
        this.chatWidgetService = chatWidgetService;
        this.commandService = commandService;
        this.hoverOrdinal = 1;
    }
    computeSync(anchor, _lineDecorations) {
        if (!this.editor.hasModel()) {
            return [];
        }
        const widget = this.chatWidgetService.getWidgetByInputUri(this.editor.getModel().uri);
        if (!widget) {
            return [];
        }
        const { agentPart } = extractAgentAndCommand(widget.parsedInput);
        if (!agentPart) {
            return [];
        }
        if (Range.containsPosition(agentPart.editorRange, anchor.range.getStartPosition())) {
            return [new ChatAgentHoverPart(this, Range.lift(agentPart.editorRange), agentPart.agent)];
        }
        return [];
    }
    renderHoverParts(context, hoverParts) {
        if (!hoverParts.length) {
            return new RenderedHoverParts([]);
        }
        const disposables = new DisposableStore();
        const hover = disposables.add(this.instantiationService.createInstance(ChatAgentHover));
        disposables.add(hover.onDidChangeContents(() => context.onContentsChanged()));
        const hoverPart = hoverParts[0];
        const agent = hoverPart.agent;
        hover.setAgent(agent.id);
        const actions = getChatAgentHoverOptions(() => agent, this.commandService).actions;
        const wrapper = this.instantiationService.createInstance(ChatEditorHoverWrapper, hover.domNode, actions);
        const wrapperNode = wrapper.domNode;
        context.fragment.appendChild(wrapperNode);
        const renderedHoverPart = {
            hoverPart,
            hoverElement: wrapperNode,
            dispose() { disposables.dispose(); }
        };
        return new RenderedHoverParts([renderedHoverPart]);
    }
    getAccessibleContent(hoverPart) {
        return nls.localize('hoverAccessibilityChatAgent', 'There is a chat agent hover part here.');
    }
};
ChatAgentHoverParticipant = __decorate([
    __param(1, IInstantiationService),
    __param(2, IChatWidgetService),
    __param(3, ICommandService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], ChatAgentHoverParticipant);
export { ChatAgentHoverParticipant };
export class ChatAgentHoverPart {
    constructor(owner, range, agent) {
        this.owner = owner;
        this.range = range;
        this.agent = agent;
    }
    isValidForHoverAnchor(anchor) {
        return (anchor.type === 1
            && this.range.startColumn <= anchor.range.startColumn
            && this.range.endColumn >= anchor.range.endColumn);
    }
}
HoverParticipantRegistry.register(ChatAgentHoverParticipant);
