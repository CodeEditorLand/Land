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
import { RunOnceScheduler } from '../../../../../../base/common/async.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { URI } from '../../../../../../base/common/uri.js';
import { Registry } from '../../../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../../../common/contributions.js';
import { IDebugService } from '../../../../debug/common/debug.js';
import { CellUri } from '../../../common/notebookCommon.js';
import { CellExecutionUpdateType } from '../../../common/notebookExecutionService.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
let NotebookCellPausing = class NotebookCellPausing extends Disposable {
    constructor(_debugService, _notebookExecutionStateService) {
        super();
        this._debugService = _debugService;
        this._notebookExecutionStateService = _notebookExecutionStateService;
        this._pausedCells = new Set();
        this._register(_debugService.getModel().onDidChangeCallStack(() => {
            this.onDidChangeCallStack(true);
            this._scheduler.schedule();
        }));
        this._scheduler = this._register(new RunOnceScheduler(() => this.onDidChangeCallStack(false), 2000));
    }
    async onDidChangeCallStack(fallBackOnStaleCallstack) {
        const newPausedCells = new Set();
        for (const session of this._debugService.getModel().getSessions()) {
            for (const thread of session.getAllThreads()) {
                let callStack = thread.getCallStack();
                if (fallBackOnStaleCallstack && !callStack.length) {
                    callStack = thread.getStaleCallStack();
                }
                callStack.forEach(sf => {
                    const parsed = CellUri.parse(sf.source.uri);
                    if (parsed) {
                        newPausedCells.add(sf.source.uri.toString());
                        this.editIsPaused(sf.source.uri, true);
                    }
                });
            }
        }
        for (const uri of this._pausedCells) {
            if (!newPausedCells.has(uri)) {
                this.editIsPaused(URI.parse(uri), false);
                this._pausedCells.delete(uri);
            }
        }
        newPausedCells.forEach(cell => this._pausedCells.add(cell));
    }
    editIsPaused(cellUri, isPaused) {
        const parsed = CellUri.parse(cellUri);
        if (parsed) {
            const exeState = this._notebookExecutionStateService.getCellExecution(cellUri);
            if (exeState && (exeState.isPaused !== isPaused || !exeState.didPause)) {
                exeState.update([{
                        editType: CellExecutionUpdateType.ExecutionState,
                        didPause: true,
                        isPaused
                    }]);
            }
        }
    }
};
NotebookCellPausing = __decorate([
    __param(0, IDebugService),
    __param(1, INotebookExecutionStateService),
    __metadata("design:paramtypes", [Object, Object])
], NotebookCellPausing);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(NotebookCellPausing, 3);
