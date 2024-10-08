/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { getChatAccessibilityHelpProvider } from '../../chat/browser/actions/chatAccessibilityHelp.js';
import { CONTEXT_CHAT_INPUT_HAS_FOCUS } from '../../chat/common/chatContextKeys.js';
import { CTX_INLINE_CHAT_RESPONSE_FOCUSED } from '../common/inlineChat.js';
export class InlineChatAccessibilityHelp {
    constructor() {
        this.priority = 106;
        this.name = 'inlineChat';
        this.type = "help" /* AccessibleViewType.Help */;
        this.when = ContextKeyExpr.or(CTX_INLINE_CHAT_RESPONSE_FOCUSED, CONTEXT_CHAT_INPUT_HAS_FOCUS);
    }
    getProvider(accessor) {
        const codeEditor = accessor.get(ICodeEditorService).getActiveCodeEditor() || accessor.get(ICodeEditorService).getFocusedCodeEditor();
        if (!codeEditor) {
            return;
        }
        return getChatAccessibilityHelpProvider(accessor, codeEditor, 'inlineChat');
    }
}
