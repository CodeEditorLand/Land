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
import * as nls from '../../../../nls.js';
import * as resources from '../../../../base/common/resources.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { ITaskService } from '../common/taskService.js';
import { RunOnOptions, TaskSourceKind, TASKS_CATEGORY } from '../common/tasks.js';
import { IQuickInputService } from '../../../../platform/quickinput/common/quickInput.js';
import { Action2 } from '../../../../platform/actions/common/actions.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { Event } from '../../../../base/common/event.js';
import { ILogService } from '../../../../platform/log/common/log.js';
const ALLOW_AUTOMATIC_TASKS = 'task.allowAutomaticTasks';
let RunAutomaticTasks = class RunAutomaticTasks extends Disposable {
    constructor(_taskService, _configurationService, _workspaceTrustManagementService, _logService) {
        super();
        this._taskService = _taskService;
        this._configurationService = _configurationService;
        this._workspaceTrustManagementService = _workspaceTrustManagementService;
        this._logService = _logService;
        this._hasRunTasks = false;
        if (this._taskService.isReconnected) {
            this._tryRunTasks();
        }
        else {
            this._register(Event.once(this._taskService.onDidReconnectToTasks)(async () => await this._tryRunTasks()));
        }
        this._register(this._workspaceTrustManagementService.onDidChangeTrust(async () => await this._tryRunTasks()));
    }
    async _tryRunTasks() {
        if (!this._workspaceTrustManagementService.isWorkspaceTrusted()) {
            return;
        }
        if (this._hasRunTasks || this._configurationService.getValue(ALLOW_AUTOMATIC_TASKS) === 'off') {
            return;
        }
        this._hasRunTasks = true;
        this._logService.trace('RunAutomaticTasks: Trying to run tasks.');
        if (!this._taskService.hasTaskSystemInfo) {
            this._logService.trace('RunAutomaticTasks: Awaiting task system info.');
            await Event.toPromise(Event.once(this._taskService.onDidChangeTaskSystemInfo));
        }
        let workspaceTasks = await this._taskService.getWorkspaceTasks(2);
        this._logService.trace(`RunAutomaticTasks: Found ${workspaceTasks.size} automatic tasks`);
        let autoTasks = this._findAutoTasks(this._taskService, workspaceTasks);
        this._logService.trace(`RunAutomaticTasks: taskNames=${JSON.stringify(autoTasks.taskNames)}`);
        if (autoTasks.taskNames.length === 0) {
            const updatedWithinTimeout = await Promise.race([
                new Promise((resolve) => {
                    Event.toPromise(Event.once(this._taskService.onDidChangeTaskConfig)).then(() => resolve(true));
                }),
                new Promise((resolve) => {
                    const timer = setTimeout(() => { clearTimeout(timer); resolve(false); }, 10000);
                })
            ]);
            if (!updatedWithinTimeout) {
                this._logService.trace(`RunAutomaticTasks: waited some extra time, but no update of tasks configuration`);
                return;
            }
            workspaceTasks = await this._taskService.getWorkspaceTasks(2);
            autoTasks = this._findAutoTasks(this._taskService, workspaceTasks);
            this._logService.trace(`RunAutomaticTasks: updated taskNames=${JSON.stringify(autoTasks.taskNames)}`);
        }
        this._runWithPermission(this._taskService, this._configurationService, autoTasks.tasks, autoTasks.taskNames);
    }
    _runTasks(taskService, tasks) {
        tasks.forEach(task => {
            if (task instanceof Promise) {
                task.then(promiseResult => {
                    if (promiseResult) {
                        taskService.run(promiseResult);
                    }
                });
            }
            else {
                taskService.run(task);
            }
        });
    }
    _getTaskSource(source) {
        const taskKind = TaskSourceKind.toConfigurationTarget(source.kind);
        switch (taskKind) {
            case 6: {
                return resources.joinPath(source.config.workspaceFolder.uri, source.config.file);
            }
            case 5: {
                return source.config.workspace?.configuration ?? undefined;
            }
        }
        return undefined;
    }
    _findAutoTasks(taskService, workspaceTaskResult) {
        const tasks = new Array();
        const taskNames = new Array();
        const locations = new Map();
        if (workspaceTaskResult) {
            workspaceTaskResult.forEach(resultElement => {
                if (resultElement.set) {
                    resultElement.set.tasks.forEach(task => {
                        if (task.runOptions.runOn === RunOnOptions.folderOpen) {
                            tasks.push(task);
                            taskNames.push(task._label);
                            const location = this._getTaskSource(task._source);
                            if (location) {
                                locations.set(location.fsPath, location);
                            }
                        }
                    });
                }
                if (resultElement.configurations) {
                    for (const configuredTask of Object.values(resultElement.configurations.byIdentifier)) {
                        if (configuredTask.runOptions.runOn === RunOnOptions.folderOpen) {
                            tasks.push(new Promise(resolve => {
                                taskService.getTask(resultElement.workspaceFolder, configuredTask._id, true).then(task => resolve(task));
                            }));
                            if (configuredTask._label) {
                                taskNames.push(configuredTask._label);
                            }
                            else {
                                taskNames.push(configuredTask.configures.task);
                            }
                            const location = this._getTaskSource(configuredTask._source);
                            if (location) {
                                locations.set(location.fsPath, location);
                            }
                        }
                    }
                }
            });
        }
        return { tasks, taskNames, locations };
    }
    async _runWithPermission(taskService, configurationService, tasks, taskNames) {
        if (taskNames.length === 0) {
            return;
        }
        if (configurationService.getValue(ALLOW_AUTOMATIC_TASKS) === 'off') {
            return;
        }
        this._runTasks(taskService, tasks);
    }
};
RunAutomaticTasks = __decorate([
    __param(0, ITaskService),
    __param(1, IConfigurationService),
    __param(2, IWorkspaceTrustManagementService),
    __param(3, ILogService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], RunAutomaticTasks);
export { RunAutomaticTasks };
export class ManageAutomaticTaskRunning extends Action2 {
    static { this.ID = 'workbench.action.tasks.manageAutomaticRunning'; }
    static { this.LABEL = nls.localize('workbench.action.tasks.manageAutomaticRunning', "Manage Automatic Tasks"); }
    constructor() {
        super({
            id: ManageAutomaticTaskRunning.ID,
            title: ManageAutomaticTaskRunning.LABEL,
            category: TASKS_CATEGORY
        });
    }
    async run(accessor) {
        const quickInputService = accessor.get(IQuickInputService);
        const configurationService = accessor.get(IConfigurationService);
        const allowItem = { label: nls.localize('workbench.action.tasks.allowAutomaticTasks', "Allow Automatic Tasks") };
        const disallowItem = { label: nls.localize('workbench.action.tasks.disallowAutomaticTasks', "Disallow Automatic Tasks") };
        const value = await quickInputService.pick([allowItem, disallowItem], { canPickMany: false });
        if (!value) {
            return;
        }
        configurationService.updateValue(ALLOW_AUTOMATIC_TASKS, value === allowItem ? 'on' : 'off', 2);
    }
}
