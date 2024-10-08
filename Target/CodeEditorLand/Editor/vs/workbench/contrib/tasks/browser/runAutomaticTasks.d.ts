import { Disposable } from '../../../../base/common/lifecycle.js';
import { IWorkbenchContribution } from '../../../common/contributions.js';
import { ITaskService } from '../common/taskService.js';
import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
import { IWorkspaceTrustManagementService } from '../../../../platform/workspace/common/workspaceTrust.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { ILogService } from '../../../../platform/log/common/log.js';
export declare class RunAutomaticTasks extends Disposable implements IWorkbenchContribution {
    private readonly _taskService;
    private readonly _configurationService;
    private readonly _workspaceTrustManagementService;
    private readonly _logService;
    private _hasRunTasks;
    constructor(_taskService: ITaskService, _configurationService: IConfigurationService, _workspaceTrustManagementService: IWorkspaceTrustManagementService, _logService: ILogService);
    private _tryRunTasks;
    private _runTasks;
    private _getTaskSource;
    private _findAutoTasks;
    private _runWithPermission;
}
export declare class ManageAutomaticTaskRunning extends Action2 {
    static readonly ID = "workbench.action.tasks.manageAutomaticRunning";
    static readonly LABEL: string;
    constructor();
    run(accessor: ServicesAccessor): Promise<any>;
}
