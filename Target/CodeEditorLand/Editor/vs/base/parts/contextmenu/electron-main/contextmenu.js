import { Menu, MenuItem } from 'electron';
import { validatedIpcMain } from '../../ipc/electron-main/ipcMain.js';
import { CONTEXT_MENU_CHANNEL, CONTEXT_MENU_CLOSE_CHANNEL } from '../common/contextmenu.js';
export function registerContextMenuListener() {
    validatedIpcMain.on(CONTEXT_MENU_CHANNEL, (event, contextMenuId, items, onClickChannel, options) => {
        const menu = createMenu(event, onClickChannel, items);
        menu.popup({
            x: options ? options.x : undefined,
            y: options ? options.y : undefined,
            positioningItem: options ? options.positioningItem : undefined,
            callback: () => {
                if (menu) {
                    event.sender.send(CONTEXT_MENU_CLOSE_CHANNEL, contextMenuId);
                }
            }
        });
    });
}
function createMenu(event, onClickChannel, items) {
    const menu = new Menu();
    items.forEach(item => {
        let menuitem;
        if (item.type === 'separator') {
            menuitem = new MenuItem({
                type: item.type,
            });
        }
        else if (Array.isArray(item.submenu)) {
            menuitem = new MenuItem({
                submenu: createMenu(event, onClickChannel, item.submenu),
                label: item.label
            });
        }
        else {
            menuitem = new MenuItem({
                label: item.label,
                type: item.type,
                accelerator: item.accelerator,
                checked: item.checked,
                enabled: item.enabled,
                visible: item.visible,
                click: (menuItem, win, contextmenuEvent) => event.sender.send(onClickChannel, item.id, contextmenuEvent)
            });
        }
        menu.append(menuitem);
    });
    return menu;
}
