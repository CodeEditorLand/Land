import { ServicesAccessor } from '../../../../editor/browser/editorExtensions.js';
import { AccessibleViewType } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplentation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
export declare class InlineChatAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 106;
    readonly name = "inlineChat";
    readonly type = AccessibleViewType.Help;
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
    getProvider(accessor: ServicesAccessor): import("../../../../platform/accessibility/browser/accessibleView.js").AccessibleContentProvider | undefined;
}
