import { IQuickPickSeparator } from '../../../../platform/quickinput/common/quickInput.js';
import { IPickerQuickAccessItem, PickerQuickAccessProvider } from '../../../../platform/quickinput/browser/pickerQuickAccess.js';
import { IViewDescriptorService } from '../../../common/views.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
import { IOutputService } from '../../../services/output/common/output.js';
import { ITerminalGroupService, ITerminalService } from '../../terminal/browser/terminal.js';
import { IContextKeyService } from '../../../../platform/contextkey/common/contextkey.js';
import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IPaneCompositePartService } from '../../../services/panecomposite/browser/panecomposite.js';
import { IDebugService } from '../../debug/common/debug.js';
interface IViewQuickPickItem extends IPickerQuickAccessItem {
    containerLabel: string;
}
export declare class ViewQuickAccessProvider extends PickerQuickAccessProvider<IViewQuickPickItem> {
    private readonly viewDescriptorService;
    private readonly viewsService;
    private readonly outputService;
    private readonly terminalService;
    private readonly terminalGroupService;
    private readonly debugService;
    private readonly paneCompositeService;
    private readonly contextKeyService;
    static PREFIX: string;
    constructor(viewDescriptorService: IViewDescriptorService, viewsService: IViewsService, outputService: IOutputService, terminalService: ITerminalService, terminalGroupService: ITerminalGroupService, debugService: IDebugService, paneCompositeService: IPaneCompositePartService, contextKeyService: IContextKeyService);
    protected _getPicks(filter: string): Array<IViewQuickPickItem | IQuickPickSeparator>;
    private doGetViewPickItems;
    private includeViewContainer;
}
export declare class OpenViewPickerAction extends Action2 {
    static readonly ID = "workbench.action.openView";
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class QuickAccessViewPickerAction extends Action2 {
    static readonly ID = "workbench.action.quickOpenView";
    static readonly KEYBINDING: {
        primary: number;
        mac: {
            primary: number;
        };
        linux: {
            primary: number;
        };
    };
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export {};
