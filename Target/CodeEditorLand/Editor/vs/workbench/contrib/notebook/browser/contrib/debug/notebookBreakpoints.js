/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
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
import { ResourceMap } from '../../../../../../base/common/map.js';
import { Schemas } from '../../../../../../base/common/network.js';
import { isEqual } from '../../../../../../base/common/resources.js';
import { Registry } from '../../../../../../platform/registry/common/platform.js';
import { Extensions as WorkbenchExtensions } from '../../../../../common/contributions.js';
import { IDebugService } from '../../../../debug/common/debug.js';
import { getNotebookEditorFromEditorPane } from '../../notebookBrowser.js';
import { CellUri, NotebookCellsChangeType } from '../../../common/notebookCommon.js';
import { INotebookService } from '../../../common/notebookService.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
let NotebookBreakpoints = class NotebookBreakpoints extends Disposable {
    constructor(_debugService, _notebookService, _editorService) {
        super();
        this._debugService = _debugService;
        this._editorService = _editorService;
        const listeners = new ResourceMap();
        this._register(_notebookService.onWillAddNotebookDocument(model => {
            listeners.set(model.uri, model.onWillAddRemoveCells(e => {
                // When deleting a cell, remove its breakpoints
                const debugModel = this._debugService.getModel();
                if (!debugModel.getBreakpoints().length) {
                    return;
                }
                if (e.rawEvent.kind !== NotebookCellsChangeType.ModelChange) {
                    return;
                }
                for (const change of e.rawEvent.changes) {
                    const [start, deleteCount] = change;
                    if (deleteCount > 0) {
                        const deleted = model.cells.slice(start, start + deleteCount);
                        for (const deletedCell of deleted) {
                            const cellBps = debugModel.getBreakpoints({ uri: deletedCell.uri });
                            cellBps.forEach(cellBp => this._debugService.removeBreakpoints(cellBp.getId()));
                        }
                    }
                }
            }));
        }));
        this._register(_notebookService.onWillRemoveNotebookDocument(model => {
            this.updateBreakpoints(model);
            listeners.get(model.uri)?.dispose();
            listeners.delete(model.uri);
        }));
        this._register(this._debugService.getModel().onDidChangeBreakpoints(e => {
            const newCellBp = e?.added?.find(bp => 'uri' in bp && bp.uri.scheme === Schemas.vscodeNotebookCell);
            if (newCellBp) {
                const parsed = CellUri.parse(newCellBp.uri);
                if (!parsed) {
                    return;
                }
                const editor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
                if (!editor || !editor.hasModel() || editor.textModel.uri.toString() !== parsed.notebook.toString()) {
                    return;
                }
                const cell = editor.getCellByHandle(parsed.handle);
                if (!cell) {
                    return;
                }
                editor.focusElement(cell);
            }
        }));
    }
    updateBreakpoints(model) {
        const bps = this._debugService.getModel().getBreakpoints();
        if (!bps.length || !model.cells.length) {
            return;
        }
        const idxMap = new ResourceMap();
        model.cells.forEach((cell, i) => {
            idxMap.set(cell.uri, i);
        });
        bps.forEach(bp => {
            const idx = idxMap.get(bp.uri);
            if (typeof idx !== 'number') {
                return;
            }
            const notebook = CellUri.parse(bp.uri)?.notebook;
            if (!notebook) {
                return;
            }
            const newUri = CellUri.generate(notebook, idx);
            if (isEqual(newUri, bp.uri)) {
                return;
            }
            this._debugService.removeBreakpoints(bp.getId());
            this._debugService.addBreakpoints(newUri, [
                {
                    column: bp.column,
                    condition: bp.condition,
                    enabled: bp.enabled,
                    hitCondition: bp.hitCondition,
                    logMessage: bp.logMessage,
                    lineNumber: bp.lineNumber
                }
            ]);
        });
    }
};
NotebookBreakpoints = __decorate([
    __param(0, IDebugService),
    __param(1, INotebookService),
    __param(2, IEditorService),
    __metadata("design:paramtypes", [Object, Object, Object])
], NotebookBreakpoints);
Registry.as(WorkbenchExtensions.Workbench).registerWorkbenchContribution(NotebookBreakpoints, 3 /* LifecyclePhase.Restored */);
