import { IDisposable } from '../../../../../base/common/lifecycle.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IWorkspaceTrustRequestService } from '../../../../../platform/workspace/common/workspaceTrust.js';
import { NotebookCellTextModel } from '../../common/model/notebookCellTextModel.js';
import { INotebookTextModel } from '../../common/notebookCommon.js';
import { INotebookExecutionService, ICellExecutionParticipant } from '../../common/notebookExecutionService.js';
import { INotebookExecutionStateService } from '../../common/notebookExecutionStateService.js';
import { INotebookKernelHistoryService, INotebookKernelService } from '../../common/notebookKernelService.js';
import { INotebookLoggingService } from '../../common/notebookLoggingService.js';
export declare class NotebookExecutionService implements INotebookExecutionService, IDisposable {
    private readonly _commandService;
    private readonly _notebookKernelService;
    private readonly _notebookKernelHistoryService;
    private readonly _workspaceTrustRequestService;
    private readonly _logService;
    private readonly _notebookExecutionStateService;
    _serviceBrand: undefined;
    private _activeProxyKernelExecutionToken;
    constructor(_commandService: ICommandService, _notebookKernelService: INotebookKernelService, _notebookKernelHistoryService: INotebookKernelHistoryService, _workspaceTrustRequestService: IWorkspaceTrustRequestService, _logService: INotebookLoggingService, _notebookExecutionStateService: INotebookExecutionStateService);
    executeNotebookCells(notebook: INotebookTextModel, cells: Iterable<NotebookCellTextModel>, contextKeyService: IContextKeyService): Promise<void>;
    cancelNotebookCellHandles(notebook: INotebookTextModel, cells: Iterable<number>): Promise<void>;
    cancelNotebookCells(notebook: INotebookTextModel, cells: Iterable<NotebookCellTextModel>): Promise<void>;
    private readonly cellExecutionParticipants;
    registerExecutionParticipant(participant: ICellExecutionParticipant): IDisposable;
    private runExecutionParticipants;
    dispose(): void;
}
