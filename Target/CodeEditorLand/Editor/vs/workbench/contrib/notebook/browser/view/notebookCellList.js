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
import { ListError } from '../../../../../base/browser/ui/list/list.js';
import { Emitter, Event } from '../../../../../base/common/event.js';
import { Disposable, DisposableStore, MutableDisposable } from '../../../../../base/common/lifecycle.js';
import { isMacintosh } from '../../../../../base/common/platform.js';
import { PrefixSumComputer } from '../../../../../editor/common/model/prefixSumComputer.js';
import { IConfigurationService } from '../../../../../platform/configuration/common/configuration.js';
import { IContextKeyService } from '../../../../../platform/contextkey/common/contextkey.js';
import { IListService, WorkbenchList } from '../../../../../platform/list/browser/listService.js';
import { CursorAtBoundary, CellEditState, CellFocusMode, CellRevealRangeType, CursorAtLineBoundary } from '../notebookBrowser.js';
import { diff, NOTEBOOK_EDITOR_CURSOR_BOUNDARY, CellKind, SelectionStateType, NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY } from '../../common/notebookCommon.js';
import { cellRangesToIndexes, reduceCellRanges, cellRangesEqual } from '../../common/notebookRange.js';
import { NOTEBOOK_CELL_LIST_FOCUSED } from '../../common/notebookContextKeys.js';
import { clamp } from '../../../../../base/common/numbers.js';
import { FastDomNode } from '../../../../../base/browser/fastDomNode.js';
import { MarkupCellViewModel } from '../viewModel/markupCellViewModel.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { NotebookCellListView } from './notebookCellListView.js';
import { NotebookOptions } from '../notebookOptions.js';
import { INotebookExecutionStateService } from '../../common/notebookExecutionStateService.js';
import { NotebookCellAnchor } from './notebookCellAnchor.js';
import { NotebookViewZones } from '../viewParts/notebookViewZones.js';
function getVisibleCells(cells, hiddenRanges) {
    if (!hiddenRanges.length) {
        return cells;
    }
    let start = 0;
    let hiddenRangeIndex = 0;
    const result = [];
    while (start < cells.length && hiddenRangeIndex < hiddenRanges.length) {
        if (start < hiddenRanges[hiddenRangeIndex].start) {
            result.push(...cells.slice(start, hiddenRanges[hiddenRangeIndex].start));
        }
        start = hiddenRanges[hiddenRangeIndex].end + 1;
        hiddenRangeIndex++;
    }
    if (start < cells.length) {
        result.push(...cells.slice(start));
    }
    return result;
}
export const NOTEBOOK_WEBVIEW_BOUNDARY = 5000;
function validateWebviewBoundary(element) {
    const webviewTop = 0 - (parseInt(element.style.top, 10) || 0);
    return webviewTop >= 0 && webviewTop <= NOTEBOOK_WEBVIEW_BOUNDARY * 2;
}
let NotebookCellList = class NotebookCellList extends WorkbenchList {
    get onWillScroll() { return this.view.onWillScroll; }
    get rowsContainer() {
        return this.view.containerDomNode;
    }
    get scrollableElement() {
        return this.view.scrollableElementDomNode;
    }
    get viewModel() {
        return this._viewModel;
    }
    get visibleRanges() {
        return this._visibleRanges;
    }
    set visibleRanges(ranges) {
        if (cellRangesEqual(this._visibleRanges, ranges)) {
            return;
        }
        this._visibleRanges = ranges;
        this._onDidChangeVisibleRanges.fire();
    }
    get isDisposed() {
        return this._isDisposed;
    }
    get webviewElement() {
        return this._webviewElement;
    }
    get inRenderingTransaction() {
        return this.view.inRenderingTransaction;
    }
    constructor(listUser, container, notebookOptions, delegate, renderers, contextKeyService, options, listService, configurationService, instantiationService, notebookExecutionStateService) {
        super(listUser, container, delegate, renderers, options, contextKeyService, listService, configurationService, instantiationService);
        this.listUser = listUser;
        this.notebookOptions = notebookOptions;
        this._previousFocusedElements = [];
        this._localDisposableStore = new DisposableStore();
        this._viewModelStore = new DisposableStore();
        this._onDidRemoveOutputs = this._localDisposableStore.add(new Emitter());
        this.onDidRemoveOutputs = this._onDidRemoveOutputs.event;
        this._onDidHideOutputs = this._localDisposableStore.add(new Emitter());
        this.onDidHideOutputs = this._onDidHideOutputs.event;
        this._onDidRemoveCellsFromView = this._localDisposableStore.add(new Emitter());
        this.onDidRemoveCellsFromView = this._onDidRemoveCellsFromView.event;
        this._viewModel = null;
        this._hiddenRangeIds = [];
        this.hiddenRangesPrefixSum = null;
        this._onDidChangeVisibleRanges = this._localDisposableStore.add(new Emitter());
        this.onDidChangeVisibleRanges = this._onDidChangeVisibleRanges.event;
        this._visibleRanges = [];
        this._isDisposed = false;
        this._isInLayout = false;
        this._webviewElement = null;
        NOTEBOOK_CELL_LIST_FOCUSED.bindTo(this.contextKeyService).set(true);
        this._previousFocusedElements = this.getFocusedElements();
        this._localDisposableStore.add(this.onDidChangeFocus((e) => {
            this._previousFocusedElements.forEach(element => {
                if (e.elements.indexOf(element) < 0) {
                    element.onDeselect();
                }
            });
            this._previousFocusedElements = e.elements;
        }));
        const notebookEditorCursorAtBoundaryContext = NOTEBOOK_EDITOR_CURSOR_BOUNDARY.bindTo(contextKeyService);
        notebookEditorCursorAtBoundaryContext.set('none');
        const notebookEditorCursorAtLineBoundaryContext = NOTEBOOK_EDITOR_CURSOR_LINE_BOUNDARY.bindTo(contextKeyService);
        notebookEditorCursorAtLineBoundaryContext.set('none');
        const cursorSelectionListener = this._localDisposableStore.add(new MutableDisposable());
        const textEditorAttachListener = this._localDisposableStore.add(new MutableDisposable());
        this._notebookCellAnchor = new NotebookCellAnchor(notebookExecutionStateService, configurationService, this.onDidScroll);
        const recomputeContext = (element) => {
            switch (element.cursorAtBoundary()) {
                case CursorAtBoundary.Both:
                    notebookEditorCursorAtBoundaryContext.set('both');
                    break;
                case CursorAtBoundary.Top:
                    notebookEditorCursorAtBoundaryContext.set('top');
                    break;
                case CursorAtBoundary.Bottom:
                    notebookEditorCursorAtBoundaryContext.set('bottom');
                    break;
                default:
                    notebookEditorCursorAtBoundaryContext.set('none');
                    break;
            }
            switch (element.cursorAtLineBoundary()) {
                case CursorAtLineBoundary.Both:
                    notebookEditorCursorAtLineBoundaryContext.set('both');
                    break;
                case CursorAtLineBoundary.Start:
                    notebookEditorCursorAtLineBoundaryContext.set('start');
                    break;
                case CursorAtLineBoundary.End:
                    notebookEditorCursorAtLineBoundaryContext.set('end');
                    break;
                default:
                    notebookEditorCursorAtLineBoundaryContext.set('none');
                    break;
            }
            return;
        };
        this._localDisposableStore.add(this.onDidChangeFocus((e) => {
            if (e.elements.length) {
                const focusedElement = e.elements[0];
                cursorSelectionListener.value = focusedElement.onDidChangeState((e) => {
                    if (e.selectionChanged) {
                        recomputeContext(focusedElement);
                    }
                });
                textEditorAttachListener.value = focusedElement.onDidChangeEditorAttachState(() => {
                    if (focusedElement.editorAttached) {
                        recomputeContext(focusedElement);
                    }
                });
                recomputeContext(focusedElement);
                return;
            }
            notebookEditorCursorAtBoundaryContext.set('none');
        }));
        this._localDisposableStore.add(this.view.onMouseDblClick(() => {
            const focus = this.getFocusedElements()[0];
            if (focus && focus.cellKind === CellKind.Markup && !focus.isInputCollapsed && !this._viewModel?.options.isReadOnly) {
                const focusedCellIndex = this._getViewIndexUpperBound(focus);
                if (focusedCellIndex >= 0) {
                    this._revealInViewWithMinimalScrolling(focusedCellIndex);
                }
                focus.updateEditState(CellEditState.Editing, 'dbclick');
                focus.focusMode = CellFocusMode.Editor;
            }
        }));
        const updateVisibleRanges = () => {
            if (!this.view.length) {
                return;
            }
            const top = this.getViewScrollTop();
            const bottom = this.getViewScrollBottom();
            if (top >= bottom) {
                return;
            }
            const topViewIndex = clamp(this.view.indexAt(top), 0, this.view.length - 1);
            const topElement = this.view.element(topViewIndex);
            const topModelIndex = this._viewModel.getCellIndex(topElement);
            const bottomViewIndex = clamp(this.view.indexAt(bottom), 0, this.view.length - 1);
            const bottomElement = this.view.element(bottomViewIndex);
            const bottomModelIndex = this._viewModel.getCellIndex(bottomElement);
            if (bottomModelIndex - topModelIndex === bottomViewIndex - topViewIndex) {
                this.visibleRanges = [{ start: topModelIndex, end: bottomModelIndex + 1 }];
            }
            else {
                this.visibleRanges = this._getVisibleRangesFromIndex(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex);
            }
        };
        this._localDisposableStore.add(this.view.onDidChangeContentHeight(() => {
            if (this._isInLayout) {
                DOM.scheduleAtNextAnimationFrame(DOM.getWindow(container), () => {
                    updateVisibleRanges();
                });
            }
            updateVisibleRanges();
        }));
        this._localDisposableStore.add(this.view.onDidScroll(() => {
            if (this._isInLayout) {
                DOM.scheduleAtNextAnimationFrame(DOM.getWindow(container), () => {
                    updateVisibleRanges();
                });
            }
            updateVisibleRanges();
        }));
    }
    createListView(container, virtualDelegate, renderers, viewOptions) {
        const listView = new NotebookCellListView(container, virtualDelegate, renderers, viewOptions);
        this.viewZones = new NotebookViewZones(listView, this);
        return listView;
    }
    _getView() {
        return this.view;
    }
    attachWebview(element) {
        element.style.top = `-${NOTEBOOK_WEBVIEW_BOUNDARY}px`;
        this.rowsContainer.insertAdjacentElement('afterbegin', element);
        this._webviewElement = new FastDomNode(element);
    }
    elementAt(position) {
        if (!this.view.length) {
            return undefined;
        }
        const idx = this.view.indexAt(position);
        const clamped = clamp(idx, 0, this.view.length - 1);
        return this.element(clamped);
    }
    elementHeight(element) {
        const index = this._getViewIndexUpperBound(element);
        if (index === undefined || index < 0 || index >= this.length) {
            this._getViewIndexUpperBound(element);
            throw new ListError(this.listUser, `Invalid index ${index}`);
        }
        return this.view.elementHeight(index);
    }
    detachViewModel() {
        this._viewModelStore.clear();
        this._viewModel = null;
        this.hiddenRangesPrefixSum = null;
    }
    attachViewModel(model) {
        this._viewModel = model;
        this._viewModelStore.add(model.onDidChangeViewCells((e) => {
            if (this._isDisposed) {
                return;
            }
            this.viewZones.onCellsChanged(e);
            const currentRanges = this._hiddenRangeIds.map(id => this._viewModel.getTrackedRange(id)).filter(range => range !== null);
            const newVisibleViewCells = getVisibleCells(this._viewModel.viewCells, currentRanges);
            const oldVisibleViewCells = [];
            const oldViewCellMapping = new Set();
            for (let i = 0; i < this.length; i++) {
                oldVisibleViewCells.push(this.element(i));
                oldViewCellMapping.add(this.element(i).uri.toString());
            }
            const viewDiffs = diff(oldVisibleViewCells, newVisibleViewCells, a => {
                return oldViewCellMapping.has(a.uri.toString());
            });
            if (e.synchronous) {
                this._updateElementsInWebview(viewDiffs);
            }
            else {
                this._viewModelStore.add(DOM.scheduleAtNextAnimationFrame(DOM.getWindow(this.rowsContainer), () => {
                    if (this._isDisposed) {
                        return;
                    }
                    this._updateElementsInWebview(viewDiffs);
                }));
            }
        }));
        this._viewModelStore.add(model.onDidChangeSelection((e) => {
            if (e === 'view') {
                return;
            }
            const viewSelections = cellRangesToIndexes(model.getSelections()).map(index => model.cellAt(index)).filter(cell => !!cell).map(cell => this._getViewIndexUpperBound(cell));
            this.setSelection(viewSelections, undefined, true);
            const primary = cellRangesToIndexes([model.getFocus()]).map(index => model.cellAt(index)).filter(cell => !!cell).map(cell => this._getViewIndexUpperBound(cell));
            if (primary.length) {
                this.setFocus(primary, undefined, true);
            }
        }));
        const hiddenRanges = model.getHiddenRanges();
        this.setHiddenAreas(hiddenRanges, false);
        const newRanges = reduceCellRanges(hiddenRanges);
        const viewCells = model.viewCells.slice(0);
        newRanges.reverse().forEach(range => {
            const removedCells = viewCells.splice(range.start, range.end - range.start + 1);
            this._onDidRemoveCellsFromView.fire(removedCells);
        });
        this.splice2(0, 0, viewCells);
    }
    _updateElementsInWebview(viewDiffs) {
        viewDiffs.reverse().forEach((diff) => {
            const hiddenOutputs = [];
            const deletedOutputs = [];
            const removedMarkdownCells = [];
            for (let i = diff.start; i < diff.start + diff.deleteCount; i++) {
                const cell = this.element(i);
                if (cell.cellKind === CellKind.Code) {
                    if (this._viewModel.hasCell(cell)) {
                        hiddenOutputs.push(...cell?.outputsViewModels);
                    }
                    else {
                        deletedOutputs.push(...cell?.outputsViewModels);
                    }
                }
                else {
                    removedMarkdownCells.push(cell);
                }
            }
            this.splice2(diff.start, diff.deleteCount, diff.toInsert);
            this._onDidHideOutputs.fire(hiddenOutputs);
            this._onDidRemoveOutputs.fire(deletedOutputs);
            this._onDidRemoveCellsFromView.fire(removedMarkdownCells);
        });
    }
    clear() {
        super.splice(0, this.length);
    }
    setHiddenAreas(_ranges, triggerViewUpdate) {
        if (!this._viewModel) {
            return false;
        }
        const newRanges = reduceCellRanges(_ranges);
        const oldRanges = this._hiddenRangeIds.map(id => this._viewModel.getTrackedRange(id)).filter(range => range !== null);
        if (newRanges.length === oldRanges.length) {
            let hasDifference = false;
            for (let i = 0; i < newRanges.length; i++) {
                if (!(newRanges[i].start === oldRanges[i].start && newRanges[i].end === oldRanges[i].end)) {
                    hasDifference = true;
                    break;
                }
            }
            if (!hasDifference) {
                this._updateHiddenRangePrefixSum(newRanges);
                this.viewZones.onHiddenRangesChange();
                this.viewZones.layout();
                return false;
            }
        }
        this._hiddenRangeIds.forEach(id => this._viewModel.setTrackedRange(id, null, 3));
        const hiddenAreaIds = newRanges.map(range => this._viewModel.setTrackedRange(null, range, 3)).filter(id => id !== null);
        this._hiddenRangeIds = hiddenAreaIds;
        this._updateHiddenRangePrefixSum(newRanges);
        this.viewZones.onHiddenRangesChange();
        if (triggerViewUpdate) {
            this.updateHiddenAreasInView(oldRanges, newRanges);
        }
        this.viewZones.layout();
        return true;
    }
    _updateHiddenRangePrefixSum(newRanges) {
        let start = 0;
        let index = 0;
        const ret = [];
        while (index < newRanges.length) {
            for (let j = start; j < newRanges[index].start - 1; j++) {
                ret.push(1);
            }
            ret.push(newRanges[index].end - newRanges[index].start + 1 + 1);
            start = newRanges[index].end + 1;
            index++;
        }
        for (let i = start; i < this._viewModel.length; i++) {
            ret.push(1);
        }
        const values = new Uint32Array(ret.length);
        for (let i = 0; i < ret.length; i++) {
            values[i] = ret[i];
        }
        this.hiddenRangesPrefixSum = new PrefixSumComputer(values);
    }
    updateHiddenAreasInView(oldRanges, newRanges) {
        const oldViewCellEntries = getVisibleCells(this._viewModel.viewCells, oldRanges);
        const oldViewCellMapping = new Set();
        oldViewCellEntries.forEach(cell => {
            oldViewCellMapping.add(cell.uri.toString());
        });
        const newViewCellEntries = getVisibleCells(this._viewModel.viewCells, newRanges);
        const viewDiffs = diff(oldViewCellEntries, newViewCellEntries, a => {
            return oldViewCellMapping.has(a.uri.toString());
        });
        this._updateElementsInWebview(viewDiffs);
    }
    splice2(start, deleteCount, elements = []) {
        if (start < 0 || start > this.view.length) {
            return;
        }
        const focusInside = DOM.isAncestorOfActiveElement(this.rowsContainer);
        super.splice(start, deleteCount, elements);
        if (focusInside) {
            this.domFocus();
        }
        const selectionsLeft = [];
        this.getSelectedElements().forEach(el => {
            if (this._viewModel.hasCell(el)) {
                selectionsLeft.push(el.handle);
            }
        });
        if (!selectionsLeft.length && this._viewModel.viewCells.length) {
            this._viewModel.updateSelectionsState({ kind: SelectionStateType.Index, focus: { start: 0, end: 1 }, selections: [{ start: 0, end: 1 }] });
        }
        this.viewZones.layout();
    }
    getModelIndex(cell) {
        const viewIndex = this.indexOf(cell);
        return this.getModelIndex2(viewIndex);
    }
    getModelIndex2(viewIndex) {
        if (!this.hiddenRangesPrefixSum) {
            return viewIndex;
        }
        const modelIndex = this.hiddenRangesPrefixSum.getPrefixSum(viewIndex - 1);
        return modelIndex;
    }
    getViewIndex(cell) {
        const modelIndex = this._viewModel.getCellIndex(cell);
        return this.getViewIndex2(modelIndex);
    }
    getViewIndex2(modelIndex) {
        if (!this.hiddenRangesPrefixSum) {
            return modelIndex;
        }
        const viewIndexInfo = this.hiddenRangesPrefixSum.getIndexOf(modelIndex);
        if (viewIndexInfo.remainder !== 0) {
            if (modelIndex >= this.hiddenRangesPrefixSum.getTotalSum()) {
                return modelIndex - (this.hiddenRangesPrefixSum.getTotalSum() - this.hiddenRangesPrefixSum.getCount());
            }
            return undefined;
        }
        else {
            return viewIndexInfo.index;
        }
    }
    convertModelIndexToViewIndex(modelIndex) {
        if (!this.hiddenRangesPrefixSum) {
            return modelIndex;
        }
        if (modelIndex >= this.hiddenRangesPrefixSum.getTotalSum()) {
            return Math.min(this.length, this.hiddenRangesPrefixSum.getTotalSum());
        }
        return this.hiddenRangesPrefixSum.getIndexOf(modelIndex).index;
    }
    modelIndexIsVisible(modelIndex) {
        if (!this.hiddenRangesPrefixSum) {
            return true;
        }
        const viewIndexInfo = this.hiddenRangesPrefixSum.getIndexOf(modelIndex);
        if (viewIndexInfo.remainder !== 0) {
            if (modelIndex >= this.hiddenRangesPrefixSum.getTotalSum()) {
                return true;
            }
            return false;
        }
        else {
            return true;
        }
    }
    _getVisibleRangesFromIndex(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex) {
        const stack = [];
        const ranges = [];
        let index = topViewIndex;
        let modelIndex = topModelIndex;
        while (index <= bottomViewIndex) {
            const accu = this.hiddenRangesPrefixSum.getPrefixSum(index);
            if (accu === modelIndex + 1) {
                if (stack.length) {
                    if (stack[stack.length - 1] === modelIndex - 1) {
                        ranges.push({ start: stack[stack.length - 1], end: modelIndex + 1 });
                    }
                    else {
                        ranges.push({ start: stack[stack.length - 1], end: stack[stack.length - 1] + 1 });
                    }
                }
                stack.push(modelIndex);
                index++;
                modelIndex++;
            }
            else {
                if (stack.length) {
                    if (stack[stack.length - 1] === modelIndex - 1) {
                        ranges.push({ start: stack[stack.length - 1], end: modelIndex + 1 });
                    }
                    else {
                        ranges.push({ start: stack[stack.length - 1], end: stack[stack.length - 1] + 1 });
                    }
                }
                stack.push(modelIndex);
                index++;
                modelIndex = accu;
            }
        }
        if (stack.length) {
            ranges.push({ start: stack[stack.length - 1], end: stack[stack.length - 1] + 1 });
        }
        return reduceCellRanges(ranges);
    }
    getVisibleRangesPlusViewportAboveAndBelow() {
        if (this.view.length <= 0) {
            return [];
        }
        const top = Math.max(this.getViewScrollTop() - this.renderHeight, 0);
        const topViewIndex = this.view.indexAt(top);
        const topElement = this.view.element(topViewIndex);
        const topModelIndex = this._viewModel.getCellIndex(topElement);
        const bottom = clamp(this.getViewScrollBottom() + this.renderHeight, 0, this.scrollHeight);
        const bottomViewIndex = clamp(this.view.indexAt(bottom), 0, this.view.length - 1);
        const bottomElement = this.view.element(bottomViewIndex);
        const bottomModelIndex = this._viewModel.getCellIndex(bottomElement);
        if (bottomModelIndex - topModelIndex === bottomViewIndex - topViewIndex) {
            return [{ start: topModelIndex, end: bottomModelIndex }];
        }
        else {
            return this._getVisibleRangesFromIndex(topViewIndex, topModelIndex, bottomViewIndex, bottomModelIndex);
        }
    }
    _getViewIndexUpperBound(cell) {
        if (!this._viewModel) {
            return -1;
        }
        const modelIndex = this._viewModel.getCellIndex(cell);
        if (modelIndex === -1) {
            return -1;
        }
        if (!this.hiddenRangesPrefixSum) {
            return modelIndex;
        }
        const viewIndexInfo = this.hiddenRangesPrefixSum.getIndexOf(modelIndex);
        if (viewIndexInfo.remainder !== 0) {
            if (modelIndex >= this.hiddenRangesPrefixSum.getTotalSum()) {
                return modelIndex - (this.hiddenRangesPrefixSum.getTotalSum() - this.hiddenRangesPrefixSum.getCount());
            }
        }
        return viewIndexInfo.index;
    }
    _getViewIndexUpperBound2(modelIndex) {
        if (!this.hiddenRangesPrefixSum) {
            return modelIndex;
        }
        const viewIndexInfo = this.hiddenRangesPrefixSum.getIndexOf(modelIndex);
        if (viewIndexInfo.remainder !== 0) {
            if (modelIndex >= this.hiddenRangesPrefixSum.getTotalSum()) {
                return modelIndex - (this.hiddenRangesPrefixSum.getTotalSum() - this.hiddenRangesPrefixSum.getCount());
            }
        }
        return viewIndexInfo.index;
    }
    focusElement(cell) {
        const index = this._getViewIndexUpperBound(cell);
        if (index >= 0 && this._viewModel) {
            const focusedElementHandle = this.element(index).handle;
            this._viewModel.updateSelectionsState({
                kind: SelectionStateType.Handle,
                primary: focusedElementHandle,
                selections: [focusedElementHandle]
            }, 'view');
            this.setFocus([index], undefined, false);
        }
    }
    selectElements(elements) {
        const indices = elements.map(cell => this._getViewIndexUpperBound(cell)).filter(index => index >= 0);
        this.setSelection(indices);
    }
    getCellViewScrollTop(cell) {
        const index = this._getViewIndexUpperBound(cell);
        if (index === undefined || index < 0 || index >= this.length) {
            throw new ListError(this.listUser, `Invalid index ${index}`);
        }
        return this.view.elementTop(index);
    }
    getCellViewScrollBottom(cell) {
        const index = this._getViewIndexUpperBound(cell);
        if (index === undefined || index < 0 || index >= this.length) {
            throw new ListError(this.listUser, `Invalid index ${index}`);
        }
        const top = this.view.elementTop(index);
        const height = this.view.elementHeight(index);
        return top + height;
    }
    setFocus(indexes, browserEvent, ignoreTextModelUpdate) {
        if (ignoreTextModelUpdate) {
            super.setFocus(indexes, browserEvent);
            return;
        }
        if (!indexes.length) {
            if (this._viewModel) {
                if (this.length) {
                    return;
                }
                this._viewModel.updateSelectionsState({
                    kind: SelectionStateType.Handle,
                    primary: null,
                    selections: []
                }, 'view');
            }
        }
        else {
            if (this._viewModel) {
                const focusedElementHandle = this.element(indexes[0]).handle;
                this._viewModel.updateSelectionsState({
                    kind: SelectionStateType.Handle,
                    primary: focusedElementHandle,
                    selections: this.getSelection().map(selection => this.element(selection).handle)
                }, 'view');
            }
        }
        super.setFocus(indexes, browserEvent);
    }
    setSelection(indexes, browserEvent, ignoreTextModelUpdate) {
        if (ignoreTextModelUpdate) {
            super.setSelection(indexes, browserEvent);
            return;
        }
        if (!indexes.length) {
            if (this._viewModel) {
                this._viewModel.updateSelectionsState({
                    kind: SelectionStateType.Handle,
                    primary: this.getFocusedElements()[0]?.handle ?? null,
                    selections: []
                }, 'view');
            }
        }
        else {
            if (this._viewModel) {
                this._viewModel.updateSelectionsState({
                    kind: SelectionStateType.Handle,
                    primary: this.getFocusedElements()[0]?.handle ?? null,
                    selections: indexes.map(index => this.element(index)).map(cell => cell.handle)
                }, 'view');
            }
        }
        super.setSelection(indexes, browserEvent);
    }
    revealCells(range) {
        const startIndex = this._getViewIndexUpperBound2(range.start);
        if (startIndex < 0) {
            return;
        }
        const endIndex = this._getViewIndexUpperBound2(range.end - 1);
        const scrollTop = this.getViewScrollTop();
        const wrapperBottom = this.getViewScrollBottom();
        const elementTop = this.view.elementTop(startIndex);
        if (elementTop >= scrollTop
            && elementTop < wrapperBottom) {
            const endElementTop = this.view.elementTop(endIndex);
            const endElementHeight = this.view.elementHeight(endIndex);
            if (endElementTop + endElementHeight <= wrapperBottom) {
                return;
            }
            if (endElementTop >= wrapperBottom) {
                return this._revealInternal(endIndex, false, 2);
            }
            if (endElementTop < wrapperBottom) {
                if (endElementTop + endElementHeight - wrapperBottom < elementTop - scrollTop) {
                    return this.view.setScrollTop(scrollTop + endElementTop + endElementHeight - wrapperBottom);
                }
                else {
                    return this._revealInternal(startIndex, false, 0);
                }
            }
        }
        this._revealInViewWithMinimalScrolling(startIndex);
    }
    _revealInViewWithMinimalScrolling(viewIndex, firstLine) {
        const firstIndex = this.view.firstMostlyVisibleIndex;
        const elementHeight = this.view.elementHeight(viewIndex);
        if (viewIndex <= firstIndex || (!firstLine && elementHeight >= this.view.renderHeight)) {
            this._revealInternal(viewIndex, true, 0);
        }
        else {
            this._revealInternal(viewIndex, true, 2, firstLine);
        }
    }
    scrollToBottom() {
        const scrollHeight = this.view.scrollHeight;
        const scrollTop = this.getViewScrollTop();
        const wrapperBottom = this.getViewScrollBottom();
        this.view.setScrollTop(scrollHeight - (wrapperBottom - scrollTop));
    }
    async revealCell(cell, revealType) {
        const index = this._getViewIndexUpperBound(cell);
        if (index < 0) {
            return;
        }
        switch (revealType) {
            case 2:
                this._revealInternal(index, false, 0);
                break;
            case 3:
                this._revealInternal(index, false, 1);
                break;
            case 4:
                this._revealInternal(index, true, 1);
                break;
            case 5:
                this._revealInternal(index, true, 3);
                break;
            case 6:
                this._revealInViewWithMinimalScrolling(index, true);
                break;
            case 1:
                this._revealInViewWithMinimalScrolling(index);
                break;
        }
        if ((cell.getEditState() === CellEditState.Editing
            || (revealType === 6 && cell.cellKind === CellKind.Code)) && !cell.editorAttached) {
            return getEditorAttachedPromise(cell);
        }
        return;
    }
    _revealInternal(viewIndex, ignoreIfInsideViewport, revealPosition, firstLine) {
        if (viewIndex >= this.view.length) {
            return;
        }
        const scrollTop = this.getViewScrollTop();
        const wrapperBottom = this.getViewScrollBottom();
        const elementTop = this.view.elementTop(viewIndex);
        const elementBottom = this.view.elementHeight(viewIndex) + elementTop;
        if (ignoreIfInsideViewport) {
            if (elementTop >= scrollTop && elementBottom < wrapperBottom) {
                return;
            }
        }
        switch (revealPosition) {
            case 0:
                this.view.setScrollTop(elementTop);
                this.view.setScrollTop(this.view.elementTop(viewIndex));
                break;
            case 1:
            case 3:
                {
                    this.view.setScrollTop(elementTop - this.view.renderHeight / 2);
                    const newElementTop = this.view.elementTop(viewIndex);
                    const newElementHeight = this.view.elementHeight(viewIndex);
                    const renderHeight = this.getViewScrollBottom() - this.getViewScrollTop();
                    if (newElementHeight >= renderHeight) {
                        this.view.setScrollTop(newElementTop);
                    }
                    else if (revealPosition === 1) {
                        this.view.setScrollTop(newElementTop + (newElementHeight / 2) - (renderHeight / 2));
                    }
                    else if (revealPosition === 3) {
                        this.view.setScrollTop(newElementTop - (renderHeight / 5));
                    }
                }
                break;
            case 2:
                if (firstLine) {
                    const lineHeight = this.viewModel?.layoutInfo?.fontInfo.lineHeight ?? 15;
                    const padding = this.notebookOptions.getLayoutConfiguration().cellTopMargin + this.notebookOptions.getLayoutConfiguration().editorTopPadding;
                    const firstLineLocation = elementTop + lineHeight + padding;
                    if (firstLineLocation < wrapperBottom) {
                        return;
                    }
                    this.view.setScrollTop(this.scrollTop + (firstLineLocation - wrapperBottom));
                    break;
                }
                this.view.setScrollTop(this.scrollTop + (elementBottom - wrapperBottom));
                this.view.setScrollTop(this.scrollTop + (this.view.elementTop(viewIndex) + this.view.elementHeight(viewIndex) - this.getViewScrollBottom()));
                break;
            default:
                break;
        }
    }
    async revealRangeInCell(cell, range, revealType) {
        const index = this._getViewIndexUpperBound(cell);
        if (index < 0) {
            return;
        }
        switch (revealType) {
            case CellRevealRangeType.Default:
                return this._revealRangeInternalAsync(index, range);
            case CellRevealRangeType.Center:
                return this._revealRangeInCenterInternalAsync(index, range);
            case CellRevealRangeType.CenterIfOutsideViewport:
                return this._revealRangeInCenterIfOutsideViewportInternalAsync(index, range);
        }
    }
    async _revealRangeInternalAsync(viewIndex, range) {
        const scrollTop = this.getViewScrollTop();
        const wrapperBottom = this.getViewScrollBottom();
        const elementTop = this.view.elementTop(viewIndex);
        const element = this.view.element(viewIndex);
        if (element.editorAttached) {
            this._revealRangeCommon(viewIndex, range);
        }
        else {
            const elementHeight = this.view.elementHeight(viewIndex);
            let alignHint = undefined;
            if (elementTop + elementHeight <= scrollTop) {
                this.view.setScrollTop(elementTop);
                alignHint = 'top';
            }
            else if (elementTop >= wrapperBottom) {
                this.view.setScrollTop(elementTop - this.view.renderHeight / 2);
                alignHint = 'bottom';
            }
            const editorAttachedPromise = new Promise((resolve, reject) => {
                element.onDidChangeEditorAttachState(() => {
                    element.editorAttached ? resolve() : reject();
                });
            });
            return editorAttachedPromise.then(() => {
                this._revealRangeCommon(viewIndex, range, alignHint);
            });
        }
    }
    async _revealRangeInCenterInternalAsync(viewIndex, range) {
        const reveal = (viewIndex, range) => {
            const element = this.view.element(viewIndex);
            const positionOffset = element.getPositionScrollTopOffset(range);
            const positionOffsetInView = this.view.elementTop(viewIndex) + positionOffset;
            this.view.setScrollTop(positionOffsetInView - this.view.renderHeight / 2);
            element.revealRangeInCenter(range);
        };
        const elementTop = this.view.elementTop(viewIndex);
        const viewItemOffset = elementTop;
        this.view.setScrollTop(viewItemOffset - this.view.renderHeight / 2);
        const element = this.view.element(viewIndex);
        if (!element.editorAttached) {
            return getEditorAttachedPromise(element).then(() => reveal(viewIndex, range));
        }
        else {
            reveal(viewIndex, range);
        }
    }
    async _revealRangeInCenterIfOutsideViewportInternalAsync(viewIndex, range) {
        const reveal = (viewIndex, range) => {
            const element = this.view.element(viewIndex);
            const positionOffset = element.getPositionScrollTopOffset(range);
            const positionOffsetInView = this.view.elementTop(viewIndex) + positionOffset;
            this.view.setScrollTop(positionOffsetInView - this.view.renderHeight / 2);
            element.revealRangeInCenter(range);
        };
        const scrollTop = this.getViewScrollTop();
        const wrapperBottom = this.getViewScrollBottom();
        const elementTop = this.view.elementTop(viewIndex);
        const viewItemOffset = elementTop;
        const element = this.view.element(viewIndex);
        const positionOffset = viewItemOffset + element.getPositionScrollTopOffset(range);
        if (positionOffset < scrollTop || positionOffset > wrapperBottom) {
            this.view.setScrollTop(positionOffset - this.view.renderHeight / 2);
            const newPositionOffset = this.view.elementTop(viewIndex) + element.getPositionScrollTopOffset(range);
            this.view.setScrollTop(newPositionOffset - this.view.renderHeight / 2);
            if (!element.editorAttached) {
                return getEditorAttachedPromise(element).then(() => reveal(viewIndex, range));
            }
            else {
            }
        }
        else {
            if (element.editorAttached) {
                element.revealRangeInCenter(range);
            }
            else {
                return getEditorAttachedPromise(element).then(() => reveal(viewIndex, range));
            }
        }
    }
    _revealRangeCommon(viewIndex, range, alignHint) {
        const element = this.view.element(viewIndex);
        const scrollTop = this.getViewScrollTop();
        const wrapperBottom = this.getViewScrollBottom();
        const positionOffset = element.getPositionScrollTopOffset(range);
        const elementOriginalHeight = this.view.elementHeight(viewIndex);
        if (positionOffset >= elementOriginalHeight) {
            const newTotalHeight = element.layoutInfo.totalHeight;
            this.updateElementHeight(viewIndex, newTotalHeight);
        }
        const elementTop = this.view.elementTop(viewIndex);
        const positionTop = elementTop + positionOffset;
        if (positionTop < scrollTop) {
            this.view.setScrollTop(positionTop - 30);
        }
        else if (positionTop > wrapperBottom) {
            this.view.setScrollTop(scrollTop + positionTop - wrapperBottom + 30);
        }
        else if (alignHint === 'bottom') {
            this.view.setScrollTop(scrollTop + positionTop - wrapperBottom + 30);
        }
        else if (alignHint === 'top') {
            this.view.setScrollTop(positionTop - 30);
        }
    }
    revealCellOffsetInCenter(cell, offset) {
        const viewIndex = this._getViewIndexUpperBound(cell);
        if (viewIndex >= 0) {
            const element = this.view.element(viewIndex);
            const elementTop = this.view.elementTop(viewIndex);
            if (element instanceof MarkupCellViewModel) {
                return this._revealInCenterIfOutsideViewport(viewIndex);
            }
            else {
                const rangeOffset = element.layoutInfo.outputContainerOffset + Math.min(offset, element.layoutInfo.outputTotalHeight);
                this.view.setScrollTop(elementTop - this.view.renderHeight / 2);
                this.view.setScrollTop(elementTop + rangeOffset - this.view.renderHeight / 2);
            }
        }
    }
    revealOffsetInCenterIfOutsideViewport(offset) {
        const scrollTop = this.getViewScrollTop();
        const wrapperBottom = this.getViewScrollBottom();
        if (offset < scrollTop || offset > wrapperBottom) {
            this.view.setScrollTop(offset - this.view.renderHeight / 2);
        }
    }
    _revealInCenterIfOutsideViewport(viewIndex) {
        this._revealInternal(viewIndex, true, 1);
    }
    domElementOfElement(element) {
        const index = this._getViewIndexUpperBound(element);
        if (index >= 0) {
            return this.view.domElement(index);
        }
        return null;
    }
    focusView() {
        this.view.domNode.focus();
    }
    triggerScrollFromMouseWheelEvent(browserEvent) {
        this.view.delegateScrollFromMouseWheelEvent(browserEvent);
    }
    delegateVerticalScrollbarPointerDown(browserEvent) {
        this.view.delegateVerticalScrollbarPointerDown(browserEvent);
    }
    isElementAboveViewport(index) {
        const elementTop = this.view.elementTop(index);
        const elementBottom = elementTop + this.view.elementHeight(index);
        return elementBottom < this.scrollTop;
    }
    updateElementHeight2(element, size, anchorElementIndex = null) {
        const index = this._getViewIndexUpperBound(element);
        if (index === undefined || index < 0 || index >= this.length) {
            return;
        }
        if (this.isElementAboveViewport(index)) {
            const oldHeight = this.elementHeight(element);
            const delta = oldHeight - size;
            if (this._webviewElement) {
                Event.once(this.view.onWillScroll)(() => {
                    const webviewTop = parseInt(this._webviewElement.domNode.style.top, 10);
                    if (validateWebviewBoundary(this._webviewElement.domNode)) {
                        this._webviewElement.setTop(webviewTop - delta);
                    }
                    else {
                        this._webviewElement.setTop(-NOTEBOOK_WEBVIEW_BOUNDARY);
                    }
                });
            }
            this.view.updateElementHeight(index, size, anchorElementIndex);
            this.viewZones.layout();
            return;
        }
        if (anchorElementIndex !== null) {
            this.view.updateElementHeight(index, size, anchorElementIndex);
            this.viewZones.layout();
            return;
        }
        const focused = this.getFocus();
        const focus = focused.length ? focused[0] : null;
        if (focus) {
            const heightDelta = size - this.view.elementHeight(index);
            if (this._notebookCellAnchor.shouldAnchor(this.view, focus, heightDelta, this.element(index))) {
                this.view.updateElementHeight(index, size, focus);
                this.viewZones.layout();
                return;
            }
        }
        this.view.updateElementHeight(index, size, null);
        this.viewZones.layout();
        return;
    }
    changeViewZones(callback) {
        if (this.viewZones.changeViewZones(callback)) {
            this.viewZones.layout();
        }
    }
    domFocus() {
        const focused = this.getFocusedElements()[0];
        const focusedDomElement = focused && this.domElementOfElement(focused);
        if (this.view.domNode.ownerDocument.activeElement && focusedDomElement && focusedDomElement.contains(this.view.domNode.ownerDocument.activeElement)) {
            return;
        }
        if (!isMacintosh && this.view.domNode.ownerDocument.activeElement && !!DOM.findParentWithClass(this.view.domNode.ownerDocument.activeElement, 'context-view')) {
            return;
        }
        super.domFocus();
    }
    focusContainer(clearSelection) {
        if (clearSelection) {
            this._viewModel?.updateSelectionsState({
                kind: SelectionStateType.Handle,
                primary: null,
                selections: []
            }, 'view');
            this.setFocus([], undefined, true);
            this.setSelection([], undefined, true);
        }
        super.domFocus();
    }
    getViewScrollTop() {
        return this.view.getScrollTop();
    }
    getViewScrollBottom() {
        return this.getViewScrollTop() + this.view.renderHeight;
    }
    setCellEditorSelection(cell, range) {
        const element = cell;
        if (element.editorAttached) {
            element.setSelection(range);
        }
        else {
            getEditorAttachedPromise(element).then(() => { element.setSelection(range); });
        }
    }
    style(styles) {
        const selectorSuffix = this.view.domId;
        if (!this.styleElement) {
            this.styleElement = DOM.createStyleSheet(this.view.domNode);
        }
        const suffix = selectorSuffix && `.${selectorSuffix}`;
        const content = [];
        if (styles.listBackground) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows { background: ${styles.listBackground}; }`);
        }
        if (styles.listFocusBackground) {
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color: ${styles.listFocusBackground}; }`);
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color: ${styles.listFocusBackground}; }`);
        }
        if (styles.listFocusForeground) {
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { color: ${styles.listFocusForeground}; }`);
        }
        if (styles.listActiveSelectionBackground) {
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color: ${styles.listActiveSelectionBackground}; }`);
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color: ${styles.listActiveSelectionBackground}; }`);
        }
        if (styles.listActiveSelectionForeground) {
            content.push(`.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listActiveSelectionForeground}; }`);
        }
        if (styles.listFocusAndSelectionBackground) {
            content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { background-color: ${styles.listFocusAndSelectionBackground}; }
			`);
        }
        if (styles.listFocusAndSelectionForeground) {
            content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected.focused { color: ${styles.listFocusAndSelectionForeground}; }
			`);
        }
        if (styles.listInactiveFocusBackground) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { background-color:  ${styles.listInactiveFocusBackground}; }`);
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused:hover { background-color:  ${styles.listInactiveFocusBackground}; }`);
        }
        if (styles.listInactiveSelectionBackground) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { background-color:  ${styles.listInactiveSelectionBackground}; }`);
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected:hover { background-color:  ${styles.listInactiveSelectionBackground}; }`);
        }
        if (styles.listInactiveSelectionForeground) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { color: ${styles.listInactiveSelectionForeground}; }`);
        }
        if (styles.listHoverBackground) {
            content.push(`.monaco-list${suffix}:not(.drop-target) > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { background-color:  ${styles.listHoverBackground}; }`);
        }
        if (styles.listHoverForeground) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover:not(.selected):not(.focused) { color:  ${styles.listHoverForeground}; }`);
        }
        if (styles.listSelectionOutline) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.selected { outline: 1px dotted ${styles.listSelectionOutline}; outline-offset: -1px; }`);
        }
        if (styles.listFocusOutline) {
            content.push(`
				.monaco-drag-image,
				.monaco-list${suffix}:focus > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px solid ${styles.listFocusOutline}; outline-offset: -1px; }
			`);
        }
        if (styles.listInactiveFocusOutline) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row.focused { outline: 1px dotted ${styles.listInactiveFocusOutline}; outline-offset: -1px; }`);
        }
        if (styles.listHoverOutline) {
            content.push(`.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows > .monaco-list-row:hover { outline: 1px dashed ${styles.listHoverOutline}; outline-offset: -1px; }`);
        }
        if (styles.listDropOverBackground) {
            content.push(`
				.monaco-list${suffix}.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-rows.drop-target,
				.monaco-list${suffix} > div.monaco-scrollable-element > .monaco-list-row.drop-target { background-color: ${styles.listDropOverBackground} !important; color: inherit !important; }
			`);
        }
        const newStyles = content.join('\n');
        if (newStyles !== this.styleElement.textContent) {
            this.styleElement.textContent = newStyles;
        }
    }
    getRenderHeight() {
        return this.view.renderHeight;
    }
    getScrollHeight() {
        return this.view.scrollHeight;
    }
    layout(height, width) {
        this._isInLayout = true;
        super.layout(height, width);
        if (this.renderHeight === 0) {
            this.view.domNode.style.visibility = 'hidden';
        }
        else {
            this.view.domNode.style.visibility = 'initial';
        }
        this._isInLayout = false;
    }
    dispose() {
        this._isDisposed = true;
        this._viewModelStore.dispose();
        this._localDisposableStore.dispose();
        this._notebookCellAnchor.dispose();
        this.viewZones.dispose();
        super.dispose();
        this._previousFocusedElements = [];
        this._viewModel = null;
        this._hiddenRangeIds = [];
        this.hiddenRangesPrefixSum = null;
        this._visibleRanges = [];
    }
};
NotebookCellList = __decorate([
    __param(7, IListService),
    __param(8, IConfigurationService),
    __param(9, IInstantiationService),
    __param(10, INotebookExecutionStateService),
    __metadata("design:paramtypes", [String, HTMLElement,
        NotebookOptions, Object, Array, Object, Object, Object, Object, Object, Object])
], NotebookCellList);
export { NotebookCellList };
export class ListViewInfoAccessor extends Disposable {
    constructor(list) {
        super();
        this.list = list;
    }
    getViewIndex(cell) {
        return this.list.getViewIndex(cell) ?? -1;
    }
    getViewHeight(cell) {
        if (!this.list.viewModel) {
            return -1;
        }
        return this.list.elementHeight(cell);
    }
    getCellRangeFromViewRange(startIndex, endIndex) {
        if (!this.list.viewModel) {
            return undefined;
        }
        const modelIndex = this.list.getModelIndex2(startIndex);
        if (modelIndex === undefined) {
            throw new Error(`startIndex ${startIndex} out of boundary`);
        }
        if (endIndex >= this.list.length) {
            const endModelIndex = this.list.viewModel.length;
            return { start: modelIndex, end: endModelIndex };
        }
        else {
            const endModelIndex = this.list.getModelIndex2(endIndex);
            if (endModelIndex === undefined) {
                throw new Error(`endIndex ${endIndex} out of boundary`);
            }
            return { start: modelIndex, end: endModelIndex };
        }
    }
    getCellsFromViewRange(startIndex, endIndex) {
        if (!this.list.viewModel) {
            return [];
        }
        const range = this.getCellRangeFromViewRange(startIndex, endIndex);
        if (!range) {
            return [];
        }
        return this.list.viewModel.getCellsInRange(range);
    }
    getCellsInRange(range) {
        return this.list.viewModel?.getCellsInRange(range) ?? [];
    }
    getVisibleRangesPlusViewportAboveAndBelow() {
        return this.list?.getVisibleRangesPlusViewportAboveAndBelow() ?? [];
    }
}
function getEditorAttachedPromise(element) {
    return new Promise((resolve, reject) => {
        Event.once(element.onDidChangeEditorAttachState)(() => element.editorAttached ? resolve() : reject());
    });
}
