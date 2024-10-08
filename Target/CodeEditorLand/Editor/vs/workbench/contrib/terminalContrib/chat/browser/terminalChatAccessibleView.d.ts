import { AccessibleViewType, AccessibleContentProvider } from '../../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplentation } from '../../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
export declare class TerminalInlineChatAccessibleView implements IAccessibleViewImplentation {
    readonly priority = 105;
    readonly name = "terminalInlineChat";
    readonly type = AccessibleViewType.View;
    readonly when: import("../../../../../platform/contextkey/common/contextkey.js").RawContextKey<boolean>;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
