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
var NotebookTextDiffEditor_1;
import * as nls from '../../../../../nls.js';
import * as DOM from '../../../../../base/browser/dom.js';
import { findLastIdx } from '../../../../../base/common/arraysFind.js';
import { IStorageService } from '../../../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../../../platform/telemetry/common/telemetry.js';
import { IThemeService, registerThemingParticipant } from '../../../../../platform/theme/common/themeService.js';
import { getDefaultNotebookCreationOptions } from '../notebookEditorWidget.js';
import { CancellationTokenSource } from '../../../../../base/common/cancellation.js';
import { SideBySideDiffElementViewModel } from './diffElementViewModel.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { CellDiffPlaceholderRenderer, CellDiffSideBySideRenderer, CellDiffSingleSideRenderer, NotebookCellTextDiffListDelegate, NotebookDocumentMetadataDiffRenderer, NotebookTextDiffList } from './notebookDiffList.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { diffDiagonalFill, editorBackground, focusBorder, foreground } from '../../../../../platform/theme/common/colorRegistry.js';
import { INotebookEditorWorkerService } from '../../common/services/notebookWorkerService.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { BareFontInfo } from '../../../../../editor/common/config/fontInfo.js';
import { PixelRatio } from '../../../../../base/browser/pixelRatio.js';
import { DiffSide, DIFF_CELL_MARGIN } from './notebookDiffEditorBrowser.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { DisposableStore, toDisposable } from '../../../../../base/common/lifecycle.js';
import { EditorPane } from '../../../../browser/parts/editor/editorPane.js';
import { CellUri, NOTEBOOK_DIFF_EDITOR_ID, NotebookSetting } from '../../common/notebookCommon.js';
import { SequencerByKey } from '../../../../../base/common/async.js';
import { generateUuid } from '../../../../../base/common/uuid.js';
import { BackLayerWebView } from '../view/renderers/backLayerWebView.js';
import { NotebookDiffEditorEventDispatcher, NotebookDiffLayoutChangedEvent } from './eventDispatcher.js';
import { FontMeasurements } from '../../../../../editor/browser/config/fontMeasurements.js';
import { NotebookOptions } from '../notebookOptions.js';
import { cellIndexesToRanges, cellRangesToIndexes } from '../../common/notebookRange.js';
import { NotebookDiffOverviewRuler } from './notebookDiffOverviewRuler.js';
import { registerZIndex, ZIndex } from '../../../../../platform/layout/browser/zIndexRegistry.js';
import { NotebookDiffViewModel } from './notebookDiffViewModel.js';
import { INotebookService } from '../../common/notebookService.js';
import { DiffEditorHeightCalculatorService } from './editorHeightCalculator.js';
import { IEditorService } from '../../../../services/editor/common/editorService.js';
const $ = DOM.$;
class NotebookDiffEditorSelection {
    constructor(selections) {
        this.selections = selections;
    }
    compare(other) {
        if (!(other instanceof NotebookDiffEditorSelection)) {
            return 3;
        }
        if (this.selections.length !== other.selections.length) {
            return 3;
        }
        for (let i = 0; i < this.selections.length; i++) {
            if (this.selections[i] !== other.selections[i]) {
                return 3;
            }
        }
        return 1;
    }
    restore(options) {
        const notebookOptions = {
            cellSelections: cellIndexesToRanges(this.selections)
        };
        Object.assign(notebookOptions, options);
        return notebookOptions;
    }
}
let NotebookTextDiffEditor = class NotebookTextDiffEditor extends EditorPane {
    static { NotebookTextDiffEditor_1 = this; }
    static { this.ENTIRE_DIFF_OVERVIEW_WIDTH = 30; }
    static { this.ID = NOTEBOOK_DIFF_EDITOR_ID; }
    get textModel() {
        return this._model?.modified.notebook;
    }
    get notebookOptions() {
        return this._notebookOptions;
    }
    get isDisposed() {
        return this._isDisposed;
    }
    constructor(group, instantiationService, themeService, contextKeyService, notebookEditorWorkerService, configurationService, telemetryService, storageService, notebookService, editorService) {
        super(NotebookTextDiffEditor_1.ID, group, telemetryService, themeService, storageService);
        this.instantiationService = instantiationService;
        this.contextKeyService = contextKeyService;
        this.notebookEditorWorkerService = notebookEditorWorkerService;
        this.configurationService = configurationService;
        this.notebookService = notebookService;
        this.editorService = editorService;
        this.creationOptions = getDefaultNotebookCreationOptions();
        this._dimension = null;
        this._modifiedWebview = null;
        this._originalWebview = null;
        this._webviewTransparentCover = null;
        this._onMouseUp = this._register(new Emitter());
        this.onMouseUp = this._onMouseUp.event;
        this._onDidScroll = this._register(new Emitter());
        this.onDidScroll = this._onDidScroll.event;
        this.onDidChangeScroll = this._onDidScroll.event;
        this._model = null;
        this._modifiedResourceDisposableStore = this._register(new DisposableStore());
        this._insetModifyQueueByOutputId = new SequencerByKey();
        this._onDidDynamicOutputRendered = this._register(new Emitter());
        this.onDidDynamicOutputRendered = this._onDidDynamicOutputRendered.event;
        this._localStore = this._register(new DisposableStore());
        this._onDidChangeSelection = this._register(new Emitter());
        this.onDidChangeSelection = this._onDidChangeSelection.event;
        this._isDisposed = false;
        this.pendingLayouts = new WeakMap();
        this.diffEditorCalcuator = this.instantiationService.createInstance(DiffEditorHeightCalculatorService, this.fontInfo.lineHeight);
        this._notebookOptions = instantiationService.createInstance(NotebookOptions, this.window, false, undefined);
        this._register(this._notebookOptions);
        this._revealFirst = true;
    }
    get fontInfo() {
        if (!this._fontInfo) {
            this._fontInfo = this.createFontInfo();
        }
        return this._fontInfo;
    }
    createFontInfo() {
        const editorOptions = this.configurationService.getValue('editor');
        return FontMeasurements.readFontInfo(this.window, BareFontInfo.createFromRawSettings(editorOptions, PixelRatio.getInstance(this.window).value));
    }
    isOverviewRulerEnabled() {
        return this.configurationService.getValue(NotebookSetting.diffOverviewRuler) ?? false;
    }
    getSelection() {
        const selections = this._list.getFocus();
        return new NotebookDiffEditorSelection(selections);
    }
    toggleNotebookCellSelection(cell) {
    }
    updatePerformanceMetadata(cellId, executionId, duration, rendererId) {
    }
    async focusNotebookCell(cell, focus) {
    }
    async focusNextNotebookCell(cell, focus) {
    }
    didFocusOutputInputChange(inputFocused) {
    }
    getScrollTop() {
        return this._list?.scrollTop ?? 0;
    }
    getScrollHeight() {
        return this._list?.scrollHeight ?? 0;
    }
    getScrollPosition() {
        return {
            scrollTop: this.getScrollTop(),
            scrollLeft: this._list?.scrollLeft ?? 0
        };
    }
    setScrollPosition(scrollPosition) {
        if (!this._list) {
            return;
        }
        this._list.scrollTop = scrollPosition.scrollTop;
        if (scrollPosition.scrollLeft !== undefined) {
            this._list.scrollLeft = scrollPosition.scrollLeft;
        }
    }
    delegateVerticalScrollbarPointerDown(browserEvent) {
        this._list?.delegateVerticalScrollbarPointerDown(browserEvent);
    }
    updateOutputHeight(cellInfo, output, outputHeight, isInit) {
        const diffElement = cellInfo.diffElement;
        const cell = this.getCellByInfo(cellInfo);
        const outputIndex = cell.outputsViewModels.indexOf(output);
        if (diffElement instanceof SideBySideDiffElementViewModel) {
            const info = CellUri.parse(cellInfo.cellUri);
            if (!info) {
                return;
            }
            diffElement.updateOutputHeight(info.notebook.toString() === this._model?.original.resource.toString() ? DiffSide.Original : DiffSide.Modified, outputIndex, outputHeight);
        }
        else {
            diffElement.updateOutputHeight(diffElement.type === 'insert' ? DiffSide.Modified : DiffSide.Original, outputIndex, outputHeight);
        }
        if (isInit) {
            this._onDidDynamicOutputRendered.fire({ cell, output });
        }
    }
    setMarkupCellEditState(cellId, editState) {
    }
    didStartDragMarkupCell(cellId, event) {
    }
    didDragMarkupCell(cellId, event) {
    }
    didEndDragMarkupCell(cellId) {
    }
    didDropMarkupCell(cellId) {
    }
    didResizeOutput(cellId) {
    }
    createEditor(parent) {
        this._rootElement = DOM.append(parent, DOM.$('.notebook-text-diff-editor'));
        this._overflowContainer = document.createElement('div');
        this._overflowContainer.classList.add('notebook-overflow-widget-container', 'monaco-editor');
        DOM.append(parent, this._overflowContainer);
        const renderers = [
            this.instantiationService.createInstance(CellDiffSingleSideRenderer, this),
            this.instantiationService.createInstance(CellDiffSideBySideRenderer, this),
            this.instantiationService.createInstance(CellDiffPlaceholderRenderer, this),
            this.instantiationService.createInstance(NotebookDocumentMetadataDiffRenderer, this),
        ];
        this._listViewContainer = DOM.append(this._rootElement, DOM.$('.notebook-diff-list-view'));
        this._list = this.instantiationService.createInstance(NotebookTextDiffList, 'NotebookTextDiff', this._listViewContainer, this.instantiationService.createInstance(NotebookCellTextDiffListDelegate, this.window), renderers, this.contextKeyService, {
            setRowLineHeight: false,
            setRowHeight: false,
            supportDynamicHeights: true,
            horizontalScrolling: false,
            keyboardSupport: false,
            mouseSupport: true,
            multipleSelectionSupport: false,
            typeNavigationEnabled: true,
            paddingBottom: 0,
            styleController: (_suffix) => { return this._list; },
            overrideStyles: {
                listBackground: editorBackground,
                listActiveSelectionBackground: editorBackground,
                listActiveSelectionForeground: foreground,
                listFocusAndSelectionBackground: editorBackground,
                listFocusAndSelectionForeground: foreground,
                listFocusBackground: editorBackground,
                listFocusForeground: foreground,
                listHoverForeground: foreground,
                listHoverBackground: editorBackground,
                listHoverOutline: focusBorder,
                listFocusOutline: focusBorder,
                listInactiveSelectionBackground: editorBackground,
                listInactiveSelectionForeground: foreground,
                listInactiveFocusBackground: editorBackground,
                listInactiveFocusOutline: editorBackground,
            },
            accessibilityProvider: {
                getAriaLabel() { return null; },
                getWidgetAriaLabel() {
                    return nls.localize('notebookTreeAriaLabel', "Notebook Text Diff");
                }
            },
        });
        this._register(this._list);
        this._register(this._list.onMouseUp(e => {
            if (e.element) {
                if (typeof e.index === 'number') {
                    this._list.setFocus([e.index]);
                }
                this._onMouseUp.fire({ event: e.browserEvent, target: e.element });
            }
        }));
        this._register(this._list.onDidScroll(() => {
            this._onDidScroll.fire();
        }));
        this._register(this._list.onDidChangeFocus(() => this._onDidChangeSelection.fire({ reason: 2 })));
        this._overviewRulerContainer = document.createElement('div');
        this._overviewRulerContainer.classList.add('notebook-overview-ruler-container');
        this._rootElement.appendChild(this._overviewRulerContainer);
        this._registerOverviewRuler();
        this._webviewTransparentCover = DOM.append(this._list.rowsContainer, $('.webview-cover'));
        this._webviewTransparentCover.style.display = 'none';
        this._register(DOM.addStandardDisposableGenericMouseDownListener(this._overflowContainer, (e) => {
            if (e.target.classList.contains('slider') && this._webviewTransparentCover) {
                this._webviewTransparentCover.style.display = 'block';
            }
        }));
        this._register(DOM.addStandardDisposableGenericMouseUpListener(this._overflowContainer, () => {
            if (this._webviewTransparentCover) {
                this._webviewTransparentCover.style.display = 'none';
            }
        }));
        this._register(this._list.onDidScroll(e => {
            this._webviewTransparentCover.style.top = `${e.scrollTop}px`;
        }));
    }
    _registerOverviewRuler() {
        this._overviewRuler = this._register(this.instantiationService.createInstance(NotebookDiffOverviewRuler, this, NotebookTextDiffEditor_1.ENTIRE_DIFF_OVERVIEW_WIDTH, this._overviewRulerContainer));
    }
    _updateOutputsOffsetsInWebview(scrollTop, scrollHeight, activeWebview, getActiveNestedCell, diffSide) {
        activeWebview.element.style.height = `${scrollHeight}px`;
        if (activeWebview.insetMapping) {
            const updateItems = [];
            const removedItems = [];
            activeWebview.insetMapping.forEach((value, key) => {
                const cell = getActiveNestedCell(value.cellInfo.diffElement);
                if (!cell) {
                    return;
                }
                const viewIndex = this._list.indexOf(value.cellInfo.diffElement);
                if (viewIndex === undefined) {
                    return;
                }
                if (cell.outputsViewModels.indexOf(key) < 0) {
                    removedItems.push(key);
                }
                else {
                    const cellTop = this._list.getCellViewScrollTop(value.cellInfo.diffElement);
                    const outputIndex = cell.outputsViewModels.indexOf(key);
                    const outputOffset = value.cellInfo.diffElement.getOutputOffsetInCell(diffSide, outputIndex);
                    updateItems.push({
                        cell,
                        output: key,
                        cellTop: cellTop,
                        outputOffset: outputOffset,
                        forceDisplay: false
                    });
                }
            });
            activeWebview.removeInsets(removedItems);
            if (updateItems.length) {
                activeWebview.updateScrollTops(updateItems, []);
            }
        }
    }
    async setInput(input, options, context, token) {
        await super.setInput(input, options, context, token);
        const model = await input.resolve();
        if (this._model !== model) {
            this._detachModel();
            this._attachModel(model);
        }
        this._model = model;
        if (this._model === null) {
            return;
        }
        this._revealFirst = true;
        this._modifiedResourceDisposableStore.clear();
        this._layoutCancellationTokenSource = new CancellationTokenSource();
        this._modifiedResourceDisposableStore.add(Event.any(this._model.original.notebook.onDidChangeContent, this._model.modified.notebook.onDidChangeContent)(e => {
            if (this._model !== null && this.editorService.activeEditor !== input) {
                this._layoutCancellationTokenSource?.dispose();
                this._layoutCancellationTokenSource = new CancellationTokenSource();
                this.updateLayout(this._layoutCancellationTokenSource.token);
            }
        }));
        await this._createOriginalWebview(generateUuid(), this._model.original.viewType, this._model.original.resource);
        if (this._originalWebview) {
            this._modifiedResourceDisposableStore.add(this._originalWebview);
        }
        await this._createModifiedWebview(generateUuid(), this._model.modified.viewType, this._model.modified.resource);
        if (this._modifiedWebview) {
            this._modifiedResourceDisposableStore.add(this._modifiedWebview);
        }
        await this.updateLayout(this._layoutCancellationTokenSource.token, options?.cellSelections ? cellRangesToIndexes(options.cellSelections) : undefined);
    }
    _detachModel() {
        this._localStore.clear();
        this._originalWebview?.dispose();
        this._originalWebview?.element.remove();
        this._originalWebview = null;
        this._modifiedWebview?.dispose();
        this._modifiedWebview?.element.remove();
        this._modifiedWebview = null;
        this.notebookDiffViewModel?.dispose();
        this.notebookDiffViewModel = undefined;
        this._modifiedResourceDisposableStore.clear();
        this._list.clear();
    }
    _attachModel(model) {
        this._model = model;
        this._eventDispatcher = new NotebookDiffEditorEventDispatcher();
        const updateInsets = () => {
            DOM.scheduleAtNextAnimationFrame(this.window, () => {
                if (this._isDisposed) {
                    return;
                }
                if (this._modifiedWebview) {
                    this._updateOutputsOffsetsInWebview(this._list.scrollTop, this._list.scrollHeight, this._modifiedWebview, (diffElement) => {
                        return diffElement.modified;
                    }, DiffSide.Modified);
                }
                if (this._originalWebview) {
                    this._updateOutputsOffsetsInWebview(this._list.scrollTop, this._list.scrollHeight, this._originalWebview, (diffElement) => {
                        return diffElement.original;
                    }, DiffSide.Original);
                }
            });
        };
        this._localStore.add(this._list.onDidChangeContentHeight(() => {
            updateInsets();
        }));
        this._localStore.add(this._eventDispatcher.onDidChangeCellLayout(() => {
            updateInsets();
        }));
        const vm = this.notebookDiffViewModel = this._register(new NotebookDiffViewModel(this._model, this.notebookEditorWorkerService, this.configurationService, this._eventDispatcher, this.notebookService, this.diffEditorCalcuator, this.fontInfo, undefined));
        this._localStore.add(this.notebookDiffViewModel.onDidChangeItems(e => {
            this._originalWebview?.removeInsets([...this._originalWebview?.insetMapping.keys()]);
            this._modifiedWebview?.removeInsets([...this._modifiedWebview?.insetMapping.keys()]);
            if (this._revealFirst && typeof e.firstChangeIndex === 'number' && e.firstChangeIndex < this._list.length) {
                this._revealFirst = false;
                this._list.setFocus([e.firstChangeIndex]);
                this._list.reveal(e.firstChangeIndex, 0.3);
            }
            this._list.splice(e.start, e.deleteCount, e.elements);
            if (this.isOverviewRulerEnabled()) {
                this._overviewRuler.updateViewModels(vm.items, this._eventDispatcher);
            }
        }));
    }
    async _createModifiedWebview(id, viewType, resource) {
        this._modifiedWebview?.dispose();
        this._modifiedWebview = this.instantiationService.createInstance(BackLayerWebView, this, id, viewType, resource, {
            ...this._notebookOptions.computeDiffWebviewOptions(),
            fontFamily: this._generateFontFamily()
        }, undefined);
        this._list.rowsContainer.insertAdjacentElement('afterbegin', this._modifiedWebview.element);
        this._modifiedWebview.createWebview(this.window);
        this._modifiedWebview.element.style.width = `calc(50% - 16px)`;
        this._modifiedWebview.element.style.left = `calc(50%)`;
    }
    _generateFontFamily() {
        return this.fontInfo.fontFamily ?? `"SF Mono", Monaco, Menlo, Consolas, "Ubuntu Mono", "Liberation Mono", "DejaVu Sans Mono", "Courier New", monospace`;
    }
    async _createOriginalWebview(id, viewType, resource) {
        this._originalWebview?.dispose();
        this._originalWebview = this.instantiationService.createInstance(BackLayerWebView, this, id, viewType, resource, {
            ...this._notebookOptions.computeDiffWebviewOptions(),
            fontFamily: this._generateFontFamily()
        }, undefined);
        this._list.rowsContainer.insertAdjacentElement('afterbegin', this._originalWebview.element);
        this._originalWebview.createWebview(this.window);
        this._originalWebview.element.style.width = `calc(50% - 16px)`;
        this._originalWebview.element.style.left = `16px`;
    }
    setOptions(options) {
        const selections = options?.cellSelections ? cellRangesToIndexes(options.cellSelections) : undefined;
        if (selections) {
            this._list.setFocus(selections);
        }
    }
    async updateLayout(token, selections) {
        if (!this._model || !this.notebookDiffViewModel) {
            return;
        }
        await this.notebookDiffViewModel.computeDiff(token);
        if (token.isCancellationRequested) {
            return;
        }
        if (selections) {
            this._list.setFocus(selections);
        }
    }
    scheduleOutputHeightAck(cellInfo, outputId, height) {
        const diffElement = cellInfo.diffElement;
        let diffSide = DiffSide.Original;
        if (diffElement instanceof SideBySideDiffElementViewModel) {
            const info = CellUri.parse(cellInfo.cellUri);
            if (!info) {
                return;
            }
            diffSide = info.notebook.toString() === this._model?.original.resource.toString() ? DiffSide.Original : DiffSide.Modified;
        }
        else {
            diffSide = diffElement.type === 'insert' ? DiffSide.Modified : DiffSide.Original;
        }
        const webview = diffSide === DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
        DOM.scheduleAtNextAnimationFrame(this.window, () => {
            webview?.ackHeight([{ cellId: cellInfo.cellId, outputId, height }]);
        }, 10);
    }
    layoutNotebookCell(cell, height) {
        const relayout = (cell, height) => {
            this._list.updateElementHeight2(cell, height);
        };
        if (this.pendingLayouts.has(cell)) {
            this.pendingLayouts.get(cell).dispose();
        }
        let r;
        const layoutDisposable = DOM.scheduleAtNextAnimationFrame(this.window, () => {
            this.pendingLayouts.delete(cell);
            relayout(cell, height);
            r();
        });
        this.pendingLayouts.set(cell, toDisposable(() => {
            layoutDisposable.dispose();
            r();
        }));
        return new Promise(resolve => { r = resolve; });
    }
    setScrollTop(scrollTop) {
        this._list.scrollTop = scrollTop;
    }
    triggerScroll(event) {
        this._list.triggerScrollFromMouseWheelEvent(event);
    }
    previousChange() {
        if (!this.notebookDiffViewModel) {
            return;
        }
        let currFocus = this._list.getFocus()[0];
        if (isNaN(currFocus) || currFocus < 0) {
            currFocus = 0;
        }
        let prevChangeIndex = currFocus - 1;
        const currentViewModels = this.notebookDiffViewModel.items;
        while (prevChangeIndex >= 0) {
            const vm = currentViewModels[prevChangeIndex];
            if (vm.type !== 'unchanged' && vm.type !== 'placeholder') {
                break;
            }
            prevChangeIndex--;
        }
        if (prevChangeIndex >= 0) {
            this._list.setFocus([prevChangeIndex]);
            this._list.reveal(prevChangeIndex);
        }
        else {
            const index = findLastIdx(currentViewModels, vm => vm.type !== 'unchanged' && vm.type !== 'placeholder');
            if (index >= 0) {
                this._list.setFocus([index]);
                this._list.reveal(index);
            }
        }
    }
    nextChange() {
        if (!this.notebookDiffViewModel) {
            return;
        }
        let currFocus = this._list.getFocus()[0];
        if (isNaN(currFocus) || currFocus < 0) {
            currFocus = 0;
        }
        let nextChangeIndex = currFocus + 1;
        const currentViewModels = this.notebookDiffViewModel.items;
        while (nextChangeIndex < currentViewModels.length) {
            const vm = currentViewModels[nextChangeIndex];
            if (vm.type !== 'unchanged' && vm.type !== 'placeholder') {
                break;
            }
            nextChangeIndex++;
        }
        if (nextChangeIndex < currentViewModels.length) {
            this._list.setFocus([nextChangeIndex]);
            this._list.reveal(nextChangeIndex);
        }
        else {
            const index = currentViewModels.findIndex(vm => vm.type !== 'unchanged' && vm.type !== 'placeholder');
            if (index >= 0) {
                this._list.setFocus([index]);
                this._list.reveal(index);
            }
        }
    }
    createOutput(cellDiffViewModel, cellViewModel, output, getOffset, diffSide) {
        this._insetModifyQueueByOutputId.queue(output.source.model.outputId + (diffSide === DiffSide.Modified ? '-right' : 'left'), async () => {
            const activeWebview = diffSide === DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
            if (!activeWebview) {
                return;
            }
            if (!activeWebview.insetMapping.has(output.source)) {
                const cellTop = this._list.getCellViewScrollTop(cellDiffViewModel);
                await activeWebview.createOutput({ diffElement: cellDiffViewModel, cellHandle: cellViewModel.handle, cellId: cellViewModel.id, cellUri: cellViewModel.uri }, output, cellTop, getOffset());
            }
            else {
                const cellTop = this._list.getCellViewScrollTop(cellDiffViewModel);
                const outputIndex = cellViewModel.outputsViewModels.indexOf(output.source);
                const outputOffset = cellDiffViewModel.getOutputOffsetInCell(diffSide, outputIndex);
                activeWebview.updateScrollTops([{
                        cell: cellViewModel,
                        output: output.source,
                        cellTop,
                        outputOffset,
                        forceDisplay: true
                    }], []);
            }
        });
    }
    updateMarkupCellHeight() {
    }
    getCellByInfo(cellInfo) {
        return cellInfo.diffElement.getCellByUri(cellInfo.cellUri);
    }
    getCellById(cellId) {
        throw new Error('Not implemented');
    }
    removeInset(cellDiffViewModel, cellViewModel, displayOutput, diffSide) {
        this._insetModifyQueueByOutputId.queue(displayOutput.model.outputId + (diffSide === DiffSide.Modified ? '-right' : 'left'), async () => {
            const activeWebview = diffSide === DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
            if (!activeWebview) {
                return;
            }
            if (!activeWebview.insetMapping.has(displayOutput)) {
                return;
            }
            activeWebview.removeInsets([displayOutput]);
        });
    }
    showInset(cellDiffViewModel, cellViewModel, displayOutput, diffSide) {
        this._insetModifyQueueByOutputId.queue(displayOutput.model.outputId + (diffSide === DiffSide.Modified ? '-right' : 'left'), async () => {
            const activeWebview = diffSide === DiffSide.Modified ? this._modifiedWebview : this._originalWebview;
            if (!activeWebview) {
                return;
            }
            if (!activeWebview.insetMapping.has(displayOutput)) {
                return;
            }
            const cellTop = this._list.getCellViewScrollTop(cellDiffViewModel);
            const outputIndex = cellViewModel.outputsViewModels.indexOf(displayOutput);
            const outputOffset = cellDiffViewModel.getOutputOffsetInCell(diffSide, outputIndex);
            activeWebview.updateScrollTops([{
                    cell: cellViewModel,
                    output: displayOutput,
                    cellTop,
                    outputOffset,
                    forceDisplay: true,
                }], []);
        });
    }
    hideInset(cellDiffViewModel, cellViewModel, output) {
        this._modifiedWebview?.hideInset(output);
        this._originalWebview?.hideInset(output);
    }
    getDomNode() {
        return this._rootElement;
    }
    getOverflowContainerDomNode() {
        return this._overflowContainer;
    }
    getControl() {
        return this;
    }
    clearInput() {
        super.clearInput();
        this._modifiedResourceDisposableStore.clear();
        this._list?.splice(0, this._list?.length || 0);
        this._model = null;
        this.notebookDiffViewModel?.dispose();
        this.notebookDiffViewModel = undefined;
    }
    deltaCellOutputContainerClassNames(diffSide, cellId, added, removed) {
        if (diffSide === DiffSide.Original) {
            this._originalWebview?.deltaCellContainerClassNames(cellId, added, removed);
        }
        else {
            this._modifiedWebview?.deltaCellContainerClassNames(cellId, added, removed);
        }
    }
    getLayoutInfo() {
        if (!this._list) {
            throw new Error('Editor is not initalized successfully');
        }
        return {
            width: this._dimension.width,
            height: this._dimension.height,
            fontInfo: this.fontInfo,
            scrollHeight: this._list?.getScrollHeight() ?? 0,
            stickyHeight: 0,
        };
    }
    layout(dimension, _position) {
        this._rootElement.classList.toggle('mid-width', dimension.width < 1000 && dimension.width >= 600);
        this._rootElement.classList.toggle('narrow-width', dimension.width < 600);
        const overviewRulerEnabled = this.isOverviewRulerEnabled();
        this._dimension = dimension.with(dimension.width - (overviewRulerEnabled ? NotebookTextDiffEditor_1.ENTIRE_DIFF_OVERVIEW_WIDTH : 0));
        this._listViewContainer.style.height = `${dimension.height}px`;
        this._listViewContainer.style.width = `${this._dimension.width}px`;
        this._list?.layout(this._dimension.height, this._dimension.width);
        if (this._modifiedWebview) {
            this._modifiedWebview.element.style.width = `calc(50% - 16px)`;
            this._modifiedWebview.element.style.left = `calc(50%)`;
        }
        if (this._originalWebview) {
            this._originalWebview.element.style.width = `calc(50% - 16px)`;
            this._originalWebview.element.style.left = `16px`;
        }
        if (this._webviewTransparentCover) {
            this._webviewTransparentCover.style.height = `${this._dimension.height}px`;
            this._webviewTransparentCover.style.width = `${this._dimension.width}px`;
        }
        if (overviewRulerEnabled) {
            this._overviewRuler.layout();
        }
        this._eventDispatcher?.emit([new NotebookDiffLayoutChangedEvent({ width: true, fontInfo: true }, this.getLayoutInfo())]);
    }
    dispose() {
        this._isDisposed = true;
        this._layoutCancellationTokenSource?.dispose();
        this._detachModel();
        super.dispose();
    }
};
NotebookTextDiffEditor = NotebookTextDiffEditor_1 = __decorate([
    __param(1, IInstantiationService),
    __param(2, IThemeService),
    __param(3, IContextKeyService),
    __param(4, INotebookEditorWorkerService),
    __param(5, IConfigurationService),
    __param(6, ITelemetryService),
    __param(7, IStorageService),
    __param(8, INotebookService),
    __param(9, IEditorService),
    __metadata("design:paramtypes", [Object, Object, Object, Object, Object, Object, Object, Object, Object, Object])
], NotebookTextDiffEditor);
export { NotebookTextDiffEditor };
registerZIndex(ZIndex.Base, 10, 'notebook-diff-view-viewport-slider');
registerThemingParticipant((theme, collector) => {
    const diffDiagonalFillColor = theme.getColor(diffDiagonalFill);
    collector.addRule(`
	.notebook-text-diff-editor .diagonal-fill {
		background-image: linear-gradient(
			-45deg,
			${diffDiagonalFillColor} 12.5%,
			#0000 12.5%, #0000 50%,
			${diffDiagonalFillColor} 50%, ${diffDiagonalFillColor} 62.5%,
			#0000 62.5%, #0000 100%
		);
		background-size: 8px 8px;
	}
	`);
    collector.addRule(`.notebook-text-diff-editor .cell-body { margin: ${DIFF_CELL_MARGIN}px; }`);
    collector.addRule(`.notebook-text-diff-editor .cell-placeholder-body { margin: ${DIFF_CELL_MARGIN}px 0; }`);
});
