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
import { renderLabelWithIcons } from '../../../../../../base/browser/ui/iconLabel/iconLabels.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { localize } from '../../../../../../nls.js';
import { ThemeIcon } from '../../../../../../base/common/themables.js';
import { errorStateIcon, executingStateIcon, pendingStateIcon, successStateIcon } from '../../notebookIcons.js';
import { NotebookCellExecutionState } from '../../../common/notebookCommon.js';
import { INotebookExecutionStateService, NotebookExecutionType } from '../../../common/notebookExecutionStateService.js';
let CollapsedCodeCellExecutionIcon = class CollapsedCodeCellExecutionIcon extends Disposable {
    constructor(_notebookEditor, _cell, _element, _executionStateService) {
        super();
        this._cell = _cell;
        this._element = _element;
        this._executionStateService = _executionStateService;
        this._visible = false;
        this._update();
        this._register(this._executionStateService.onDidChangeExecution(e => {
            if (e.type === NotebookExecutionType.cell && e.affectsCell(this._cell.uri)) {
                this._update();
            }
        }));
        this._register(this._cell.model.onDidChangeInternalMetadata(() => this._update()));
    }
    setVisibility(visible) {
        this._visible = visible;
        this._update();
    }
    _update() {
        if (!this._visible) {
            return;
        }
        const runState = this._executionStateService.getCellExecution(this._cell.uri);
        const item = this._getItemForState(runState, this._cell.model.internalMetadata);
        if (item) {
            this._element.style.display = '';
            DOM.reset(this._element, ...renderLabelWithIcons(item.text));
            this._element.title = item.tooltip ?? '';
        }
        else {
            this._element.style.display = 'none';
            DOM.reset(this._element);
        }
    }
    _getItemForState(runState, internalMetadata) {
        const state = runState?.state;
        const { lastRunSuccess } = internalMetadata;
        if (!state && lastRunSuccess) {
            return {
                text: `$(${successStateIcon.id})`,
                tooltip: localize('notebook.cell.status.success', "Success"),
            };
        }
        else if (!state && lastRunSuccess === false) {
            return {
                text: `$(${errorStateIcon.id})`,
                tooltip: localize('notebook.cell.status.failure', "Failure"),
            };
        }
        else if (state === NotebookCellExecutionState.Pending || state === NotebookCellExecutionState.Unconfirmed) {
            return {
                text: `$(${pendingStateIcon.id})`,
                tooltip: localize('notebook.cell.status.pending', "Pending"),
            };
        }
        else if (state === NotebookCellExecutionState.Executing) {
            const icon = ThemeIcon.modify(executingStateIcon, 'spin');
            return {
                text: `$(${icon.id})`,
                tooltip: localize('notebook.cell.status.executing', "Executing"),
            };
        }
        return;
    }
};
CollapsedCodeCellExecutionIcon = __decorate([
    __param(3, INotebookExecutionStateService),
    __metadata("design:paramtypes", [Object, Object, HTMLElement, Object])
], CollapsedCodeCellExecutionIcon);
export { CollapsedCodeCellExecutionIcon };
