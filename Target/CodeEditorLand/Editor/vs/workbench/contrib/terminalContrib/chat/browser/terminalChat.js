import { localize } from '../../../../../nls.js';
import { MenuId } from '../../../../../platform/actions/common/actions.js';
import { RawContextKey } from '../../../../../platform/contextkey/common/contextkey.js';
export const MENU_TERMINAL_CHAT_INPUT = MenuId.for('terminalChatInput');
export const MENU_TERMINAL_CHAT_WIDGET = MenuId.for('terminalChatWidget');
export const MENU_TERMINAL_CHAT_WIDGET_STATUS = MenuId.for('terminalChatWidget.status');
export const MENU_TERMINAL_CHAT_WIDGET_TOOLBAR = MenuId.for('terminalChatWidget.toolbar');
export var TerminalChatContextKeys;
(function (TerminalChatContextKeys) {
    TerminalChatContextKeys.focused = new RawContextKey("terminalChatFocus", false, localize('chatFocusedContextKey', "Whether the chat view is focused."));
    TerminalChatContextKeys.visible = new RawContextKey("terminalChatVisible", false, localize('chatVisibleContextKey', "Whether the chat view is visible."));
    TerminalChatContextKeys.requestActive = new RawContextKey("terminalChatActiveRequest", false, localize('chatRequestActiveContextKey', "Whether there is an active chat request."));
    TerminalChatContextKeys.inputHasText = new RawContextKey("terminalChatInputHasText", false, localize('chatInputHasTextContextKey', "Whether the chat input has text."));
    TerminalChatContextKeys.responseContainsCodeBlock = new RawContextKey("terminalChatResponseContainsCodeBlock", false, localize('chatResponseContainsCodeBlockContextKey', "Whether the chat response contains a code block."));
    TerminalChatContextKeys.responseContainsMultipleCodeBlocks = new RawContextKey("terminalChatResponseContainsMultipleCodeBlocks", false, localize('chatResponseContainsMultipleCodeBlocksContextKey', "Whether the chat response contains multiple code blocks."));
    TerminalChatContextKeys.hasChatAgent = new RawContextKey("terminalChatAgentRegistered", false, localize('chatAgentRegisteredContextKey', "Whether a chat agent is registered for the terminal location."));
})(TerminalChatContextKeys || (TerminalChatContextKeys = {}));
