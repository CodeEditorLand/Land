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
import { disposableTimeout } from '../../../../../../base/common/async.js';
import { DisposableStore } from '../../../../../../base/common/lifecycle.js';
import { clamp } from '../../../../../../base/common/numbers.js';
import { CellContentPart } from '../cellPart.js';
import { CodeCellViewModel } from '../../viewModel/codeCellViewModel.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
const UPDATE_EXECUTION_ORDER_GRACE_PERIOD = 200;
let CellExecutionPart = class CellExecutionPart extends CellContentPart {
    constructor(_notebookEditor, _executionOrderLabel, _notebookExecutionStateService) {
        super();
        this._notebookEditor = _notebookEditor;
        this._executionOrderLabel = _executionOrderLabel;
        this._notebookExecutionStateService = _notebookExecutionStateService;
        this.kernelDisposables = this._register(new DisposableStore());
        this._register(this._notebookEditor.onDidChangeActiveKernel(() => {
            if (this.currentCell) {
                this.kernelDisposables.clear();
                if (this._notebookEditor.activeKernel) {
                    this.kernelDisposables.add(this._notebookEditor.activeKernel.onDidChange(() => {
                        if (this.currentCell) {
                            this.updateExecutionOrder(this.currentCell.internalMetadata);
                        }
                    }));
                }
                this.updateExecutionOrder(this.currentCell.internalMetadata);
            }
        }));
        this._register(this._notebookEditor.onDidScroll(() => {
            this._updatePosition();
        }));
    }
    didRenderCell(element) {
        this.updateExecutionOrder(element.internalMetadata, true);
    }
    updateExecutionOrder(internalMetadata, forceClear = false) {
        if (this._notebookEditor.activeKernel?.implementsExecutionOrder || (!this._notebookEditor.activeKernel && typeof internalMetadata.executionOrder === 'number')) {
            // If the executionOrder was just cleared, and the cell is executing, wait just a bit before clearing the view to avoid flashing
            if (typeof internalMetadata.executionOrder !== 'number' && !forceClear && !!this._notebookExecutionStateService.getCellExecution(this.currentCell.uri)) {
                const renderingCell = this.currentCell;
                disposableTimeout(() => {
                    if (this.currentCell === renderingCell) {
                        this.updateExecutionOrder(this.currentCell.internalMetadata, true);
                    }
                }, UPDATE_EXECUTION_ORDER_GRACE_PERIOD, this.cellDisposables);
                return;
            }
            const executionOrderLabel = typeof internalMetadata.executionOrder === 'number' ?
                `[${internalMetadata.executionOrder}]` :
                '[ ]';
            this._executionOrderLabel.innerText = executionOrderLabel;
        }
        else {
            this._executionOrderLabel.innerText = '';
        }
    }
    updateState(element, e) {
        if (e.internalMetadataChanged) {
            this.updateExecutionOrder(element.internalMetadata);
        }
    }
    updateInternalLayoutNow(element) {
        this._updatePosition();
    }
    _updatePosition() {
        if (this.currentCell) {
            if (this.currentCell.isInputCollapsed) {
                DOM.hide(this._executionOrderLabel);
            }
            else {
                DOM.show(this._executionOrderLabel);
                let top = this.currentCell.layoutInfo.editorHeight - 22 + this.currentCell.layoutInfo.statusBarHeight;
                if (this.currentCell instanceof CodeCellViewModel) {
                    const elementTop = this._notebookEditor.getAbsoluteTopOfElement(this.currentCell);
                    const editorBottom = elementTop + this.currentCell.layoutInfo.outputContainerOffset;
                    // another approach to avoid the flicker caused by sticky scroll is manually calculate the scrollBottom:
                    // const scrollBottom = this._notebookEditor.scrollTop + this._notebookEditor.getLayoutInfo().height - 26 - this._notebookEditor.getLayoutInfo().stickyHeight;
                    const scrollBottom = this._notebookEditor.scrollBottom;
                    const lineHeight = 22;
                    if (scrollBottom <= editorBottom) {
                        const offset = editorBottom - scrollBottom;
                        top -= offset;
                        top = clamp(top, lineHeight + 12, // line height + padding for single line
                        this.currentCell.layoutInfo.editorHeight - lineHeight + this.currentCell.layoutInfo.statusBarHeight);
                    }
                }
                this._executionOrderLabel.style.top = `${top}px`;
            }
        }
    }
};
CellExecutionPart = __decorate([
    __param(2, INotebookExecutionStateService),
    __metadata("design:paramtypes", [Object, HTMLElement, Object])
], CellExecutionPart);
export { CellExecutionPart };
