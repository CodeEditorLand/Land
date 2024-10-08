/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Event, Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { observableFromEvent } from '../../../../base/common/observable.js';
import * as nls from '../../../../nls.js';
import { CellKind, NotebookCellExecutionState } from '../common/notebookCommon.js';
import { NotebookExecutionType } from '../common/notebookExecutionStateService.js';
export class NotebookAccessibilityProvider extends Disposable {
    constructor(notebookExecutionStateService, viewModel, keybindingService, configurationService, isReplHistory) {
        super();
        this.notebookExecutionStateService = notebookExecutionStateService;
        this.viewModel = viewModel;
        this.keybindingService = keybindingService;
        this.configurationService = configurationService;
        this.isReplHistory = isReplHistory;
        this._onDidAriaLabelChange = new Emitter();
        this.onDidAriaLabelChange = this._onDidAriaLabelChange.event;
        this._register(Event.debounce(this.notebookExecutionStateService.onDidChangeExecution, (last, e) => this.mergeEvents(last, e), 100)((cellHandles) => {
            const viewModel = this.viewModel();
            if (viewModel) {
                for (const handle of cellHandles) {
                    const cellModel = viewModel.getCellByHandle(handle);
                    if (cellModel) {
                        this._onDidAriaLabelChange.fire(cellModel);
                    }
                }
            }
        }, this));
    }
    get verbositySettingId() {
        return this.isReplHistory ?
            "accessibility.verbosity.notebook" /* AccessibilityVerbositySettingId.ReplEditor */ :
            "accessibility.verbosity.notebook" /* AccessibilityVerbositySettingId.Notebook */;
    }
    getAriaLabel(element) {
        const event = Event.filter(this.onDidAriaLabelChange, e => e === element);
        return observableFromEvent(this, event, () => {
            const viewModel = this.viewModel();
            if (!viewModel) {
                return '';
            }
            const index = viewModel.getCellIndex(element);
            if (index >= 0) {
                return this.getLabel(index, element);
            }
            return '';
        });
    }
    createItemLabel(executionLabel, index, cellKind) {
        return this.isReplHistory ?
            `item${executionLabel}` :
            `${cellKind === CellKind.Markup ? 'markdown' : 'code'} cell${executionLabel}`;
    }
    getLabel(index, element) {
        const executionState = this.notebookExecutionStateService.getCellExecution(element.uri)?.state;
        const executionLabel = executionState === NotebookCellExecutionState.Executing
            ? ', executing'
            : executionState === NotebookCellExecutionState.Pending
                ? ', pending'
                : '';
        return this.createItemLabel(executionLabel, index, element.cellKind);
    }
    get widgetAriaLabelName() {
        return this.isReplHistory ?
            nls.localize('replHistoryTreeAriaLabel', "REPL Editor History") :
            nls.localize('notebookTreeAriaLabel', "Notebook");
    }
    getWidgetAriaLabel() {
        const keybinding = this.keybindingService.lookupKeybinding("editor.action.accessibilityHelp" /* AccessibilityCommandId.OpenAccessibilityHelp */)?.getLabel();
        if (this.configurationService.getValue(this.verbositySettingId)) {
            return keybinding
                ? nls.localize('notebookTreeAriaLabelHelp', "{0}\nUse {1} for accessibility help", this.widgetAriaLabelName, keybinding)
                : nls.localize('notebookTreeAriaLabelHelpNoKb', "{0}\nRun the Open Accessibility Help command for more information", this.widgetAriaLabelName);
        }
        return this.widgetAriaLabelName;
    }
    mergeEvents(last, e) {
        const viewModel = this.viewModel();
        const result = last || [];
        if (viewModel && e.type === NotebookExecutionType.cell && e.affectsNotebook(viewModel.uri)) {
            if (result.indexOf(e.cellHandle) < 0) {
                result.push(e.cellHandle);
            }
        }
        return result;
    }
}
