import { Emitter } from '../../../../../base/common/event.js';
import { hash } from '../../../../../base/common/hash.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { DiffEditorWidget } from '../../../../../editor/browser/widget/diffEditor/diffEditorWidget.js';
import { getEditorPadding } from './diffCellEditorOptions.js';
import { DiffNestedCellViewModel } from './diffNestedCellViewModel.js';
import { NotebookDiffViewEventType } from './eventDispatcher.js';
import { DIFF_CELL_MARGIN, DiffSide } from './notebookDiffEditorBrowser.js';
import { CellLayoutState } from '../notebookBrowser.js';
import { getFormattedMetadataJSON } from '../../common/model/notebookCellTextModel.js';
import { CellUri } from '../../common/notebookCommon.js';
import { Schemas } from '../../../../../base/common/network.js';
import { NotebookDocumentMetadataTextModel } from '../../common/model/notebookMetadataTextModel.js';
const PropertyHeaderHeight = 25;
export const HeightOfHiddenLinesRegionInDiffEditor = 24;
export const DefaultLineHeight = 17;
export var PropertyFoldingState;
(function (PropertyFoldingState) {
    PropertyFoldingState[PropertyFoldingState["Expanded"] = 0] = "Expanded";
    PropertyFoldingState[PropertyFoldingState["Collapsed"] = 1] = "Collapsed";
})(PropertyFoldingState || (PropertyFoldingState = {}));
export const OUTPUT_EDITOR_HEIGHT_MAGIC = 1440;
export class DiffElementViewModelBase extends Disposable {
    constructor(mainDocumentTextModel, editorEventDispatcher, initData) {
        super();
        this.mainDocumentTextModel = mainDocumentTextModel;
        this.editorEventDispatcher = editorEventDispatcher;
        this.initData = initData;
        this._layoutInfoEmitter = this._register(new Emitter());
        this.onDidLayoutChange = this._layoutInfoEmitter.event;
        this._register(this.editorEventDispatcher.onDidChangeLayout(e => this._layoutInfoEmitter.fire({ outerWidth: true })));
    }
}
export class DiffElementPlaceholderViewModel extends DiffElementViewModelBase {
    constructor(mainDocumentTextModel, editorEventDispatcher, initData) {
        super(mainDocumentTextModel, editorEventDispatcher, initData);
        this.type = 'placeholder';
        this.hiddenCells = [];
        this._unfoldHiddenCells = this._register(new Emitter());
        this.onUnfoldHiddenCells = this._unfoldHiddenCells.event;
        this.renderOutput = false;
    }
    get totalHeight() {
        return 24 + (2 * DIFF_CELL_MARGIN);
    }
    getHeight(_) {
        return this.totalHeight;
    }
    layoutChange() {
    }
    showHiddenCells() {
        this._unfoldHiddenCells.fire();
    }
}
export class NotebookDocumentMetadataViewModel extends DiffElementViewModelBase {
    set editorHeight(height) {
        this._layout({ editorHeight: height });
    }
    get editorHeight() {
        throw new Error('Use Cell.layoutInfo.editorHeight');
    }
    set editorMargin(margin) {
        this._layout({ editorMargin: margin });
    }
    get editorMargin() {
        throw new Error('Use Cell.layoutInfo.editorMargin');
    }
    get layoutInfo() {
        return this._layoutInfo;
    }
    get totalHeight() {
        return this.layoutInfo.totalHeight;
    }
    constructor(originalDocumentTextModel, modifiedDocumentTextModel, type, editorEventDispatcher, initData, notebookService, editorHeightCalculator) {
        super(originalDocumentTextModel, editorEventDispatcher, initData);
        this.originalDocumentTextModel = originalDocumentTextModel;
        this.modifiedDocumentTextModel = modifiedDocumentTextModel;
        this.type = type;
        this.editorHeightCalculator = editorHeightCalculator;
        this.renderOutput = false;
        this._sourceEditorViewState = null;
        const cellStatusHeight = PropertyHeaderHeight;
        this._layoutInfo = {
            width: 0,
            editorHeight: 0,
            editorMargin: 0,
            metadataHeight: 0,
            cellStatusHeight,
            metadataStatusHeight: 0,
            rawOutputHeight: 0,
            outputTotalHeight: 0,
            outputStatusHeight: 0,
            outputMetadataHeight: 0,
            bodyMargin: 32,
            totalHeight: 82 + cellStatusHeight + 0,
            layoutState: CellLayoutState.Uninitialized
        };
        this.cellFoldingState = type === 'modifiedMetadata' ? PropertyFoldingState.Expanded : PropertyFoldingState.Collapsed;
        this.originalMetadata = this._register(new NotebookDocumentMetadataTextModel(originalDocumentTextModel));
        this.modifiedMetadata = this._register(new NotebookDocumentMetadataTextModel(modifiedDocumentTextModel));
    }
    async computeHeights() {
        if (this.type === 'unchangedMetadata') {
            this.editorHeight = this.editorHeightCalculator.computeHeightFromLines(this.originalMetadata.textBuffer.getLineCount());
        }
        else {
            const original = this.originalMetadata.uri;
            const modified = this.modifiedMetadata.uri;
            this.editorHeight = await this.editorHeightCalculator.diffAndComputeHeight(original, modified);
        }
    }
    layoutChange() {
        this._layout({ recomputeOutput: true });
    }
    _layout(delta) {
        const width = delta.width !== undefined ? delta.width : this._layoutInfo.width;
        const editorHeight = delta.editorHeight !== undefined ? delta.editorHeight : this._layoutInfo.editorHeight;
        const editorMargin = delta.editorMargin !== undefined ? delta.editorMargin : this._layoutInfo.editorMargin;
        const cellStatusHeight = delta.cellStatusHeight !== undefined ? delta.cellStatusHeight : this._layoutInfo.cellStatusHeight;
        const bodyMargin = delta.bodyMargin !== undefined ? delta.bodyMargin : this._layoutInfo.bodyMargin;
        const totalHeight = editorHeight
            + editorMargin
            + cellStatusHeight
            + bodyMargin;
        const newLayout = {
            width: width,
            editorHeight: editorHeight,
            editorMargin: editorMargin,
            metadataHeight: 0,
            cellStatusHeight,
            metadataStatusHeight: 0,
            outputTotalHeight: 0,
            outputStatusHeight: 0,
            bodyMargin: bodyMargin,
            rawOutputHeight: 0,
            outputMetadataHeight: 0,
            totalHeight: totalHeight,
            layoutState: CellLayoutState.Measured
        };
        let somethingChanged = false;
        const changeEvent = {};
        if (newLayout.width !== this._layoutInfo.width) {
            changeEvent.width = true;
            somethingChanged = true;
        }
        if (newLayout.editorHeight !== this._layoutInfo.editorHeight) {
            changeEvent.editorHeight = true;
            somethingChanged = true;
        }
        if (newLayout.editorMargin !== this._layoutInfo.editorMargin) {
            changeEvent.editorMargin = true;
            somethingChanged = true;
        }
        if (newLayout.cellStatusHeight !== this._layoutInfo.cellStatusHeight) {
            changeEvent.cellStatusHeight = true;
            somethingChanged = true;
        }
        if (newLayout.bodyMargin !== this._layoutInfo.bodyMargin) {
            changeEvent.bodyMargin = true;
            somethingChanged = true;
        }
        if (newLayout.totalHeight !== this._layoutInfo.totalHeight) {
            changeEvent.totalHeight = true;
            somethingChanged = true;
        }
        if (somethingChanged) {
            this._layoutInfo = newLayout;
            this._fireLayoutChangeEvent(changeEvent);
        }
    }
    getHeight(lineHeight) {
        if (this._layoutInfo.layoutState === CellLayoutState.Uninitialized) {
            const editorHeight = this.cellFoldingState === PropertyFoldingState.Collapsed ? 0 : this.computeInputEditorHeight(lineHeight);
            return this._computeTotalHeight(editorHeight);
        }
        else {
            return this._layoutInfo.totalHeight;
        }
    }
    _computeTotalHeight(editorHeight) {
        const totalHeight = editorHeight
            + this._layoutInfo.editorMargin
            + this._layoutInfo.metadataHeight
            + this._layoutInfo.cellStatusHeight
            + this._layoutInfo.metadataStatusHeight
            + this._layoutInfo.outputTotalHeight
            + this._layoutInfo.outputStatusHeight
            + this._layoutInfo.outputMetadataHeight
            + this._layoutInfo.bodyMargin;
        return totalHeight;
    }
    computeInputEditorHeight(_lineHeight) {
        return this.editorHeightCalculator.computeHeightFromLines(Math.max(this.originalMetadata.textBuffer.getLineCount(), this.modifiedMetadata.textBuffer.getLineCount()));
    }
    _fireLayoutChangeEvent(state) {
        this._layoutInfoEmitter.fire(state);
        this.editorEventDispatcher.emit([{ type: NotebookDiffViewEventType.CellLayoutChanged, source: this._layoutInfo }]);
    }
    getComputedCellContainerWidth(layoutInfo, diffEditor, fullWidth) {
        if (fullWidth) {
            return layoutInfo.width - 2 * DIFF_CELL_MARGIN + (diffEditor ? DiffEditorWidget.ENTIRE_DIFF_OVERVIEW_WIDTH : 0) - 2;
        }
        return (layoutInfo.width - 2 * DIFF_CELL_MARGIN + (diffEditor ? DiffEditorWidget.ENTIRE_DIFF_OVERVIEW_WIDTH : 0)) / 2 - 18 - 2;
    }
    getSourceEditorViewState() {
        return this._sourceEditorViewState;
    }
    saveSpirceEditorViewState(viewState) {
        this._sourceEditorViewState = viewState;
    }
}
export class DiffElementCellViewModelBase extends DiffElementViewModelBase {
    hideUnchangedCells() {
        this._hideUnchangedCells.fire();
    }
    set rawOutputHeight(height) {
        this._layout({ rawOutputHeight: Math.min(OUTPUT_EDITOR_HEIGHT_MAGIC, height) });
    }
    get rawOutputHeight() {
        throw new Error('Use Cell.layoutInfo.rawOutputHeight');
    }
    set outputStatusHeight(height) {
        this._layout({ outputStatusHeight: height });
    }
    get outputStatusHeight() {
        throw new Error('Use Cell.layoutInfo.outputStatusHeight');
    }
    set outputMetadataHeight(height) {
        this._layout({ outputMetadataHeight: height });
    }
    get outputMetadataHeight() {
        throw new Error('Use Cell.layoutInfo.outputStatusHeight');
    }
    set editorHeight(height) {
        this._layout({ editorHeight: height });
    }
    get editorHeight() {
        throw new Error('Use Cell.layoutInfo.editorHeight');
    }
    set editorMargin(margin) {
        this._layout({ editorMargin: margin });
    }
    get editorMargin() {
        throw new Error('Use Cell.layoutInfo.editorMargin');
    }
    set metadataStatusHeight(height) {
        this._layout({ metadataStatusHeight: height });
    }
    get metadataStatusHeight() {
        throw new Error('Use Cell.layoutInfo.outputStatusHeight');
    }
    set metadataHeight(height) {
        this._layout({ metadataHeight: height });
    }
    get metadataHeight() {
        throw new Error('Use Cell.layoutInfo.metadataHeight');
    }
    set renderOutput(value) {
        this._renderOutput = value;
        this._layout({ recomputeOutput: true });
        this._stateChangeEmitter.fire({ renderOutput: this._renderOutput });
    }
    get renderOutput() {
        return this._renderOutput;
    }
    get layoutInfo() {
        return this._layoutInfo;
    }
    get totalHeight() {
        return this.layoutInfo.totalHeight;
    }
    get ignoreOutputs() {
        return this.configurationService.getValue('notebook.diff.ignoreOutputs') || !!(this.mainDocumentTextModel?.transientOptions.transientOutputs);
    }
    get ignoreMetadata() {
        return this.configurationService.getValue('notebook.diff.ignoreMetadata');
    }
    constructor(mainDocumentTextModel, original, modified, type, editorEventDispatcher, initData, notebookService, index, configurationService, diffEditorHeightCalculator) {
        super(mainDocumentTextModel, editorEventDispatcher, initData);
        this.type = type;
        this.index = index;
        this.configurationService = configurationService;
        this.diffEditorHeightCalculator = diffEditorHeightCalculator;
        this._stateChangeEmitter = this._register(new Emitter());
        this.onDidStateChange = this._stateChangeEmitter.event;
        this._hideUnchangedCells = this._register(new Emitter());
        this.onHideUnchangedCells = this._hideUnchangedCells.event;
        this._renderOutput = true;
        this._sourceEditorViewState = null;
        this._outputEditorViewState = null;
        this._metadataEditorViewState = null;
        this.original = original ? this._register(new DiffNestedCellViewModel(original, notebookService)) : undefined;
        this.modified = modified ? this._register(new DiffNestedCellViewModel(modified, notebookService)) : undefined;
        const editorHeight = this._estimateEditorHeight(initData.fontInfo);
        const cellStatusHeight = PropertyHeaderHeight;
        this._layoutInfo = {
            width: 0,
            editorHeight: editorHeight,
            editorMargin: 0,
            metadataHeight: 0,
            cellStatusHeight,
            metadataStatusHeight: this.ignoreMetadata ? 0 : PropertyHeaderHeight,
            rawOutputHeight: 0,
            outputTotalHeight: 0,
            outputStatusHeight: this.ignoreOutputs ? 0 : PropertyHeaderHeight,
            outputMetadataHeight: 0,
            bodyMargin: 32,
            totalHeight: 82 + cellStatusHeight + editorHeight,
            layoutState: CellLayoutState.Uninitialized
        };
        this.cellFoldingState = modified?.getTextBufferHash() !== original?.getTextBufferHash() ? PropertyFoldingState.Expanded : PropertyFoldingState.Collapsed;
        this.metadataFoldingState = PropertyFoldingState.Collapsed;
        this.outputFoldingState = PropertyFoldingState.Collapsed;
    }
    layoutChange() {
        this._layout({ recomputeOutput: true });
    }
    _estimateEditorHeight(fontInfo) {
        const lineHeight = fontInfo?.lineHeight ?? 17;
        switch (this.type) {
            case 'unchanged':
            case 'insert':
                {
                    const lineCount = this.modified.textModel.textBuffer.getLineCount();
                    const editorHeight = lineCount * lineHeight + getEditorPadding(lineCount).top + getEditorPadding(lineCount).bottom;
                    return editorHeight;
                }
            case 'delete':
            case 'modified':
                {
                    const lineCount = this.original.textModel.textBuffer.getLineCount();
                    const editorHeight = lineCount * lineHeight + getEditorPadding(lineCount).top + getEditorPadding(lineCount).bottom;
                    return editorHeight;
                }
        }
    }
    _layout(delta) {
        const width = delta.width !== undefined ? delta.width : this._layoutInfo.width;
        const editorHeight = delta.editorHeight !== undefined ? delta.editorHeight : this._layoutInfo.editorHeight;
        const editorMargin = delta.editorMargin !== undefined ? delta.editorMargin : this._layoutInfo.editorMargin;
        const metadataHeight = delta.metadataHeight !== undefined ? delta.metadataHeight : this._layoutInfo.metadataHeight;
        const cellStatusHeight = delta.cellStatusHeight !== undefined ? delta.cellStatusHeight : this._layoutInfo.cellStatusHeight;
        const metadataStatusHeight = delta.metadataStatusHeight !== undefined ? delta.metadataStatusHeight : this._layoutInfo.metadataStatusHeight;
        const rawOutputHeight = delta.rawOutputHeight !== undefined ? delta.rawOutputHeight : this._layoutInfo.rawOutputHeight;
        const outputStatusHeight = delta.outputStatusHeight !== undefined ? delta.outputStatusHeight : this._layoutInfo.outputStatusHeight;
        const bodyMargin = delta.bodyMargin !== undefined ? delta.bodyMargin : this._layoutInfo.bodyMargin;
        const outputMetadataHeight = delta.outputMetadataHeight !== undefined ? delta.outputMetadataHeight : this._layoutInfo.outputMetadataHeight;
        const outputHeight = this.ignoreOutputs ? 0 : (delta.recomputeOutput || delta.rawOutputHeight !== undefined || delta.outputMetadataHeight !== undefined) ? this._getOutputTotalHeight(rawOutputHeight, outputMetadataHeight) : this._layoutInfo.outputTotalHeight;
        const totalHeight = editorHeight
            + editorMargin
            + cellStatusHeight
            + metadataHeight
            + metadataStatusHeight
            + outputHeight
            + outputStatusHeight
            + bodyMargin;
        const newLayout = {
            width: width,
            editorHeight: editorHeight,
            editorMargin: editorMargin,
            metadataHeight: metadataHeight,
            cellStatusHeight,
            metadataStatusHeight: metadataStatusHeight,
            outputTotalHeight: outputHeight,
            outputStatusHeight: outputStatusHeight,
            bodyMargin: bodyMargin,
            rawOutputHeight: rawOutputHeight,
            outputMetadataHeight: outputMetadataHeight,
            totalHeight: totalHeight,
            layoutState: CellLayoutState.Measured
        };
        let somethingChanged = false;
        const changeEvent = {};
        if (newLayout.width !== this._layoutInfo.width) {
            changeEvent.width = true;
            somethingChanged = true;
        }
        if (newLayout.editorHeight !== this._layoutInfo.editorHeight) {
            changeEvent.editorHeight = true;
            somethingChanged = true;
        }
        if (newLayout.editorMargin !== this._layoutInfo.editorMargin) {
            changeEvent.editorMargin = true;
            somethingChanged = true;
        }
        if (newLayout.metadataHeight !== this._layoutInfo.metadataHeight) {
            changeEvent.metadataHeight = true;
            somethingChanged = true;
        }
        if (newLayout.cellStatusHeight !== this._layoutInfo.cellStatusHeight) {
            changeEvent.cellStatusHeight = true;
            somethingChanged = true;
        }
        if (newLayout.metadataStatusHeight !== this._layoutInfo.metadataStatusHeight) {
            changeEvent.metadataStatusHeight = true;
            somethingChanged = true;
        }
        if (newLayout.outputTotalHeight !== this._layoutInfo.outputTotalHeight) {
            changeEvent.outputTotalHeight = true;
            somethingChanged = true;
        }
        if (newLayout.outputStatusHeight !== this._layoutInfo.outputStatusHeight) {
            changeEvent.outputStatusHeight = true;
            somethingChanged = true;
        }
        if (newLayout.bodyMargin !== this._layoutInfo.bodyMargin) {
            changeEvent.bodyMargin = true;
            somethingChanged = true;
        }
        if (newLayout.outputMetadataHeight !== this._layoutInfo.outputMetadataHeight) {
            changeEvent.outputMetadataHeight = true;
            somethingChanged = true;
        }
        if (newLayout.totalHeight !== this._layoutInfo.totalHeight) {
            changeEvent.totalHeight = true;
            somethingChanged = true;
        }
        if (somethingChanged) {
            this._layoutInfo = newLayout;
            this._fireLayoutChangeEvent(changeEvent);
        }
    }
    getHeight(lineHeight) {
        if (this._layoutInfo.layoutState === CellLayoutState.Uninitialized) {
            const editorHeight = this.cellFoldingState === PropertyFoldingState.Collapsed ? 0 : this.computeInputEditorHeight(lineHeight);
            return this._computeTotalHeight(editorHeight);
        }
        else {
            return this._layoutInfo.totalHeight;
        }
    }
    _computeTotalHeight(editorHeight) {
        const totalHeight = editorHeight
            + this._layoutInfo.editorMargin
            + this._layoutInfo.metadataHeight
            + this._layoutInfo.cellStatusHeight
            + this._layoutInfo.metadataStatusHeight
            + this._layoutInfo.outputTotalHeight
            + this._layoutInfo.outputStatusHeight
            + this._layoutInfo.outputMetadataHeight
            + this._layoutInfo.bodyMargin;
        return totalHeight;
    }
    computeInputEditorHeight(lineHeight) {
        const lineCount = Math.max(this.original?.textModel.textBuffer.getLineCount() ?? 1, this.modified?.textModel.textBuffer.getLineCount() ?? 1);
        return this.diffEditorHeightCalculator.computeHeightFromLines(lineCount);
    }
    _getOutputTotalHeight(rawOutputHeight, metadataHeight) {
        if (this.outputFoldingState === PropertyFoldingState.Collapsed) {
            return 0;
        }
        if (this.renderOutput) {
            if (this.isOutputEmpty()) {
                return 24;
            }
            return this.getRichOutputTotalHeight() + metadataHeight;
        }
        else {
            return rawOutputHeight;
        }
    }
    _fireLayoutChangeEvent(state) {
        this._layoutInfoEmitter.fire(state);
        this.editorEventDispatcher.emit([{ type: NotebookDiffViewEventType.CellLayoutChanged, source: this._layoutInfo }]);
    }
    getComputedCellContainerWidth(layoutInfo, diffEditor, fullWidth) {
        if (fullWidth) {
            return layoutInfo.width - 2 * DIFF_CELL_MARGIN + (diffEditor ? DiffEditorWidget.ENTIRE_DIFF_OVERVIEW_WIDTH : 0) - 2;
        }
        return (layoutInfo.width - 2 * DIFF_CELL_MARGIN + (diffEditor ? DiffEditorWidget.ENTIRE_DIFF_OVERVIEW_WIDTH : 0)) / 2 - 18 - 2;
    }
    getOutputEditorViewState() {
        return this._outputEditorViewState;
    }
    saveOutputEditorViewState(viewState) {
        this._outputEditorViewState = viewState;
    }
    getMetadataEditorViewState() {
        return this._metadataEditorViewState;
    }
    saveMetadataEditorViewState(viewState) {
        this._metadataEditorViewState = viewState;
    }
    getSourceEditorViewState() {
        return this._sourceEditorViewState;
    }
    saveSpirceEditorViewState(viewState) {
        this._sourceEditorViewState = viewState;
    }
}
export class SideBySideDiffElementViewModel extends DiffElementCellViewModelBase {
    get originalDocument() {
        return this.otherDocumentTextModel;
    }
    get modifiedDocument() {
        return this.mainDocumentTextModel;
    }
    constructor(mainDocumentTextModel, otherDocumentTextModel, original, modified, type, editorEventDispatcher, initData, notebookService, configurationService, index, diffEditorHeightCalculator) {
        super(mainDocumentTextModel, original, modified, type, editorEventDispatcher, initData, notebookService, index, configurationService, diffEditorHeightCalculator);
        this.otherDocumentTextModel = otherDocumentTextModel;
        this.type = type;
        this.cellFoldingState = this.modified.textModel.getValue() !== this.original.textModel.getValue() ? PropertyFoldingState.Expanded : PropertyFoldingState.Collapsed;
        this.metadataFoldingState = PropertyFoldingState.Collapsed;
        this.outputFoldingState = PropertyFoldingState.Collapsed;
        if (this.checkMetadataIfModified()) {
            this.metadataFoldingState = PropertyFoldingState.Expanded;
        }
        if (this.checkIfOutputsModified()) {
            this.outputFoldingState = PropertyFoldingState.Expanded;
        }
        this._register(this.original.onDidChangeOutputLayout(() => {
            this._layout({ recomputeOutput: true });
        }));
        this._register(this.modified.onDidChangeOutputLayout(() => {
            this._layout({ recomputeOutput: true });
        }));
        this._register(this.modified.textModel.onDidChangeContent(() => {
            if (mainDocumentTextModel.transientOptions.cellContentMetadata) {
                const cellMetadataKeys = [...Object.keys(mainDocumentTextModel.transientOptions.cellContentMetadata)];
                const modifiedMedataRaw = Object.assign({}, this.modified.metadata);
                const originalCellMetadata = this.original.metadata;
                for (const key of cellMetadataKeys) {
                    if (key in originalCellMetadata) {
                        modifiedMedataRaw[key] = originalCellMetadata[key];
                    }
                }
                this.modified.textModel.metadata = modifiedMedataRaw;
            }
        }));
    }
    checkIfInputModified() {
        if (this.original.textModel.getTextBufferHash() === this.modified.textModel.getTextBufferHash()) {
            return false;
        }
        return {
            reason: 'Cell content has changed',
        };
    }
    checkIfOutputsModified() {
        if (this.mainDocumentTextModel.transientOptions.transientOutputs) {
            return false;
        }
        const ret = outputsEqual(this.original?.outputs ?? [], this.modified?.outputs ?? []);
        if (ret === 0) {
            return false;
        }
        return {
            reason: ret === 1 ? 'Output metadata has changed' : undefined,
            kind: ret
        };
    }
    checkMetadataIfModified() {
        const modified = hash(getFormattedMetadataJSON(this.mainDocumentTextModel.transientOptions.transientCellMetadata, this.original?.metadata || {}, this.original?.language)) !== hash(getFormattedMetadataJSON(this.mainDocumentTextModel.transientOptions.transientCellMetadata, this.modified?.metadata ?? {}, this.modified?.language));
        if (modified) {
            return { reason: undefined };
        }
        else {
            return false;
        }
    }
    updateOutputHeight(diffSide, index, height) {
        if (diffSide === DiffSide.Original) {
            this.original.updateOutputHeight(index, height);
        }
        else {
            this.modified.updateOutputHeight(index, height);
        }
    }
    getOutputOffsetInContainer(diffSide, index) {
        if (diffSide === DiffSide.Original) {
            return this.original.getOutputOffset(index);
        }
        else {
            return this.modified.getOutputOffset(index);
        }
    }
    getOutputOffsetInCell(diffSide, index) {
        const offsetInOutputsContainer = this.getOutputOffsetInContainer(diffSide, index);
        return this._layoutInfo.editorHeight
            + this._layoutInfo.editorMargin
            + this._layoutInfo.metadataHeight
            + this._layoutInfo.cellStatusHeight
            + this._layoutInfo.metadataStatusHeight
            + this._layoutInfo.outputStatusHeight
            + this._layoutInfo.bodyMargin / 2
            + offsetInOutputsContainer;
    }
    isOutputEmpty() {
        if (this.mainDocumentTextModel.transientOptions.transientOutputs) {
            return true;
        }
        if (this.checkIfOutputsModified()) {
            return false;
        }
        return (this.original?.outputs || []).length === 0;
    }
    getRichOutputTotalHeight() {
        return Math.max(this.original.getOutputTotalHeight(), this.modified.getOutputTotalHeight());
    }
    getNestedCellViewModel(diffSide) {
        return diffSide === DiffSide.Original ? this.original : this.modified;
    }
    getCellByUri(cellUri) {
        if (cellUri.toString() === this.original.uri.toString()) {
            return this.original;
        }
        else {
            return this.modified;
        }
    }
    computeInputEditorHeight(lineHeight) {
        if (this.type === 'modified' &&
            typeof this.editorHeightWithUnchangedLinesCollapsed === 'number' &&
            this.checkIfInputModified()) {
            return this.editorHeightWithUnchangedLinesCollapsed;
        }
        return super.computeInputEditorHeight(lineHeight);
    }
    async computeModifiedInputEditorHeight() {
        if (this.checkIfInputModified()) {
            this.editorHeightWithUnchangedLinesCollapsed = this._layoutInfo.editorHeight = await this.diffEditorHeightCalculator.diffAndComputeHeight(this.original.uri, this.modified.uri);
        }
    }
    async computeModifiedMetadataEditorHeight() {
        if (this.checkMetadataIfModified()) {
            const originalMetadataUri = CellUri.generateCellPropertyUri(this.originalDocument.uri, this.original.handle, Schemas.vscodeNotebookCellMetadata);
            const modifiedMetadataUri = CellUri.generateCellPropertyUri(this.modifiedDocument.uri, this.modified.handle, Schemas.vscodeNotebookCellMetadata);
            this._layoutInfo.metadataHeight = await this.diffEditorHeightCalculator.diffAndComputeHeight(originalMetadataUri, modifiedMetadataUri);
        }
    }
    async computeEditorHeights() {
        if (this.type === 'unchanged') {
            return;
        }
        await Promise.all([this.computeModifiedInputEditorHeight(), this.computeModifiedMetadataEditorHeight()]);
    }
}
export class SingleSideDiffElementViewModel extends DiffElementCellViewModelBase {
    get cellViewModel() {
        return this.type === 'insert' ? this.modified : this.original;
    }
    get originalDocument() {
        if (this.type === 'insert') {
            return this.otherDocumentTextModel;
        }
        else {
            return this.mainDocumentTextModel;
        }
    }
    get modifiedDocument() {
        if (this.type === 'insert') {
            return this.mainDocumentTextModel;
        }
        else {
            return this.otherDocumentTextModel;
        }
    }
    constructor(mainDocumentTextModel, otherDocumentTextModel, original, modified, type, editorEventDispatcher, initData, notebookService, configurationService, diffEditorHeightCalculator, index) {
        super(mainDocumentTextModel, original, modified, type, editorEventDispatcher, initData, notebookService, index, configurationService, diffEditorHeightCalculator);
        this.otherDocumentTextModel = otherDocumentTextModel;
        this.type = type;
        this._register(this.cellViewModel.onDidChangeOutputLayout(() => {
            this._layout({ recomputeOutput: true });
        }));
    }
    checkIfInputModified() {
        return {
            reason: 'Cell content has changed',
        };
    }
    getNestedCellViewModel(diffSide) {
        return this.type === 'insert' ? this.modified : this.original;
    }
    checkIfOutputsModified() {
        return false;
    }
    checkMetadataIfModified() {
        return false;
    }
    updateOutputHeight(diffSide, index, height) {
        this.cellViewModel?.updateOutputHeight(index, height);
    }
    getOutputOffsetInContainer(diffSide, index) {
        return this.cellViewModel.getOutputOffset(index);
    }
    getOutputOffsetInCell(diffSide, index) {
        const offsetInOutputsContainer = this.cellViewModel.getOutputOffset(index);
        return this._layoutInfo.editorHeight
            + this._layoutInfo.editorMargin
            + this._layoutInfo.metadataHeight
            + this._layoutInfo.cellStatusHeight
            + this._layoutInfo.metadataStatusHeight
            + this._layoutInfo.outputStatusHeight
            + this._layoutInfo.bodyMargin / 2
            + offsetInOutputsContainer;
    }
    isOutputEmpty() {
        if (this.mainDocumentTextModel.transientOptions.transientOutputs) {
            return true;
        }
        return (this.original?.outputs || this.modified?.outputs || []).length === 0;
    }
    getRichOutputTotalHeight() {
        return this.cellViewModel?.getOutputTotalHeight() ?? 0;
    }
    getCellByUri(cellUri) {
        return this.cellViewModel;
    }
}
export function outputEqual(a, b) {
    if (hash(a.metadata) === hash(b.metadata)) {
        return 2;
    }
    for (let j = 0; j < a.outputs.length; j++) {
        const aOutputItem = a.outputs[j];
        const bOutputItem = b.outputs[j];
        if (aOutputItem.mime !== bOutputItem.mime) {
            return 2;
        }
        if (aOutputItem.data.buffer.length !== bOutputItem.data.buffer.length) {
            return 2;
        }
        for (let k = 0; k < aOutputItem.data.buffer.length; k++) {
            if (aOutputItem.data.buffer[k] !== bOutputItem.data.buffer[k]) {
                return 2;
            }
        }
    }
    return 1;
}
function outputsEqual(original, modified) {
    if (original.length !== modified.length) {
        return 2;
    }
    const len = original.length;
    for (let i = 0; i < len; i++) {
        const a = original[i];
        const b = modified[i];
        if (hash(a.metadata) !== hash(b.metadata)) {
            return 1;
        }
        if (a.outputs.length !== b.outputs.length) {
            return 2;
        }
        for (let j = 0; j < a.outputs.length; j++) {
            const aOutputItem = a.outputs[j];
            const bOutputItem = b.outputs[j];
            if (aOutputItem.mime !== bOutputItem.mime) {
                return 2;
            }
            if (aOutputItem.data.buffer.length !== bOutputItem.data.buffer.length) {
                return 2;
            }
            for (let k = 0; k < aOutputItem.data.buffer.length; k++) {
                if (aOutputItem.data.buffer[k] !== bOutputItem.data.buffer[k]) {
                    return 2;
                }
            }
        }
    }
    return 0;
}
export function getStreamOutputData(outputs) {
    if (!outputs.length) {
        return null;
    }
    const first = outputs[0];
    const mime = first.mime;
    const sameStream = !outputs.find(op => op.mime !== mime);
    if (sameStream) {
        return outputs.map(opit => opit.data.toString()).join('');
    }
    else {
        return null;
    }
}
export function getFormattedOutputJSON(outputs) {
    if (outputs.length === 1) {
        const streamOutputData = getStreamOutputData(outputs[0].outputs);
        if (streamOutputData) {
            return streamOutputData;
        }
    }
    return JSON.stringify(outputs.map(output => {
        return ({
            metadata: output.metadata,
            outputItems: output.outputs.map(opit => ({
                mimeType: opit.mime,
                data: opit.data.toString()
            }))
        });
    }), undefined, '\t');
}
