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
import * as nls from '../../../../../../nls.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../../../base/common/lifecycle.js';
import { Schemas } from '../../../../../../base/common/network.js';
import { ILanguageFeaturesService } from '../../../../../../editor/common/services/languageFeatures.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { ILogService } from '../../../../../../platform/log/common/log.js';
import { registerWorkbenchContribution2 } from '../../../../../common/contributions.js';
import { CENTER_ACTIVE_CELL } from '../navigation/arrow.js';
import { SELECT_KERNEL_ID } from '../../controller/coreActions.js';
import { SELECT_NOTEBOOK_INDENTATION_ID } from '../../controller/editActions.js';
import { getNotebookEditorFromEditorPane } from '../../notebookBrowser.js';
import { NotebookTextModel } from '../../../common/model/notebookTextModel.js';
import { NotebookCellsChangeType } from '../../../common/notebookCommon.js';
import { INotebookKernelService } from '../../../common/notebookKernelService.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
import { IStatusbarService } from '../../../../../services/statusbar/browser/statusbar.js';
import { IEditorGroupsService } from '../../../../../services/editor/common/editorGroupsService.js';
import { Event } from '../../../../../../base/common/event.js';
let ImplictKernelSelector = class ImplictKernelSelector {
    constructor(notebook, suggested, notebookKernelService, languageFeaturesService, logService) {
        const disposables = new DisposableStore();
        this.dispose = disposables.dispose.bind(disposables);
        const selectKernel = () => {
            disposables.clear();
            notebookKernelService.selectKernelForNotebook(suggested, notebook);
        };
        // IMPLICITLY select a suggested kernel when the notebook has been changed
        // e.g change cell source, move cells, etc
        disposables.add(notebook.onDidChangeContent(e => {
            for (const event of e.rawEvents) {
                switch (event.kind) {
                    case NotebookCellsChangeType.ChangeCellContent:
                    case NotebookCellsChangeType.ModelChange:
                    case NotebookCellsChangeType.Move:
                    case NotebookCellsChangeType.ChangeCellLanguage:
                        logService.trace('IMPLICIT kernel selection because of change event', event.kind);
                        selectKernel();
                        break;
                }
            }
        }));
        // IMPLICITLY select a suggested kernel when users start to hover. This should
        // be a strong enough hint that the user wants to interact with the notebook. Maybe
        // add more triggers like goto-providers or completion-providers
        disposables.add(languageFeaturesService.hoverProvider.register({ scheme: Schemas.vscodeNotebookCell, pattern: notebook.uri.path }, {
            provideHover() {
                logService.trace('IMPLICIT kernel selection because of hover');
                selectKernel();
                return undefined;
            }
        }));
    }
};
ImplictKernelSelector = __decorate([
    __param(2, INotebookKernelService),
    __param(3, ILanguageFeaturesService),
    __param(4, ILogService),
    __metadata("design:paramtypes", [NotebookTextModel, Object, Object, Object, Object])
], ImplictKernelSelector);
let KernelStatus = class KernelStatus extends Disposable {
    constructor(_editorService, _statusbarService, _notebookKernelService, _instantiationService) {
        super();
        this._editorService = _editorService;
        this._statusbarService = _statusbarService;
        this._notebookKernelService = _notebookKernelService;
        this._instantiationService = _instantiationService;
        this._editorDisposables = this._register(new DisposableStore());
        this._kernelInfoElement = this._register(new DisposableStore());
        this._register(this._editorService.onDidActiveEditorChange(() => this._updateStatusbar()));
    }
    _updateStatusbar() {
        this._editorDisposables.clear();
        const activeEditor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
        if (!activeEditor) {
            // not a notebook -> clean-up, done
            this._kernelInfoElement.clear();
            return;
        }
        const updateStatus = () => {
            if (activeEditor.notebookOptions.getDisplayOptions().globalToolbar) {
                // kernel info rendered in the notebook toolbar already
                this._kernelInfoElement.clear();
                return;
            }
            const notebook = activeEditor.textModel;
            if (notebook) {
                this._showKernelStatus(notebook);
            }
            else {
                this._kernelInfoElement.clear();
            }
        };
        this._editorDisposables.add(this._notebookKernelService.onDidAddKernel(updateStatus));
        this._editorDisposables.add(this._notebookKernelService.onDidChangeSelectedNotebooks(updateStatus));
        this._editorDisposables.add(this._notebookKernelService.onDidChangeNotebookAffinity(updateStatus));
        this._editorDisposables.add(activeEditor.onDidChangeModel(updateStatus));
        this._editorDisposables.add(activeEditor.notebookOptions.onDidChangeOptions(updateStatus));
        updateStatus();
    }
    _showKernelStatus(notebook) {
        this._kernelInfoElement.clear();
        const { selected, suggestions, all } = this._notebookKernelService.getMatchingKernel(notebook);
        const suggested = (suggestions.length === 1 ? suggestions[0] : undefined)
            ?? (all.length === 1) ? all[0] : undefined;
        let isSuggested = false;
        if (all.length === 0) {
            // no kernel -> no status
            return;
        }
        else if (selected || suggested) {
            // selected or single kernel
            let kernel = selected;
            if (!kernel) {
                // proceed with suggested kernel - show UI and install handler that selects the kernel
                // when non trivial interactions with the notebook happen.
                kernel = suggested;
                isSuggested = true;
                this._kernelInfoElement.add(this._instantiationService.createInstance(ImplictKernelSelector, notebook, kernel));
            }
            const tooltip = kernel.description ?? kernel.detail ?? kernel.label;
            this._kernelInfoElement.add(this._statusbarService.addEntry({
                name: nls.localize('notebook.info', "Notebook Kernel Info"),
                text: `$(notebook-kernel-select) ${kernel.label}`,
                ariaLabel: kernel.label,
                tooltip: isSuggested ? nls.localize('tooltop', "{0} (suggestion)", tooltip) : tooltip,
                command: SELECT_KERNEL_ID,
            }, SELECT_KERNEL_ID, 1 /* StatusbarAlignment.RIGHT */, 10));
            this._kernelInfoElement.add(kernel.onDidChange(() => this._showKernelStatus(notebook)));
        }
        else {
            // multiple kernels -> show selection hint
            this._kernelInfoElement.add(this._statusbarService.addEntry({
                name: nls.localize('notebook.select', "Notebook Kernel Selection"),
                text: nls.localize('kernel.select.label', "Select Kernel"),
                ariaLabel: nls.localize('kernel.select.label', "Select Kernel"),
                command: SELECT_KERNEL_ID,
                kind: 'prominent'
            }, SELECT_KERNEL_ID, 1 /* StatusbarAlignment.RIGHT */, 10));
        }
    }
};
KernelStatus = __decorate([
    __param(0, IEditorService),
    __param(1, IStatusbarService),
    __param(2, INotebookKernelService),
    __param(3, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], KernelStatus);
export { KernelStatus };
let ActiveCellStatus = class ActiveCellStatus extends Disposable {
    constructor(_editorService, _statusbarService) {
        super();
        this._editorService = _editorService;
        this._statusbarService = _statusbarService;
        this._itemDisposables = this._register(new DisposableStore());
        this._accessor = this._register(new MutableDisposable());
        this._register(this._editorService.onDidActiveEditorChange(() => this._update()));
    }
    _update() {
        this._itemDisposables.clear();
        const activeEditor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
        if (activeEditor) {
            this._itemDisposables.add(activeEditor.onDidChangeSelection(() => this._show(activeEditor)));
            this._itemDisposables.add(activeEditor.onDidChangeActiveCell(() => this._show(activeEditor)));
            this._show(activeEditor);
        }
        else {
            this._accessor.clear();
        }
    }
    _show(editor) {
        if (!editor.hasModel()) {
            this._accessor.clear();
            return;
        }
        const newText = this._getSelectionsText(editor);
        if (!newText) {
            this._accessor.clear();
            return;
        }
        const entry = {
            name: nls.localize('notebook.activeCellStatusName', "Notebook Editor Selections"),
            text: newText,
            ariaLabel: newText,
            command: CENTER_ACTIVE_CELL
        };
        if (!this._accessor.value) {
            this._accessor.value = this._statusbarService.addEntry(entry, 'notebook.activeCellStatus', 1 /* StatusbarAlignment.RIGHT */, 100);
        }
        else {
            this._accessor.value.update(entry);
        }
    }
    _getSelectionsText(editor) {
        if (!editor.hasModel()) {
            return undefined;
        }
        const activeCell = editor.getActiveCell();
        if (!activeCell) {
            return undefined;
        }
        const idxFocused = editor.getCellIndex(activeCell) + 1;
        const numSelected = editor.getSelections().reduce((prev, range) => prev + (range.end - range.start), 0);
        const totalCells = editor.getLength();
        return numSelected > 1 ?
            nls.localize('notebook.multiActiveCellIndicator', "Cell {0} ({1} selected)", idxFocused, numSelected) :
            nls.localize('notebook.singleActiveCellIndicator', "Cell {0} of {1}", idxFocused, totalCells);
    }
};
ActiveCellStatus = __decorate([
    __param(0, IEditorService),
    __param(1, IStatusbarService),
    __metadata("design:paramtypes", [Object, Object])
], ActiveCellStatus);
export { ActiveCellStatus };
let NotebookIndentationStatus = class NotebookIndentationStatus extends Disposable {
    static { this.ID = 'selectNotebookIndentation'; }
    constructor(_editorService, _statusbarService, _configurationService) {
        super();
        this._editorService = _editorService;
        this._statusbarService = _statusbarService;
        this._configurationService = _configurationService;
        this._itemDisposables = this._register(new DisposableStore());
        this._accessor = this._register(new MutableDisposable());
        this._register(this._editorService.onDidActiveEditorChange(() => this._update()));
        this._register(this._configurationService.onDidChangeConfiguration(e => {
            if (e.affectsConfiguration('editor') || e.affectsConfiguration('notebook')) {
                this._update();
            }
        }));
    }
    _update() {
        this._itemDisposables.clear();
        const activeEditor = getNotebookEditorFromEditorPane(this._editorService.activeEditorPane);
        if (activeEditor) {
            this._show(activeEditor);
            this._itemDisposables.add(activeEditor.onDidChangeSelection(() => {
                this._accessor.clear();
                this._show(activeEditor);
            }));
        }
        else {
            this._accessor.clear();
        }
    }
    _show(editor) {
        if (!editor.hasModel()) {
            this._accessor.clear();
            return;
        }
        const cellOptions = editor.getActiveCell()?.textModel?.getOptions();
        if (!cellOptions) {
            this._accessor.clear();
            return;
        }
        const cellEditorOverridesRaw = editor.notebookOptions.getDisplayOptions().editorOptionsCustomizations;
        const indentSize = cellEditorOverridesRaw?.['editor.indentSize'] ?? cellOptions?.indentSize;
        const insertSpaces = cellEditorOverridesRaw?.['editor.insertSpaces'] ?? cellOptions?.insertSpaces;
        const tabSize = cellEditorOverridesRaw?.['editor.tabSize'] ?? cellOptions?.tabSize;
        const width = typeof indentSize === 'number' ? indentSize : tabSize;
        const message = insertSpaces ? `Spaces: ${width}` : `Tab Size: ${width}`;
        const newText = message;
        if (!newText) {
            this._accessor.clear();
            return;
        }
        const entry = {
            name: nls.localize('notebook.indentation', "Notebook Indentation"),
            text: newText,
            ariaLabel: newText,
            tooltip: nls.localize('selectNotebookIndentation', "Select Indentation"),
            command: SELECT_NOTEBOOK_INDENTATION_ID
        };
        if (!this._accessor.value) {
            this._accessor.value = this._statusbarService.addEntry(entry, 'notebook.status.indentation', 1 /* StatusbarAlignment.RIGHT */, 100.4);
        }
        else {
            this._accessor.value.update(entry);
        }
    }
};
NotebookIndentationStatus = __decorate([
    __param(0, IEditorService),
    __param(1, IStatusbarService),
    __param(2, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], NotebookIndentationStatus);
export { NotebookIndentationStatus };
let NotebookEditorStatusContribution = class NotebookEditorStatusContribution extends Disposable {
    static { this.ID = 'notebook.contrib.editorStatus'; }
    constructor(editorGroupService) {
        super();
        this.editorGroupService = editorGroupService;
        for (const part of editorGroupService.parts) {
            this.createNotebookStatus(part);
        }
        this._register(editorGroupService.onDidCreateAuxiliaryEditorPart(part => this.createNotebookStatus(part)));
    }
    createNotebookStatus(part) {
        const disposables = new DisposableStore();
        Event.once(part.onWillDispose)(() => disposables.dispose());
        const scopedInstantiationService = this.editorGroupService.getScopedInstantiationService(part);
        disposables.add(scopedInstantiationService.createInstance(KernelStatus));
        disposables.add(scopedInstantiationService.createInstance(ActiveCellStatus));
        disposables.add(scopedInstantiationService.createInstance(NotebookIndentationStatus));
    }
};
NotebookEditorStatusContribution = __decorate([
    __param(0, IEditorGroupsService),
    __metadata("design:paramtypes", [Object])
], NotebookEditorStatusContribution);
export { NotebookEditorStatusContribution };
registerWorkbenchContribution2(NotebookEditorStatusContribution.ID, NotebookEditorStatusContribution, 3 /* WorkbenchPhase.AfterRestored */);
