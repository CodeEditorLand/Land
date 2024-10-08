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
import * as DOM from '../../../../../base/browser/dom.js';
import { DisposableStore, dispose } from '../../../../../base/common/lifecycle.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { KERNEL_EXTENSIONS } from '../notebookBrowser.js';
import { KERNEL_HAS_VARIABLE_PROVIDER, NOTEBOOK_CELL_TOOLBAR_LOCATION, NOTEBOOK_HAS_OUTPUTS, NOTEBOOK_HAS_RUNNING_CELL, NOTEBOOK_HAS_SOMETHING_RUNNING, NOTEBOOK_INTERRUPTIBLE_KERNEL, NOTEBOOK_KERNEL, NOTEBOOK_KERNEL_COUNT, NOTEBOOK_KERNEL_SELECTED, NOTEBOOK_KERNEL_SOURCE_COUNT, NOTEBOOK_LAST_CELL_FAILED, NOTEBOOK_MISSING_KERNEL_EXTENSION, NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON, NOTEBOOK_VIEW_TYPE } from '../../common/notebookContextKeys.js';
import { INotebookExecutionStateService, NotebookExecutionType } from '../../common/notebookExecutionStateService.js';
import { INotebookKernelService } from '../../common/notebookKernelService.js';
import { IExtensionService } from '../../../../services/extensions/common/extensions.js';
let NotebookEditorContextKeys = class NotebookEditorContextKeys {
    constructor(_editor, _notebookKernelService, contextKeyService, _extensionService, _notebookExecutionStateService) {
        this._editor = _editor;
        this._notebookKernelService = _notebookKernelService;
        this._extensionService = _extensionService;
        this._notebookExecutionStateService = _notebookExecutionStateService;
        this._disposables = new DisposableStore();
        this._viewModelDisposables = new DisposableStore();
        this._cellOutputsListeners = [];
        this._selectedKernelDisposables = new DisposableStore();
        this._notebookKernel = NOTEBOOK_KERNEL.bindTo(contextKeyService);
        this._notebookKernelCount = NOTEBOOK_KERNEL_COUNT.bindTo(contextKeyService);
        this._notebookKernelSelected = NOTEBOOK_KERNEL_SELECTED.bindTo(contextKeyService);
        this._interruptibleKernel = NOTEBOOK_INTERRUPTIBLE_KERNEL.bindTo(contextKeyService);
        this._hasVariableProvider = KERNEL_HAS_VARIABLE_PROVIDER.bindTo(contextKeyService);
        this._someCellRunning = NOTEBOOK_HAS_RUNNING_CELL.bindTo(contextKeyService);
        this._kernelRunning = NOTEBOOK_HAS_SOMETHING_RUNNING.bindTo(contextKeyService);
        this._useConsolidatedOutputButton = NOTEBOOK_USE_CONSOLIDATED_OUTPUT_BUTTON.bindTo(contextKeyService);
        this._hasOutputs = NOTEBOOK_HAS_OUTPUTS.bindTo(contextKeyService);
        this._viewType = NOTEBOOK_VIEW_TYPE.bindTo(contextKeyService);
        this._missingKernelExtension = NOTEBOOK_MISSING_KERNEL_EXTENSION.bindTo(contextKeyService);
        this._notebookKernelSourceCount = NOTEBOOK_KERNEL_SOURCE_COUNT.bindTo(contextKeyService);
        this._cellToolbarLocation = NOTEBOOK_CELL_TOOLBAR_LOCATION.bindTo(contextKeyService);
        this._lastCellFailed = NOTEBOOK_LAST_CELL_FAILED.bindTo(contextKeyService);
        this._handleDidChangeModel();
        this._updateForNotebookOptions();
        this._disposables.add(_editor.onDidChangeModel(this._handleDidChangeModel, this));
        this._disposables.add(_notebookKernelService.onDidAddKernel(this._updateKernelContext, this));
        this._disposables.add(_notebookKernelService.onDidChangeSelectedNotebooks(this._updateKernelContext, this));
        this._disposables.add(_notebookKernelService.onDidChangeSourceActions(this._updateKernelContext, this));
        this._disposables.add(_editor.notebookOptions.onDidChangeOptions(this._updateForNotebookOptions, this));
        this._disposables.add(_extensionService.onDidChangeExtensions(this._updateForInstalledExtension, this));
        this._disposables.add(_notebookExecutionStateService.onDidChangeExecution(this._updateForExecution, this));
        this._disposables.add(_notebookExecutionStateService.onDidChangeLastRunFailState(this._updateForLastRunFailState, this));
    }
    dispose() {
        this._disposables.dispose();
        this._viewModelDisposables.dispose();
        this._notebookKernelCount.reset();
        this._notebookKernelSourceCount.reset();
        this._interruptibleKernel.reset();
        this._hasVariableProvider.reset();
        this._someCellRunning.reset();
        this._kernelRunning.reset();
        this._viewType.reset();
        dispose(this._cellOutputsListeners);
        this._cellOutputsListeners.length = 0;
    }
    _handleDidChangeModel() {
        this._updateKernelContext();
        this._updateForNotebookOptions();
        this._viewModelDisposables.clear();
        dispose(this._cellOutputsListeners);
        this._cellOutputsListeners.length = 0;
        if (!this._editor.hasModel()) {
            return;
        }
        const recomputeOutputsExistence = () => {
            let hasOutputs = false;
            if (this._editor.hasModel()) {
                for (let i = 0; i < this._editor.getLength(); i++) {
                    if (this._editor.cellAt(i).outputsViewModels.length > 0) {
                        hasOutputs = true;
                        break;
                    }
                }
            }
            this._hasOutputs.set(hasOutputs);
        };
        const layoutDisposable = this._viewModelDisposables.add(new DisposableStore());
        const addCellOutputsListener = (c) => {
            return c.model.onDidChangeOutputs(() => {
                layoutDisposable.clear();
                layoutDisposable.add(DOM.scheduleAtNextAnimationFrame(DOM.getWindow(this._editor.getDomNode()), () => {
                    recomputeOutputsExistence();
                }));
            });
        };
        for (let i = 0; i < this._editor.getLength(); i++) {
            const cell = this._editor.cellAt(i);
            this._cellOutputsListeners.push(addCellOutputsListener(cell));
        }
        recomputeOutputsExistence();
        this._updateForInstalledExtension();
        this._viewModelDisposables.add(this._editor.onDidChangeViewCells(e => {
            [...e.splices].reverse().forEach(splice => {
                const [start, deleted, newCells] = splice;
                const deletedCellOutputStates = this._cellOutputsListeners.splice(start, deleted, ...newCells.map(addCellOutputsListener));
                dispose(deletedCellOutputStates);
            });
        }));
        this._viewType.set(this._editor.textModel.viewType);
    }
    _updateForExecution(e) {
        if (this._editor.textModel) {
            const notebookExe = this._notebookExecutionStateService.getExecution(this._editor.textModel.uri);
            const notebookCellExe = this._notebookExecutionStateService.getCellExecutionsForNotebook(this._editor.textModel.uri);
            this._kernelRunning.set(notebookCellExe.length > 0 || !!notebookExe);
            if (e.type === NotebookExecutionType.cell) {
                this._someCellRunning.set(notebookCellExe.length > 0);
            }
        }
        else {
            this._kernelRunning.set(false);
            if (e.type === NotebookExecutionType.cell) {
                this._someCellRunning.set(false);
            }
        }
    }
    _updateForLastRunFailState(e) {
        if (e.notebook === this._editor.textModel?.uri) {
            this._lastCellFailed.set(e.visible);
        }
    }
    async _updateForInstalledExtension() {
        if (!this._editor.hasModel()) {
            return;
        }
        const viewType = this._editor.textModel.viewType;
        const kernelExtensionId = KERNEL_EXTENSIONS.get(viewType);
        this._missingKernelExtension.set(!!kernelExtensionId && !(await this._extensionService.getExtension(kernelExtensionId)));
    }
    _updateKernelContext() {
        if (!this._editor.hasModel()) {
            this._notebookKernelCount.reset();
            this._notebookKernelSourceCount.reset();
            this._interruptibleKernel.reset();
            this._hasVariableProvider.reset();
            return;
        }
        const { selected, all } = this._notebookKernelService.getMatchingKernel(this._editor.textModel);
        const sourceActions = this._notebookKernelService.getSourceActions(this._editor.textModel, this._editor.scopedContextKeyService);
        this._notebookKernelCount.set(all.length);
        this._notebookKernelSourceCount.set(sourceActions.length);
        this._interruptibleKernel.set(selected?.implementsInterrupt ?? false);
        this._hasVariableProvider.set(selected?.hasVariableProvider ?? false);
        this._notebookKernelSelected.set(Boolean(selected));
        this._notebookKernel.set(selected?.id ?? '');
        this._selectedKernelDisposables.clear();
        if (selected) {
            this._selectedKernelDisposables.add(selected.onDidChange(() => {
                this._interruptibleKernel.set(selected?.implementsInterrupt ?? false);
            }));
        }
    }
    _updateForNotebookOptions() {
        const layout = this._editor.notebookOptions.getDisplayOptions();
        this._useConsolidatedOutputButton.set(layout.consolidatedOutputButton);
        this._cellToolbarLocation.set(this._editor.notebookOptions.computeCellToolbarLocation(this._editor.textModel?.viewType));
    }
};
NotebookEditorContextKeys = __decorate([
    __param(1, INotebookKernelService),
    __param(2, IContextKeyService),
    __param(3, IExtensionService),
    __param(4, INotebookExecutionStateService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object])
], NotebookEditorContextKeys);
export { NotebookEditorContextKeys };
