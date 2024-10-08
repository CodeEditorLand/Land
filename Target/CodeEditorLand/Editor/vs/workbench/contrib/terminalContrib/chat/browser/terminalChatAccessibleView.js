/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { AccessibleContentProvider } from '../../../../../platform/accessibility/browser/accessibleView.js';
import { ITerminalService } from '../../../terminal/browser/terminal.js';
import { TerminalChatController } from './terminalChatController.js';
import { IMenuService, MenuItemAction } from '../../../../../platform/actions/common/actions.js';
import { MENU_TERMINAL_CHAT_WIDGET_STATUS, TerminalChatContextKeys } from './terminalChat.js';
export class TerminalInlineChatAccessibleView {
    constructor() {
        this.priority = 105;
        this.name = 'terminalInlineChat';
        this.type = "view" /* AccessibleViewType.View */;
        this.when = TerminalChatContextKeys.focused;
    }
    getProvider(accessor) {
        const terminalService = accessor.get(ITerminalService);
        const menuService = accessor.get(IMenuService);
        const actions = [];
        const contextKeyService = TerminalChatController.activeChatController?.scopedContextKeyService;
        if (contextKeyService) {
            const menuActions = menuService.getMenuActions(MENU_TERMINAL_CHAT_WIDGET_STATUS, contextKeyService);
            for (const action of menuActions) {
                for (const a of action[1]) {
                    if (a instanceof MenuItemAction) {
                        actions.push(a);
                    }
                }
            }
        }
        const controller = terminalService.activeInstance?.getContribution(TerminalChatController.ID) ?? undefined;
        if (!controller?.lastResponseContent) {
            return;
        }
        const responseContent = controller.lastResponseContent;
        return new AccessibleContentProvider("terminal-chat" /* AccessibleViewProviderId.TerminalChat */, { type: "view" /* AccessibleViewType.View */ }, () => { return responseContent; }, () => {
            controller.focus();
        }, "accessibility.verbosity.inlineChat" /* AccessibilityVerbositySettingId.InlineChat */, undefined, actions);
    }
}
