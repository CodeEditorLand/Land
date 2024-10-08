/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { localize2 } from '../../../../../nls.js';
import { Action2, MenuId, registerAction2 } from '../../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../../platform/contextkey/common/contextkey.js';
import { ActiveEditorContext } from '../../../../common/contextkeys.js';
import { CHAT_CATEGORY } from './chatActions.js';
import { CHAT_VIEW_ID, IChatWidgetService } from '../chat.js';
import { ChatEditor } from '../chatEditor.js';
import { ChatEditorInput } from '../chatEditorInput.js';
import { CONTEXT_CHAT_ENABLED } from '../../common/chatContextKeys.js';
import { IEditorGroupsService } from '../../../../services/editor/common/editorGroupsService.js';
import { ACTIVE_GROUP, AUX_WINDOW_GROUP, IEditorService } from '../../../../services/editor/common/editorService.js';
import { IViewsService } from '../../../../services/views/common/viewsService.js';
import { isChatViewTitleActionContext } from '../../common/chatActions.js';
var MoveToNewLocation;
(function (MoveToNewLocation) {
    MoveToNewLocation["Editor"] = "Editor";
    MoveToNewLocation["Window"] = "Window";
})(MoveToNewLocation || (MoveToNewLocation = {}));
export function registerMoveActions() {
    registerAction2(class GlobalMoveToEditorAction extends Action2 {
        constructor() {
            super({
                id: `workbench.action.chat.openInEditor`,
                title: localize2('chat.openInEditor.label', "Open Chat in Editor"),
                category: CHAT_CATEGORY,
                precondition: CONTEXT_CHAT_ENABLED,
                f1: true,
                menu: {
                    id: MenuId.ViewTitle,
                    when: ContextKeyExpr.equals('view', CHAT_VIEW_ID),
                    order: 0
                },
            });
        }
        async run(accessor, ...args) {
            const context = args[0];
            executeMoveToAction(accessor, MoveToNewLocation.Editor, isChatViewTitleActionContext(context) ? context.sessionId : undefined);
        }
    });
    registerAction2(class GlobalMoveToNewWindowAction extends Action2 {
        constructor() {
            super({
                id: `workbench.action.chat.openInNewWindow`,
                title: localize2('chat.openInNewWindow.label', "Open Chat in New Window"),
                category: CHAT_CATEGORY,
                precondition: CONTEXT_CHAT_ENABLED,
                f1: true,
                menu: {
                    id: MenuId.ViewTitle,
                    when: ContextKeyExpr.equals('view', CHAT_VIEW_ID),
                    order: 0
                },
            });
        }
        async run(accessor, ...args) {
            const context = args[0];
            executeMoveToAction(accessor, MoveToNewLocation.Window, isChatViewTitleActionContext(context) ? context.sessionId : undefined);
        }
    });
    registerAction2(class GlobalMoveToSidebarAction extends Action2 {
        constructor() {
            super({
                id: `workbench.action.chat.openInSidebar`,
                title: localize2('interactiveSession.openInSidebar.label', "Open Chat in Side Bar"),
                category: CHAT_CATEGORY,
                precondition: CONTEXT_CHAT_ENABLED,
                f1: true,
                menu: [{
                        id: MenuId.EditorTitle,
                        order: 0,
                        when: ActiveEditorContext.isEqualTo(ChatEditorInput.EditorID),
                    }]
            });
        }
        async run(accessor, ...args) {
            return moveToSidebar(accessor);
        }
    });
}
async function executeMoveToAction(accessor, moveTo, _sessionId) {
    const widgetService = accessor.get(IChatWidgetService);
    const editorService = accessor.get(IEditorService);
    const widget = (_sessionId ? widgetService.getWidgetBySessionId(_sessionId) : undefined)
        ?? widgetService.lastFocusedWidget;
    if (!widget || !('viewId' in widget.viewContext)) {
        await editorService.openEditor({ resource: ChatEditorInput.getNewEditorUri(), options: { pinned: true } }, moveTo === MoveToNewLocation.Window ? AUX_WINDOW_GROUP : ACTIVE_GROUP);
        return;
    }
    const viewModel = widget.viewModel;
    if (!viewModel) {
        return;
    }
    const sessionId = viewModel.sessionId;
    const viewState = widget.getViewState();
    widget.clear();
    const options = { target: { sessionId }, pinned: true, viewState: viewState };
    await editorService.openEditor({ resource: ChatEditorInput.getNewEditorUri(), options }, moveTo === MoveToNewLocation.Window ? AUX_WINDOW_GROUP : ACTIVE_GROUP);
}
async function moveToSidebar(accessor) {
    const viewsService = accessor.get(IViewsService);
    const editorService = accessor.get(IEditorService);
    const editorGroupService = accessor.get(IEditorGroupsService);
    const chatEditor = editorService.activeEditorPane;
    const chatEditorInput = chatEditor?.input;
    let view;
    if (chatEditor instanceof ChatEditor && chatEditorInput instanceof ChatEditorInput && chatEditorInput.sessionId) {
        await editorService.closeEditor({ editor: chatEditor.input, groupId: editorGroupService.activeGroup.id });
        view = await viewsService.openView(CHAT_VIEW_ID);
        view.loadSession(chatEditorInput.sessionId, chatEditor.getViewState());
    }
    else {
        view = await viewsService.openView(CHAT_VIEW_ID);
    }
    view.focus();
}
