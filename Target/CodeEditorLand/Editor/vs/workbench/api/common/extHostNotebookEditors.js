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
import { Emitter } from '../../../base/common/event.js';
import { ILogService } from '../../../platform/log/common/log.js';
import { ExtHostNotebookController } from './extHostNotebook.js';
import * as typeConverters from './extHostTypeConverters.js';
let ExtHostNotebookEditors = class ExtHostNotebookEditors {
    constructor(_logService, _notebooksAndEditors) {
        this._logService = _logService;
        this._notebooksAndEditors = _notebooksAndEditors;
        this._onDidChangeNotebookEditorSelection = new Emitter();
        this._onDidChangeNotebookEditorVisibleRanges = new Emitter();
        this.onDidChangeNotebookEditorSelection = this._onDidChangeNotebookEditorSelection.event;
        this.onDidChangeNotebookEditorVisibleRanges = this._onDidChangeNotebookEditorVisibleRanges.event;
    }
    $acceptEditorPropertiesChanged(id, data) {
        this._logService.debug('ExtHostNotebook#$acceptEditorPropertiesChanged', id, data);
        const editor = this._notebooksAndEditors.getEditorById(id);
        if (data.visibleRanges) {
            editor._acceptVisibleRanges(data.visibleRanges.ranges.map(typeConverters.NotebookRange.to));
        }
        if (data.selections) {
            editor._acceptSelections(data.selections.selections.map(typeConverters.NotebookRange.to));
        }
        if (data.visibleRanges) {
            this._onDidChangeNotebookEditorVisibleRanges.fire({
                notebookEditor: editor.apiEditor,
                visibleRanges: editor.apiEditor.visibleRanges
            });
        }
        if (data.selections) {
            this._onDidChangeNotebookEditorSelection.fire(Object.freeze({
                notebookEditor: editor.apiEditor,
                selections: editor.apiEditor.selections
            }));
        }
    }
    $acceptEditorViewColumns(data) {
        for (const id in data) {
            const editor = this._notebooksAndEditors.getEditorById(id);
            editor._acceptViewColumn(typeConverters.ViewColumn.to(data[id]));
        }
    }
};
ExtHostNotebookEditors = __decorate([
    __param(0, ILogService),
    __metadata("design:paramtypes", [Object, ExtHostNotebookController])
], ExtHostNotebookEditors);
export { ExtHostNotebookEditors };
