import { ServicesAccessor } from '../../../../editor/browser/editorExtensions.js';
import { AccessibleViewProviderId, AccessibleViewType, IAccessibleViewContentProvider } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplentation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { AccessibilityVerbositySettingId } from '../../accessibility/browser/accessibilityConfiguration.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
export declare class RunAndDebugAccessibilityHelp implements IAccessibleViewImplentation {
    priority: number;
    name: string;
    when: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression | undefined;
    type: AccessibleViewType;
    getProvider(accessor: ServicesAccessor): RunAndDebugAccessibilityHelpProvider;
}
declare class RunAndDebugAccessibilityHelpProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _commandService;
    private readonly _viewsService;
    readonly id = AccessibleViewProviderId.RunAndDebug;
    readonly verbositySettingKey = AccessibilityVerbositySettingId.Debug;
    readonly options: {
        type: AccessibleViewType;
    };
    private _focusedView;
    constructor(_commandService: ICommandService, _viewsService: IViewsService);
    onClose(): void;
    provideContent(): string;
}
export {};
