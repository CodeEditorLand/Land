import { ContentHoverController } from './contentHoverController.js';
import { AccessibleViewType, AccessibleViewProviderId, AccessibleContentProvider, IAccessibleViewContentProvider, IAccessibleViewOptions } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IAccessibleViewImplentation } from '../../../../platform/accessibility/browser/accessibleViewRegistry.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { IAction } from '../../../../base/common/actions.js';
import { Event } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
export declare class HoverAccessibleView implements IAccessibleViewImplentation {
    readonly type = AccessibleViewType.View;
    readonly priority = 95;
    readonly name = "hover";
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").RawContextKey<boolean>;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
export declare class HoverAccessibilityHelp implements IAccessibleViewImplentation {
    readonly priority = 100;
    readonly name = "hover";
    readonly type = AccessibleViewType.Help;
    readonly when: import("../../../../platform/contextkey/common/contextkey.js").RawContextKey<boolean>;
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
declare abstract class BaseHoverAccessibleViewProvider extends Disposable implements IAccessibleViewContentProvider {
    protected readonly _hoverController: ContentHoverController;
    abstract provideContent(): string;
    abstract options: IAccessibleViewOptions;
    readonly id = AccessibleViewProviderId.Hover;
    readonly verbositySettingKey = "accessibility.verbosity.hover";
    private readonly _onDidChangeContent;
    readonly onDidChangeContent: Event<void>;
    protected _focusedHoverPartIndex: number;
    constructor(_hoverController: ContentHoverController);
    onOpen(): void;
    onClose(): void;
    provideContentAtIndex(focusedHoverIndex: number, includeVerbosityActions: boolean): string;
    private _descriptionsOfVerbosityActionsForIndex;
    private _descriptionOfVerbosityActionForIndex;
}
export declare class HoverAccessibilityHelpProvider extends BaseHoverAccessibleViewProvider implements IAccessibleViewContentProvider {
    readonly options: IAccessibleViewOptions;
    constructor(hoverController: ContentHoverController);
    provideContent(): string;
}
export declare class HoverAccessibleViewProvider extends BaseHoverAccessibleViewProvider implements IAccessibleViewContentProvider {
    private readonly _keybindingService;
    private readonly _editor;
    readonly options: IAccessibleViewOptions;
    constructor(_keybindingService: IKeybindingService, _editor: ICodeEditor, hoverController: ContentHoverController);
    provideContent(): string;
    get actions(): IAction[];
    private _getActionFor;
    private _initializeOptions;
}
export declare class ExtHoverAccessibleView implements IAccessibleViewImplentation {
    readonly type = AccessibleViewType.View;
    readonly priority = 90;
    readonly name = "extension-hover";
    getProvider(accessor: ServicesAccessor): AccessibleContentProvider | undefined;
}
export {};
