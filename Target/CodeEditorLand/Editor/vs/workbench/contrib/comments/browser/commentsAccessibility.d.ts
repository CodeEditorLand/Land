import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { AccessibilityVerbositySettingId } from '../../accessibility/browser/accessibilityConfiguration.js';
import { IAccessibleViewContentProvider, AccessibleViewProviderId, IAccessibleViewOptions, AccessibleViewType } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplentation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export declare namespace CommentAccessibilityHelpNLS {
    const intro: string;
    const tabFocus: string;
    const commentCommands: string;
    const escape: string;
    const nextRange: string;
    const previousRange: string;
    const nextCommentThread: string;
    const previousCommentThread: string;
    const nextCommentedRange: string;
    const previousCommentedRange: string;
    const addComment: string;
    const submitComment: string;
}
export declare class CommentsAccessibilityHelpProvider extends Disposable implements IAccessibleViewContentProvider {
    id: AccessibleViewProviderId;
    verbositySettingKey: AccessibilityVerbositySettingId;
    options: IAccessibleViewOptions;
    private _element;
    provideContent(): string;
    onClose(): void;
}
export declare class CommentsAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 110;
    readonly name = "comments";
    readonly type = AccessibleViewType.Help;
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
    getProvider(accessor: ServicesAccessor): CommentsAccessibilityHelpProvider;
}
