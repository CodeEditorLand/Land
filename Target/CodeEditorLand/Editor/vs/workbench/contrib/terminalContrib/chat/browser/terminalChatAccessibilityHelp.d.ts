import { AccessibleViewType, AccessibleContentProvider } from '../../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplentation } from '../../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { ServicesAccessor } from '../../../../../platform/instantiation/common/instantiation.js';
export declare class TerminalChatAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 110;
    readonly name = "terminalChat";
    readonly when: import("../../../../../platform/contextkey/common/contextkey.js").RawContextKey<boolean>;
    readonly type = AccessibleViewType.Help;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
export declare function getAccessibilityHelpText(accessor: ServicesAccessor): string;
