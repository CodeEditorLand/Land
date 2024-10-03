import { Task, ConfiguringTask } from '../common/tasks.js';
import { IWorkspace, IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { ITaskService } from '../common/taskService.js';
import { IQuickPickItem, QuickPickInput, IQuickPick, IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Disposable, DisposableStore, IDisposable } from '../../../../base/common/lifecycle.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { ThemeIcon } from '../../../../base/common/themables.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { TaskQuickPickEntryType } from './abstractTaskService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
export declare const QUICKOPEN_DETAIL_CONFIG = "task.quickOpen.detail";
export declare const QUICKOPEN_SKIP_CONFIG = "task.quickOpen.skip";
export declare function isWorkspaceFolder(folder: IWorkspace | IWorkspaceFolder): folder is IWorkspaceFolder;
export interface ITaskQuickPickEntry extends IQuickPickItem {
    task: Task | undefined | null;
}
export interface ITaskTwoLevelQuickPickEntry extends IQuickPickItem {
    task: Task | ConfiguringTask | string | undefined | null;
    settingType?: string;
}
export declare const configureTaskIcon: ThemeIcon;
export declare class TaskQuickPick extends Disposable {
    private _taskService;
    private _configurationService;
    private _quickInputService;
    private _notificationService;
    private _themeService;
    private _dialogService;
    private _storageService;
    private _sorter;
    private _topLevelEntries;
    constructor(_taskService: ITaskService, _configurationService: IConfigurationService, _quickInputService: IQuickInputService, _notificationService: INotificationService, _themeService: IThemeService, _dialogService: IDialogService, _storageService: IStorageService);
    private _showDetail;
    private _guessTaskLabel;
    static getTaskLabelWithIcon(task: Task | ConfiguringTask, labelGuess?: string): string;
    static applyColorStyles(task: Task | ConfiguringTask, entry: TaskQuickPickEntryType | ITaskTwoLevelQuickPickEntry, themeService: IThemeService): IDisposable | undefined;
    private _createTaskEntry;
    private _createEntriesForGroup;
    private _createTypeEntries;
    private _handleFolderTaskResult;
    private _dedupeConfiguredAndRecent;
    getTopLevelEntries(defaultEntry?: ITaskQuickPickEntry): Promise<{
        entries: QuickPickInput<ITaskTwoLevelQuickPickEntry>[];
        isSingleConfigured?: Task | ConfiguringTask;
    }>;
    handleSettingOption(selectedType: string): Promise<Task | null | undefined>;
    show(placeHolder: string, defaultEntry?: ITaskQuickPickEntry, startAtType?: string, name?: string): Promise<Task | undefined | null>;
    private _doPickerFirstLevel;
    doPickerSecondLevel(picker: IQuickPick<ITaskTwoLevelQuickPickEntry, {
        useSeparators: true;
    }>, disposables: DisposableStore, type: string, name?: string): Promise<ITaskTwoLevelQuickPickEntry | null | undefined>;
    static allSettingEntries(configurationService: IConfigurationService): (ITaskTwoLevelQuickPickEntry & {
        settingType: string;
    })[];
    static getSettingEntry(configurationService: IConfigurationService, type: string): (ITaskTwoLevelQuickPickEntry & {
        settingType: string;
    }) | undefined;
    private _getEntriesForProvider;
    private _toTask;
}
