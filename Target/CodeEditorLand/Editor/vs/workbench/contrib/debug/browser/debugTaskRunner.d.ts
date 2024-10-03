import { IDisposable } from '../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../platform/commands/common/commands.js';
import { IConfigurationService } from '../../../../platform/configuration/common/configuration.js';
import { IDialogService } from '../../../../platform/dialogs/common/dialogs.js';
import { IMarkerService } from '../../../../platform/markers/common/markers.js';
import { IProgressService } from '../../../../platform/progress/common/progress.js';
import { IStorageService } from '../../../../platform/storage/common/storage.js';
import { IWorkspace, IWorkspaceFolder } from '../../../../platform/workspace/common/workspace.js';
import { ITaskIdentifier } from '../../tasks/common/tasks.js';
import { ITaskService, ITaskSummary } from '../../tasks/common/taskService.js';
import { IViewsService } from '../../../services/views/common/viewsService.js';
export declare const enum TaskRunResult {
    Failure = 0,
    Success = 1
}
interface IRunnerTaskSummary extends ITaskSummary {
    cancelled?: boolean;
}
export declare class DebugTaskRunner implements IDisposable {
    private readonly taskService;
    private readonly markerService;
    private readonly configurationService;
    private readonly viewsService;
    private readonly dialogService;
    private readonly storageService;
    private readonly commandService;
    private readonly progressService;
    private globalCancellation;
    constructor(taskService: ITaskService, markerService: IMarkerService, configurationService: IConfigurationService, viewsService: IViewsService, dialogService: IDialogService, storageService: IStorageService, commandService: ICommandService, progressService: IProgressService);
    cancel(): void;
    dispose(): void;
    runTaskAndCheckErrors(root: IWorkspaceFolder | IWorkspace | undefined, taskId: string | ITaskIdentifier | undefined): Promise<TaskRunResult>;
    runTask(root: IWorkspace | IWorkspaceFolder | undefined, taskId: string | ITaskIdentifier | undefined, token?: import("../../../../base/common/cancellation.js").CancellationToken): Promise<IRunnerTaskSummary | null>;
}
export {};
