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
var ExecutionStateCellStatusBarItem_1, TimerCellStatusBarItem_1;
import { disposableTimeout, RunOnceScheduler } from '../../../../../../base/common/async.js';
import { Disposable, dispose, MutableDisposable } from '../../../../../../base/common/lifecycle.js';
import { language } from '../../../../../../base/common/platform.js';
import { localize } from '../../../../../../nls.js';
import { IInstantiationService } from '../../../../../../platform/instantiation/common/instantiation.js';
import { themeColorFromId } from '../../../../../../platform/theme/common/themeService.js';
import { ThemeIcon } from '../../../../../../base/common/themables.js';
import { NotebookVisibleCellObserver } from './notebookVisibleCellObserver.js';
import { registerNotebookContribution } from '../../notebookEditorExtensions.js';
import { cellStatusIconError, cellStatusIconSuccess } from '../../notebookEditorWidget.js';
import { errorStateIcon, executingStateIcon, pendingStateIcon, successStateIcon } from '../../notebookIcons.js';
import { NotebookCellExecutionState } from '../../../common/notebookCommon.js';
import { INotebookExecutionStateService, NotebookExecutionType } from '../../../common/notebookExecutionStateService.js';
import { INotebookService } from '../../../common/notebookService.js';
export function formatCellDuration(duration, showMilliseconds = true) {
    if (showMilliseconds && duration < 1000) {
        return `${duration}ms`;
    }
    const minutes = Math.floor(duration / 1000 / 60);
    const seconds = Math.floor(duration / 1000) % 60;
    const tenths = Math.floor((duration % 1000) / 100);
    if (minutes > 0) {
        return `${minutes}m ${seconds}.${tenths}s`;
    }
    else {
        return `${seconds}.${tenths}s`;
    }
}
export class NotebookStatusBarController extends Disposable {
    constructor(_notebookEditor, _itemFactory) {
        super();
        this._notebookEditor = _notebookEditor;
        this._itemFactory = _itemFactory;
        this._visibleCells = new Map();
        this._observer = this._register(new NotebookVisibleCellObserver(this._notebookEditor));
        this._register(this._observer.onDidChangeVisibleCells(this._updateVisibleCells, this));
        this._updateEverything();
    }
    _updateEverything() {
        this._visibleCells.forEach(dispose);
        this._visibleCells.clear();
        this._updateVisibleCells({ added: this._observer.visibleCells, removed: [] });
    }
    _updateVisibleCells(e) {
        const vm = this._notebookEditor.getViewModel();
        if (!vm) {
            return;
        }
        for (const oldCell of e.removed) {
            this._visibleCells.get(oldCell.handle)?.dispose();
            this._visibleCells.delete(oldCell.handle);
        }
        for (const newCell of e.added) {
            this._visibleCells.set(newCell.handle, this._itemFactory(vm, newCell));
        }
    }
    dispose() {
        super.dispose();
        this._visibleCells.forEach(dispose);
        this._visibleCells.clear();
    }
}
let ExecutionStateCellStatusBarContrib = class ExecutionStateCellStatusBarContrib extends Disposable {
    static { this.id = 'workbench.notebook.statusBar.execState'; }
    constructor(notebookEditor, instantiationService) {
        super();
        this._register(new NotebookStatusBarController(notebookEditor, (vm, cell) => instantiationService.createInstance(ExecutionStateCellStatusBarItem, vm, cell)));
    }
};
ExecutionStateCellStatusBarContrib = __decorate([
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object])
], ExecutionStateCellStatusBarContrib);
export { ExecutionStateCellStatusBarContrib };
registerNotebookContribution(ExecutionStateCellStatusBarContrib.id, ExecutionStateCellStatusBarContrib);
/**
 * Shows the cell's execution state in the cell status bar. When the "executing" state is shown, it will be shown for a minimum brief time.
 */
