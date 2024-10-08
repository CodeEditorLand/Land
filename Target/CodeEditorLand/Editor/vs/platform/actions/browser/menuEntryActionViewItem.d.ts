import { ActionViewItem, BaseActionViewItem } from '../../../base/browser/ui/actionbar/actionViewItems.js';
import { DropdownMenuActionViewItem, IDropdownMenuActionViewItemOptions } from '../../../base/browser/ui/dropdown/dropdownActionViewItem.js';
import { IAction, SubmenuAction } from '../../../base/common/actions.js';
import { Event } from '../../../base/common/event.js';
import './menuEntryActionViewItem.css';
import { IMenu, IMenuActionOptions, IMenuService, MenuItemAction, SubmenuItemAction } from '../common/actions.js';
import { IContextKeyService } from '../../contextkey/common/contextkey.js';
import { IContextMenuService } from '../../contextview/browser/contextView.js';
import { IInstantiationService } from '../../instantiation/common/instantiation.js';
import { IKeybindingService } from '../../keybinding/common/keybinding.js';
import { INotificationService } from '../../notification/common/notification.js';
import { IStorageService } from '../../storage/common/storage.js';
import { IThemeService } from '../../theme/common/themeService.js';
import { IHoverDelegate } from '../../../base/browser/ui/hover/hoverDelegate.js';
import { IAccessibilityService } from '../../accessibility/common/accessibility.js';
export declare function createAndFillInContextMenuActions(menu: IMenu, options: IMenuActionOptions | undefined, target: IAction[] | {
    primary: IAction[];
    secondary: IAction[];
}, primaryGroup?: string): void;
export declare function createAndFillInContextMenuActions(menu: [string, Array<MenuItemAction | SubmenuItemAction>][], target: IAction[] | {
    primary: IAction[];
    secondary: IAction[];
}, primaryGroup?: string): void;
export declare function createAndFillInActionBarActions(menu: IMenu, options: IMenuActionOptions | undefined, target: IAction[] | {
    primary: IAction[];
    secondary: IAction[];
}, primaryGroup?: string | ((actionGroup: string) => boolean), shouldInlineSubmenu?: (action: SubmenuAction, group: string, groupSize: number) => boolean, useSeparatorsInPrimaryActions?: boolean): void;
export declare function createAndFillInActionBarActions(menu: [string, Array<MenuItemAction | SubmenuItemAction>][], target: IAction[] | {
    primary: IAction[];
    secondary: IAction[];
}, primaryGroup?: string | ((actionGroup: string) => boolean), shouldInlineSubmenu?: (action: SubmenuAction, group: string, groupSize: number) => boolean, useSeparatorsInPrimaryActions?: boolean): void;
export interface IMenuEntryActionViewItemOptions {
    draggable?: boolean;
    keybinding?: string;
    hoverDelegate?: IHoverDelegate;
}
export declare class MenuEntryActionViewItem<T extends IMenuEntryActionViewItemOptions = IMenuEntryActionViewItemOptions> extends ActionViewItem {
    protected _options: T | undefined;
    protected readonly _keybindingService: IKeybindingService;
    protected _notificationService: INotificationService;
    protected _contextKeyService: IContextKeyService;
    protected _themeService: IThemeService;
    protected _contextMenuService: IContextMenuService;
    private readonly _accessibilityService;
    private _wantsAltCommand;
    private readonly _itemClassDispose;
    private readonly _altKey;
    constructor(action: MenuItemAction, _options: T | undefined, _keybindingService: IKeybindingService, _notificationService: INotificationService, _contextKeyService: IContextKeyService, _themeService: IThemeService, _contextMenuService: IContextMenuService, _accessibilityService: IAccessibilityService);
    protected get _menuItemAction(): MenuItemAction;
    protected get _commandAction(): MenuItemAction;
    onClick(event: MouseEvent): Promise<void>;
    render(container: HTMLElement): void;
    protected updateLabel(): void;
    protected getTooltip(): string;
    protected updateClass(): void;
    private _updateItemClass;
}
export interface ITextOnlyMenuEntryActionViewItemOptions extends IMenuEntryActionViewItemOptions {
    conversational?: boolean;
    useComma?: boolean;
}
export declare class TextOnlyMenuEntryActionViewItem extends MenuEntryActionViewItem<ITextOnlyMenuEntryActionViewItemOptions> {
    render(container: HTMLElement): void;
    protected updateLabel(): void;
    private static _symbolPrintEnter;
}
export declare class SubmenuEntryActionViewItem extends DropdownMenuActionViewItem {
    protected _keybindingService: IKeybindingService;
    protected _contextMenuService: IContextMenuService;
    protected _themeService: IThemeService;
    constructor(action: SubmenuItemAction, options: IDropdownMenuActionViewItemOptions | undefined, _keybindingService: IKeybindingService, _contextMenuService: IContextMenuService, _themeService: IThemeService);
    render(container: HTMLElement): void;
}
export interface IDropdownWithDefaultActionViewItemOptions extends IDropdownMenuActionViewItemOptions {
    renderKeybindingWithDefaultActionLabel?: boolean;
    persistLastActionId?: boolean;
}
export declare class DropdownWithDefaultActionViewItem extends BaseActionViewItem {
    protected readonly _keybindingService: IKeybindingService;
    protected _notificationService: INotificationService;
    protected _contextMenuService: IContextMenuService;
    protected _menuService: IMenuService;
    protected _instaService: IInstantiationService;
    protected _storageService: IStorageService;
    private readonly _options;
    private _defaultAction;
    private readonly _dropdown;
    private _container;
    private readonly _storageKey;
    get onDidChangeDropdownVisibility(): Event<boolean>;
    constructor(submenuAction: SubmenuItemAction, options: IDropdownWithDefaultActionViewItemOptions | undefined, _keybindingService: IKeybindingService, _notificationService: INotificationService, _contextMenuService: IContextMenuService, _menuService: IMenuService, _instaService: IInstantiationService, _storageService: IStorageService);
    private update;
    private _getDefaultActionKeybindingLabel;
    setActionContext(newContext: unknown): void;
    render(container: HTMLElement): void;
    focus(fromRight?: boolean): void;
    blur(): void;
    setFocusable(focusable: boolean): void;
    dispose(): void;
}
/**
 * Creates action view items for menu actions or submenu actions.
 */
export declare function createActionViewItem(instaService: IInstantiationService, action: IAction, options: IDropdownMenuActionViewItemOptions | IMenuEntryActionViewItemOptions | undefined): undefined | MenuEntryActionViewItem | SubmenuEntryActionViewItem | BaseActionViewItem;
