import * as DOM from '../../../../../../base/browser/dom.js';
import { IActionViewItemProvider } from '../../../../../../base/browser/ui/actionbar/actionbar.js';
import { IActionProvider } from '../../../../../../base/browser/ui/dropdown/dropdown.js';
import { IMenuEntryActionViewItemOptions, MenuEntryActionViewItem, SubmenuEntryActionViewItem } from '../../../../../../platform/actions/browser/menuEntryActionViewItem.js';
import { SubmenuItemAction } from '../../../../../../platform/actions/common/actions.js';
import { IContextMenuService } from '../../../../../../platform/contextview/browser/contextView.js';
import { IKeybindingService } from '../../../../../../platform/keybinding/common/keybinding.js';
import { IThemeService } from '../../../../../../platform/theme/common/themeService.js';
import { IHoverService } from '../../../../../../platform/hover/browser/hover.js';
export declare class CodiconActionViewItem extends MenuEntryActionViewItem {
    protected updateLabel(): void;
}
export declare class ActionViewWithLabel extends MenuEntryActionViewItem {
    private _actionLabel?;
    render(container: HTMLElement): void;
    protected updateLabel(): void;
}
export declare class UnifiedSubmenuActionView extends SubmenuEntryActionViewItem {
    readonly renderLabel: boolean;
    readonly subActionProvider: IActionProvider;
    readonly subActionViewItemProvider: IActionViewItemProvider | undefined;
    private readonly _hoverService;
    private _actionLabel?;
    private _hover?;
    private _primaryAction;
    constructor(action: SubmenuItemAction, options: IMenuEntryActionViewItemOptions | undefined, renderLabel: boolean, subActionProvider: IActionProvider, subActionViewItemProvider: IActionViewItemProvider | undefined, _keybindingService: IKeybindingService, _contextMenuService: IContextMenuService, _themeService: IThemeService, _hoverService: IHoverService);
    render(container: HTMLElement): void;
    onClick(event: DOM.EventLike, preserveFocus?: boolean): void;
    protected updateLabel(): void;
}