let ExecutionStateCellStatusBarItem = class ExecutionStateCellStatusBarItem extends Disposable {
    static { ExecutionStateCellStatusBarItem_1 = this; }
    static { this.MIN_SPINNER_TIME = 500; }
    constructor(_notebookViewModel, _cell, _executionStateService) {
        super();
        this._notebookViewModel = _notebookViewModel;
        this._cell = _cell;
        this._executionStateService = _executionStateService;
        this._currentItemIds = [];
        this._clearExecutingStateTimer = this._register(new MutableDisposable());
        this._update();
        this._register(this._executionStateService.onDidChangeExecution(e => {
            if (e.type === NotebookExecutionType.cell && e.affectsCell(this._cell.uri)) {
                this._update();
            }
        }));
        this._register(this._cell.model.onDidChangeInternalMetadata(() => this._update()));
    }
    async _update() {
        const items = this._getItemsForCell();
        if (Array.isArray(items)) {
            this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
        }
    }
    /**
     *	Returns undefined if there should be no change, and an empty array if all items should be removed.
     */
    _getItemsForCell() {
        const runState = this._executionStateService.getCellExecution(this._cell.uri);
        // Show the execution spinner for a minimum time
        if (runState?.state === NotebookCellExecutionState.Executing && typeof this._showedExecutingStateTime !== 'number') {
            this._showedExecutingStateTime = Date.now();
        }
        else if (runState?.state !== NotebookCellExecutionState.Executing && typeof this._showedExecutingStateTime === 'number') {
            const timeUntilMin = ExecutionStateCellStatusBarItem_1.MIN_SPINNER_TIME - (Date.now() - this._showedExecutingStateTime);
            if (timeUntilMin > 0) {
                if (!this._clearExecutingStateTimer.value) {
                    this._clearExecutingStateTimer.value = disposableTimeout(() => {
                        this._showedExecutingStateTime = undefined;
                        this._clearExecutingStateTimer.clear();
                        this._update();
                    }, timeUntilMin);
                }
                return undefined;
            }
            else {
                this._showedExecutingStateTime = undefined;
            }
        }
        const items = this._getItemForState(runState, this._cell.internalMetadata);
        return items;
    }
    _getItemForState(runState, internalMetadata) {
        const state = runState?.state;
        const { lastRunSuccess } = internalMetadata;
        if (!state && lastRunSuccess) {
            return [{
                    text: `$(${successStateIcon.id})`,
                    color: themeColorFromId(cellStatusIconSuccess),
                    tooltip: localize('notebook.cell.status.success', "Success"),
                    alignment: 1 /* CellStatusbarAlignment.Left */,
                    priority: Number.MAX_SAFE_INTEGER
                }];
        }
        else if (!state && lastRunSuccess === false) {
            return [{
                    text: `$(${errorStateIcon.id})`,
                    color: themeColorFromId(cellStatusIconError),
                    tooltip: localize('notebook.cell.status.failed', "Failed"),
                    alignment: 1 /* CellStatusbarAlignment.Left */,
                    priority: Number.MAX_SAFE_INTEGER
                }];
        }
        else if (state === NotebookCellExecutionState.Pending || state === NotebookCellExecutionState.Unconfirmed) {
            return [{
                    text: `$(${pendingStateIcon.id})`,
                    tooltip: localize('notebook.cell.status.pending', "Pending"),
                    alignment: 1 /* CellStatusbarAlignment.Left */,
                    priority: Number.MAX_SAFE_INTEGER
                }];
        }
        else if (state === NotebookCellExecutionState.Executing) {
            const icon = runState?.didPause ?
                executingStateIcon :
                ThemeIcon.modify(executingStateIcon, 'spin');
            return [{
                    text: `$(${icon.id})`,
                    tooltip: localize('notebook.cell.status.executing', "Executing"),
                    alignment: 1 /* CellStatusbarAlignment.Left */,
                    priority: Number.MAX_SAFE_INTEGER
                }];
        }
        return [];
    }
    dispose() {
        super.dispose();
        this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items: [] }]);
    }
};
ExecutionStateCellStatusBarItem = ExecutionStateCellStatusBarItem_1 = __decorate([
    __param(2, INotebookExecutionStateService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ExecutionStateCellStatusBarItem);
let TimerCellStatusBarContrib = class TimerCellStatusBarContrib extends Disposable {
    static { this.id = 'workbench.notebook.statusBar.execTimer'; }
    constructor(notebookEditor, instantiationService) {
        super();
        this._register(new NotebookStatusBarController(notebookEditor, (vm, cell) => instantiationService.createInstance(TimerCellStatusBarItem, vm, cell)));
    }
};
TimerCellStatusBarContrib = __decorate([
    __param(1, IInstantiationService),
    __metadata("design:paramtypes", [Object, Object])
], TimerCellStatusBarContrib);
export { TimerCellStatusBarContrib };
registerNotebookContribution(TimerCellStatusBarContrib.id, TimerCellStatusBarContrib);
const UPDATE_TIMER_GRACE_PERIOD = 200;
let TimerCellStatusBarItem = class TimerCellStatusBarItem extends Disposable {
    static { TimerCellStatusBarItem_1 = this; }
    static { this.UPDATE_INTERVAL = 100; }
    constructor(_notebookViewModel, _cell, _executionStateService, _notebookService) {
        super();
        this._notebookViewModel = _notebookViewModel;
        this._cell = _cell;
        this._executionStateService = _executionStateService;
        this._notebookService = _notebookService;
        this._currentItemIds = [];
        this._scheduler = this._register(new RunOnceScheduler(() => this._update(), TimerCellStatusBarItem_1.UPDATE_INTERVAL));
        this._update();
        this._register(this._cell.model.onDidChangeInternalMetadata(() => this._update()));
    }
    async _update() {
        let timerItem;
        const runState = this._executionStateService.getCellExecution(this._cell.uri);
        const state = runState?.state;
        const startTime = this._cell.internalMetadata.runStartTime;
        const adjustment = this._cell.internalMetadata.runStartTimeAdjustment ?? 0;
        const endTime = this._cell.internalMetadata.runEndTime;
        if (runState?.didPause) {
            timerItem = undefined;
        }
        else if (state === NotebookCellExecutionState.Executing) {
            if (typeof startTime === 'number') {
                timerItem = this._getTimeItem(startTime, Date.now(), adjustment);
                this._scheduler.schedule();
            }
        }
        else if (!state) {
            if (typeof startTime === 'number' && typeof endTime === 'number') {
                const timerDuration = Date.now() - startTime + adjustment;
                const executionDuration = endTime - startTime;
                const renderDuration = this._cell.internalMetadata.renderDuration ?? {};
                timerItem = this._getTimeItem(startTime, endTime, undefined, {
                    timerDuration,
                    executionDuration,
                    renderDuration
                });
            }
        }
        const items = timerItem ? [timerItem] : [];
        if (!items.length && !!runState) {
            if (!this._deferredUpdate) {
                this._deferredUpdate = disposableTimeout(() => {
                    this._deferredUpdate = undefined;
                    this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
                }, UPDATE_TIMER_GRACE_PERIOD);
            }
        }
        else {
            this._deferredUpdate?.dispose();
            this._deferredUpdate = undefined;
            this._currentItemIds = this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items }]);
        }
    }
    _getTimeItem(startTime, endTime, adjustment = 0, runtimeInformation) {
        const duration = endTime - startTime + adjustment;
        let tooltip;
        if (runtimeInformation) {
            const lastExecution = new Date(endTime).toLocaleTimeString(language);
            const { renderDuration, executionDuration, timerDuration } = runtimeInformation;
            let renderTimes = '';
            for (const key in renderDuration) {
                const rendererInfo = this._notebookService.getRendererInfo(key);
                const args = encodeURIComponent(JSON.stringify({
                    extensionId: rendererInfo?.extensionId.value ?? '',
                    issueBody: `Auto-generated text from notebook cell performance. The duration for the renderer, ${rendererInfo?.displayName ?? key}, is slower than expected.\n` +
                        `Execution Time: ${formatCellDuration(executionDuration)}\n` +
                        `Renderer Duration: ${formatCellDuration(renderDuration[key])}\n`
                }));
                renderTimes += `- [${rendererInfo?.displayName ?? key}](command:workbench.action.openIssueReporter?${args}) ${formatCellDuration(renderDuration[key])}\n`;
            }
            renderTimes += `\n*${localize('notebook.cell.statusBar.timerTooltip.reportIssueFootnote', "Use the links above to file an issue using the issue reporter.")}*\n`;
            tooltip = {
                value: localize('notebook.cell.statusBar.timerTooltip', "**Last Execution** {0}\n\n**Execution Time** {1}\n\n**Overhead Time** {2}\n\n**Render Times**\n\n{3}", lastExecution, formatCellDuration(executionDuration), formatCellDuration(timerDuration - executionDuration), renderTimes),
                isTrusted: true
            };
        }
        return {
            text: formatCellDuration(duration, false),
            alignment: 1 /* CellStatusbarAlignment.Left */,
            priority: Number.MAX_SAFE_INTEGER - 5,
            tooltip
        };
    }
    dispose() {
        super.dispose();
        this._deferredUpdate?.dispose();
        this._notebookViewModel.deltaCellStatusBarItems(this._currentItemIds, [{ handle: this._cell.handle, items: [] }]);
    }
};
TimerCellStatusBarItem = TimerCellStatusBarItem_1 = __decorate([
    __param(2, INotebookExecutionStateService),
    __param(3, INotebookService),
    __metadata("design:paramtypes", [Object, Object, Object, Object])
], TimerCellStatusBarItem);
