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
var TasksQuickAccessProvider_1;
import { localize } from '../../../../nls.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { PickerQuickAccessProvider, TriggerAction } from '../../../../platform/quickinput/browser/pickerQuickAccess.js';
import { matchesFuzzy } from '../../../../base/common/filters.js';
import { IExtensionService } from '../../../services/extensions/common/extensions.js';
import { ITaskService } from '../common/taskService.js';
import { CustomTask, ContributedTask, ConfiguringTask } from '../common/tasks.js';
import { TaskQuickPick } from './taskQuickPick.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { isString } from '../../../../base/common/types.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IThemeService } from '../../../../platform/theme/common/themeService.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
let TasksQuickAccessProvider = class TasksQuickAccessProvider extends PickerQuickAccessProvider {
    static { TasksQuickAccessProvider_1 = this; }
    static { this.PREFIX = 'task '; }
    constructor(extensionService, _taskService, _configurationService, _quickInputService, _notificationService, _dialogService, _themeService, _storageService) {
        super(TasksQuickAccessProvider_1.PREFIX, {
            noResultsPick: {
                label: localize('noTaskResults', "No matching tasks")
            }
        });
        this._taskService = _taskService;
        this._configurationService = _configurationService;
        this._quickInputService = _quickInputService;
        this._notificationService = _notificationService;
        this._dialogService = _dialogService;
        this._themeService = _themeService;
        this._storageService = _storageService;
    }
    async _getPicks(filter, disposables, token) {
        if (token.isCancellationRequested) {
            return [];
        }
        const taskQuickPick = new TaskQuickPick(this._taskService, this._configurationService, this._quickInputService, this._notificationService, this._themeService, this._dialogService, this._storageService);
        const topLevelPicks = await taskQuickPick.getTopLevelEntries();
        const taskPicks = [];
        for (const entry of topLevelPicks.entries) {
            const highlights = matchesFuzzy(filter, entry.label);
            if (!highlights) {
                continue;
            }
            if (entry.type === 'separator') {
                taskPicks.push(entry);
            }
            const task = entry.task;
            const quickAccessEntry = entry;
            quickAccessEntry.highlights = { label: highlights };
            quickAccessEntry.trigger = (index) => {
                if ((index === 1) && (quickAccessEntry.buttons?.length === 2)) {
                    const key = (task && !isString(task)) ? task.getKey() : undefined;
                    if (key) {
                        this._taskService.removeRecentlyUsedTask(key);
                    }
                    return TriggerAction.REFRESH_PICKER;
                }
                else {
                    if (ContributedTask.is(task)) {
                        this._taskService.customize(task, undefined, true);
                    }
                    else if (CustomTask.is(task)) {
                        this._taskService.openConfig(task);
                    }
                    return TriggerAction.CLOSE_PICKER;
                }
            };
            quickAccessEntry.accept = async () => {
                if (isString(task)) {
                    const showResult = await taskQuickPick.show(localize('TaskService.pickRunTask', 'Select the task to run'), undefined, task);
                    if (showResult) {
                        this._taskService.run(showResult, { attachProblemMatcher: true });
                    }
                }
                else {
                    this._taskService.run(await this._toTask(task), { attachProblemMatcher: true });
                }
            };
            taskPicks.push(quickAccessEntry);
        }
        return taskPicks;
    }
    async _toTask(task) {
        if (!ConfiguringTask.is(task)) {
            return task;
        }
        return this._taskService.tryResolveTask(task);
    }
};
TasksQuickAccessProvider = TasksQuickAccessProvider_1 = __decorate([
    __param(0, IExtensionService),
    __param(1, ITaskService),
    __param(2, IConfigurationService),
    __param(3, IQuickInputService),
    __param(4, INotificationService),
    __param(5, IDialogService),
    __param(6, IThemeService),
    __param(7, IStorageService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], TasksQuickAccessProvider);
export { TasksQuickAccessProvider };
