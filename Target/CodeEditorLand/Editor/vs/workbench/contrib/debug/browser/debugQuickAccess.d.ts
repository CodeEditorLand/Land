import { IQuickPickSeparator } from '../../../../platform/quickinput/common/quickInput.js';
import { PickerQuickAccessProvider, IPickerQuickAccessItem } from '../../../../platform/quickinput/browser/pickerQuickAccess.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IDebugService } from '../common/debug.js';
import { IWorkspaceContextService } from '../../../../platform/workspace/common/workspace.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
export declare class StartDebugQuickAccessProvider extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private readonly debugService;
    private readonly contextService;
    private readonly commandService;
    private readonly notificationService;
    constructor(debugService: IDebugService, contextService: IWorkspaceContextService, commandService: ICommandService, notificationService: INotificationService);
    protected _getPicks(filter: string): Promise<(IQuickPickSeparator | IPickerQuickAccessItem)[]>;
}
