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
import { throttle } from '../../../../../../base/common/decorators.js';
import { Disposable, MutableDisposable } from '../../../../../../base/common/lifecycle.js';
import { registerNotebookContribution } from '../../notebookEditorExtensions.js';
import { NotebookCellExecutionState } from '../../../common/notebookCommon.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
import { IUserActivityService } from '../../../../../services/userActivity/common/userActivityService.js';
let ExecutionEditorProgressController = class ExecutionEditorProgressController extends Disposable {
    static { this.id = 'workbench.notebook.executionEditorProgress'; }
    constructor(_notebookEditor, _notebookExecutionStateService, _userActivity) {
        super();
        this._notebookEditor = _notebookEditor;
        this._notebookExecutionStateService = _notebookExecutionStateService;
        this._userActivity = _userActivity;
        this._activityMutex = this._register(new MutableDisposable());
        this._register(_notebookEditor.onDidScroll(() => this._update()));
        this._register(_notebookExecutionStateService.onDidChangeExecution(e => {
            if (e.notebook.toString() !== this._notebookEditor.textModel?.uri.toString()) {
                return;
            }
            this._update();
        }));
        this._register(_notebookEditor.onDidChangeModel(() => this._update()));
    }
    _update() {
        if (!this._notebookEditor.hasModel()) {
            return;
        }
        const cellExecutions = this._notebookExecutionStateService.getCellExecutionsForNotebook(this._notebookEditor.textModel?.uri)
            .filter(exe => exe.state === NotebookCellExecutionState.Executing);
        const notebookExecution = this._notebookExecutionStateService.getExecution(this._notebookEditor.textModel?.uri);
        const executionIsVisible = (exe) => {
            for (const range of this._notebookEditor.visibleRanges) {
                for (const cell of this._notebookEditor.getCellsInRange(range)) {
                    if (cell.handle === exe.cellHandle) {
                        const top = this._notebookEditor.getAbsoluteTopOfElement(cell);
                        if (this._notebookEditor.scrollTop < top + 5) {
                            return true;
                        }
                    }
                }
            }
            return false;
        };
        const hasAnyExecution = cellExecutions.length || notebookExecution;
        if (hasAnyExecution && !this._activityMutex.value) {
            this._activityMutex.value = this._userActivity.markActive();
        }
        else if (!hasAnyExecution && this._activityMutex.value) {
            this._activityMutex.clear();
        }
        const shouldShowEditorProgressbarForCellExecutions = cellExecutions.length && !cellExecutions.some(executionIsVisible) && !cellExecutions.some(e => e.isPaused);
        const showEditorProgressBar = !!notebookExecution || shouldShowEditorProgressbarForCellExecutions;
        if (showEditorProgressBar) {
            this._notebookEditor.showProgress();
        }
        else {
            this._notebookEditor.hideProgress();
        }
    }
};
__decorate([
    throttle(100),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ExecutionEditorProgressController.prototype, "_update", null);
ExecutionEditorProgressController = __decorate([
    __param(1, INotebookExecutionStateService),
    __param(2, IUserActivityService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ExecutionEditorProgressController);
export { ExecutionEditorProgressController };
registerNotebookContribution(ExecutionEditorProgressController.id, ExecutionEditorProgressController);
