import { Codicon } from '../../../../../base/common/codicons.js';
import { localize2 } from '../../../../../nls.js';
import { AccessibilitySignal, IAccessibilitySignalService } from '../../../../../platform/accessibilitySignal/browser/accessibilitySignalService.js';
import { Action2, MenuId, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { ActiveEditorContext } from '../../../../common/contextkeys.js';
import { CHAT_CATEGORY, isChatViewTitleActionContext } from './chatActions.js';
import { clearChatEditor } from './chatClear.js';
import { CHAT_VIEW_ID, EDITS_VIEW_ID, IChatWidgetService } from '../chat.js';
import { ChatEditorInput } from '../chatEditorInput.js';
import { CONTEXT_IN_CHAT_SESSION, CONTEXT_CHAT_ENABLED, CONTEXT_CHAT_EDITING_PARTICIPANT_REGISTERED, CONTEXT_CHAT_EDITING_ENABLED } from '../../common/chatContextKeys.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
import { ChatAgentLocation } from '../../common/chatAgents.js';
import { ChatContextAttachments } from '../contrib/chatContextAttachments.js';
export const ACTION_ID_NEW_CHAT = `workbench.action.chat.newChat`;
export const ACTION_ID_NEW_EDIT_SESSION = `workbench.action.chat.newEditSession`;
export function registerNewChatActions() {
    registerAction2(class NewChatEditorAction extends Action2 {
        constructor() {
            super({
                id: 'workbench.action.chatEditor.newChat',
                title: localize2('chat.newChat.label', "New Chat"),
                icon: Codicon.plus,
                f1: false,
                precondition: CONTEXT_CHAT_ENABLED,
                menu: [{
                        id: MenuId.EditorTitle,
                        group: 'navigation',
                        order: 0,
                        when: ActiveEditorContext.isEqualTo(ChatEditorInput.EditorID),
                    }]
            });
        }
        async run(accessor, ...args) {
            announceChatCleared(accessor.get(IAccessibilitySignalService));
            await clearChatEditor(accessor);
        }
    });
    registerAction2(class GlobalClearChatAction extends Action2 {
        constructor() {
            super({
                id: ACTION_ID_NEW_CHAT,
                title: localize2('chat.newChat.label', "New Chat"),
                category: CHAT_CATEGORY,
                icon: Codicon.plus,
                precondition: CONTEXT_CHAT_ENABLED,
                f1: true,
                keybinding: {
                    weight: 200,
                    primary: 2048 | 42,
                    mac: {
                        primary: 256 | 42
                    },
                    when: CONTEXT_IN_CHAT_SESSION
                },
                menu: [{
                        id: MenuId.ChatContext,
                        group: 'z_clear'
                    },
                    {
                        id: MenuId.ViewTitle,
                        when: ContextKeyExpr.equals('view', CHAT_VIEW_ID),
                        group: 'navigation',
                        order: -1
                    }]
            });
        }
        async run(accessor, ...args) {
            const context = args[0];
            const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
            if (isChatViewTitleActionContext(context)) {
                announceChatCleared(accessibilitySignalService);
                context.chatView.widget.clear();
                context.chatView.widget.focusInput();
            }
            else {
                const widgetService = accessor.get(IChatWidgetService);
                const viewsService = accessor.get(IViewsService);
                let widget = widgetService.lastFocusedWidget;
                if (!widget) {
                    const chatView = await viewsService.openView(CHAT_VIEW_ID);
                    widget = chatView.widget;
                }
                announceChatCleared(accessibilitySignalService);
                widget.clear();
                widget.focusInput();
            }
        }
    });
    registerAction2(class GlobalClearEditsAction extends Action2 {
        constructor() {
            super({
                id: ACTION_ID_NEW_EDIT_SESSION,
                title: localize2('chat.newEdits.label', "New Edit Session"),
                category: CHAT_CATEGORY,
                icon: Codicon.plus,
                precondition: ContextKeyExpr.and(CONTEXT_CHAT_ENABLED, CONTEXT_CHAT_EDITING_PARTICIPANT_REGISTERED),
                f1: true,
                menu: [{
                        id: MenuId.ChatContext,
                        group: 'z_clear'
                    },
                    {
                        id: MenuId.ViewTitle,
                        when: ContextKeyExpr.equals('view', EDITS_VIEW_ID),
                        group: 'navigation',
                        order: -1
                    },
                ]
            });
        }
        async run(accessor, ...args) {
            const context = args[0];
            const accessibilitySignalService = accessor.get(IAccessibilitySignalService);
            if (isChatViewTitleActionContext(context)) {
                announceChatCleared(accessibilitySignalService);
                context.chatView.widget.clear();
                context.chatView.widget.getContrib(ChatContextAttachments.ID)?.setContext(true, ...[]);
                context.chatView.widget.focusInput();
            }
            else {
                const widgetService = accessor.get(IChatWidgetService);
                const viewsService = accessor.get(IViewsService);
                let widget = widgetService.lastFocusedWidget;
                if (!widget || widget.location !== ChatAgentLocation.EditingSession) {
                    const chatView = await viewsService.openView(EDITS_VIEW_ID);
                    widget = chatView.widget;
                }
                announceChatCleared(accessibilitySignalService);
                widget.clear();
                widget.getContrib(ChatContextAttachments.ID)?.setContext(true, ...[]);
                widget.focusInput();
            }
        }
    });
    registerAction2(class GlobalClearEditsAction extends Action2 {
        constructor() {
            super({
                id: 'workbench.action.chat.openEditSession',
                title: localize2('chat.openEdits.label', "Open Edit Session"),
                category: CHAT_CATEGORY,
                icon: Codicon.edit,
                precondition: ContextKeyExpr.and(CONTEXT_CHAT_ENABLED, CONTEXT_CHAT_EDITING_PARTICIPANT_REGISTERED),
                f1: true,
                menu: [{
                        id: MenuId.ViewTitle,
                        when: ContextKeyExpr.and(ContextKeyExpr.equals('view', CHAT_VIEW_ID), CONTEXT_CHAT_EDITING_ENABLED),
                        group: 'navigation',
                        order: 1
                    }]
            });
        }
        async run(accessor, ...args) {
            const viewsService = accessor.get(IViewsService);
            const chatView = await viewsService.openView(EDITS_VIEW_ID);
            chatView.widget.focusInput();
        }
    });
}
function announceChatCleared(accessibilitySignalService) {
    accessibilitySignalService.playSignal(AccessibilitySignal.clear);
}
