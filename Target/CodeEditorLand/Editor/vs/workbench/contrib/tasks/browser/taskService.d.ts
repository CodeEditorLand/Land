import { IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { ITaskSystem } from '../common/taskSystem.js';
import { AbstractTaskService, IWorkspaceFolderConfigurationResult } from './abstractTaskService.js';
import { ITaskFilter } from '../common/taskService.js';
export declare class TaskService extends AbstractTaskService {
    private static readonly ProcessTaskSystemSupportMessage;
    protected _getTaskSystem(): ITaskSystem;
    protected _computeLegacyConfiguration(workspaceFolder: IWorkspaceFolder): Promise<IWorkspaceFolderConfigurationResult>;
    protected _versionAndEngineCompatible(filter?: ITaskFilter): boolean;
}
