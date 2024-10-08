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
import { Delayer } from '../../../../../../base/common/async.js';
import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { Range } from '../../../../../../editor/common/core/range.js';
import { IConfigurationService } from '../../../../../../platform/configuration/common/configuration.js';
import { debugIconBreakpointForeground } from '../../../../debug/browser/breakpointEditorContribution.js';
import { focusedStackFrameColor, topStackFrameColor } from '../../../../debug/browser/callStackEditorContribution.js';
import { IDebugService } from '../../../../debug/common/debug.js';
import { NotebookOverviewRulerLane } from '../../notebookBrowser.js';
import { registerNotebookContribution } from '../../notebookEditorExtensions.js';
import { runningCellRulerDecorationColor } from '../../notebookEditorWidget.js';
import { CellUri, NotebookCellExecutionState } from '../../../common/notebookCommon.js';
import { INotebookExecutionStateService, NotebookExecutionType } from '../../../common/notebookExecutionStateService.js';
let PausedCellDecorationContribution = class PausedCellDecorationContribution extends Disposable {
    static { this.id = 'workbench.notebook.debug.pausedCellDecorations'; }
    constructor(_notebookEditor, _debugService, _notebookExecutionStateService) {
        super();
        this._notebookEditor = _notebookEditor;
        this._debugService = _debugService;
        this._notebookExecutionStateService = _notebookExecutionStateService;
        this._currentTopDecorations = [];
        this._currentOtherDecorations = [];
        this._executingCellDecorations = [];
        const delayer = this._register(new Delayer(200));
        this._register(_debugService.getModel().onDidChangeCallStack(() => this.updateExecutionDecorations()));
        this._register(_debugService.getViewModel().onDidFocusStackFrame(() => this.updateExecutionDecorations()));
        this._register(_notebookExecutionStateService.onDidChangeExecution(e => {
            if (e.type === NotebookExecutionType.cell && this._notebookEditor.textModel && e.affectsNotebook(this._notebookEditor.textModel.uri)) {
                delayer.trigger(() => this.updateExecutionDecorations());
            }
        }));
    }
    updateExecutionDecorations() {
        const exes = this._notebookEditor.textModel ?
            this._notebookExecutionStateService.getCellExecutionsByHandleForNotebook(this._notebookEditor.textModel.uri)
            : undefined;
        const topFrameCellsAndRanges = [];
        let focusedFrameCellAndRange = undefined;
        const getNotebookCellAndRange = (sf) => {
            const parsed = CellUri.parse(sf.source.uri);
            if (parsed && parsed.notebook.toString() === this._notebookEditor.textModel?.uri.toString()) {
                return { handle: parsed.handle, range: sf.range };
            }
            return undefined;
        };
        for (const session of this._debugService.getModel().getSessions()) {
            for (const thread of session.getAllThreads()) {
                const topFrame = thread.getTopStackFrame();
                if (topFrame) {
                    const notebookCellAndRange = getNotebookCellAndRange(topFrame);
                    if (notebookCellAndRange) {
                        topFrameCellsAndRanges.push(notebookCellAndRange);
                        exes?.delete(notebookCellAndRange.handle);
                    }
                }
            }
        }
        const focusedFrame = this._debugService.getViewModel().focusedStackFrame;
        if (focusedFrame && focusedFrame.thread.stopped) {
            const thisFocusedFrameCellAndRange = getNotebookCellAndRange(focusedFrame);
            if (thisFocusedFrameCellAndRange &&
                !topFrameCellsAndRanges.some(topFrame => topFrame.handle === thisFocusedFrameCellAndRange?.handle && Range.equalsRange(topFrame.range, thisFocusedFrameCellAndRange?.range))) {
                focusedFrameCellAndRange = thisFocusedFrameCellAndRange;
                exes?.delete(focusedFrameCellAndRange.handle);
            }
        }
        this.setTopFrameDecoration(topFrameCellsAndRanges);
        this.setFocusedFrameDecoration(focusedFrameCellAndRange);
        const exeHandles = exes ?
            Array.from(exes.entries())
                .filter(([_, exe]) => exe.state === NotebookCellExecutionState.Executing)
                .map(([handle]) => handle)
            : [];
        this.setExecutingCellDecorations(exeHandles);
    }
    setTopFrameDecoration(handlesAndRanges) {
        const newDecorations = handlesAndRanges.map(({ handle, range }) => {
            const options = {
                overviewRuler: {
                    color: topStackFrameColor,
                    includeOutput: false,
                    modelRanges: [range],
                    position: NotebookOverviewRulerLane.Full
                }
            };
            return { handle, options };
        });
        this._currentTopDecorations = this._notebookEditor.deltaCellDecorations(this._currentTopDecorations, newDecorations);
    }
    setFocusedFrameDecoration(focusedFrameCellAndRange) {
        let newDecorations = [];
        if (focusedFrameCellAndRange) {
            const options = {
                overviewRuler: {
                    color: focusedStackFrameColor,
                    includeOutput: false,
                    modelRanges: [focusedFrameCellAndRange.range],
                    position: NotebookOverviewRulerLane.Full
                }
            };
            newDecorations = [{ handle: focusedFrameCellAndRange.handle, options }];
        }
        this._currentOtherDecorations = this._notebookEditor.deltaCellDecorations(this._currentOtherDecorations, newDecorations);
    }
    setExecutingCellDecorations(handles) {
        const newDecorations = handles.map(handle => {
            const options = {
                overviewRuler: {
                    color: runningCellRulerDecorationColor,
                    includeOutput: false,
                    modelRanges: [new Range(0, 0, 0, 0)],
                    position: NotebookOverviewRulerLane.Left
                }
            };
            return { handle, options };
        });
        this._executingCellDecorations = this._notebookEditor.deltaCellDecorations(this._executingCellDecorations, newDecorations);
    }
};
PausedCellDecorationContribution = __decorate([
    __param(1, IDebugService),
    __param(2, INotebookExecutionStateService),
    __metadata("design:paramtypes", [Object, Object, Object])
], PausedCellDecorationContribution);
export { PausedCellDecorationContribution };
registerNotebookContribution(PausedCellDecorationContribution.id, PausedCellDecorationContribution);
let NotebookBreakpointDecorations = class NotebookBreakpointDecorations extends Disposable {
    static { this.id = 'workbench.notebook.debug.notebookBreakpointDecorations'; }
    constructor(_notebookEditor, _debugService, _configService) {
        super();
        this._notebookEditor = _notebookEditor;
        this._debugService = _debugService;
        this._configService = _configService;
        this._currentDecorations = [];
        this._register(_debugService.getModel().onDidChangeBreakpoints(() => this.updateDecorations()));
        this._register(_configService.onDidChangeConfiguration(e => e.affectsConfiguration('debug.showBreakpointsInOverviewRuler') && this.updateDecorations()));
    }
    updateDecorations() {
        const enabled = this._configService.getValue('debug.showBreakpointsInOverviewRuler');
        const newDecorations = enabled ?
            this._debugService.getModel().getBreakpoints().map(breakpoint => {
                const parsed = CellUri.parse(breakpoint.uri);
                if (!parsed || parsed.notebook.toString() !== this._notebookEditor.textModel.uri.toString()) {
                    return null;
                }
                const options = {
                    overviewRuler: {
                        color: debugIconBreakpointForeground,
                        includeOutput: false,
                        modelRanges: [new Range(breakpoint.lineNumber, 0, breakpoint.lineNumber, 0)],
                        position: NotebookOverviewRulerLane.Left
                    }
                };
                return { handle: parsed.handle, options };
            }).filter(x => !!x)
            : [];
        this._currentDecorations = this._notebookEditor.deltaCellDecorations(this._currentDecorations, newDecorations);
    }
};
NotebookBreakpointDecorations = __decorate([
    __param(1, IDebugService),
    __param(2, IConfigurationService),
    __metadata("design:paramtypes", [Object, Object, Object])
], NotebookBreakpointDecorations);
export { NotebookBreakpointDecorations };
registerNotebookContribution(NotebookBreakpointDecorations.id, NotebookBreakpointDecorations);
