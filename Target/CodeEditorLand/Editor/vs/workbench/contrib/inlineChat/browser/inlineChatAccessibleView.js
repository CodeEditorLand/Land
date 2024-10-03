import { InlineChatController } from './inlineChatController.js';
import { CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_RESPONSE_FOCUSED } from '../common/inlineChat.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { AccessibleContentProvider } from '../../../../platform/accessibility/browser/accessibleView.js';
import { MarkdownString } from '../../../../base/common/htmlContent.js';
import { renderMarkdownAsPlaintext } from '../../../../base/browser/markdownRenderer.js';
export class InlineChatAccessibleView {
    constructor() {
        this.priority = 100;
        this.name = 'inlineChat';
        this.when = ContextKeyExpr.or(CTX_INLINE_CHAT_FOCUSED, CTX_INLINE_CHAT_RESPONSE_FOCUSED);
        this.type = "view";
    }
    getProvider(accessor) {
        const codeEditorService = accessor.get(ICodeEditorService);
        const editor = (codeEditorService.getActiveCodeEditor() || codeEditorService.getFocusedCodeEditor());
        if (!editor) {
            return;
        }
        const controller = InlineChatController.get(editor);
        if (!controller) {
            return;
        }
        const responseContent = controller?.getMessage();
        if (!responseContent) {
            return;
        }
        return new AccessibleContentProvider("inlineChat", { type: "view" }, () => renderMarkdownAsPlaintext(new MarkdownString(responseContent), true), () => controller.focus(), "accessibility.verbosity.inlineChat");
    }
}
