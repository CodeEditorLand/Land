import { UriComponents } from '../../../base/common/uri.js';
import { Event, Emitter } from '../../../base/common/event.js';
import { MainThreadTaskShape, ExtHostTaskShape } from './extHost.protocol.js';
import * as types from './extHostTypes.js';
import { IExtHostWorkspaceProvider, IExtHostWorkspace } from './extHostWorkspace.js';
import type * as vscode from 'vscode';
import * as tasks from './shared/tasks.js';
import { IExtHostDocumentsAndEditors } from './extHostDocumentsAndEditors.js';
import { IExtHostConfiguration } from './extHostConfiguration.js';
import { IExtensionDescription } from '../../../platform/extensions/common/extensions.js';
import { IExtHostTerminalService } from './extHostTerminalService.js';
import { IExtHostRpcService } from './extHostRpcService.js';
import { IExtHostInitDataService } from './extHostInitDataService.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { IExtHostApiDeprecationService } from './extHostApiDeprecationService.js';
export interface IExtHostTask extends ExtHostTaskShape {
    readonly _serviceBrand: undefined;
    taskExecutions: vscode.TaskExecution[];
    onDidStartTask: Event<vscode.TaskStartEvent>;
    onDidEndTask: Event<vscode.TaskEndEvent>;
    onDidStartTaskProcess: Event<vscode.TaskProcessStartEvent>;
    onDidEndTaskProcess: Event<vscode.TaskProcessEndEvent>;
    registerTaskProvider(extension: IExtensionDescription, type: string, provider: vscode.TaskProvider): vscode.Disposable;
    registerTaskSystem(scheme: string, info: tasks.ITaskSystemInfoDTO): void;
    fetchTasks(filter?: vscode.TaskFilter): Promise<vscode.Task[]>;
    executeTask(extension: IExtensionDescription, task: vscode.Task): Promise<vscode.TaskExecution>;
    terminateTask(execution: vscode.TaskExecution): Promise<void>;
}
export declare namespace CustomExecutionDTO {
    function is(value: tasks.IShellExecutionDTO | tasks.IProcessExecutionDTO | tasks.ICustomExecutionDTO | undefined): value is tasks.ICustomExecutionDTO;
    function from(value: vscode.CustomExecution): tasks.ICustomExecutionDTO;
    function to(taskId: string, providedCustomExeutions: Map<string, types.CustomExecution>): types.CustomExecution | undefined;
}
export declare namespace TaskHandleDTO {
    function from(value: types.Task, workspaceService?: IExtHostWorkspace): tasks.ITaskHandleDTO;
}
export declare namespace TaskDTO {
    function fromMany(tasks: vscode.Task[], extension: IExtensionDescription): tasks.ITaskDTO[];
    function from(value: vscode.Task, extension: IExtensionDescription): tasks.ITaskDTO | undefined;
    function to(value: tasks.ITaskDTO | undefined, workspace: IExtHostWorkspaceProvider, providedCustomExeutions: Map<string, types.CustomExecution>): Promise<types.Task | undefined>;
}
declare class TaskExecutionImpl implements vscode.TaskExecution {
    #private;
    readonly _id: string;
    private readonly _task;
    constructor(tasks: ExtHostTaskBase, _id: string, _task: vscode.Task);
    get task(): vscode.Task;
    terminate(): void;
    fireDidStartProcess(value: tasks.ITaskProcessStartedDTO): void;
    fireDidEndProcess(value: tasks.ITaskProcessEndedDTO): void;
}
export interface HandlerData {
    type: string;
    provider: vscode.TaskProvider;
    extension: IExtensionDescription;
}
export declare abstract class ExtHostTaskBase implements ExtHostTaskShape, IExtHostTask {
    readonly _serviceBrand: undefined;
    protected readonly _proxy: MainThreadTaskShape;
    protected readonly _workspaceProvider: IExtHostWorkspaceProvider;
    protected readonly _editorService: IExtHostDocumentsAndEditors;
    protected readonly _configurationService: IExtHostConfiguration;
    protected readonly _terminalService: IExtHostTerminalService;
    protected readonly _logService: ILogService;
    protected readonly _deprecationService: IExtHostApiDeprecationService;
    protected _handleCounter: number;
    protected _handlers: Map<number, HandlerData>;
    protected _taskExecutions: Map<string, TaskExecutionImpl>;
    protected _taskExecutionPromises: Map<string, Promise<TaskExecutionImpl>>;
    protected _providedCustomExecutions2: Map<string, types.CustomExecution>;
    private _notProvidedCustomExecutions;
    protected _activeCustomExecutions2: Map<string, types.CustomExecution>;
    private _lastStartedTask;
    protected readonly _onDidExecuteTask: Emitter<vscode.TaskStartEvent>;
    protected readonly _onDidTerminateTask: Emitter<vscode.TaskEndEvent>;
    protected readonly _onDidTaskProcessStarted: Emitter<vscode.TaskProcessStartEvent>;
    protected readonly _onDidTaskProcessEnded: Emitter<vscode.TaskProcessEndEvent>;
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService, workspaceService: IExtHostWorkspace, editorService: IExtHostDocumentsAndEditors, configurationService: IExtHostConfiguration, extHostTerminalService: IExtHostTerminalService, logService: ILogService, deprecationService: IExtHostApiDeprecationService);
    registerTaskProvider(extension: IExtensionDescription, type: string, provider: vscode.TaskProvider): vscode.Disposable;
    registerTaskSystem(scheme: string, info: tasks.ITaskSystemInfoDTO): void;
    fetchTasks(filter?: vscode.TaskFilter): Promise<vscode.Task[]>;
    abstract executeTask(extension: IExtensionDescription, task: vscode.Task): Promise<vscode.TaskExecution>;
    get taskExecutions(): vscode.TaskExecution[];
    terminateTask(execution: vscode.TaskExecution): Promise<void>;
    get onDidStartTask(): Event<vscode.TaskStartEvent>;
    $onDidStartTask(execution: tasks.ITaskExecutionDTO, terminalId: number, resolvedDefinition: tasks.ITaskDefinitionDTO): Promise<void>;
    get onDidEndTask(): Event<vscode.TaskEndEvent>;
    $OnDidEndTask(execution: tasks.ITaskExecutionDTO): Promise<void>;
    get onDidStartTaskProcess(): Event<vscode.TaskProcessStartEvent>;
    $onDidStartTaskProcess(value: tasks.ITaskProcessStartedDTO): Promise<void>;
    get onDidEndTaskProcess(): Event<vscode.TaskProcessEndEvent>;
    $onDidEndTaskProcess(value: tasks.ITaskProcessEndedDTO): Promise<void>;
    protected abstract provideTasksInternal(validTypes: {
        [key: string]: boolean;
    }, taskIdPromises: Promise<void>[], handler: HandlerData, value: vscode.Task[] | null | undefined): {
        tasks: tasks.ITaskDTO[];
        extension: IExtensionDescription;
    };
    $provideTasks(handle: number, validTypes: {
        [key: string]: boolean;
    }): Promise<tasks.ITaskSetDTO>;
    protected abstract resolveTaskInternal(resolvedTaskDTO: tasks.ITaskDTO): Promise<tasks.ITaskDTO | undefined>;
    $resolveTask(handle: number, taskDTO: tasks.ITaskDTO): Promise<tasks.ITaskDTO | undefined>;
    abstract $resolveVariables(uriComponents: UriComponents, toResolve: {
        process?: {
            name: string;
            cwd?: string;
            path?: string;
        };
        variables: string[];
    }): Promise<{
        process?: string;
        variables: {
            [key: string]: string;
        };
    }>;
    private nextHandle;
    protected addCustomExecution(taskDTO: tasks.ITaskDTO, task: vscode.Task, isProvided: boolean): Promise<void>;
    protected getTaskExecution(execution: tasks.ITaskExecutionDTO | string, task?: vscode.Task): Promise<TaskExecutionImpl>;
    protected checkDeprecation(task: vscode.Task, handler: HandlerData): void;
    private customExecutionComplete;
    abstract $jsonTasksSupported(): Promise<boolean>;
    abstract $findExecutable(command: string, cwd?: string | undefined, paths?: string[] | undefined): Promise<string | undefined>;
}
export declare class WorkerExtHostTask extends ExtHostTaskBase {
    constructor(extHostRpc: IExtHostRpcService, initData: IExtHostInitDataService, workspaceService: IExtHostWorkspace, editorService: IExtHostDocumentsAndEditors, configurationService: IExtHostConfiguration, extHostTerminalService: IExtHostTerminalService, logService: ILogService, deprecationService: IExtHostApiDeprecationService);
    executeTask(extension: IExtensionDescription, task: vscode.Task): Promise<vscode.TaskExecution>;
    protected provideTasksInternal(validTypes: {
        [key: string]: boolean;
    }, taskIdPromises: Promise<void>[], handler: HandlerData, value: vscode.Task[] | null | undefined): {
        tasks: tasks.ITaskDTO[];
        extension: IExtensionDescription;
    };
    protected resolveTaskInternal(resolvedTaskDTO: tasks.ITaskDTO): Promise<tasks.ITaskDTO | undefined>;
    $resolveVariables(uriComponents: UriComponents, toResolve: {
        process?: {
            name: string;
            cwd?: string;
            path?: string;
        };
        variables: string[];
    }): Promise<{
        process?: string;
        variables: {
            [key: string]: string;
        };
    }>;
    $jsonTasksSupported(): Promise<boolean>;
    $findExecutable(command: string, cwd?: string | undefined, paths?: string[] | undefined): Promise<string | undefined>;
}
export declare const IExtHostTask: import("../../../platform/instantiation/common/instantiation.js").ServiceIdentifier<IExtHostTask>;
export {};
