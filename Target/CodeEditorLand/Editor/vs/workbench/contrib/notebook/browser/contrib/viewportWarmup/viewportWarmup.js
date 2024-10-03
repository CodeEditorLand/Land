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
import { IAccessibilityService } from '../../../../../../platform/accessibility/common/accessibility.js';
import { CellEditState } from '../../notebookBrowser.js';
import { registerNotebookContribution } from '../../notebookEditorExtensions.js';
import { outputDisplayLimit } from '../../viewModel/codeCellViewModel.js';
import { CellKind } from '../../../common/notebookCommon.js';
import { cellRangesToIndexes } from '../../../common/notebookRange.js';
import { INotebookService } from '../../../common/notebookService.js';
let NotebookViewportContribution = class NotebookViewportContribution extends Disposable {
    static { this.id = 'workbench.notebook.viewportWarmup'; }
    constructor(_notebookEditor, _notebookService, accessibilityService) {
        super();
        this._notebookEditor = _notebookEditor;
        this._notebookService = _notebookService;
        this._warmupDocument = null;
        this._warmupViewport = new RunOnceScheduler(() => this._warmupViewportNow(), 200);
        this._register(this._warmupViewport);
        this._register(this._notebookEditor.onDidScroll(() => {
            this._warmupViewport.schedule();
        }));
        this._warmupDocument = new RunOnceScheduler(() => this._warmupDocumentNow(), 200);
        this._register(this._warmupDocument);
        this._register(this._notebookEditor.onDidAttachViewModel(() => {
            if (this._notebookEditor.hasModel()) {
                this._warmupDocument?.schedule();
            }
        }));
        if (this._notebookEditor.hasModel()) {
            this._warmupDocument?.schedule();
        }
    }
    _warmupDocumentNow() {
        if (this._notebookEditor.hasModel()) {
            for (let i = 0; i < this._notebookEditor.getLength(); i++) {
                const cell = this._notebookEditor.cellAt(i);
                if (cell?.cellKind === CellKind.Markup && cell?.getEditState() === CellEditState.Preview && !cell.isInputCollapsed) {
                }
                else if (cell?.cellKind === CellKind.Code) {
                    this._warmupCodeCell(cell);
                }
            }
        }
    }
    _warmupViewportNow() {
        if (this._notebookEditor.isDisposed) {
            return;
        }
        if (!this._notebookEditor.hasModel()) {
            return;
        }
        const visibleRanges = this._notebookEditor.getVisibleRangesPlusViewportAboveAndBelow();
        cellRangesToIndexes(visibleRanges).forEach(index => {
            const cell = this._notebookEditor.cellAt(index);
            if (cell?.cellKind === CellKind.Markup && cell?.getEditState() === CellEditState.Preview && !cell.isInputCollapsed) {
                this._notebookEditor.createMarkupPreview(cell);
            }
            else if (cell?.cellKind === CellKind.Code) {
                this._warmupCodeCell(cell);
            }
        });
    }
    _warmupCodeCell(viewCell) {
        if (viewCell.isOutputCollapsed) {
            return;
        }
        const outputs = viewCell.outputsViewModels;
        for (const output of outputs.slice(0, outputDisplayLimit)) {
            const [mimeTypes, pick] = output.resolveMimeTypes(this._notebookEditor.textModel, undefined);
            if (!mimeTypes.find(mimeType => mimeType.isTrusted) || mimeTypes.length === 0) {
                continue;
            }
            const pickedMimeTypeRenderer = mimeTypes[pick];
            if (!pickedMimeTypeRenderer) {
                return;
            }
            if (!this._notebookEditor.hasModel()) {
                return;
            }
            const renderer = this._notebookService.getRendererInfo(pickedMimeTypeRenderer.rendererId);
            if (!renderer) {
                return;
            }
            const result = { type: 1, renderer, source: output, mimeType: pickedMimeTypeRenderer.mimeType };
            this._notebookEditor.createOutput(viewCell, result, 0, true);
        }
    }
};
NotebookViewportContribution = __decorate([
    __param(1, INotebookService),
    __param(2, IAccessibilityService),
    __metadata("design:paramtypes", [Object, Object, Object])
], NotebookViewportContribution);
registerNotebookContribution(NotebookViewportContribution.id, NotebookViewportContribution);
