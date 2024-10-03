import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { INativeHostService } from '../../../../platform/native/common/native.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
export declare class DialogHandlerContribution extends Disposable implements IWorkbenchContribution {
    private configurationService;
    private dialogService;
    static readonly ID = "workbench.contrib.dialogHandler";
    private nativeImpl;
    private browserImpl;
    private model;
    private currentDialog;
    constructor(configurationService: IConfigurationService, dialogService: IDialogService, logService: ILogService, layoutService: ILayoutService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, productService: IProductService, clipboardService: IClipboardService, nativeHostService: INativeHostService);
    private processDialogs;
    private get useCustomDialog();
}
