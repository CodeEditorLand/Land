var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Separator } from '../../../../base/common/actions.js';
import { IMenuService, SubmenuItemAction, MenuItemAction } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IWorkspacesService } from '../../../../platform/workspaces/common/workspaces.js';
import { isMacintosh } from '../../../../base/common/platform.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { INativeWorkbenchEnvironmentService } from '../../../services/environment/electron-sandbox/environmentService.js';
import { IAccessibilityService } from '../../../../platform/accessibility/common/accessibility.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ILabelService } from '../../../../platform/label/common/label.js';
import { IUpdateService } from '../../../../platform/update/common/update.js';
import { MenubarControl } from '../../../browser/parts/titlebar/menubarControl.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IMenubarService } from '../../../../platform/menubar/electron-sandbox/menubar.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IHostService } from '../../../services/host/browser/host.js';
import { IPreferencesService } from '../../../services/preferences/common/preferences.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { OpenRecentAction } from '../../../browser/actions/windowActions.js';
import { isICommandActionToggleInfo } from '../../../../platform/action/common/action.js';
import { createAndFillInContextMenuActions } from '../../../../platform/actions/browser/menuEntryActionViewItem.js';
let NativeMenubarControl = class NativeMenubarControl extends MenubarControl {
    constructor(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, menubarService, hostService, nativeHostService, commandService) {
        super(menuService, workspacesService, contextKeyService, keybindingService, configurationService, labelService, updateService, storageService, notificationService, preferencesService, environmentService, accessibilityService, hostService, commandService);
        this.menubarService = menubarService;
        this.nativeHostService = nativeHostService;
        (async () => {
            this.recentlyOpened = await this.workspacesService.getRecentlyOpened();
            this.doUpdateMenubar();
        })();
        this.registerListeners();
    }
    setupMainMenu() {
        super.setupMainMenu();
        for (const topLevelMenuName of Object.keys(this.topLevelTitles)) {
            const menu = this.menus[topLevelMenuName];
            if (menu) {
                this.mainMenuDisposables.add(menu.onDidChange(() => this.updateMenubar()));
            }
        }
    }
    doUpdateMenubar() {
        if (!this.hostService.hasFocus) {
            return;
        }
        const menubarData = { menus: {}, keybindings: {} };
        if (this.getMenubarMenus(menubarData)) {
            this.menubarService.updateMenubar(this.nativeHostService.windowId, menubarData);
        }
    }
    getMenubarMenus(menubarData) {
        if (!menubarData) {
            return false;
        }
        menubarData.keybindings = this.getAdditionalKeybindings();
        for (const topLevelMenuName of Object.keys(this.topLevelTitles)) {
            const menu = this.menus[topLevelMenuName];
            if (menu) {
                const menubarMenu = { items: [] };
                const menuActions = [];
                createAndFillInContextMenuActions(menu, { shouldForwardArgs: true }, menuActions);
                this.populateMenuItems(menuActions, menubarMenu, menubarData.keybindings);
                if (menubarMenu.items.length === 0) {
                    return false;
                }
                menubarData.menus[topLevelMenuName] = menubarMenu;
            }
        }
        return true;
    }
    populateMenuItems(menuActions, menuToPopulate, keybindings) {
        for (const menuItem of menuActions) {
            if (menuItem instanceof Separator) {
                menuToPopulate.items.push({ id: 'vscode.menubar.separator' });
            }
            else if (menuItem instanceof MenuItemAction || menuItem instanceof SubmenuItemAction) {
                const title = typeof menuItem.item.title === 'string'
                    ? menuItem.item.title
                    : menuItem.item.title.mnemonicTitle ?? menuItem.item.title.value;
                if (menuItem instanceof SubmenuItemAction) {
                    const submenu = { items: [] };
                    this.populateMenuItems(menuItem.actions, submenu, keybindings);
                    if (submenu.items.length > 0) {
                        const menubarSubmenuItem = {
                            id: menuItem.id,
                            label: title,
                            submenu
                        };
                        menuToPopulate.items.push(menubarSubmenuItem);
                    }
                }
                else {
                    if (menuItem.id === OpenRecentAction.ID) {
                        const actions = this.getOpenRecentActions().map(this.transformOpenRecentAction);
                        menuToPopulate.items.push(...actions);
                    }
                    const menubarMenuItem = {
                        id: menuItem.id,
                        label: title
                    };
                    if (isICommandActionToggleInfo(menuItem.item.toggled)) {
                        menubarMenuItem.label = menuItem.item.toggled.mnemonicTitle ?? menuItem.item.toggled.title ?? title;
                    }
                    if (menuItem.checked) {
                        menubarMenuItem.checked = true;
                    }
                    if (!menuItem.enabled) {
                        menubarMenuItem.enabled = false;
                    }
                    keybindings[menuItem.id] = this.getMenubarKeybinding(menuItem.id);
                    menuToPopulate.items.push(menubarMenuItem);
                }
            }
        }
    }
    transformOpenRecentAction(action) {
        if (action instanceof Separator) {
            return { id: 'vscode.menubar.separator' };
        }
        return {
            id: action.id,
            uri: action.uri,
            remoteAuthority: action.remoteAuthority,
            enabled: action.enabled,
            label: action.label
        };
    }
    getAdditionalKeybindings() {
        const keybindings = {};
        if (isMacintosh) {
            const keybinding = this.getMenubarKeybinding('workbench.action.quit');
            if (keybinding) {
                keybindings['workbench.action.quit'] = keybinding;
            }
        }
        return keybindings;
    }
    getMenubarKeybinding(id) {
        const binding = this.keybindingService.lookupKeybinding(id);
        if (!binding) {
            return undefined;
        }
        const electronAccelerator = binding.getElectronAccelerator();
        if (electronAccelerator) {
            return { label: electronAccelerator, userSettingsLabel: binding.getUserSettingsLabel() ?? undefined };
        }
        const acceleratorLabel = binding.getLabel();
        if (acceleratorLabel) {
            return { label: acceleratorLabel, isNative: false, userSettingsLabel: binding.getUserSettingsLabel() ?? undefined };
        }
        return undefined;
    }
};
NativeMenubarControl = __decorate([
    __param(0, IMenuService),
    __param(1, IWorkspacesService),
    __param(2, IContextKeyService),
    __param(3, IKeybindingService),
    __param(4, IConfigurationService),
    __param(5, ILabelService),
    __param(6, IUpdateService),
    __param(7, IStorageService),
    __param(8, INotificationService),
    __param(9, IPreferencesService),
    __param(10, INativeWorkbenchEnvironmentService),
    __param(11, IAccessibilityService),
    __param(12, IMenubarService),
    __param(13, IHostService),
    __param(14, INativeHostService),
    __param(15, ICommandService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], NativeMenubarControl);
export { NativeMenubarControl };
