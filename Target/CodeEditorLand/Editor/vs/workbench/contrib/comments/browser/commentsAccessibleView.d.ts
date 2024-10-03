import { Disposable } from '../../../../base/common/lifecycle.js';
import { ServicesAccessor } from '../../../../editor/browser/editorExtensions.js';
import { AccessibleViewProviderId, AccessibleViewType, IAccessibleViewContentProvider } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplentation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { AccessibilityVerbositySettingId } from '../../accessibility/browser/accessibilityConfiguration.js';
import { CommentsMenus } from './commentsTreeViewer.js';
import { CommentsPanel } from './commentsView.js';
import { ICommentService } from './commentService.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { IUriIdentityService } from '../../../../platform/uriIdentity/common/uriIdentity.js';
export declare class CommentsAccessibleView extends Disposable implements IAccessibleViewImplentation {
    readonly priority = 90;
    readonly name = "comment";
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").RawContextKey<boolean>;
    readonly type = AccessibleViewType.View;
    getProvider(accessor: ServicesAccessor): CommentsAccessibleContentProvider | undefined;
    constructor();
}
export declare class CommentThreadAccessibleView extends Disposable implements IAccessibleViewImplentation {
    readonly priority = 85;
    readonly name = "commentThread";
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").RawContextKey<boolean>;
    readonly type = AccessibleViewType.View;
    getProvider(accessor: ServicesAccessor): CommentsThreadWidgetAccessibleContentProvider | undefined;
    constructor();
}
declare class CommentsAccessibleContentProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _commentsView;
    private readonly _focusedCommentNode;
    private readonly _menus;
    constructor(_commentsView: CommentsPanel, _focusedCommentNode: any, _menus: CommentsMenus);
    readonly id = AccessibleViewProviderId.Comments;
    readonly verbositySettingKey = AccessibilityVerbositySettingId.Comments;
    readonly options: {
        type: AccessibleViewType;
    };
    actions: {
        run: () => void;
        id: string;
        label: string;
        tooltip: string;
        class: string | undefined;
        enabled: boolean;
        checked?: boolean;
    }[];
    provideContent(): string;
    onClose(): void;
    provideNextContent(): string | undefined;
    providePreviousContent(): string | undefined;
}
declare class CommentsThreadWidgetAccessibleContentProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _commentService;
    private readonly _editorService;
    private readonly _uriIdentityService;
    readonly id = AccessibleViewProviderId.CommentThread;
    readonly verbositySettingKey = AccessibilityVerbositySettingId.Comments;
    readonly options: {
        type: AccessibleViewType;
    };
    private _activeCommentInfo;
    constructor(_commentService: ICommentService, _editorService: IEditorService, _uriIdentityService: IUriIdentityService);
    private get activeCommentInfo();
    provideContent(): string;
    onClose(): void;
    provideNextContent(): string | undefined;
    providePreviousContent(): string | undefined;
}
export {};
