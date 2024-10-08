import { AccessibleViewProviderId, AccessibleViewType, IAccessibleViewContentProvider, IAccessibleViewService } from '../../../../platform/accessibility/browser/accessibleView.js';
import { AccessibilityVerbositySettingId } from '../../accessibility/browser/accessibilityConfiguration.js';
import { IReplElement } from '../common/debug.js';
import { IAccessibleViewImplentation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { Repl } from './repl.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export declare class ReplAccessibleView implements IAccessibleViewImplentation {
    priority: number;
    name: string;
    when: import("../../../../platform/contextkey/common/contextkey.js").ContextKeyExpression;
    type: AccessibleViewType;
    getProvider(accessor: ServicesAccessor): ReplOutputAccessibleViewProvider | undefined;
}
declare class ReplOutputAccessibleViewProvider extends Disposable implements IAccessibleViewContentProvider {
    private readonly _replView;
    private readonly _focusedElement;
    private readonly _accessibleViewService;
    readonly id = AccessibleViewProviderId.Repl;
    private _content;
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<void>;
    private readonly _onDidResolveChildren;
    readonly onDidResolveChildren: Event<void>;
    readonly verbositySettingKey = AccessibilityVerbositySettingId.Debug;
    readonly options: {
        type: AccessibleViewType;
    };
    private _elementPositionMap;
    private _treeHadFocus;
    constructor(_replView: Repl, _focusedElement: IReplElement | undefined, _accessibleViewService: IAccessibleViewService);
    provideContent(): string;
    onClose(): void;
    onOpen(): void;
    private _updateContent;
}
export {};
