import { AccessibleContentProvider } from '../../../../../platform/accessibility/browser/accessibleView.js';
import { ITerminalService } from '../../../terminal/browser/terminal.js';
import { TerminalChatController } from './terminalChatController.js';
import { TerminalChatContextKeys } from './terminalChat.js';
export class TerminalInlineChatAccessibleView {
    constructor() {
        this.priority = 105;
        this.name = 'terminalInlineChat';
        this.type = "view";
        this.when = TerminalChatContextKeys.focused;
    }
    getProvider(accessor) {
        const terminalService = accessor.get(ITerminalService);
        const controller = terminalService.activeInstance?.getContribution(TerminalChatController.ID) ?? undefined;
        if (!controller?.lastResponseContent) {
            return;
        }
        const responseContent = controller.lastResponseContent;
        return new AccessibleContentProvider("terminal-chat", { type: "view" }, () => { return responseContent; }, () => {
            controller.focus();
        }, "accessibility.verbosity.inlineChat");
    }
}
