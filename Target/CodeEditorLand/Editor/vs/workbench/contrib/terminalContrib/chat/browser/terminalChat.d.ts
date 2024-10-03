import { MenuId } from '../../../../../platform/actions/common/actions.js';
import { RawContextKey } from '../../../../../platform/contextkey/common/contextkey.js';
export declare const enum TerminalChatCommandId {
    Start = "workbench.action.terminal.chat.start",
    Close = "workbench.action.terminal.chat.close",
    FocusResponse = "workbench.action.terminal.chat.focusResponse",
    FocusInput = "workbench.action.terminal.chat.focusInput",
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
    const focused: RawContextKey<boolean>;
    const visible: RawContextKey<boolean>;
    const requestActive: RawContextKey<boolean>;
    const inputHasText: RawContextKey<boolean>;
    const responseContainsCodeBlock: RawContextKey<boolean>;
    const responseContainsMultipleCodeBlocks: RawContextKey<boolean>;
    const hasChatAgent: RawContextKey<boolean>;
}
