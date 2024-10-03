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
import { Emitter, PauseableEmitter } from '../../../../../base/common/event.js';
import { dispose } from '../../../../../base/common/lifecycle.js';
import { observableValue } from '../../../../../base/common/observable.js';
import * as UUID from '../../../../../base/common/uuid.js';
import { ICodeEditorService } from '../../../../../editor/browser/services/codeEditorService.js';
import { PrefixSumComputer } from '../../../../../editor/common/model/prefixSumComputer.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IUndoRedoService } from '../../../../../platform/undoRedo/common/undoRedo.js';
import { CellEditState, CellLayoutState } from '../notebookBrowser.js';
import { CellOutputViewModel } from './cellOutputViewModel.js';
import { ViewContext } from './viewContext.js';
import { NotebookCellTextModel } from '../../common/model/notebookCellTextModel.js';
import { CellKind } from '../../common/notebookCommon.js';
import { INotebookService } from '../../common/notebookService.js';
import { BaseCellViewModel } from './baseCellViewModel.js';
export const outputDisplayLimit = 500;
let CodeCellViewModel = class CodeCellViewModel extends BaseCellViewModel {
    set editorHeight(height) {
        if (this._editorHeight === height) {
            return;
        }
        this._editorHeight = height;
        this.layoutChange({ editorHeight: true }, 'CodeCellViewModel#editorHeight');
    }
    get editorHeight() {
        throw new Error('editorHeight is write-only');
    }
    set chatHeight(height) {
        if (this._chatHeight === height) {
            return;
        }
        this._chatHeight = height;
        this.layoutChange({ chatHeight: true }, 'CodeCellViewModel#chatHeight');
    }
    get chatHeight() {
        return this._chatHeight;
    }
    get outputIsHovered() {
        return this._hoveringOutput;
    }
    set outputIsHovered(v) {
        this._hoveringOutput = v;
        this._onDidChangeState.fire({ outputIsHoveredChanged: true });
    }
    get outputIsFocused() {
        return this._focusOnOutput;
    }
    set outputIsFocused(v) {
        this._focusOnOutput = v;
        this._onDidChangeState.fire({ outputIsFocusedChanged: true });
    }
    get inputInOutputIsFocused() {
        return this._focusInputInOutput;
    }
    set inputInOutputIsFocused(v) {
        this._focusInputInOutput = v;
    }
    get outputMinHeight() {
        return this._outputMinHeight;
    }
    set outputMinHeight(newMin) {
        this._outputMinHeight = newMin;
    }
    get layoutInfo() {
        return this._layoutInfo;
    }
    get outputsViewModels() {
        return this._outputViewModels;
    }
    constructor(viewType, model, initialNotebookLayoutInfo, viewContext, configurationService, _notebookService, modelService, undoRedoService, codeEditorService, instantiationService) {
        super(viewType, model, UUID.generateUuid(), viewContext, configurationService, modelService, undoRedoService, codeEditorService);
        this.viewContext = viewContext;
        this._notebookService = _notebookService;
        this.cellKind = CellKind.Code;
        this._onLayoutInfoRead = this._register(new Emitter());
        this.onLayoutInfoRead = this._onLayoutInfoRead.event;
        this._onDidStartExecution = this._register(new Emitter());
        this.onDidStartExecution = this._onDidStartExecution.event;
        this._onDidStopExecution = this._register(new Emitter());
        this.onDidStopExecution = this._onDidStopExecution.event;
        this._onDidChangeOutputs = this._register(new Emitter());
        this.onDidChangeOutputs = this._onDidChangeOutputs.event;
        this._onDidRemoveOutputs = this._register(new Emitter());
        this.onDidRemoveOutputs = this._onDidRemoveOutputs.event;
        this._outputCollection = [];
        this._outputsTop = null;
        this._pauseableEmitter = this._register(new PauseableEmitter());
        this.onDidChangeLayout = this._pauseableEmitter.event;
        this._editorHeight = 0;
        this._chatHeight = 0;
        this._hoveringOutput = false;
        this._focusOnOutput = false;
        this._focusInputInOutput = false;
        this._outputMinHeight = 0;
        this.excecutionError = observableValue('excecutionError', undefined);
        this._hasFindResult = this._register(new Emitter());
        this.hasFindResult = this._hasFindResult.event;
        this._outputViewModels = this.model.outputs.map(output => new CellOutputViewModel(this, output, this._notebookService));
        this._register(this.model.onDidChangeOutputs((splice) => {
            const removedOutputs = [];
            let outputLayoutChange = false;
            for (let i = splice.start; i < splice.start + splice.deleteCount; i++) {
                if (this._outputCollection[i] !== undefined && this._outputCollection[i] !== 0) {
                    outputLayoutChange = true;
                }
            }
            this._outputCollection.splice(splice.start, splice.deleteCount, ...splice.newOutputs.map(() => 0));
            removedOutputs.push(...this._outputViewModels.splice(splice.start, splice.deleteCount, ...splice.newOutputs.map(output => new CellOutputViewModel(this, output, this._notebookService))));
            this._outputsTop = null;
            this._onDidChangeOutputs.fire(splice);
            this._onDidRemoveOutputs.fire(removedOutputs);
            if (outputLayoutChange) {
                this.layoutChange({ outputHeight: true }, 'CodeCellViewModel#model.onDidChangeOutputs');
            }
            dispose(removedOutputs);
        }));
        this._outputCollection = new Array(this.model.outputs.length);
        this._layoutInfo = {
            fontInfo: initialNotebookLayoutInfo?.fontInfo || null,
            editorHeight: 0,
            editorWidth: initialNotebookLayoutInfo
                ? this.viewContext.notebookOptions.computeCodeCellEditorWidth(initialNotebookLayoutInfo.width)
                : 0,
            chatHeight: 0,
            statusBarHeight: 0,
            commentOffset: 0,
            commentHeight: 0,
            outputContainerOffset: 0,
            outputTotalHeight: 0,
            outputShowMoreContainerHeight: 0,
            outputShowMoreContainerOffset: 0,
            totalHeight: this.computeTotalHeight(17, 0, 0, 0),
            codeIndicatorHeight: 0,
            outputIndicatorHeight: 0,
            bottomToolbarOffset: 0,
            layoutState: CellLayoutState.Uninitialized,
            estimatedHasHorizontalScrolling: false
        };
    }
    updateExecutionState(e) {
        if (e.changed) {
            this._onDidStartExecution.fire(e);
        }
        else {
            this._onDidStopExecution.fire(e);
        }
    }
    updateOptions(e) {
        super.updateOptions(e);
        if (e.cellStatusBarVisibility || e.insertToolbarPosition || e.cellToolbarLocation) {
            this.layoutChange({});
        }
    }
    pauseLayout() {
        this._pauseableEmitter.pause();
    }
    resumeLayout() {
        this._pauseableEmitter.resume();
    }
    layoutChange(state, source) {
        this._ensureOutputsTop();
        const notebookLayoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
        const bottomToolbarDimensions = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
        const outputShowMoreContainerHeight = state.outputShowMoreContainerHeight ? state.outputShowMoreContainerHeight : this._layoutInfo.outputShowMoreContainerHeight;
        const outputTotalHeight = Math.max(this._outputMinHeight, this.isOutputCollapsed ? notebookLayoutConfiguration.collapsedIndicatorHeight : this._outputsTop.getTotalSum());
        const commentHeight = state.commentHeight ? this._commentHeight : this._layoutInfo.commentHeight;
        const originalLayout = this.layoutInfo;
        if (!this.isInputCollapsed) {
            let newState;
            let editorHeight;
            let totalHeight;
            let hasHorizontalScrolling = false;
            const chatHeight = state.chatHeight ? this._chatHeight : this._layoutInfo.chatHeight;
            if (!state.editorHeight && this._layoutInfo.layoutState === CellLayoutState.FromCache && !state.outputHeight) {
                const estimate = this.estimateEditorHeight(state.font?.lineHeight ?? this._layoutInfo.fontInfo?.lineHeight);
                editorHeight = estimate.editorHeight;
                hasHorizontalScrolling = estimate.hasHorizontalScrolling;
                totalHeight = this._layoutInfo.totalHeight;
                newState = CellLayoutState.FromCache;
            }
            else if (state.editorHeight || this._layoutInfo.layoutState === CellLayoutState.Measured) {
                editorHeight = this._editorHeight;
                totalHeight = this.computeTotalHeight(this._editorHeight, outputTotalHeight, outputShowMoreContainerHeight, chatHeight);
                newState = CellLayoutState.Measured;
                hasHorizontalScrolling = this._layoutInfo.estimatedHasHorizontalScrolling;
            }
            else {
                const estimate = this.estimateEditorHeight(state.font?.lineHeight ?? this._layoutInfo.fontInfo?.lineHeight);
                editorHeight = estimate.editorHeight;
                hasHorizontalScrolling = estimate.hasHorizontalScrolling;
                totalHeight = this.computeTotalHeight(editorHeight, outputTotalHeight, outputShowMoreContainerHeight, chatHeight);
                newState = CellLayoutState.Estimated;
            }
            const statusBarHeight = this.viewContext.notebookOptions.computeEditorStatusbarHeight(this.internalMetadata, this.uri);
            const codeIndicatorHeight = editorHeight + statusBarHeight;
            const outputIndicatorHeight = outputTotalHeight + outputShowMoreContainerHeight;
            const outputContainerOffset = notebookLayoutConfiguration.editorToolbarHeight
                + notebookLayoutConfiguration.cellTopMargin
                + chatHeight
                + editorHeight
                + statusBarHeight;
            const outputShowMoreContainerOffset = totalHeight
                - bottomToolbarDimensions.bottomToolbarGap
                - bottomToolbarDimensions.bottomToolbarHeight / 2
                - outputShowMoreContainerHeight;
            const bottomToolbarOffset = this.viewContext.notebookOptions.computeBottomToolbarOffset(totalHeight, this.viewType);
            const editorWidth = state.outerWidth !== undefined
                ? this.viewContext.notebookOptions.computeCodeCellEditorWidth(state.outerWidth)
                : this._layoutInfo?.editorWidth;
            this._layoutInfo = {
                fontInfo: state.font ?? this._layoutInfo.fontInfo ?? null,
                chatHeight,
                editorHeight,
                editorWidth,
                statusBarHeight,
                outputContainerOffset,
                outputTotalHeight,
                outputShowMoreContainerHeight,
                outputShowMoreContainerOffset,
                commentOffset: outputContainerOffset + outputTotalHeight,
                commentHeight,
                totalHeight,
                codeIndicatorHeight,
                outputIndicatorHeight,
                bottomToolbarOffset,
                layoutState: newState,
                estimatedHasHorizontalScrolling: hasHorizontalScrolling
            };
        }
        else {
            const codeIndicatorHeight = notebookLayoutConfiguration.collapsedIndicatorHeight;
            const outputIndicatorHeight = outputTotalHeight + outputShowMoreContainerHeight;
            const chatHeight = state.chatHeight ? this._chatHeight : this._layoutInfo.chatHeight;
            const outputContainerOffset = notebookLayoutConfiguration.cellTopMargin + notebookLayoutConfiguration.collapsedIndicatorHeight;
            const totalHeight = notebookLayoutConfiguration.cellTopMargin
                + notebookLayoutConfiguration.collapsedIndicatorHeight
                + notebookLayoutConfiguration.cellBottomMargin
                + bottomToolbarDimensions.bottomToolbarGap
                + chatHeight
                + commentHeight
                + outputTotalHeight + outputShowMoreContainerHeight;
            const outputShowMoreContainerOffset = totalHeight
                - bottomToolbarDimensions.bottomToolbarGap
                - bottomToolbarDimensions.bottomToolbarHeight / 2
                - outputShowMoreContainerHeight;
            const bottomToolbarOffset = this.viewContext.notebookOptions.computeBottomToolbarOffset(totalHeight, this.viewType);
            const editorWidth = state.outerWidth !== undefined
                ? this.viewContext.notebookOptions.computeCodeCellEditorWidth(state.outerWidth)
                : this._layoutInfo?.editorWidth;
            this._layoutInfo = {
                fontInfo: state.font ?? this._layoutInfo.fontInfo ?? null,
                editorHeight: this._layoutInfo.editorHeight,
                editorWidth,
                chatHeight: chatHeight,
                statusBarHeight: 0,
                outputContainerOffset,
                outputTotalHeight,
                outputShowMoreContainerHeight,
                outputShowMoreContainerOffset,
                commentOffset: outputContainerOffset + outputTotalHeight,
                commentHeight,
                totalHeight,
                codeIndicatorHeight,
                outputIndicatorHeight,
                bottomToolbarOffset,
                layoutState: this._layoutInfo.layoutState,
                estimatedHasHorizontalScrolling: false
            };
        }
        this._fireOnDidChangeLayout({
            ...state,
            totalHeight: this.layoutInfo.totalHeight !== originalLayout.totalHeight,
            source,
        });
    }
    _fireOnDidChangeLayout(state) {
        this._pauseableEmitter.fire(state);
    }
    restoreEditorViewState(editorViewStates, totalHeight) {
        super.restoreEditorViewState(editorViewStates);
        if (totalHeight !== undefined && this._layoutInfo.layoutState !== CellLayoutState.Measured) {
            this._layoutInfo = {
                ...this._layoutInfo,
                totalHeight: totalHeight,
                layoutState: CellLayoutState.FromCache,
            };
        }
    }
    getDynamicHeight() {
        this._onLayoutInfoRead.fire();
        return this._layoutInfo.totalHeight;
    }
    getHeight(lineHeight) {
        if (this._layoutInfo.layoutState === CellLayoutState.Uninitialized) {
            const estimate = this.estimateEditorHeight(lineHeight);
            return this.computeTotalHeight(estimate.editorHeight, 0, 0, 0);
        }
        else {
            return this._layoutInfo.totalHeight;
        }
    }
    estimateEditorHeight(lineHeight = 20) {
        let hasHorizontalScrolling = false;
        const cellEditorOptions = this.viewContext.getBaseCellEditorOptions(this.language);
        if (this.layoutInfo.fontInfo && cellEditorOptions.value.wordWrap === 'off') {
            for (let i = 0; i < this.lineCount; i++) {
                const max = this.textBuffer.getLineLastNonWhitespaceColumn(i + 1);
                const estimatedWidth = max * (this.layoutInfo.fontInfo.typicalHalfwidthCharacterWidth + this.layoutInfo.fontInfo.letterSpacing);
                if (estimatedWidth > this.layoutInfo.editorWidth) {
                    hasHorizontalScrolling = true;
                    break;
                }
            }
        }
        const verticalScrollbarHeight = hasHorizontalScrolling ? 12 : 0;
        const editorPadding = this.viewContext.notebookOptions.computeEditorPadding(this.internalMetadata, this.uri);
        const editorHeight = this.lineCount * lineHeight
            + editorPadding.top
            + editorPadding.bottom
            + verticalScrollbarHeight;
        return {
            editorHeight,
            hasHorizontalScrolling
        };
    }
    computeTotalHeight(editorHeight, outputsTotalHeight, outputShowMoreContainerHeight, chatHeight) {
        const layoutConfiguration = this.viewContext.notebookOptions.getLayoutConfiguration();
        const { bottomToolbarGap } = this.viewContext.notebookOptions.computeBottomToolbarDimensions(this.viewType);
        return layoutConfiguration.editorToolbarHeight
            + layoutConfiguration.cellTopMargin
            + chatHeight
            + editorHeight
            + this.viewContext.notebookOptions.computeEditorStatusbarHeight(this.internalMetadata, this.uri)
            + this._commentHeight
            + outputsTotalHeight
            + outputShowMoreContainerHeight
            + bottomToolbarGap
            + layoutConfiguration.cellBottomMargin;
    }
    onDidChangeTextModelContent() {
        if (this.getEditState() !== CellEditState.Editing) {
            this.updateEditState(CellEditState.Editing, 'onDidChangeTextModelContent');
            this._onDidChangeState.fire({ contentChanged: true });
        }
    }
    onDeselect() {
        this.updateEditState(CellEditState.Preview, 'onDeselect');
    }
    updateOutputShowMoreContainerHeight(height) {
        this.layoutChange({ outputShowMoreContainerHeight: height }, 'CodeCellViewModel#updateOutputShowMoreContainerHeight');
    }
    updateOutputMinHeight(height) {
        this.outputMinHeight = height;
    }
    unlockOutputHeight() {
        this.outputMinHeight = 0;
        this.layoutChange({ outputHeight: true });
    }
    updateOutputHeight(index, height, source) {
        if (index >= this._outputCollection.length) {
            throw new Error('Output index out of range!');
        }
        this._ensureOutputsTop();
        if (index === 0 || height > 0) {
            this._outputViewModels[index].setVisible(true);
        }
        else if (height === 0) {
            this._outputViewModels[index].setVisible(false);
        }
        if (this._outputViewModels[index].visible.get() && height < 28) {
            height = 28;
        }
        this._outputCollection[index] = height;
        if (this._outputsTop.setValue(index, height)) {
            this.layoutChange({ outputHeight: true }, source);
        }
    }
    getOutputOffsetInContainer(index) {
        this._ensureOutputsTop();
        if (index >= this._outputCollection.length) {
            throw new Error('Output index out of range!');
        }
        return this._outputsTop.getPrefixSum(index - 1);
    }
    getOutputOffset(index) {
        return this.layoutInfo.outputContainerOffset + this.getOutputOffsetInContainer(index);
    }
    spliceOutputHeights(start, deleteCnt, heights) {
        this._ensureOutputsTop();
        this._outputsTop.removeValues(start, deleteCnt);
        if (heights.length) {
            const values = new Uint32Array(heights.length);
            for (let i = 0; i < heights.length; i++) {
                values[i] = heights[i];
            }
            this._outputsTop.insertValues(start, values);
        }
        this.layoutChange({ outputHeight: true }, 'CodeCellViewModel#spliceOutputs');
    }
    _ensureOutputsTop() {
        if (!this._outputsTop) {
            const values = new Uint32Array(this._outputCollection.length);
            for (let i = 0; i < this._outputCollection.length; i++) {
                values[i] = this._outputCollection[i];
            }
            this._outputsTop = new PrefixSumComputer(values);
        }
    }
    startFind(value, options) {
        const matches = super.cellStartFind(value, options);
        if (matches === null) {
            return null;
        }
        return {
            cell: this,
            contentMatches: matches
        };
    }
    dispose() {
        super.dispose();
        this._outputCollection = [];
        this._outputsTop = null;
        dispose(this._outputViewModels);
    }
};
CodeCellViewModel = __decorate([
    __param(4, IConfigurationService),
    __param(5, INotebookService),
    __param(6, ITextModelService),
    __param(7, IUndoRedoService),
    __param(8, ICodeEditorService),
    __param(9, IInstantiationService),
    __metadata("design:paramtypes", [String, NotebookCellTextModel, Object, ViewContext, Object, Object, Object, Object, Object, Object])
], CodeCellViewModel);
export { CodeCellViewModel };
