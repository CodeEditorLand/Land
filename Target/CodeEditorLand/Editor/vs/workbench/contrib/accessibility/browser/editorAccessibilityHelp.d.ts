import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
export declare class EditorAccessibilityHelpContribution extends Disposable {
    static ID: 'editorAccessibilityHelpContribution';
    constructor();
}
export declare function getCommentCommandInfo(keybindingService: IKeybindingService, contextKeyService: IContextKeyService, editor: ICodeEditor): string | undefined;
export declare function getChatCommandInfo(keybindingService: IKeybindingService, contextKeyService: IContextKeyService): string | undefined;
