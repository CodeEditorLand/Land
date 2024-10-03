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
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { registerWorkbenchContribution2 } from '../../../../../common/contributions.js';
import { CellKind } from '../../../common/notebookCommon.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
import { CellEditState, getNotebookEditorFromEditorPane } from '../../notebookBrowser.js';
import { RedoCommand, UndoCommand } from '../../../../../../editor/browser/editorExtensions.js';
let NotebookUndoRedoContribution = class NotebookUndoRedoContribution extends Disposable {
    static { this.ID = 'workbench.contrib.notebookUndoRedo'; }
    constructor(_editorService) {
        super();
        this._editorService = _editorService;
        const PRIORITY = 105;
        this._register(UndoCommand.addImplementation(PRIORITY, 'notebook-undo-redo', () => {
            const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
            const viewModel = editor?.getViewModel();
            if (editor && editor.hasModel() && viewModel) {
                return viewModel.undo().then(cellResources => {
                    if (cellResources?.length) {
                        for (let i = 0; i < editor.getLength(); i++) {
                            const cell = editor.cellAt(i);
                            if (cell.cellKind === CellKind.Markup && cellResources.find(resource => resource.fragment === cell.model.uri.fragment)) {
                                cell.updateEditState(CellEditState.Editing, 'undo');
                            }
                        }
                        editor?.setOptions({ cellOptions: { resource: cellResources[0] }, preserveFocus: true });
                    }
                });
            }
            return false;
        }));
        this._register(RedoCommand.addImplementation(PRIORITY, 'notebook-undo-redo', () => {
            const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
            const viewModel = editor?.getViewModel();
            if (editor && editor.hasModel() && viewModel) {
                return viewModel.redo().then(cellResources => {
                    if (cellResources?.length) {
                        for (let i = 0; i < editor.getLength(); i++) {
                            const cell = editor.cellAt(i);
                            if (cell.cellKind === CellKind.Markup && cellResources.find(resource => resource.fragment === cell.model.uri.fragment)) {
                                cell.updateEditState(CellEditState.Editing, 'redo');
                            }
                        }
                        editor?.setOptions({ cellOptions: { resource: cellResources[0] }, preserveFocus: true });
                    }
                });
            }
            return false;
        }));
    }
};
NotebookUndoRedoContribution = __decorate([
    __param(0, IEditorService),
    __metadata("design:paramtypes", [Object])
], NotebookUndoRedoContribution);
registerWorkbenchContribution2(NotebookUndoRedoContribution.ID, NotebookUndoRedoContribution, 2);
