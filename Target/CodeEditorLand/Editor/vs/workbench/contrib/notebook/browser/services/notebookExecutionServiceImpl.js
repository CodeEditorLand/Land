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
import { toDisposable } from '../../../../../base/common/lifecycle.js';
import * as nls from '../../../../../nls.js';
import { ICommandService } from '../../../../../platform/commands/common/commands.js';
import { IWorkspaceTrustRequestService } from '../../../../../platform/workspace/common/workspaceTrust.js';
import { KernelPickerMRUStrategy } from '../viewParts/notebookKernelQuickPickStrategy.js';
import { CellKind, NotebookCellExecutionState } from '../../common/notebookCommon.js';
import { INotebookExecutionStateService } from '../../common/notebookExecutionStateService.js';
import { INotebookKernelHistoryService, INotebookKernelService } from '../../common/notebookKernelService.js';
import { INotebookLoggingService } from '../../common/notebookLoggingService.js';
let NotebookExecutionService = class NotebookExecutionService {
    constructor(_commandService, _notebookKernelService, _notebookKernelHistoryService, _workspaceTrustRequestService, _logService, _notebookExecutionStateService) {
        this._commandService = _commandService;
        this._notebookKernelService = _notebookKernelService;
        this._notebookKernelHistoryService = _notebookKernelHistoryService;
        this._workspaceTrustRequestService = _workspaceTrustRequestService;
        this._logService = _logService;
        this._notebookExecutionStateService = _notebookExecutionStateService;
        this.cellExecutionParticipants = new Set;
    }
    async executeNotebookCells(notebook, cells, contextKeyService) {
        const cellsArr = Array.from(cells)
            .filter(c => c.cellKind === CellKind.Code);
        if (!cellsArr.length) {
            return;
        }
        this._logService.debug(`Execution`, `${JSON.stringify(cellsArr.map(c => c.handle))}`);
        const message = nls.localize('notebookRunTrust', "Executing a notebook cell will run code from this workspace.");
        const trust = await this._workspaceTrustRequestService.requestWorkspaceTrust({ message });
        if (!trust) {
            return;
        }
        const cellExecutions = [];
        for (const cell of cellsArr) {
            const cellExe = this._notebookExecutionStateService.getCellExecution(cell.uri);
            if (!!cellExe) {
                continue;
            }
            cellExecutions.push([cell, this._notebookExecutionStateService.createCellExecution(notebook.uri, cell.handle)]);
        }
        const kernel = await KernelPickerMRUStrategy.resolveKernel(notebook, this._notebookKernelService, this._notebookKernelHistoryService, this._commandService);
        if (!kernel) {
            cellExecutions.forEach(cellExe => cellExe[1].complete({}));
            return;
        }
        this._notebookKernelHistoryService.addMostRecentKernel(kernel);
        const validCellExecutions = [];
        for (const [cell, cellExecution] of cellExecutions) {
            if (!kernel.supportedLanguages.includes(cell.language)) {
                cellExecution.complete({});
            }
            else {
                validCellExecutions.push(cellExecution);
            }
        }
        if (validCellExecutions.length > 0) {
            await this.runExecutionParticipants(validCellExecutions);
            this._notebookKernelService.selectKernelForNotebook(kernel, notebook);
            await kernel.executeNotebookCellsRequest(notebook.uri, validCellExecutions.map(c => c.cellHandle));
            const unconfirmed = validCellExecutions.filter(exe => exe.state === NotebookCellExecutionState.Unconfirmed);
            if (unconfirmed.length) {
                this._logService.debug(`Execution`, `Completing unconfirmed executions ${JSON.stringify(unconfirmed.map(exe => exe.cellHandle))}`);
                unconfirmed.forEach(exe => exe.complete({}));
            }
            this._logService.debug(`Execution`, `Completed executions ${JSON.stringify(validCellExecutions.map(exe => exe.cellHandle))}`);
        }
    }
    async cancelNotebookCellHandles(notebook, cells) {
        const cellsArr = Array.from(cells);
        this._logService.debug(`Execution`, `CancelNotebookCellHandles ${JSON.stringify(cellsArr)}`);
        const kernel = this._notebookKernelService.getSelectedOrSuggestedKernel(notebook);
        if (kernel) {
            await kernel.cancelNotebookCellExecution(notebook.uri, cellsArr);
        }
    }
    async cancelNotebookCells(notebook, cells) {
        this.cancelNotebookCellHandles(notebook, Array.from(cells, cell => cell.handle));
    }
    registerExecutionParticipant(participant) {
        this.cellExecutionParticipants.add(participant);
        return toDisposable(() => this.cellExecutionParticipants.delete(participant));
    }
    async runExecutionParticipants(executions) {
        for (const participant of this.cellExecutionParticipants) {
            await participant.onWillExecuteCell(executions);
        }
        return;
    }
    dispose() {
        this._activeProxyKernelExecutionToken?.dispose(true);
    }
};
NotebookExecutionService = __decorate([
    __param(0, ICommandService),
    __param(1, INotebookKernelService),
    __param(2, INotebookKernelHistoryService),
    __param(3, IWorkspaceTrustRequestService),
    __param(4, INotebookLoggingService),
    __param(5, INotebookExecutionStateService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object])
], NotebookExecutionService);
export { NotebookExecutionService };
