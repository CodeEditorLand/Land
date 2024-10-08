import { Disposable } from '../../../base/common/lifecycle.js';
import { IWorkspaceContextService } from '../../../platform/workspace/common/workspace.js';
import { ITaskService } from '../../contrib/tasks/common/taskService.js';
import { IExtHostContext } from '../../services/extensions/common/extHostCustomers.js';
import { MainThreadTaskShape } from '../common/extHost.protocol.js';
import { ITaskExecutionDTO, ITaskDTO, ITaskHandleDTO, ITaskFilterDTO, ITaskSystemInfoDTO } from '../common/shared/tasks.js';
import { IConfigurationResolverService } from '../../services/configurationResolver/common/configurationResolver.js';
export declare class MainThreadTask extends Disposable implements MainThreadTaskShape {
    private readonly _taskService;
    private readonly _workspaceContextServer;
    private readonly _configurationResolverService;
    private readonly _extHostContext;
    private readonly _proxy;
    private readonly _providers;
    constructor(extHostContext: IExtHostContext, _taskService: ITaskService, _workspaceContextServer: IWorkspaceContextService, _configurationResolverService: IConfigurationResolverService);
    dispose(): void;
    $createTaskId(taskDTO: ITaskDTO): Promise<string>;
    $registerTaskProvider(handle: number, type: string): Promise<void>;
    $unregisterTaskProvider(handle: number): Promise<void>;
    $fetchTasks(filter?: ITaskFilterDTO): Promise<ITaskDTO[]>;
    private getWorkspace;
    $getTaskExecution(value: ITaskHandleDTO | ITaskDTO): Promise<ITaskExecutionDTO>;
    $executeTask(value: ITaskHandleDTO | ITaskDTO): Promise<ITaskExecutionDTO>;
    $customExecutionComplete(id: string, result?: number): Promise<void>;
    $terminateTask(id: string): Promise<void>;
    $registerTaskSystem(key: string, info: ITaskSystemInfoDTO): void;
    $registerSupportedExecutions(custom?: boolean, shell?: boolean, process?: boolean): Promise<void>;
}
