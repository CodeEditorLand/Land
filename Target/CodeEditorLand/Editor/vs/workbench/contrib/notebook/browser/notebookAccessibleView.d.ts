import { AccessibleViewType, AccessibleContentProvider } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplentation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
export declare class NotebookAccessibleView implements IAccessibleViewImplentation {
    readonly priority = 100;
    readonly name = "notebook";
    readonly type = AccessibleViewType.View;
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
export declare function getAccessibleOutputProvider(editorService: IEditorService): AccessibleContentProvider | undefined;
