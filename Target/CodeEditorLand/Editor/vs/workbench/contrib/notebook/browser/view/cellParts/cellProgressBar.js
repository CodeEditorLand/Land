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
import { ProgressBar } from '../../../../../../base/browser/ui/progressbar/progressbar.js';
import { defaultProgressBarStyles } from '../../../../../../platform/theme/browser/defaultStyles.js';
import { CellContentPart } from '../cellPart.js';
import { NotebookCellExecutionState } from '../../../common/notebookCommon.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
let CellProgressBar = class CellProgressBar extends CellContentPart {
    constructor(editorContainer, collapsedInputContainer, _notebookExecutionStateService) {
        super();
        this._notebookExecutionStateService = _notebookExecutionStateService;
        this._progressBar = this._register(new ProgressBar(editorContainer, defaultProgressBarStyles));
        this._progressBar.hide();
        this._collapsedProgressBar = this._register(new ProgressBar(collapsedInputContainer, defaultProgressBarStyles));
        this._collapsedProgressBar.hide();
    }
    didRenderCell(element) {
        this._updateForExecutionState(element);
    }
    updateForExecutionState(element, e) {
        this._updateForExecutionState(element, e);
    }
    updateState(element, e) {
        if (e.metadataChanged || e.internalMetadataChanged) {
            this._updateForExecutionState(element);
        }
        if (e.inputCollapsedChanged) {
            const exeState = this._notebookExecutionStateService.getCellExecution(element.uri);
            if (element.isInputCollapsed) {
                this._progressBar.hide();
                if (exeState?.state === NotebookCellExecutionState.Executing) {
                    this._updateForExecutionState(element);
                }
            }
            else {
                this._collapsedProgressBar.hide();
                if (exeState?.state === NotebookCellExecutionState.Executing) {
                    this._updateForExecutionState(element);
                }
            }
        }
    }
    _updateForExecutionState(element, e) {
        const exeState = e?.changed ?? this._notebookExecutionStateService.getCellExecution(element.uri);
        const progressBar = element.isInputCollapsed ? this._collapsedProgressBar : this._progressBar;
        if (exeState?.state === NotebookCellExecutionState.Executing && (!exeState.didPause || element.isInputCollapsed)) {
            showProgressBar(progressBar);
        }
        else {
            progressBar.hide();
        }
    }
};
CellProgressBar = __decorate([
    __param(2, INotebookExecutionStateService),
    __metadata("design:paramtypes", [HTMLElement,
        HTMLElement, Object])
], CellProgressBar);
export { CellProgressBar };
function showProgressBar(progressBar) {
    progressBar.infinite().show(500);
}
