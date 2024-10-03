import { ICodeEditor } from '../../../../../editor/browser/editorBrowser.js';
import { ServicesAccessor } from '../../../../../editor/browser/editorExtensions.js';
import { AccessibleViewType, AccessibleContentProvider } from '../../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplentation } from '../../../../../platform/accessibility/browser/accessibleViewRegistry.js';
export declare class ChatAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 107;
    readonly name = "panelChat";
    readonly type = AccessibleViewType.Help;
    readonly when: import("../../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
export declare function getAccessibilityHelpText(type: 'panelChat' | 'inlineChat'): string;
export declare function getChatAccessibilityHelpProvider(accessor: ServicesAccessor, editor: ICodeEditor | undefined, type: 'panelChat' | 'inlineChat'): AccessibleContentProvider | undefined;
