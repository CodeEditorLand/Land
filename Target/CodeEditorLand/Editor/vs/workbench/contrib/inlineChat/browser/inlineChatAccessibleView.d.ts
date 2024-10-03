import { AccessibleViewType, AccessibleContentProvider } from '../../../../platform/accessibility/browser/accessibleView.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IAccessibleViewImplentation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
export declare class InlineChatAccessibleView implements IAccessibleViewImplentation {
    readonly priority = 100;
    readonly name = "inlineChat";
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
    readonly type = AccessibleViewType.View;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
