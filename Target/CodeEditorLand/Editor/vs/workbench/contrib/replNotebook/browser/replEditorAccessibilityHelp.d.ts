import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IAccessibleViewImplentation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { AccessibleViewType, AccessibleContentProvider } from '../../../../platform/accessibility/browser/accessibleView.js';
export declare class ReplEditorAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 105;
    readonly name = "REPL Editor";
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").RawContextKey<boolean>;
    readonly type: AccessibleViewType;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
