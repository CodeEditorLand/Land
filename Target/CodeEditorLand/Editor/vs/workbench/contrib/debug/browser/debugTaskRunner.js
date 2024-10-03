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
import { Action } from '../../../../base/common/actions.js';
import { disposableTimeout } from '../../../../base/common/async.js';
import { CancellationTokenSource } from '../../../../base/common/cancellation.js';
import { createErrorWithActions } from '../../../../base/common/errorMessage.js';
import { Emitter, Event } from '../../../../base/common/event.js';
import { DisposableStore } from '../../../../base/common/lifecycle.js';
import severity from '../../../../base/common/severity.js';
import * as nls from '../../../../nls.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IMarkerService, MarkerSeverity } from '../../../../platform/markers/common/markers.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { DEBUG_CONFIGURE_COMMAND_ID, DEBUG_CONFIGURE_LABEL } from './debugCommands.js';
import { Markers } from '../../markers/common/markers.js';
import { ConfiguringTask, CustomTask } from '../../tasks/common/tasks.js';
import { ITaskService } from '../../tasks/common/taskService.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
const onceFilter = (event, filter) => Event.once(Event.filter(event, filter));
const DEBUG_TASK_ERROR_CHOICE_KEY = 'debug.taskerrorchoice';
const ABORT_LABEL = nls.localize('abort', "Abort");
const DEBUG_ANYWAY_LABEL = nls.localize({ key: 'debugAnyway', comment: ['&& denotes a mnemonic'] }, "&&Debug Anyway");
const DEBUG_ANYWAY_LABEL_NO_MEMO = nls.localize('debugAnywayNoMemo', "Debug Anyway");
let DebugTaskRunner = class DebugTaskRunner {
    constructor(taskService, markerService, configurationService, viewsService, dialogService, storageService, commandService, progressService) {
        this.taskService = taskService;
        this.markerService = markerService;
        this.configurationService = configurationService;
        this.viewsService = viewsService;
        this.dialogService = dialogService;
        this.storageService = storageService;
        this.commandService = commandService;
        this.progressService = progressService;
        this.globalCancellation = new CancellationTokenSource();
    }
    cancel() {
        this.globalCancellation.dispose(true);
        this.globalCancellation = new CancellationTokenSource();
    }
    dispose() {
        this.globalCancellation.dispose(true);
    }
    async runTaskAndCheckErrors(root, taskId) {
        try {
            const taskSummary = await this.runTask(root, taskId, this.globalCancellation.token);
            if (taskSummary && (taskSummary.exitCode === undefined || taskSummary.cancelled)) {
                return 0;
            }
            const errorCount = taskId ? this.markerService.read({ severities: MarkerSeverity.Error, take: 2 }).length : 0;
            const successExitCode = taskSummary && taskSummary.exitCode === 0;
            const failureExitCode = taskSummary && taskSummary.exitCode !== 0;
            const onTaskErrors = this.configurationService.getValue('debug').onTaskErrors;
            if (successExitCode || onTaskErrors === 'debugAnyway' || (errorCount === 0 && !failureExitCode)) {
                return 1;
            }
            if (onTaskErrors === 'showErrors') {
                await this.viewsService.openView(Markers.MARKERS_VIEW_ID, true);
                return Promise.resolve(0);
            }
            if (onTaskErrors === 'abort') {
                return Promise.resolve(0);
            }
            const taskLabel = typeof taskId === 'string' ? taskId : taskId ? taskId.name : '';
            const message = errorCount > 1
                ? nls.localize('preLaunchTaskErrors', "Errors exist after running preLaunchTask '{0}'.", taskLabel)
                : errorCount === 1
                    ? nls.localize('preLaunchTaskError', "Error exists after running preLaunchTask '{0}'.", taskLabel)
                    : taskSummary && typeof taskSummary.exitCode === 'number'
                        ? nls.localize('preLaunchTaskExitCode', "The preLaunchTask '{0}' terminated with exit code {1}.", taskLabel, taskSummary.exitCode)
                        : nls.localize('preLaunchTaskTerminated', "The preLaunchTask '{0}' terminated.", taskLabel);
            let DebugChoice;
            (function (DebugChoice) {
                DebugChoice[DebugChoice["DebugAnyway"] = 1] = "DebugAnyway";
                DebugChoice[DebugChoice["ShowErrors"] = 2] = "ShowErrors";
                DebugChoice[DebugChoice["Cancel"] = 0] = "Cancel";
            })(DebugChoice || (DebugChoice = {}));
            const { result, checkboxChecked } = await this.dialogService.prompt({
                type: severity.Warning,
                message,
                buttons: [
                    {
                        label: DEBUG_ANYWAY_LABEL,
                        run: () => DebugChoice.DebugAnyway
                    },
                    {
                        label: nls.localize({ key: 'showErrors', comment: ['&& denotes a mnemonic'] }, "&&Show Errors"),
                        run: () => DebugChoice.ShowErrors
                    }
                ],
                cancelButton: {
                    label: ABORT_LABEL,
                    run: () => DebugChoice.Cancel
                },
                checkbox: {
                    label: nls.localize('remember', "Remember my choice in user settings"),
                }
            });
            const debugAnyway = result === DebugChoice.DebugAnyway;
            const abort = result === DebugChoice.Cancel;
            if (checkboxChecked) {
                this.configurationService.updateValue('debug.onTaskErrors', result === DebugChoice.DebugAnyway ? 'debugAnyway' : abort ? 'abort' : 'showErrors');
            }
            if (abort) {
                return Promise.resolve(0);
            }
            if (debugAnyway) {
                return 1;
            }
            await this.viewsService.openView(Markers.MARKERS_VIEW_ID, true);
            return Promise.resolve(0);
        }
        catch (err) {
            const taskConfigureAction = this.taskService.configureAction();
            const choiceMap = JSON.parse(this.storageService.get(DEBUG_TASK_ERROR_CHOICE_KEY, 1, '{}'));
            let choice = -1;
            let DebugChoice;
            (function (DebugChoice) {
                DebugChoice[DebugChoice["DebugAnyway"] = 0] = "DebugAnyway";
                DebugChoice[DebugChoice["ConfigureTask"] = 1] = "ConfigureTask";
                DebugChoice[DebugChoice["Cancel"] = 2] = "Cancel";
            })(DebugChoice || (DebugChoice = {}));
            if (choiceMap[err.message] !== undefined) {
                choice = choiceMap[err.message];
            }
            else {
                const { result, checkboxChecked } = await this.dialogService.prompt({
                    type: severity.Error,
                    message: err.message,
                    buttons: [
                        {
                            label: nls.localize({ key: 'debugAnyway', comment: ['&& denotes a mnemonic'] }, "&&Debug Anyway"),
                            run: () => DebugChoice.DebugAnyway
                        },
                        {
                            label: taskConfigureAction.label,
                            run: () => DebugChoice.ConfigureTask
                        }
                    ],
                    cancelButton: {
                        run: () => DebugChoice.Cancel
                    },
                    checkbox: {
                        label: nls.localize('rememberTask', "Remember my choice for this task")
                    }
                });
                choice = result;
                if (checkboxChecked) {
                    choiceMap[err.message] = choice;
                    this.storageService.store(DEBUG_TASK_ERROR_CHOICE_KEY, JSON.stringify(choiceMap), 1, 1);
                }
            }
            if (choice === DebugChoice.ConfigureTask) {
                await taskConfigureAction.run();
            }
            return choice === DebugChoice.DebugAnyway ? 1 : 0;
        }
    }
    async runTask(root, taskId, token = this.globalCancellation.token) {
        if (!taskId) {
            return Promise.resolve(null);
        }
        if (!root) {
            return Promise.reject(new Error(nls.localize('invalidTaskReference', "Task '{0}' can not be referenced from a launch configuration that is in a different workspace folder.", typeof taskId === 'string' ? taskId : taskId.type)));
        }
        const task = await this.taskService.getTask(root, taskId);
        if (!task) {
            const errorMessage = typeof taskId === 'string'
                ? nls.localize('DebugTaskNotFoundWithTaskId', "Could not find the task '{0}'.", taskId)
                : nls.localize('DebugTaskNotFound', "Could not find the specified task.");
            return Promise.reject(createErrorWithActions(errorMessage, [new Action(DEBUG_CONFIGURE_COMMAND_ID, DEBUG_CONFIGURE_LABEL, undefined, true, () => this.commandService.executeCommand(DEBUG_CONFIGURE_COMMAND_ID))]));
        }
        let taskStarted = false;
        const store = new DisposableStore();
        const getTaskKey = (t) => t.getKey() ?? t.getMapKey();
        const taskKey = getTaskKey(task);
        const inactivePromise = new Promise((resolve) => store.add(onceFilter(this.taskService.onDidStateChange, e => {
            return (e.kind === "inactive"
                || (e.kind === "processEnded" && e.exitCode === undefined))
                && getTaskKey(e.__task) === taskKey;
        })(e => {
            taskStarted = true;
            resolve(e.kind === "processEnded" ? { exitCode: e.exitCode } : null);
        })));
        store.add(onceFilter(this.taskService.onDidStateChange, e => ((e.kind === "active") || (e.kind === "dependsOnStarted")) && getTaskKey(e.__task) === taskKey)(() => {
            taskStarted = true;
        }));
        const didAcquireInput = store.add(new Emitter());
        store.add(onceFilter(this.taskService.onDidStateChange, e => (e.kind === "acquiredInput") && getTaskKey(e.__task) === taskKey)(() => didAcquireInput.fire()));
        const taskDonePromise = this.taskService.getActiveTasks().then(async (tasks) => {
            if (tasks.find(t => getTaskKey(t) === taskKey)) {
                didAcquireInput.fire();
                const busyTasks = await this.taskService.getBusyTasks();
                if (busyTasks.find(t => getTaskKey(t) === taskKey)) {
                    taskStarted = true;
                    return inactivePromise;
                }
                return Promise.resolve(null);
            }
            const taskPromise = this.taskService.run(task);
            if (task.configurationProperties.isBackground) {
                return inactivePromise;
            }
            return taskPromise.then(x => x ?? null);
        });
        const result = new Promise((resolve, reject) => {
            taskDonePromise.then(result => {
                taskStarted = true;
                resolve(result);
            }, error => reject(error));
            store.add(token.onCancellationRequested(() => {
                resolve({ exitCode: undefined, cancelled: true });
                this.taskService.terminate(task).catch(() => { });
            }));
            store.add(didAcquireInput.event(() => {
                const waitTime = task.configurationProperties.isBackground ? 5000 : 10000;
                store.add(disposableTimeout(() => {
                    if (!taskStarted) {
                        const errorMessage = nls.localize('taskNotTracked', "The task '{0}' has not exited and doesn't have a 'problemMatcher' defined. Make sure to define a problem matcher for watch tasks.", typeof taskId === 'string' ? taskId : JSON.stringify(taskId));
                        reject({ severity: severity.Error, message: errorMessage });
                    }
                }, waitTime));
                store.add(disposableTimeout(() => {
                    const message = nls.localize('runningTask', "Waiting for preLaunchTask '{0}'...", task.configurationProperties.name);
                    const buttons = [DEBUG_ANYWAY_LABEL_NO_MEMO, ABORT_LABEL];
                    const canConfigure = task instanceof CustomTask || task instanceof ConfiguringTask;
                    if (canConfigure) {
                        buttons.splice(1, 0, nls.localize('configureTask', "Configure Task"));
                    }
                    this.progressService.withProgress({ location: 15, title: message, buttons }, () => result.catch(() => { }), (choice) => {
                        if (choice === undefined) {
                        }
                        else if (choice === 0) {
                            resolve({ exitCode: 0 });
                        }
                        else {
                            resolve({ exitCode: undefined, cancelled: true });
                            this.taskService.terminate(task).catch(() => { });
                            if (canConfigure && choice === 1) {
                                this.taskService.openConfig(task);
                            }
                        }
                    });
                }, 10_000));
            }));
        });
        return result.finally(() => store.dispose());
    }
};
DebugTaskRunner = __decorate([
    __param(0, ITaskService),
    __param(1, IMarkerService),
    __param(2, IConfigurationService),
    __param(3, IViewsService),
    __param(4, IDialogService),
    __param(5, IStorageService),
    __param(6, ICommandService),
    __param(7, IProgressService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object])
], DebugTaskRunner);
export { DebugTaskRunner };
