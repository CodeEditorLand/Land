/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import * as nls from '../../../nls.js';
import { URI } from '../../../base/common/uri.js';
import { generateUuid } from '../../../base/common/uuid.js';
import * as Types from '../../../base/common/types.js';
import * as Platform from '../../../base/common/platform.js';
import { Disposable } from '../../../base/common/lifecycle.js';
import { IWorkspaceContextService } from '../../../platform/workspace/common/workspace.js';
import { ContributedTask, ConfiguringTask, CommandOptions, RuntimeType, CustomTask, TaskSourceKind, TaskDefinition, PresentationOptions, RunOptions } from '../../contrib/tasks/common/tasks.js';
import { ITaskService } from '../../contrib/tasks/common/taskService.js';
import { extHostNamedCustomer } from '../../services/extensions/common/extHostCustomers.js';
import { ExtHostContext, MainContext } from '../common/extHost.protocol.js';
import { IConfigurationResolverService } from '../../services/configurationResolver/common/configurationResolver.js';
import { ErrorNoTelemetry } from '../../../base/common/errors.js';
var TaskExecutionDTO;
(function (TaskExecutionDTO) {
    function from(value) {
        return {
            id: value.id,
            task: TaskDTO.from(value.task)
        };
    }
    TaskExecutionDTO.from = from;
})(TaskExecutionDTO || (TaskExecutionDTO = {}));
var TaskProcessStartedDTO;
(function (TaskProcessStartedDTO) {
    function from(value, processId) {
        return {
            id: value.id,
            processId
        };
    }
    TaskProcessStartedDTO.from = from;
})(TaskProcessStartedDTO || (TaskProcessStartedDTO = {}));
var TaskProcessEndedDTO;
(function (TaskProcessEndedDTO) {
    function from(value, exitCode) {
        return {
            id: value.id,
            exitCode
        };
    }
    TaskProcessEndedDTO.from = from;
})(TaskProcessEndedDTO || (TaskProcessEndedDTO = {}));
var TaskDefinitionDTO;
(function (TaskDefinitionDTO) {
    function from(value) {
        const result = Object.assign(Object.create(null), value);
        delete result._key;
        return result;
    }
    TaskDefinitionDTO.from = from;
    function to(value, executeOnly) {
        let result = TaskDefinition.createTaskIdentifier(value, console);
        if (result === undefined && executeOnly) {
            result = {
                _key: generateUuid(),
                type: '$executeOnly'
            };
        }
        return result;
    }
    TaskDefinitionDTO.to = to;
})(TaskDefinitionDTO || (TaskDefinitionDTO = {}));
var TaskPresentationOptionsDTO;
(function (TaskPresentationOptionsDTO) {
    function from(value) {
        if (value === undefined || value === null) {
            return undefined;
        }
        return Object.assign(Object.create(null), value);
    }
    TaskPresentationOptionsDTO.from = from;
    function to(value) {
        if (value === undefined || value === null) {
            return PresentationOptions.defaults;
        }
        return Object.assign(Object.create(null), PresentationOptions.defaults, value);
    }
    TaskPresentationOptionsDTO.to = to;
})(TaskPresentationOptionsDTO || (TaskPresentationOptionsDTO = {}));
var RunOptionsDTO;
(function (RunOptionsDTO) {
    function from(value) {
        if (value === undefined || value === null) {
            return undefined;
        }
        return Object.assign(Object.create(null), value);
    }
    RunOptionsDTO.from = from;
    function to(value) {
        if (value === undefined || value === null) {
            return RunOptions.defaults;
        }
        return Object.assign(Object.create(null), RunOptions.defaults, value);
    }
    RunOptionsDTO.to = to;
})(RunOptionsDTO || (RunOptionsDTO = {}));
var ProcessExecutionOptionsDTO;
(function (ProcessExecutionOptionsDTO) {
    function from(value) {
        if (value === undefined || value === null) {
            return undefined;
        }
        return {
            cwd: value.cwd,
            env: value.env
        };
    }
    ProcessExecutionOptionsDTO.from = from;
    function to(value) {
        if (value === undefined || value === null) {
            return CommandOptions.defaults;
        }
        return {
            cwd: value.cwd || CommandOptions.defaults.cwd,
            env: value.env
        };
    }
    ProcessExecutionOptionsDTO.to = to;
})(ProcessExecutionOptionsDTO || (ProcessExecutionOptionsDTO = {}));
var ProcessExecutionDTO;
(function (ProcessExecutionDTO) {
    function is(value) {
        const candidate = value;
        return candidate && !!candidate.process;
    }
    ProcessExecutionDTO.is = is;
    function from(value) {
        const process = Types.isString(value.name) ? value.name : value.name.value;
        const args = value.args ? value.args.map(value => Types.isString(value) ? value : value.value) : [];
        const result = {
            process: process,
            args: args
        };
        if (value.options) {
            result.options = ProcessExecutionOptionsDTO.from(value.options);
        }
        return result;
    }
    ProcessExecutionDTO.from = from;
    function to(value) {
        const result = {
            runtime: RuntimeType.Process,
            name: value.process,
            args: value.args,
            presentation: undefined
        };
        result.options = ProcessExecutionOptionsDTO.to(value.options);
        return result;
    }
    ProcessExecutionDTO.to = to;
})(ProcessExecutionDTO || (ProcessExecutionDTO = {}));
var ShellExecutionOptionsDTO;
(function (ShellExecutionOptionsDTO) {
    function from(value) {
        if (value === undefined || value === null) {
            return undefined;
        }
        const result = {
            cwd: value.cwd || CommandOptions.defaults.cwd,
            env: value.env
        };
        if (value.shell) {
            result.executable = value.shell.executable;
            result.shellArgs = value.shell.args;
            result.shellQuoting = value.shell.quoting;
        }
        return result;
    }
    ShellExecutionOptionsDTO.from = from;
    function to(value) {
        if (value === undefined || value === null) {
            return undefined;
        }
        const result = {
            cwd: value.cwd,
            env: value.env
        };
        if (value.executable) {
            result.shell = {
                executable: value.executable
            };
            if (value.shellArgs) {
                result.shell.args = value.shellArgs;
            }
            if (value.shellQuoting) {
                result.shell.quoting = value.shellQuoting;
            }
        }
        return result;
    }
    ShellExecutionOptionsDTO.to = to;
})(ShellExecutionOptionsDTO || (ShellExecutionOptionsDTO = {}));
var ShellExecutionDTO;
(function (ShellExecutionDTO) {
    function is(value) {
        const candidate = value;
        return candidate && (!!candidate.commandLine || !!candidate.command);
    }
    ShellExecutionDTO.is = is;
    function from(value) {
        const result = {};
        if (value.name && Types.isString(value.name) && (value.args === undefined || value.args === null || value.args.length === 0)) {
            result.commandLine = value.name;
        }
        else {
            result.command = value.name;
            result.args = value.args;
        }
        if (value.options) {
            result.options = ShellExecutionOptionsDTO.from(value.options);
        }
        return result;
    }
    ShellExecutionDTO.from = from;
    function to(value) {
        const result = {
            runtime: RuntimeType.Shell,
            name: value.commandLine ? value.commandLine : value.command,
            args: value.args,
            presentation: undefined
        };
        if (value.options) {
            result.options = ShellExecutionOptionsDTO.to(value.options);
        }
        return result;
    }
    ShellExecutionDTO.to = to;
})(ShellExecutionDTO || (ShellExecutionDTO = {}));
var CustomExecutionDTO;
(function (CustomExecutionDTO) {
    function is(value) {
        const candidate = value;
        return candidate && candidate.customExecution === 'customExecution';
    }
    CustomExecutionDTO.is = is;
    function from(value) {
        return {
            customExecution: 'customExecution'
        };
    }
    CustomExecutionDTO.from = from;
    function to(value) {
        return {
            runtime: RuntimeType.CustomExecution,
            presentation: undefined
        };
    }
    CustomExecutionDTO.to = to;
})(CustomExecutionDTO || (CustomExecutionDTO = {}));
var TaskSourceDTO;
(function (TaskSourceDTO) {
    function from(value) {
        const result = {
            label: value.label
        };
        if (value.kind === TaskSourceKind.Extension) {
            result.extensionId = value.extension;
            if (value.workspaceFolder) {
                result.scope = value.workspaceFolder.uri;
            }
            else {
                result.scope = value.scope;
            }
        }
        else if (value.kind === TaskSourceKind.Workspace) {
            result.extensionId = '$core';
            result.scope = value.config.workspaceFolder ? value.config.workspaceFolder.uri : 1 /* TaskScope.Global */;
        }
        return result;
    }
    TaskSourceDTO.from = from;
    function to(value, workspace) {
        let scope;
        let workspaceFolder;
        if ((value.scope === undefined) || ((typeof value.scope === 'number') && (value.scope !== 1 /* TaskScope.Global */))) {
            if (workspace.getWorkspace().folders.length === 0) {
                scope = 1 /* TaskScope.Global */;
                workspaceFolder = undefined;
            }
            else {
                scope = 3 /* TaskScope.Folder */;
                workspaceFolder = workspace.getWorkspace().folders[0];
            }
        }
        else if (typeof value.scope === 'number') {
            scope = value.scope;
        }
        else {
            scope = 3 /* TaskScope.Folder */;
            workspaceFolder = workspace.getWorkspaceFolder(URI.revive(value.scope)) ?? undefined;
        }
        const result = {
            kind: TaskSourceKind.Extension,
            label: value.label,
            extension: value.extensionId,
            scope,
            workspaceFolder
        };
        return result;
    }
    TaskSourceDTO.to = to;
})(TaskSourceDTO || (TaskSourceDTO = {}));
var TaskHandleDTO;
(function (TaskHandleDTO) {
    function is(value) {
        const candidate = value;
        return candidate && Types.isString(candidate.id) && !!candidate.workspaceFolder;
    }
    TaskHandleDTO.is = is;
})(TaskHandleDTO || (TaskHandleDTO = {}));
var TaskDTO;
(function (TaskDTO) {
    function from(task) {
        if (task === undefined || task === null || (!CustomTask.is(task) && !ContributedTask.is(task) && !ConfiguringTask.is(task))) {
            return undefined;
        }
        const result = {
            _id: task._id,
            name: task.configurationProperties.name,
            definition: TaskDefinitionDTO.from(task.getDefinition(true)),
            source: TaskSourceDTO.from(task._source),
            execution: undefined,
            presentationOptions: !ConfiguringTask.is(task) && task.command ? TaskPresentationOptionsDTO.from(task.command.presentation) : undefined,
            isBackground: task.configurationProperties.isBackground,
            problemMatchers: [],
            hasDefinedMatchers: ContributedTask.is(task) ? task.hasDefinedMatchers : false,
            runOptions: RunOptionsDTO.from(task.runOptions),
        };
        result.group = TaskGroupDTO.from(task.configurationProperties.group);
        if (task.configurationProperties.detail) {
            result.detail = task.configurationProperties.detail;
        }
        if (!ConfiguringTask.is(task) && task.command) {
            switch (task.command.runtime) {
                case RuntimeType.Process:
                    result.execution = ProcessExecutionDTO.from(task.command);
                    break;
                case RuntimeType.Shell:
                    result.execution = ShellExecutionDTO.from(task.command);
                    break;
                case RuntimeType.CustomExecution:
                    result.execution = CustomExecutionDTO.from(task.command);
                    break;
            }
        }
        if (task.configurationProperties.problemMatchers) {
            for (const matcher of task.configurationProperties.problemMatchers) {
                if (Types.isString(matcher)) {
                    result.problemMatchers.push(matcher);
                }
            }
        }
        return result;
    }
    TaskDTO.from = from;
    function to(task, workspace, executeOnly, icon, hide) {
        if (!task || (typeof task.name !== 'string')) {
            return undefined;
        }
        let command;
        if (task.execution) {
            if (ShellExecutionDTO.is(task.execution)) {
                command = ShellExecutionDTO.to(task.execution);
            }
            else if (ProcessExecutionDTO.is(task.execution)) {
                command = ProcessExecutionDTO.to(task.execution);
            }
            else if (CustomExecutionDTO.is(task.execution)) {
                command = CustomExecutionDTO.to(task.execution);
            }
        }
        if (!command) {
            return undefined;
        }
        command.presentation = TaskPresentationOptionsDTO.to(task.presentationOptions);
        const source = TaskSourceDTO.to(task.source, workspace);
        const label = nls.localize('task.label', '{0}: {1}', source.label, task.name);
        const definition = TaskDefinitionDTO.to(task.definition, executeOnly);
        const id = (CustomExecutionDTO.is(task.execution) && task._id) ? task._id : `${task.source.extensionId}.${definition._key}`;
        const result = new ContributedTask(id, // uuidMap.getUUID(identifier)
        source, label, definition.type, definition, command, task.hasDefinedMatchers, RunOptionsDTO.to(task.runOptions), {
            name: task.name,
            identifier: label,
            group: task.group,
            isBackground: !!task.isBackground,
            problemMatchers: task.problemMatchers.slice(),
            detail: task.detail,
            icon,
            hide
        });
        return result;
    }
    TaskDTO.to = to;
})(TaskDTO || (TaskDTO = {}));
var TaskGroupDTO;
(function (TaskGroupDTO) {
    function from(value) {
        if (value === undefined) {
            return undefined;
        }
        return {
            _id: (typeof value === 'string') ? value : value._id,
            isDefault: (typeof value === 'string') ? false : ((typeof value.isDefault === 'string') ? false : value.isDefault)
        };
    }
    TaskGroupDTO.from = from;
})(TaskGroupDTO || (TaskGroupDTO = {}));
var TaskFilterDTO;
(function (TaskFilterDTO) {
    function from(value) {
        return value;
    }
    TaskFilterDTO.from = from;
    function to(value) {
        return value;
    }
    TaskFilterDTO.to = to;
})(TaskFilterDTO || (TaskFilterDTO = {}));
let MainThreadTask = class MainThreadTask extends Disposable {
    constructor(extHostContext, _taskService, _workspaceContextServer, _configurationResolverService) {
        super();
        this._taskService = _taskService;
        this._workspaceContextServer = _workspaceContextServer;
        this._configurationResolverService = _configurationResolverService;
        this._proxy = extHostContext.getProxy(ExtHostContext.ExtHostTask);
        this._providers = new Map();
        this._register(this._taskService.onDidStateChange(async (event) => {
            if (event.kind === "changed" /* TaskEventKind.Changed */) {
                return;
            }
            const task = event.__task;
            if (event.kind === "start" /* TaskEventKind.Start */) {
                const execution = TaskExecutionDTO.from(task.getTaskExecution());
                let resolvedDefinition = execution.task.definition;
                if (execution.task?.execution && CustomExecutionDTO.is(execution.task.execution) && event.resolvedVariables) {
                    const dictionary = {};
                    for (const [key, value] of event.resolvedVariables.entries()) {
                        dictionary[key] = value;
                    }
                    resolvedDefinition = await this._configurationResolverService.resolveAnyAsync(task.getWorkspaceFolder(), execution.task.definition, dictionary);
                }
                this._proxy.$onDidStartTask(execution, event.terminalId, resolvedDefinition);
            }
            else if (event.kind === "processStarted" /* TaskEventKind.ProcessStarted */) {
                this._proxy.$onDidStartTaskProcess(TaskProcessStartedDTO.from(task.getTaskExecution(), event.processId));
            }
            else if (event.kind === "processEnded" /* TaskEventKind.ProcessEnded */) {
                this._proxy.$onDidEndTaskProcess(TaskProcessEndedDTO.from(task.getTaskExecution(), event.exitCode));
            }
            else if (event.kind === "end" /* TaskEventKind.End */) {
                this._proxy.$OnDidEndTask(TaskExecutionDTO.from(task.getTaskExecution()));
            }
        }));
    }
    dispose() {
        for (const value of this._providers.values()) {
            value.disposable.dispose();
        }
        this._providers.clear();
        super.dispose();
    }
    $createTaskId(taskDTO) {
        return new Promise((resolve, reject) => {
            const task = TaskDTO.to(taskDTO, this._workspaceContextServer, true);
            if (task) {
                resolve(task._id);
            }
            else {
                reject(new Error('Task could not be created from DTO'));
            }
        });
    }
    $registerTaskProvider(handle, type) {
        const provider = {
            provideTasks: (validTypes) => {
                return Promise.resolve(this._proxy.$provideTasks(handle, validTypes)).then((value) => {
                    const tasks = [];
                    for (const dto of value.tasks) {
                        const task = TaskDTO.to(dto, this._workspaceContextServer, true);
                        if (task) {
                            tasks.push(task);
                        }
                        else {
                            console.error(`Task System: can not convert task: ${JSON.stringify(dto.definition, undefined, 0)}. Task will be dropped`);
                        }
                    }
                    const processedExtension = {
                        ...value.extension,
                        extensionLocation: URI.revive(value.extension.extensionLocation)
                    };
                    return {
                        tasks,
                        extension: processedExtension
                    };
                });
            },
            resolveTask: (task) => {
                const dto = TaskDTO.from(task);
                if (dto) {
                    dto.name = ((dto.name === undefined) ? '' : dto.name); // Using an empty name causes the name to default to the one given by the provider.
                    return Promise.resolve(this._proxy.$resolveTask(handle, dto)).then(resolvedTask => {
                        if (resolvedTask) {
                            return TaskDTO.to(resolvedTask, this._workspaceContextServer, true, task.configurationProperties.icon, task.configurationProperties.hide);
                        }
                        return undefined;
                    });
                }
                return Promise.resolve(undefined);
            }
        };
        const disposable = this._taskService.registerTaskProvider(provider, type);
        this._providers.set(handle, { disposable, provider });
        return Promise.resolve(undefined);
    }
    $unregisterTaskProvider(handle) {
        const provider = this._providers.get(handle);
        if (provider) {
            provider.disposable.dispose();
            this._providers.delete(handle);
        }
        return Promise.resolve(undefined);
    }
    $fetchTasks(filter) {
        return this._taskService.tasks(TaskFilterDTO.to(filter)).then((tasks) => {
            const result = [];
            for (const task of tasks) {
                const item = TaskDTO.from(task);
                if (item) {
                    result.push(item);
                }
            }
            return result;
        });
    }
    getWorkspace(value) {
        let workspace;
        if (typeof value === 'string') {
            workspace = value;
        }
        else {
            const workspaceObject = this._workspaceContextServer.getWorkspace();
            const uri = URI.revive(value);
            if (workspaceObject.configuration?.toString() === uri.toString()) {
                workspace = workspaceObject;
            }
            else {
                workspace = this._workspaceContextServer.getWorkspaceFolder(uri);
            }
        }
        return workspace;
    }
    async $getTaskExecution(value) {
        if (TaskHandleDTO.is(value)) {
            const workspace = this.getWorkspace(value.workspaceFolder);
            if (workspace) {
                const task = await this._taskService.getTask(workspace, value.id, true);
                if (task) {
                    return {
                        id: task._id,
                        task: TaskDTO.from(task)
                    };
                }
                throw new Error('Task not found');
            }
            else {
                throw new Error('No workspace folder');
            }
        }
        else {
            const task = TaskDTO.to(value, this._workspaceContextServer, true);
            return {
                id: task._id,
                task: TaskDTO.from(task)
            };
        }
    }
    // Passing in a TaskHandleDTO will cause the task to get re-resolved, which is important for tasks are coming from the core,
    // such as those gotten from a fetchTasks, since they can have missing configuration properties.
    $executeTask(value) {
        return new Promise((resolve, reject) => {
            if (TaskHandleDTO.is(value)) {
                const workspace = this.getWorkspace(value.workspaceFolder);
                if (workspace) {
                    this._taskService.getTask(workspace, value.id, true).then((task) => {
                        if (!task) {
                            reject(new Error('Task not found'));
                        }
                        else {
                            const result = {
                                id: value.id,
                                task: TaskDTO.from(task)
                            };
                            this._taskService.run(task).then(summary => {
                                // Ensure that the task execution gets cleaned up if the exit code is undefined
                                // This can happen when the task has dependent tasks and one of them failed
                                if ((summary?.exitCode === undefined) || (summary.exitCode !== 0)) {
                                    this._proxy.$OnDidEndTask(result);
                                }
                            }, reason => {
                                // eat the error, it has already been surfaced to the user and we don't care about it here
                            });
                            resolve(result);
                        }
                    }, (_error) => {
                        reject(new Error('Task not found'));
                    });
                }
                else {
                    reject(new Error('No workspace folder'));
                }
            }
            else {
                const task = TaskDTO.to(value, this._workspaceContextServer, true);
                this._taskService.run(task).then(undefined, reason => {
                    // eat the error, it has already been surfaced to the user and we don't care about it here
                });
                const result = {
                    id: task._id,
                    task: TaskDTO.from(task)
                };
                resolve(result);
            }
        });
    }
    $customExecutionComplete(id, result) {
        return new Promise((resolve, reject) => {
            this._taskService.getActiveTasks().then((tasks) => {
                for (const task of tasks) {
                    if (id === task._id) {
                        this._taskService.extensionCallbackTaskComplete(task, result).then((value) => {
                            resolve(undefined);
                        }, (error) => {
                            reject(error);
                        });
                        return;
                    }
                }
                reject(new Error('Task to mark as complete not found'));
            });
        });
    }
    $terminateTask(id) {
        return new Promise((resolve, reject) => {
            this._taskService.getActiveTasks().then((tasks) => {
                for (const task of tasks) {
                    if (id === task._id) {
                        this._taskService.terminate(task).then((value) => {
                            resolve(undefined);
                        }, (error) => {
                            reject(undefined);
                        });
                        return;
                    }
                }
                reject(new ErrorNoTelemetry('Task to terminate not found'));
            });
        });
    }
    $registerTaskSystem(key, info) {
        let platform;
        switch (info.platform) {
            case 'Web':
                platform = 0 /* Platform.Platform.Web */;
                break;
            case 'win32':
                platform = 3 /* Platform.Platform.Windows */;
                break;
            case 'darwin':
                platform = 1 /* Platform.Platform.Mac */;
                break;
            case 'linux':
                platform = 2 /* Platform.Platform.Linux */;
                break;
            default:
                platform = Platform.platform;
        }
        this._taskService.registerTaskSystem(key, {
            platform: platform,
            uriProvider: (path) => {
                return URI.from({ scheme: info.scheme, authority: info.authority, path });
            },
            context: this._extHostContext,
            resolveVariables: (workspaceFolder, toResolve, target) => {
                const vars = [];
                toResolve.variables.forEach(item => vars.push(item));
                return Promise.resolve(this._proxy.$resolveVariables(workspaceFolder.uri, { process: toResolve.process, variables: vars })).then(values => {
                    const partiallyResolvedVars = Array.from(Object.values(values.variables));
                    return new Promise((resolve, reject) => {
                        this._configurationResolverService.resolveWithInteraction(workspaceFolder, partiallyResolvedVars, 'tasks', undefined, target).then(resolvedVars => {
                            if (!resolvedVars) {
                                resolve(undefined);
                            }
                            const result = {
                                process: undefined,
                                variables: new Map()
                            };
                            for (let i = 0; i < partiallyResolvedVars.length; i++) {
                                const variableName = vars[i].substring(2, vars[i].length - 1);
                                if (resolvedVars && values.variables[vars[i]] === vars[i]) {
                                    const resolved = resolvedVars.get(variableName);
                                    if (typeof resolved === 'string') {
                                        result.variables.set(variableName, resolved);
                                    }
                                }
                                else {
                                    result.variables.set(variableName, partiallyResolvedVars[i]);
                                }
                            }
                            if (Types.isString(values.process)) {
                                result.process = values.process;
                            }
                            resolve(result);
                        }, reason => {
                            reject(reason);
                        });
                    });
                });
            },
            findExecutable: (command, cwd, paths) => {
                return this._proxy.$findExecutable(command, cwd, paths);
            }
        });
    }
    async $registerSupportedExecutions(custom, shell, process) {
        return this._taskService.registerSupportedExecutions(custom, shell, process);
    }
};
MainThreadTask = __decorate([
    extHostNamedCustomer(MainContext.MainThreadTask),
    __param(1, ITaskService),
    __param(2, IWorkspaceContextService),
    __param(3, IConfigurationResolverService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], MainThreadTask);
export { MainThreadTask };
