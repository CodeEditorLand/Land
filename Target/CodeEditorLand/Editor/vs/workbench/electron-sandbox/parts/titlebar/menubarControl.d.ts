import { IMenuService } from '../../../../platform/actions/common/actions.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IWorkspacesService } from '../../../../platform/workspaces/common/workspaces.js';
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
export declare class NativeMenubarControl extends MenubarControl {
    private readonly menubarService;
    private readonly nativeHostService;
    constructor(menuService: IMenuService, workspacesService: IWorkspacesService, contextKeyService: IContextKeyService, keybindingService: IKeybindingService, configurationService: IConfigurationService, labelService: ILabelService, updateService: IUpdateService, storageService: IStorageService, notificationService: INotificationService, preferencesService: IPreferencesService, environmentService: INativeWorkbenchEnvironmentService, accessibilityService: IAccessibilityService, menubarService: IMenubarService, hostService: IHostService, nativeHostService: INativeHostService, commandService: ICommandService);
    protected setupMainMenu(): void;
    protected doUpdateMenubar(): void;
    private getMenubarMenus;
    private populateMenuItems;
    private transformOpenRecentAction;
    private getAdditionalKeybindings;
    private getMenubarKeybinding;
}
