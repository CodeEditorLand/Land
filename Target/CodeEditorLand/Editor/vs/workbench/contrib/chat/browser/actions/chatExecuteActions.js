import { Codicon } from '../../../../../base/common/codicons.js';
import { localize2 } from '../../../../../nls.js';
import { Action2, MenuId, MenuRegistry, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { IChatAgentService } from '../../common/chatAgents.js';
import { CONTEXT_CHAT_INPUT_HAS_AGENT, CONTEXT_CHAT_INPUT_HAS_TEXT, CONTEXT_CHAT_LOCATION, CONTEXT_CHAT_REQUEST_IN_PROGRESS, CONTEXT_LANGUAGE_MODELS_ARE_USER_SELECTABLE, CONTEXT_IN_CHAT_INPUT, CONTEXT_PARTICIPANT_SUPPORTS_MODEL_PICKER } from '../../common/chatContextKeys.js';
import { chatAgentLeader, extractAgentAndCommand } from '../../common/chatParserTypes.js';
import { IChatService } from '../../common/chatService.js';
import { IChatWidgetService } from '../chat.js';
import { CHAT_CATEGORY } from './chatActions.js';
export class SubmitAction extends Action2 {
    static { this.ID = 'workbench.action.chat.submit'; }
    constructor() {
        super({
            id: SubmitAction.ID,
            title: localize2('interactive.submit.label', "Send"),
            f1: false,
            category: CHAT_CATEGORY,
            icon: Codicon.send,
            precondition: ContextKeyExpr.and(CONTEXT_CHAT_INPUT_HAS_TEXT, CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate()),
            keybinding: {
                when: CONTEXT_IN_CHAT_INPUT,
                primary: 3,
                weight: 100
            },
            menu: [
                {
                    id: MenuId.ChatExecuteSecondary,
                    group: 'group_1',
                },
                {
                    id: MenuId.ChatExecute,
                    order: 4,
                    when: CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate(),
                    group: 'navigation',
                },
            ]
        });
    }
    run(accessor, ...args) {
        const context = args[0];
        const widgetService = accessor.get(IChatWidgetService);
        const widget = context?.widget ?? widgetService.lastFocusedWidget;
        widget?.acceptInput(context?.inputValue);
    }
}
export const ChatModelPickerActionId = 'workbench.action.chat.pickModel';
MenuRegistry.appendMenuItem(MenuId.ChatExecute, {
    command: {
        id: ChatModelPickerActionId,
        title: localize2('chat.pickModel.label', "Pick Model"),
    },
    order: 3,
    group: 'navigation',
    when: ContextKeyExpr.and(CONTEXT_LANGUAGE_MODELS_ARE_USER_SELECTABLE, CONTEXT_PARTICIPANT_SUPPORTS_MODEL_PICKER, ContextKeyExpr.equals(CONTEXT_CHAT_LOCATION.key, 'panel')),
});
export class ChatSubmitSecondaryAgentAction extends Action2 {
    static { this.ID = 'workbench.action.chat.submitSecondaryAgent'; }
    constructor() {
        super({
            id: ChatSubmitSecondaryAgentAction.ID,
            title: localize2({ key: 'actions.chat.submitSecondaryAgent', comment: ['Send input from the chat input box to the secondary agent'] }, "Submit to Secondary Agent"),
            precondition: ContextKeyExpr.and(CONTEXT_CHAT_INPUT_HAS_TEXT, CONTEXT_CHAT_INPUT_HAS_AGENT.negate(), CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate()),
            keybinding: {
                when: CONTEXT_IN_CHAT_INPUT,
                primary: 2048 | 3,
                weight: 100
            },
            menu: {
                id: MenuId.ChatExecuteSecondary,
                group: 'group_1'
            }
        });
    }
    run(accessor, ...args) {
        const context = args[0];
        const agentService = accessor.get(IChatAgentService);
        const secondaryAgent = agentService.getSecondaryAgent();
        if (!secondaryAgent) {
            return;
        }
        const widgetService = accessor.get(IChatWidgetService);
        const widget = context?.widget ?? widgetService.lastFocusedWidget;
        if (!widget) {
            return;
        }
        if (extractAgentAndCommand(widget.parsedInput).agentPart) {
            widget.acceptInput();
        }
        else {
            widget.lastSelectedAgent = secondaryAgent;
            widget.acceptInputWithPrefix(`${chatAgentLeader}${secondaryAgent.name}`);
        }
    }
}
class SendToNewChatAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.chat.sendToNewChat',
            title: localize2('chat.newChat.label', "Send to New Chat"),
            precondition: ContextKeyExpr.and(CONTEXT_CHAT_REQUEST_IN_PROGRESS.negate(), CONTEXT_CHAT_INPUT_HAS_TEXT),
            category: CHAT_CATEGORY,
            f1: false,
            menu: {
                id: MenuId.ChatExecuteSecondary,
                group: 'group_2'
            },
            keybinding: {
                weight: 200,
                primary: 2048 | 1024 | 3,
                when: CONTEXT_IN_CHAT_INPUT,
            }
        });
    }
    async run(accessor, ...args) {
        const context = args[0];
        const widgetService = accessor.get(IChatWidgetService);
        const widget = context?.widget ?? widgetService.lastFocusedWidget;
        if (!widget) {
            return;
        }
        widget.clear();
        widget.acceptInput(context?.inputValue);
    }
}
export class CancelAction extends Action2 {
    static { this.ID = 'workbench.action.chat.cancel'; }
    constructor() {
        super({
            id: CancelAction.ID,
            title: localize2('interactive.cancel.label', "Cancel"),
            f1: false,
            category: CHAT_CATEGORY,
            icon: Codicon.stopCircle,
            menu: {
                id: MenuId.ChatExecute,
                when: CONTEXT_CHAT_REQUEST_IN_PROGRESS,
                order: 4,
                group: 'navigation',
            },
            keybinding: {
                weight: 200,
                primary: 2048 | 9,
                win: { primary: 512 | 1 },
            }
        });
    }
    run(accessor, ...args) {
        const context = args[0];
        const widgetService = accessor.get(IChatWidgetService);
        const widget = context?.widget ?? widgetService.lastFocusedWidget;
        if (!widget) {
            return;
        }
        const chatService = accessor.get(IChatService);
        if (widget.viewModel) {
            chatService.cancelCurrentRequestForSession(widget.viewModel.sessionId);
        }
    }
}
export function registerChatExecuteActions() {
    registerAction2(SubmitAction);
    registerAction2(CancelAction);
    registerAction2(SendToNewChatAction);
    registerAction2(ChatSubmitSecondaryAgentAction);
}
