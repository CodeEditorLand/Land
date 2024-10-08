import { MenuId } from '../../../../../platform/actions/common/actions.js';
import { RawContextKey } from '../../../../../platform/contextkey/common/contextkey.js';
export declare const enum TerminalChatCommandId {
    Start = "workbench.action.terminal.chat.start",
    Close = "workbench.action.terminal.chat.close",
    Discard = "workbench.action.terminal.chat.discard",
    MakeRequest = "workbench.action.terminal.chat.makeRequest",
    Cancel = "workbench.action.terminal.chat.cancel",
    RunCommand = "workbench.action.terminal.chat.runCommand",
    RunFirstCommand = "workbench.action.terminal.chat.runFirstCommand",
    InsertCommand = "workbench.action.terminal.chat.insertCommand",
    InsertFirstCommand = "workbench.action.terminal.chat.insertFirstCommand",
    ViewInChat = "workbench.action.terminal.chat.viewInChat",
    PreviousFromHistory = "workbench.action.terminal.chat.previousFromHistory",
    NextFromHistory = "workbench.action.terminal.chat.nextFromHistory"
}
export declare const MENU_TERMINAL_CHAT_INPUT: MenuId;
export declare const MENU_TERMINAL_CHAT_WIDGET: MenuId;
export declare const MENU_TERMINAL_CHAT_WIDGET_STATUS: MenuId;
export declare const MENU_TERMINAL_CHAT_WIDGET_TOOLBAR: MenuId;
export declare const enum TerminalChatContextKeyStrings {
    ChatFocus = "terminalChatFocus",
    ChatVisible = "terminalChatVisible",
    ChatActiveRequest = "terminalChatActiveRequest",
    ChatInputHasText = "terminalChatInputHasText",
    ChatAgentRegistered = "terminalChatAgentRegistered",
    ChatResponseEditorFocused = "terminalChatResponseEditorFocused",
    ChatResponseContainsCodeBlock = "terminalChatResponseContainsCodeBlock",
    ChatResponseContainsMultipleCodeBlocks = "terminalChatResponseContainsMultipleCodeBlocks",
    ChatResponseSupportsIssueReporting = "terminalChatResponseSupportsIssueReporting",
    ChatSessionResponseVote = "terminalChatSessionResponseVote"
}
export declare namespace TerminalChatContextKeys {
    /** Whether the chat widget is focused */
    const focused: RawContextKey<boolean>;
    /** Whether the chat widget is visible */
    const visible: RawContextKey<boolean>;
    /** Whether there is an active chat request */
    const requestActive: RawContextKey<boolean>;
    /** Whether the chat input has text */
    const inputHasText: RawContextKey<boolean>;
    /** The chat response contains at least one code block */
    const responseContainsCodeBlock: RawContextKey<boolean>;
    /** The chat response contains multiple code blocks */
    const responseContainsMultipleCodeBlocks: RawContextKey<boolean>;
    /** A chat agent exists for the terminal location */
    const hasChatAgent: RawContextKey<boolean>;
}
