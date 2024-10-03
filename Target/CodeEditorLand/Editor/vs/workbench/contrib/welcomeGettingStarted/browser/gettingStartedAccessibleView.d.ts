import { AccessibleViewType, AccessibleContentProvider, ExtensionContentProvider } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplentation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare class GettingStartedAccessibleView implements IAccessibleViewImplentation {
    readonly type = AccessibleViewType.View;
    readonly priority = 110;
    readonly name = "walkthroughs";
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").RawContextKey<boolean>;
    getProvider: (accessor: ServicesAccessor) => AccessibleContentProvider | ExtensionContentProvider | undefined;
}
