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
import { coalesce } from '../../../../../base/common/arrays.js';
import { Codicon } from '../../../../../base/common/codicons.js';
import { fromNowByDay } from '../../../../../base/common/date.js';
import { DisposableStore } from '../../../../../base/common/lifecycle.js';
import { ThemeIcon } from '../../../../../base/common/themables.js';
import { EditorAction2 } from '../../../../../editor/browser/editorExtensions.js';
import { localize, localize2 } from '../../../../../nls.js';
import { Action2, MenuId, MenuItemAction, MenuRegistry, registerAction2, SubmenuItemAction } from '../../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { IsLinuxContext, IsWindowsContext } from '../../../../../platform/contextkey/common/contextkeys.js';
import { IQuickInputService } from '../../../../../platform/quickinput/common/quickInput.js';
import { clearChatEditor } from './chatClear.js';
import { CHAT_VIEW_ID, IChatWidgetService, showChatView } from '../chat.js';
import { ChatEditorInput } from '../chatEditorInput.js';
import { CONTEXT_CHAT_ENABLED, CONTEXT_CHAT_INPUT_CURSOR_AT_TOP, CONTEXT_CHAT_LOCATION, CONTEXT_IN_CHAT_INPUT, CONTEXT_IN_CHAT_SESSION, CONTEXT_IN_QUICK_CHAT } from '../../common/chatContextKeys.js';
import { IChatService } from '../../common/chatService.js';
import { isRequestVM } from '../../common/chatViewModel.js';
import { IChatWidgetHistoryService } from '../../common/chatWidgetHistoryService.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { ACTIVE_GROUP, IEditorService } from '../../../../services/editor/common/editorService.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
import { IActionViewItemService } from '../../../../../platform/actions/browser/actionViewItemService.js';
import { ChatAgentLocation, IChatAgentService } from '../../common/chatAgents.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { DropdownWithPrimaryActionViewItem } from '../../../../../platform/actions/browser/dropdownWithPrimaryActionViewItem.js';
import { toAction } from '../../../../../base/common/actions.js';
import { extractAgentAndCommand } from '../../common/chatParserTypes.js';
import { Position } from '../../../../../editor/common/core/position.js';
import { SuggestController } from '../../../../../editor/contrib/suggest/browser/suggestController.js';
export function isChatViewTitleActionContext(obj) {
    return obj instanceof Object && 'chatView' in obj;
}
export const CHAT_CATEGORY = localize2('chat.category', 'Chat');
export const CHAT_OPEN_ACTION_ID = 'workbench.action.chat.open';
class OpenChatGlobalAction extends Action2 {
    static { this.TITLE = localize2('openChat', "Open Chat"); }
    constructor() {
        super({
            id: CHAT_OPEN_ACTION_ID,
            title: OpenChatGlobalAction.TITLE,
            icon: Codicon.commentDiscussion,
            f1: true,
            category: CHAT_CATEGORY,
            keybinding: {
                weight: 200,
                primary: 2048 | 512 | 39,
                mac: {
                    primary: 2048 | 256 | 39
                }
            },
            menu: {
                id: MenuId.ChatCommandCenter,
                group: 'a_chat',
                order: 1
            }
        });
    }
    async run(accessor, opts) {
        opts = typeof opts === 'string' ? { query: opts } : opts;
        const chatService = accessor.get(IChatService);
        const chatWidget = await showChatView(accessor.get(IViewsService));
        if (!chatWidget) {
            return;
        }
        if (opts?.previousRequests?.length && chatWidget.viewModel) {
            for (const { request, response } of opts.previousRequests) {
                chatService.addCompleteRequest(chatWidget.viewModel.sessionId, request, undefined, 0, { message: response });
            }
        }
        if (opts?.query) {
            if (opts.isPartialQuery) {
                chatWidget.setInput(opts.query);
            }
            else {
                chatWidget.acceptInput(opts.query);
            }
        }
        chatWidget.focusInput();
    }
}
class ChatHistoryAction extends Action2 {
    constructor() {
        super({
            id: `workbench.action.chat.history`,
            title: localize2('chat.history.label', "Show Chats..."),
            menu: {
                id: MenuId.ViewTitle,
                when: ContextKeyExpr.equals('view', CHAT_VIEW_ID),
                group: 'navigation',
                order: 2
            },
            category: CHAT_CATEGORY,
            icon: Codicon.history,
            f1: true,
            precondition: CONTEXT_CHAT_ENABLED
        });
    }
    async run(accessor) {
        const chatService = accessor.get(IChatService);
        const quickInputService = accessor.get(IQuickInputService);
        const viewsService = accessor.get(IViewsService);
        const editorService = accessor.get(IEditorService);
        const showPicker = () => {
            const openInEditorButton = {
                iconClass: ThemeIcon.asClassName(Codicon.file),
                tooltip: localize('interactiveSession.history.editor', "Open in Editor"),
            };
            const deleteButton = {
                iconClass: ThemeIcon.asClassName(Codicon.x),
                tooltip: localize('interactiveSession.history.delete', "Delete"),
            };
            const renameButton = {
                iconClass: ThemeIcon.asClassName(Codicon.pencil),
                tooltip: localize('chat.history.rename', "Rename"),
            };
            const getPicks = () => {
                const items = chatService.getHistory();
                items.sort((a, b) => (b.lastMessageDate ?? 0) - (a.lastMessageDate ?? 0));
                let lastDate = undefined;
                const picks = items.flatMap((i) => {
                    const timeAgoStr = fromNowByDay(i.lastMessageDate, true, true);
                    const separator = timeAgoStr !== lastDate ? {
                        type: 'separator', label: timeAgoStr,
                    } : undefined;
                    lastDate = timeAgoStr;
                    return [
                        separator,
                        {
                            label: i.title,
                            description: i.isActive ? `(${localize('currentChatLabel', 'current')})` : '',
                            chat: i,
                            buttons: i.isActive ? [renameButton] : [
                                renameButton,
                                openInEditorButton,
                                deleteButton,
                            ]
                        }
                    ];
                });
                return coalesce(picks);
            };
            const store = new DisposableStore();
            const picker = store.add(quickInputService.createQuickPick({ useSeparators: true }));
            picker.placeholder = localize('interactiveSession.history.pick', "Switch to chat");
            const picks = getPicks();
            picker.items = picks;
            store.add(picker.onDidTriggerItemButton(async (context) => {
                if (context.button === openInEditorButton) {
                    const options = { target: { sessionId: context.item.chat.sessionId }, pinned: true };
                    editorService.openEditor({ resource: ChatEditorInput.getNewEditorUri(), options }, ACTIVE_GROUP);
                    picker.hide();
                }
                else if (context.button === deleteButton) {
                    chatService.removeHistoryEntry(context.item.chat.sessionId);
                    picker.items = getPicks();
                }
                else if (context.button === renameButton) {
                    const title = await quickInputService.input({ title: localize('newChatTitle', "New chat title"), value: context.item.chat.title });
                    if (title) {
                        chatService.setChatSessionTitle(context.item.chat.sessionId, title);
                    }
                    showPicker();
                }
            }));
            store.add(picker.onDidAccept(async () => {
                try {
                    const item = picker.selectedItems[0];
                    const sessionId = item.chat.sessionId;
                    const view = await viewsService.openView(CHAT_VIEW_ID);
                    view.loadSession(sessionId);
                }
                finally {
                    picker.hide();
                }
            }));
            store.add(picker.onDidHide(() => store.dispose()));
            picker.show();
        };
        showPicker();
    }
}
class OpenChatEditorAction extends Action2 {
    constructor() {
        super({
            id: `workbench.action.openChat`,
            title: localize2('interactiveSession.open', "Open Editor"),
            f1: true,
            category: CHAT_CATEGORY,
            precondition: CONTEXT_CHAT_ENABLED
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        await editorService.openEditor({ resource: ChatEditorInput.getNewEditorUri(), options: { pinned: true } });
    }
}
class ChatAddAction extends Action2 {
    constructor() {
        super({
            id: 'workbench.action.chat.addParticipant',
            title: localize2('chatWith', "Chat with Extension"),
            icon: Codicon.mention,
            f1: false,
            category: CHAT_CATEGORY,
            menu: {
                id: MenuId.ChatInput,
                when: CONTEXT_CHAT_LOCATION.isEqualTo(ChatAgentLocation.Panel),
                group: 'navigation',
                order: 1
            }
        });
    }
    async run(accessor, ...args) {
        const widgetService = accessor.get(IChatWidgetService);
        const context = args[0];
        const widget = context?.widget ?? widgetService.lastFocusedWidget;
        if (!widget) {
            return;
        }
        const hasAgentOrCommand = extractAgentAndCommand(widget.parsedInput);
        if (hasAgentOrCommand?.agentPart || hasAgentOrCommand?.commandPart) {
            return;
        }
        const suggestCtrl = SuggestController.get(widget.inputEditor);
        if (suggestCtrl) {
            const curText = widget.inputEditor.getValue();
            const newValue = curText ? `@ ${curText}` : '@';
            if (!curText.startsWith('@')) {
                widget.inputEditor.setValue(newValue);
            }
            widget.inputEditor.setPosition(new Position(1, 2));
            suggestCtrl.triggerSuggest(undefined, true);
        }
    }
}
export function registerChatActions() {
    registerAction2(OpenChatGlobalAction);
    registerAction2(ChatHistoryAction);
    registerAction2(OpenChatEditorAction);
    registerAction2(ChatAddAction);
    registerAction2(class ClearChatInputHistoryAction extends Action2 {
        constructor() {
            super({
                id: 'workbench.action.chat.clearInputHistory',
                title: localize2('interactiveSession.clearHistory.label', "Clear Input History"),
                precondition: CONTEXT_CHAT_ENABLED,
                category: CHAT_CATEGORY,
                f1: true,
            });
        }
        async run(accessor, ...args) {
            const historyService = accessor.get(IChatWidgetHistoryService);
            historyService.clearHistory();
        }
    });
    registerAction2(class ClearChatHistoryAction extends Action2 {
        constructor() {
            super({
                id: 'workbench.action.chat.clearHistory',
                title: localize2('chat.clear.label', "Clear All Workspace Chats"),
                precondition: CONTEXT_CHAT_ENABLED,
                category: CHAT_CATEGORY,
                f1: true,
            });
        }
        async run(accessor, ...args) {
            const editorGroupsService = accessor.get(IEditorGroupsService);
            const viewsService = accessor.get(IViewsService);
            const chatService = accessor.get(IChatService);
            chatService.clearAllHistoryEntries();
            const chatView = viewsService.getViewWithId(CHAT_VIEW_ID);
            if (chatView) {
                chatView.widget.clear();
            }
            editorGroupsService.groups.forEach(group => {
                group.editors.forEach(editor => {
                    if (editor instanceof ChatEditorInput) {
                        clearChatEditor(accessor, editor);
                    }
                });
            });
        }
    });
    registerAction2(class FocusChatAction extends EditorAction2 {
        constructor() {
            super({
                id: 'chat.action.focus',
                title: localize2('actions.interactiveSession.focus', 'Focus Chat List'),
                precondition: ContextKeyExpr.and(CONTEXT_IN_CHAT_INPUT),
                category: CHAT_CATEGORY,
                keybinding: [
                    {
                        when: ContextKeyExpr.and(CONTEXT_CHAT_INPUT_CURSOR_AT_TOP, CONTEXT_IN_QUICK_CHAT.negate()),
                        primary: 2048 | 16,
                        weight: 100,
                    },
                    {
                        when: ContextKeyExpr.and(ContextKeyExpr.or(IsWindowsContext, IsLinuxContext), CONTEXT_IN_QUICK_CHAT.negate()),
                        primary: 2048 | 16,
                        weight: 100,
                    },
                    {
                        when: ContextKeyExpr.and(CONTEXT_IN_CHAT_SESSION, CONTEXT_IN_QUICK_CHAT),
                        primary: 2048 | 18,
                        weight: 200,
                    }
                ]
            });
        }
        runEditorCommand(accessor, editor) {
            const editorUri = editor.getModel()?.uri;
            if (editorUri) {
                const widgetService = accessor.get(IChatWidgetService);
                widgetService.getWidgetByInputUri(editorUri)?.focusLastMessage();
            }
        }
    });
    registerAction2(class FocusChatInputAction extends Action2 {
        constructor() {
            super({
                id: 'workbench.action.chat.focusInput',
                title: localize2('interactiveSession.focusInput.label', "Focus Chat Input"),
                f1: false,
                keybinding: [
                    {
                        primary: 2048 | 18,
                        weight: 200,
                        when: ContextKeyExpr.and(CONTEXT_IN_CHAT_SESSION, CONTEXT_IN_CHAT_INPUT.negate(), CONTEXT_IN_QUICK_CHAT.negate()),
                    },
                    {
                        when: ContextKeyExpr.and(CONTEXT_IN_CHAT_SESSION, CONTEXT_IN_CHAT_INPUT.negate(), CONTEXT_IN_QUICK_CHAT),
                        primary: 2048 | 16,
                        weight: 200,
                    }
                ]
            });
        }
        run(accessor, ...args) {
            const widgetService = accessor.get(IChatWidgetService);
            widgetService.lastFocusedWidget?.focusInput();
        }
    });
}
export function stringifyItem(item, includeName = true) {
    if (isRequestVM(item)) {
        return (includeName ? `${item.username}: ` : '') + item.messageText;
    }
    else {
        return (includeName ? `${item.username}: ` : '') + item.response.toString();
    }
}
MenuRegistry.appendMenuItem(MenuId.CommandCenter, {
    submenu: MenuId.ChatCommandCenter,
    title: localize('title4', "Chat"),
    icon: Codicon.commentDiscussion,
    when: ContextKeyExpr.and(CONTEXT_CHAT_ENABLED, ContextKeyExpr.has('config.chat.commandCenter.enabled')),
    order: 10001,
});
let ChatCommandCenterRendering = class ChatCommandCenterRendering {
    static { this.ID = 'chat.commandCenterRendering'; }
    constructor(actionViewItemService, agentService, instantiationService) {
        this._store = new DisposableStore();
        const key = `submenuitem.${MenuId.ChatCommandCenter.id}`;
        this._store.add(actionViewItemService.register(MenuId.CommandCenter, key, (action, options) => {
            const agent = agentService.getDefaultAgent(ChatAgentLocation.Panel);
            if (!agent?.metadata.themeIcon) {
                return undefined;
            }
            if (!(action instanceof SubmenuItemAction)) {
                return undefined;
            }
            const dropdownAction = toAction({
                id: agent.id,
                label: localize('more', "More..."),
                run() { }
            });
            const primaryAction = instantiationService.createInstance(MenuItemAction, {
                id: CHAT_OPEN_ACTION_ID,
                title: OpenChatGlobalAction.TITLE,
                icon: agent.metadata.themeIcon,
            }, undefined, undefined, undefined, undefined);
            return instantiationService.createInstance(DropdownWithPrimaryActionViewItem, primaryAction, dropdownAction, action.actions, '', options);
        }, agentService.onDidChangeAgents));
    }
    dispose() {
        this._store.dispose();
    }
};
ChatCommandCenterRendering = __decorate([
    __param(0, IActionViewItemService),
    __param(1, IChatAgentService),
    __param(2, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ChatCommandCenterRendering);
export { ChatCommandCenterRendering };
