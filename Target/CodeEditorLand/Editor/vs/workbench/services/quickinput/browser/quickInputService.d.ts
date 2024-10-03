import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { QuickInputController } from '../../../../platform/quickinput/browser/quickInputController.js';
import { QuickInputService as BaseQuickInputService } from '../../../../platform/quickinput/browser/quickInputService.js';
export declare class QuickInputService extends BaseQuickInputService {
    private readonly keybindingService;
    private readonly inQuickInputContext;
    constructor(configurationService: IConfigurationService, instantiationService: IInstantiationService, keybindingService: IKeybindingService, contextKeyService: IContextKeyService, themeService: IThemeService, layoutService: ILayoutService);
    private registerListeners;
    protected createController(): QuickInputController;
}
