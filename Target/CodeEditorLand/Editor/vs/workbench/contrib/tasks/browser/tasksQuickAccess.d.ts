import { IQuickPickSeparator, IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IPickerQuickAccessItem, PickerQuickAccessProvider } from '../../../../platform/quickinput/browser/pickerQuickAccess.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ITaskService } from '../common/taskService.js';
import { CancellationToken } from '../../../../base/common/cancellation.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare class TasksQuickAccessProvider extends PickerQuickAccessProvider<IPickerQuickAccessItem> {
    private _taskService;
    private _configurationService;
    private _quickInputService;
    private _notificationService;
    private _dialogService;
    private _themeService;
    private _storageService;
    static PREFIX: string;
    constructor(extensionService: IExtensionService, _taskService: ITaskService, _configurationService: IConfigurationService, _quickInputService: IQuickInputService, _notificationService: INotificationService, _dialogService: IDialogService, _themeService: IThemeService, _storageService: IStorageService);
    protected _getPicks(filter: string, disposables: DisposableStore, token: CancellationToken): Promise<Array<IPickerQuickAccessItem | IQuickPickSeparator>>;
    private _toTask;
}
