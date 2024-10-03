import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IQuickInputService, IKeyMods, IQuickPickItem } from '../../../../platform/quickinput/common/quickInput.js';
import { IExtensionTerminalProfile, ITerminalProfile } from '../../../../platform/terminal/common/terminal.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ITerminalProfileResolverService, ITerminalProfileService } from '../common/terminal.js';
import { IQuickPickTerminalObject, ITerminalInstance } from './terminal.js';
import { IPickerQuickAccessItem } from '../../../../platform/quickinput/browser/pickerQuickAccess.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
type DefaultProfileName = string;
export declare class TerminalProfileQuickpick {
    private readonly _terminalProfileService;
    private readonly _terminalProfileResolverService;
    private readonly _configurationService;
    private readonly _quickInputService;
    private readonly _themeService;
    private readonly _notificationService;
    constructor(_terminalProfileService: ITerminalProfileService, _terminalProfileResolverService: ITerminalProfileResolverService, _configurationService: IConfigurationService, _quickInputService: IQuickInputService, _themeService: IThemeService, _notificationService: INotificationService);
    showAndGetResult(type: 'setDefault' | 'createInstance'): Promise<IQuickPickTerminalObject | DefaultProfileName | undefined>;
    private _createAndShow;
    private _createNewProfileConfig;
    private _isProfileSafe;
    private _createProfileQuickPickItem;
    private _sortProfileQuickPickItems;
}
export interface IProfileQuickPickItem extends IQuickPickItem {
    profile: ITerminalProfile | IExtensionTerminalProfile;
    profileName: string;
    keyMods?: IKeyMods | undefined;
}
export interface ITerminalQuickPickItem extends IPickerQuickAccessItem {
    terminal: ITerminalInstance;
}
export {};
