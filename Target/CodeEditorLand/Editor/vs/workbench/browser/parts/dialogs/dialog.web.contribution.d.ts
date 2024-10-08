import { IClipboardService } from '../../../../platform/clipboard/common/clipboardService.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IKeybindingService } from '../../../../platform/keybinding/common/keybinding.js';
import { ILayoutService } from '../../../../platform/layout/browser/layoutService.js';
import { ILogService } from '../../../../platform/log/common/log.js';
import { IProductService } from '../../../../platform/product/common/productService.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
export declare class DialogHandlerContribution extends Disposable implements IWorkbenchContribution {
    private dialogService;
    static readonly ID = "workbench.contrib.dialogHandler";
    private readonly model;
    private readonly impl;
    private currentDialog;
    constructor(dialogService: IDialogService, logService: ILogService, layoutService: ILayoutService, keybindingService: IKeybindingService, instantiationService: IInstantiationService, productService: IProductService, clipboardService: IClipboardService);
    private processDialogs;
}
