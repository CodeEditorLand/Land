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
import * as DOM from '../../../../../../base/browser/dom.js';
import { Codicon } from '../../../../../../base/common/codicons.js';
import { ThemeIcon } from '../../../../../../base/common/themables.js';
import { localize } from '../../../../../../nls.js';
import { FoldingController } from '../../controller/foldingController.js';
import { CellEditState } from '../../notebookBrowser.js';
import { CellContentPart } from '../cellPart.js';
import { executingStateIcon } from '../../notebookIcons.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
import { CellKind, NotebookCellExecutionState } from '../../../common/notebookCommon.js';
import { MutableDisposable } from '../../../../../../base/common/lifecycle.js';
let FoldedCellHint = class FoldedCellHint extends CellContentPart {
    constructor(_notebookEditor, _container, _notebookExecutionStateService) {
        super();
        this._notebookEditor = _notebookEditor;
        this._container = _container;
        this._notebookExecutionStateService = _notebookExecutionStateService;
        this._runButtonListener = this._register(new MutableDisposable());
        this._cellExecutionListener = this._register(new MutableDisposable());
    }
    didRenderCell(element) {
        this.update(element);
    }
    update(element) {
        if (!this._notebookEditor.hasModel()) {
            this._cellExecutionListener.clear();
            this._runButtonListener.clear();
            return;
        }
        if (element.isInputCollapsed || element.getEditState() === CellEditState.Editing) {
            this._cellExecutionListener.clear();
            this._runButtonListener.clear();
            DOM.hide(this._container);
        }
        else if (element.foldingState === 2 /* CellFoldingState.Collapsed */) {
            const idx = this._notebookEditor.getViewModel().getCellIndex(element);
            const length = this._notebookEditor.getViewModel().getFoldedLength(idx);
            const runSectionButton = this.getRunFoldedSectionButton({ start: idx, end: idx + length + 1 });
            if (!runSectionButton) {
                DOM.reset(this._container, this.getHiddenCellsLabel(length), this.getHiddenCellHintButton(element));
            }
            else {
                DOM.reset(this._container, runSectionButton, this.getHiddenCellsLabel(length), this.getHiddenCellHintButton(element));
            }
            DOM.show(this._container);
            const foldHintTop = element.layoutInfo.previewHeight;
            this._container.style.top = `${foldHintTop}px`;
        }
        else {
            this._cellExecutionListener.clear();
            this._runButtonListener.clear();
            DOM.hide(this._container);
        }
    }
    getHiddenCellsLabel(num) {
        const label = num === 1 ?
            localize('hiddenCellsLabel', "1 cell hidden") :
            localize('hiddenCellsLabelPlural', "{0} cells hidden", num);
        return DOM.$('span.notebook-folded-hint-label', undefined, label);
    }
    getHiddenCellHintButton(element) {
        const expandIcon = DOM.$('span.cell-expand-part-button');
        expandIcon.classList.add(...ThemeIcon.asClassNameArray(Codicon.more));
        this._register(DOM.addDisposableListener(expandIcon, DOM.EventType.CLICK, () => {
            const controller = this._notebookEditor.getContribution(FoldingController.id);
            const idx = this._notebookEditor.getCellIndex(element);
            if (typeof idx === 'number') {
                controller.setFoldingStateDown(idx, 1 /* CellFoldingState.Expanded */, 1);
            }
        }));
        return expandIcon;
    }
    getRunFoldedSectionButton(range) {
        const runAllContainer = DOM.$('span.folded-cell-run-section-button');
        const cells = this._notebookEditor.getCellsInRange(range);
        // Check if any cells are code cells, if not, we won't show the run button
        const hasCodeCells = cells.some(cell => cell.cellKind === CellKind.Code);
        if (!hasCodeCells) {
            return undefined;
        }
        const isRunning = cells.some(cell => {
            const cellExecution = this._notebookExecutionStateService.getCellExecution(cell.uri);
            return cellExecution && cellExecution.state === NotebookCellExecutionState.Executing;
        });
        const runAllIcon = isRunning ?
            ThemeIcon.modify(executingStateIcon, 'spin') :
            Codicon.play;
        runAllContainer.classList.add(...ThemeIcon.asClassNameArray(runAllIcon));
        this._runButtonListener.value = DOM.addDisposableListener(runAllContainer, DOM.EventType.CLICK, () => {
            this._notebookEditor.executeNotebookCells(cells);
        });
        this._cellExecutionListener.value = this._notebookExecutionStateService.onDidChangeExecution(() => {
            const isRunning = cells.some(cell => {
                const cellExecution = this._notebookExecutionStateService.getCellExecution(cell.uri);
                return cellExecution && cellExecution.state === NotebookCellExecutionState.Executing;
            });
            const runAllIcon = isRunning ?
                ThemeIcon.modify(executingStateIcon, 'spin') :
                Codicon.play;
            runAllContainer.className = '';
            runAllContainer.classList.add('folded-cell-run-section-button', ...ThemeIcon.asClassNameArray(runAllIcon));
        });
        return runAllContainer;
    }
    updateInternalLayoutNow(element) {
        this.update(element);
    }
};
FoldedCellHint = __decorate([
    __param(2, INotebookExecutionStateService),
    __metadata("design:paramtypes", [Object, HTMLElement, Object])
], FoldedCellHint);
export { FoldedCellHint };
