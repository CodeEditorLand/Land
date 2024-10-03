import { URI } from '../../../base/common/uri.js';
export interface ICommonMenubarService {
    updateMenubar(windowId: number, menuData: IMenubarData): Promise<void>;
}
export interface IMenubarData {
    menus: {
        [id: string]: IMenubarMenu;
    };
    keybindings: {
        [id: string]: IMenubarKeybinding;
    };
}
export interface IMenubarMenu {
    items: Array<MenubarMenuItem>;
}
export interface IMenubarKeybinding {
    label: string;
    userSettingsLabel?: string;
    isNative?: boolean;
}
export interface IMenubarMenuItemAction {
    id: string;
    label: string;
    checked?: boolean;
    enabled?: boolean;
}
export interface IMenubarMenuRecentItemAction {
    id: string;
    label: string;
    uri: URI;
    remoteAuthority?: string;
    enabled?: boolean;
}
export interface IMenubarMenuItemSubmenu {
    id: string;
    label: string;
    submenu: IMenubarMenu;
}
export interface IMenubarMenuItemSeparator {
    id: 'vscode.menubar.separator';
}
export type MenubarMenuItem = IMenubarMenuItemAction | IMenubarMenuItemSubmenu | IMenubarMenuItemSeparator | IMenubarMenuRecentItemAction;
export declare function isMenubarMenuItemSubmenu(menuItem: MenubarMenuItem): menuItem is IMenubarMenuItemSubmenu;
export declare function isMenubarMenuItemSeparator(menuItem: MenubarMenuItem): menuItem is IMenubarMenuItemSeparator;
export declare function isMenubarMenuItemRecentAction(menuItem: MenubarMenuItem): menuItem is IMenubarMenuRecentItemAction;
export declare function isMenubarMenuItemAction(menuItem: MenubarMenuItem): menuItem is IMenubarMenuItemAction;
