/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export function isMenubarMenuItemSubmenu(menuItem) {
    return menuItem.submenu !== undefined;
}
export function isMenubarMenuItemSeparator(menuItem) {
    return menuItem.id === 'vscode.menubar.separator';
}
export function isMenubarMenuItemRecentAction(menuItem) {
    return menuItem.uri !== undefined;
}
export function isMenubarMenuItemAction(menuItem) {
    return !isMenubarMenuItemSubmenu(menuItem) && !isMenubarMenuItemSeparator(menuItem) && !isMenubarMenuItemRecentAction(menuItem);
}
