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
import { groupBy } from '../../../../../base/common/collections.js';
import { onUnexpectedError } from '../../../../../base/common/errors.js';
import { Emitter } from '../../../../../base/common/event.js';
import { Disposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { clamp } from '../../../../../base/common/numbers.js';
import * as strings from '../../../../../base/common/strings.js';
import { IBulkEditService, ResourceTextEdit } from '../../../../../editor/browser/services/bulkEditService.js';
import { Range } from '../../../../../editor/common/core/range.js';
import { MultiModelEditStackElement, SingleModelEditStackElement } from '../../../../../editor/common/model/editStack.js';
import { IntervalNode, IntervalTree } from '../../../../../editor/common/model/intervalTree.js';
import { ModelDecorationOptions } from '../../../../../editor/common/model/textModel.js';
import { ITextModelService } from '../../../../../editor/common/services/resolverService.js';
import { IInstantiationService } from '../../../../../platform/instantiation/common/instantiation.js';
import { IUndoRedoService } from '../../../../../platform/undoRedo/common/undoRedo.js';
import { CellFindMatchModel } from '../contrib/find/findModel.js';
import { CellEditState } from '../notebookBrowser.js';
import { NotebookMetadataChangedEvent } from '../notebookViewEvents.js';
import { NotebookCellSelectionCollection } from './cellSelectionCollection.js';
import { CodeCellViewModel } from './codeCellViewModel.js';
import { MarkupCellViewModel } from './markupCellViewModel.js';
import { ViewContext } from './viewContext.js';
import { NotebookTextModel } from '../../common/model/notebookTextModel.js';
import { CellKind, NotebookCellsChangeType, NotebookFindScopeType, SelectionStateType } from '../../common/notebookCommon.js';
import { INotebookExecutionStateService, NotebookExecutionType } from '../../common/notebookExecutionStateService.js';
import { cellIndexesToRanges, cellRangesToIndexes, reduceCellRanges } from '../../common/notebookRange.js';
const invalidFunc = () => { throw new Error(`Invalid change accessor`); };
class DecorationsTree {
    constructor() {
        this._decorationsTree = new IntervalTree();
    }
    intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations = false) {
        const r1 = this._decorationsTree.intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
        return r1;
    }
    search(filterOwnerId, filterOutValidation, overviewRulerOnly, cachedVersionId, onlyMarginDecorations) {
        return this._decorationsTree.search(filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
    }
    collectNodesFromOwner(ownerId) {
        const r1 = this._decorationsTree.collectNodesFromOwner(ownerId);
        return r1;
    }
    collectNodesPostOrder() {
        const r1 = this._decorationsTree.collectNodesPostOrder();
        return r1;
    }
    insert(node) {
        this._decorationsTree.insert(node);
    }
    delete(node) {
        this._decorationsTree.delete(node);
    }
    resolveNode(node, cachedVersionId) {
        this._decorationsTree.resolveNode(node, cachedVersionId);
    }
    acceptReplace(offset, length, textLength, forceMoveMarkers) {
        this._decorationsTree.acceptReplace(offset, length, textLength, forceMoveMarkers);
    }
}
const TRACKED_RANGE_OPTIONS = [
    ModelDecorationOptions.register({ description: 'notebook-view-model-tracked-range-always-grows-when-typing-at-edges', stickiness: 0 }),
    ModelDecorationOptions.register({ description: 'notebook-view-model-tracked-range-never-grows-when-typing-at-edges', stickiness: 1 }),
    ModelDecorationOptions.register({ description: 'notebook-view-model-tracked-range-grows-only-when-typing-before', stickiness: 2 }),
    ModelDecorationOptions.register({ description: 'notebook-view-model-tracked-range-grows-only-when-typing-after', stickiness: 3 }),
];
function _normalizeOptions(options) {
    if (options instanceof ModelDecorationOptions) {
        return options;
    }
    return ModelDecorationOptions.createDynamic(options);
}
let MODEL_ID = 0;
let NotebookViewModel = class NotebookViewModel extends Disposable {
    get options() { return this._options; }
    get onDidChangeOptions() { return this._onDidChangeOptions.event; }
    get viewCells() {
        return this._viewCells;
    }
    get length() {
        return this._viewCells.length;
    }
    get notebookDocument() {
        return this._notebook;
    }
    get uri() {
        return this._notebook.uri;
    }
    get metadata() {
        return this._notebook.metadata;
    }
    get isRepl() {
        return this.viewType === 'repl';
    }
    get onDidChangeViewCells() { return this._onDidChangeViewCells.event; }
    get lastNotebookEditResource() {
        if (this._lastNotebookEditResource.length) {
            return this._lastNotebookEditResource[this._lastNotebookEditResource.length - 1];
        }
        return null;
    }
    get layoutInfo() {
        return this._layoutInfo;
    }
    get onDidChangeSelection() { return this._onDidChangeSelection.event; }
    get selectionHandles() {
        const handlesSet = new Set();
        const handles = [];
        cellRangesToIndexes(this._selectionCollection.selections).map(index => index < this.length ? this.cellAt(index) : undefined).forEach(cell => {
            if (cell && !handlesSet.has(cell.handle)) {
                handles.push(cell.handle);
            }
        });
        return handles;
    }
    set selectionHandles(selectionHandles) {
        const indexes = selectionHandles.map(handle => this._viewCells.findIndex(cell => cell.handle === handle));
        this._selectionCollection.setSelections(cellIndexesToRanges(indexes), true, 'model');
    }
    get focused() {
        return this._focused;
    }
    constructor(viewType, _notebook, _viewContext, _layoutInfo, _options, _instantiationService, _bulkEditService, _undoService, _textModelService, notebookExecutionStateService) {
        super();
        this.viewType = viewType;
        this._notebook = _notebook;
        this._viewContext = _viewContext;
        this._layoutInfo = _layoutInfo;
        this._options = _options;
        this._instantiationService = _instantiationService;
        this._bulkEditService = _bulkEditService;
        this._undoService = _undoService;
        this._textModelService = _textModelService;
        this._localStore = this._register(new DisposableStore());
        this._handleToViewCellMapping = new Map();
        this._onDidChangeOptions = this._register(new Emitter());
        this._viewCells = [];
        this._onDidChangeViewCells = this._register(new Emitter());
        this._lastNotebookEditResource = [];
        this._onDidChangeSelection = this._register(new Emitter());
        this._selectionCollection = this._register(new NotebookCellSelectionCollection());
        this._decorationsTree = new DecorationsTree();
        this._decorations = Object.create(null);
        this._lastDecorationId = 0;
        this._foldingRanges = null;
        this._onDidFoldingStateChanged = new Emitter();
        this.onDidFoldingStateChanged = this._onDidFoldingStateChanged.event;
        this._hiddenRanges = [];
        this._focused = true;
        this._decorationIdToCellMap = new Map();
        this._statusBarItemIdToCellMap = new Map();
        MODEL_ID++;
        this.id = '$notebookViewModel' + MODEL_ID;
        this._instanceId = strings.singleLetterHash(MODEL_ID);
        const compute = (changes, synchronous) => {
            const diffs = changes.map(splice => {
                return [splice[0], splice[1], splice[2].map(cell => {
                        return createCellViewModel(this._instantiationService, this, cell, this._viewContext);
                    })];
            });
            diffs.reverse().forEach(diff => {
                const deletedCells = this._viewCells.splice(diff[0], diff[1], ...diff[2]);
                this._decorationsTree.acceptReplace(diff[0], diff[1], diff[2].length, true);
                deletedCells.forEach(cell => {
                    this._handleToViewCellMapping.delete(cell.handle);
                    cell.dispose();
                });
                diff[2].forEach(cell => {
                    this._handleToViewCellMapping.set(cell.handle, cell);
                    this._localStore.add(cell);
                });
            });
            const selectionHandles = this.selectionHandles;
            this._onDidChangeViewCells.fire({
                synchronous: synchronous,
                splices: diffs
            });
            let endSelectionHandles = [];
            if (selectionHandles.length) {
                const primaryHandle = selectionHandles[0];
                const primarySelectionIndex = this._viewCells.indexOf(this.getCellByHandle(primaryHandle));
                endSelectionHandles = [primaryHandle];
                let delta = 0;
                for (let i = 0; i < diffs.length; i++) {
                    const diff = diffs[0];
                    if (diff[0] + diff[1] <= primarySelectionIndex) {
                        delta += diff[2].length - diff[1];
                        continue;
                    }
                    if (diff[0] > primarySelectionIndex) {
                        endSelectionHandles = [primaryHandle];
                        break;
                    }
                    if (diff[0] + diff[1] > primarySelectionIndex) {
                        endSelectionHandles = [this._viewCells[diff[0] + delta].handle];
                        break;
                    }
                }
            }
            const selectionIndexes = endSelectionHandles.map(handle => this._viewCells.findIndex(cell => cell.handle === handle));
            this._selectionCollection.setState(cellIndexesToRanges([selectionIndexes[0]])[0], cellIndexesToRanges(selectionIndexes), true, 'model');
        };
        this._register(this._notebook.onDidChangeContent(e => {
            for (let i = 0; i < e.rawEvents.length; i++) {
                const change = e.rawEvents[i];
                let changes = [];
                const synchronous = e.synchronous ?? true;
                if (change.kind === NotebookCellsChangeType.ModelChange || change.kind === NotebookCellsChangeType.Initialize) {
                    changes = change.changes;
                    compute(changes, synchronous);
                    continue;
                }
                else if (change.kind === NotebookCellsChangeType.Move) {
                    compute([[change.index, change.length, []]], synchronous);
                    compute([[change.newIdx, 0, change.cells]], synchronous);
                }
                else {
                    continue;
                }
            }
        }));
        this._register(this._notebook.onDidChangeContent(contentChanges => {
            contentChanges.rawEvents.forEach(e => {
                if (e.kind === NotebookCellsChangeType.ChangeDocumentMetadata) {
                    this._viewContext.eventDispatcher.emit([new NotebookMetadataChangedEvent(this._notebook.metadata)]);
                }
            });
            if (contentChanges.endSelectionState) {
                this.updateSelectionsState(contentChanges.endSelectionState);
            }
        }));
        this._register(this._viewContext.eventDispatcher.onDidChangeLayout((e) => {
            this._layoutInfo = e.value;
            this._viewCells.forEach(cell => {
                if (cell.cellKind === CellKind.Markup) {
                    if (e.source.width || e.source.fontInfo) {
                        cell.layoutChange({ outerWidth: e.value.width, font: e.value.fontInfo });
                    }
                }
                else {
                    if (e.source.width !== undefined) {
                        cell.layoutChange({ outerWidth: e.value.width, font: e.value.fontInfo });
                    }
                }
            });
        }));
        this._register(this._viewContext.notebookOptions.onDidChangeOptions(e => {
            for (let i = 0; i < this.length; i++) {
                const cell = this._viewCells[i];
                cell.updateOptions(e);
            }
        }));
        this._register(notebookExecutionStateService.onDidChangeExecution(e => {
            if (e.type !== NotebookExecutionType.cell) {
                return;
            }
            const cell = this.getCellByHandle(e.cellHandle);
            if (cell instanceof CodeCellViewModel) {
                cell.updateExecutionState(e);
            }
        }));
        this._register(this._selectionCollection.onDidChangeSelection(e => {
            this._onDidChangeSelection.fire(e);
        }));
        const viewCellCount = this.isRepl ? this._notebook.cells.length - 1 : this._notebook.cells.length;
        for (let i = 0; i < viewCellCount; i++) {
            this._viewCells.push(createCellViewModel(this._instantiationService, this, this._notebook.cells[i], this._viewContext));
        }
        this._viewCells.forEach(cell => {
            this._handleToViewCellMapping.set(cell.handle, cell);
        });
    }
    updateOptions(newOptions) {
        this._options = { ...this._options, ...newOptions };
        this._viewCells.forEach(cell => cell.updateOptions({ readonly: this._options.isReadOnly }));
        this._onDidChangeOptions.fire();
    }
    getFocus() {
        return this._selectionCollection.focus;
    }
    getSelections() {
        return this._selectionCollection.selections;
    }
    setEditorFocus(focused) {
        this._focused = focused;
    }
    validateRange(cellRange) {
        if (!cellRange) {
            return null;
        }
        const start = clamp(cellRange.start, 0, this.length);
        const end = clamp(cellRange.end, 0, this.length);
        if (start <= end) {
            return { start, end };
        }
        else {
            return { start: end, end: start };
        }
    }
    updateSelectionsState(state, source = 'model') {
        if (this._focused || source === 'model') {
            if (state.kind === SelectionStateType.Handle) {
                const primaryIndex = state.primary !== null ? this.getCellIndexByHandle(state.primary) : null;
                const primarySelection = primaryIndex !== null ? this.validateRange({ start: primaryIndex, end: primaryIndex + 1 }) : null;
                const selections = cellIndexesToRanges(state.selections.map(sel => this.getCellIndexByHandle(sel)))
                    .map(range => this.validateRange(range))
                    .filter(range => range !== null);
                this._selectionCollection.setState(primarySelection, reduceCellRanges(selections), true, source);
            }
            else {
                const primarySelection = this.validateRange(state.focus);
                const selections = state.selections
                    .map(range => this.validateRange(range))
                    .filter(range => range !== null);
                this._selectionCollection.setState(primarySelection, reduceCellRanges(selections), true, source);
            }
        }
    }
    getFoldingStartIndex(index) {
        if (!this._foldingRanges) {
            return -1;
        }
        const range = this._foldingRanges.findRange(index + 1);
        const startIndex = this._foldingRanges.getStartLineNumber(range) - 1;
        return startIndex;
    }
    getFoldingState(index) {
        if (!this._foldingRanges) {
            return 0;
        }
        const range = this._foldingRanges.findRange(index + 1);
        const startIndex = this._foldingRanges.getStartLineNumber(range) - 1;
        if (startIndex !== index) {
            return 0;
        }
        return this._foldingRanges.isCollapsed(range) ? 2 : 1;
    }
    getFoldedLength(index) {
        if (!this._foldingRanges) {
            return 0;
        }
        const range = this._foldingRanges.findRange(index + 1);
        const startIndex = this._foldingRanges.getStartLineNumber(range) - 1;
        const endIndex = this._foldingRanges.getEndLineNumber(range) - 1;
        return endIndex - startIndex;
    }
    updateFoldingRanges(ranges) {
        this._foldingRanges = ranges;
        let updateHiddenAreas = false;
        const newHiddenAreas = [];
        let i = 0;
        let k = 0;
        let lastCollapsedStart = Number.MAX_VALUE;
        let lastCollapsedEnd = -1;
        for (; i < ranges.length; i++) {
            if (!ranges.isCollapsed(i)) {
                continue;
            }
            const startLineNumber = ranges.getStartLineNumber(i) + 1;
            const endLineNumber = ranges.getEndLineNumber(i);
            if (lastCollapsedStart <= startLineNumber && endLineNumber <= lastCollapsedEnd) {
                continue;
            }
            if (!updateHiddenAreas && k < this._hiddenRanges.length && this._hiddenRanges[k].start + 1 === startLineNumber && (this._hiddenRanges[k].end + 1) === endLineNumber) {
                newHiddenAreas.push(this._hiddenRanges[k]);
                k++;
            }
            else {
                updateHiddenAreas = true;
                newHiddenAreas.push({ start: startLineNumber - 1, end: endLineNumber - 1 });
            }
            lastCollapsedStart = startLineNumber;
            lastCollapsedEnd = endLineNumber;
        }
        if (updateHiddenAreas || k < this._hiddenRanges.length) {
            this._hiddenRanges = newHiddenAreas;
            this._onDidFoldingStateChanged.fire();
        }
        this._viewCells.forEach(cell => {
            if (cell.cellKind === CellKind.Markup) {
                cell.triggerFoldingStateChange();
            }
        });
    }
    getHiddenRanges() {
        return this._hiddenRanges;
    }
    getCellByHandle(handle) {
        return this._handleToViewCellMapping.get(handle);
    }
    getCellIndexByHandle(handle) {
        return this._viewCells.findIndex(cell => cell.handle === handle);
    }
    getCellIndex(cell) {
        return this._viewCells.indexOf(cell);
    }
    cellAt(index) {
        return this._viewCells[index];
    }
    getCellsInRange(range) {
        if (!range) {
            return this._viewCells.slice(0);
        }
        const validatedRange = this.validateRange(range);
        if (validatedRange) {
            const result = [];
            for (let i = validatedRange.start; i < validatedRange.end; i++) {
                result.push(this._viewCells[i]);
            }
            return result;
        }
        return [];
    }
    getNearestVisibleCellIndexUpwards(index) {
        for (let i = this._hiddenRanges.length - 1; i >= 0; i--) {
            const cellRange = this._hiddenRanges[i];
            const foldStart = cellRange.start - 1;
            const foldEnd = cellRange.end;
            if (foldStart > index) {
                continue;
            }
            if (foldStart <= index && foldEnd >= index) {
                return index;
            }
            break;
        }
        return index;
    }
    getNextVisibleCellIndex(index) {
        for (let i = 0; i < this._hiddenRanges.length; i++) {
            const cellRange = this._hiddenRanges[i];
            const foldStart = cellRange.start - 1;
            const foldEnd = cellRange.end;
            if (foldEnd < index) {
                continue;
            }
            if (foldStart <= index) {
                return foldEnd + 1;
            }
            break;
        }
        return index + 1;
    }
    getPreviousVisibleCellIndex(index) {
        for (let i = this._hiddenRanges.length - 1; i >= 0; i--) {
            const cellRange = this._hiddenRanges[i];
            const foldStart = cellRange.start - 1;
            const foldEnd = cellRange.end;
            if (foldEnd < index) {
                return index;
            }
            if (foldStart <= index) {
                return foldStart;
            }
        }
        return index;
    }
    hasCell(cell) {
        return this._handleToViewCellMapping.has(cell.handle);
    }
    getVersionId() {
        return this._notebook.versionId;
    }
    getAlternativeId() {
        return this._notebook.alternativeVersionId;
    }
    getTrackedRange(id) {
        return this._getDecorationRange(id);
    }
    _getDecorationRange(decorationId) {
        const node = this._decorations[decorationId];
        if (!node) {
            return null;
        }
        const versionId = this.getVersionId();
        if (node.cachedVersionId !== versionId) {
            this._decorationsTree.resolveNode(node, versionId);
        }
        if (node.range === null) {
            return { start: node.cachedAbsoluteStart - 1, end: node.cachedAbsoluteEnd - 1 };
        }
        return { start: node.range.startLineNumber - 1, end: node.range.endLineNumber - 1 };
    }
    setTrackedRange(id, newRange, newStickiness) {
        const node = (id ? this._decorations[id] : null);
        if (!node) {
            if (!newRange) {
                return null;
            }
            return this._deltaCellDecorationsImpl(0, [], [{ range: new Range(newRange.start + 1, 1, newRange.end + 1, 1), options: TRACKED_RANGE_OPTIONS[newStickiness] }])[0];
        }
        if (!newRange) {
            this._decorationsTree.delete(node);
            delete this._decorations[node.id];
            return null;
        }
        this._decorationsTree.delete(node);
        node.reset(this.getVersionId(), newRange.start, newRange.end + 1, new Range(newRange.start + 1, 1, newRange.end + 1, 1));
        node.setOptions(TRACKED_RANGE_OPTIONS[newStickiness]);
        this._decorationsTree.insert(node);
        return node.id;
    }
    _deltaCellDecorationsImpl(ownerId, oldDecorationsIds, newDecorations) {
        const versionId = this.getVersionId();
        const oldDecorationsLen = oldDecorationsIds.length;
        let oldDecorationIndex = 0;
        const newDecorationsLen = newDecorations.length;
        let newDecorationIndex = 0;
        const result = new Array(newDecorationsLen);
        while (oldDecorationIndex < oldDecorationsLen || newDecorationIndex < newDecorationsLen) {
            let node = null;
            if (oldDecorationIndex < oldDecorationsLen) {
                do {
                    node = this._decorations[oldDecorationsIds[oldDecorationIndex++]];
                } while (!node && oldDecorationIndex < oldDecorationsLen);
                if (node) {
                    this._decorationsTree.delete(node);
                }
            }
            if (newDecorationIndex < newDecorationsLen) {
                if (!node) {
                    const internalDecorationId = (++this._lastDecorationId);
                    const decorationId = `${this._instanceId};${internalDecorationId}`;
                    node = new IntervalNode(decorationId, 0, 0);
                    this._decorations[decorationId] = node;
                }
                const newDecoration = newDecorations[newDecorationIndex];
                const range = newDecoration.range;
                const options = _normalizeOptions(newDecoration.options);
                node.ownerId = ownerId;
                node.reset(versionId, range.startLineNumber, range.endLineNumber, Range.lift(range));
                node.setOptions(options);
                this._decorationsTree.insert(node);
                result[newDecorationIndex] = node.id;
                newDecorationIndex++;
            }
            else {
                if (node) {
                    delete this._decorations[node.id];
                }
            }
        }
        return result;
    }
    deltaCellDecorations(oldDecorations, newDecorations) {
        oldDecorations.forEach(id => {
            const handle = this._decorationIdToCellMap.get(id);
            if (handle !== undefined) {
                const cell = this.getCellByHandle(handle);
                cell?.deltaCellDecorations([id], []);
                this._decorationIdToCellMap.delete(id);
            }
        });
        const result = [];
        newDecorations.forEach(decoration => {
            const cell = this.getCellByHandle(decoration.handle);
            const ret = cell?.deltaCellDecorations([], [decoration.options]) || [];
            ret.forEach(id => {
                this._decorationIdToCellMap.set(id, decoration.handle);
            });
            result.push(...ret);
        });
        return result;
    }
    deltaCellStatusBarItems(oldItems, newItems) {
        const deletesByHandle = groupBy(oldItems, id => this._statusBarItemIdToCellMap.get(id) ?? -1);
        const result = [];
        newItems.forEach(itemDelta => {
            const cell = this.getCellByHandle(itemDelta.handle);
            const deleted = deletesByHandle[itemDelta.handle] ?? [];
            delete deletesByHandle[itemDelta.handle];
            deleted.forEach(id => this._statusBarItemIdToCellMap.delete(id));
            const ret = cell?.deltaCellStatusBarItems(deleted, itemDelta.items) || [];
            ret.forEach(id => {
                this._statusBarItemIdToCellMap.set(id, itemDelta.handle);
            });
            result.push(...ret);
        });
        for (const _handle in deletesByHandle) {
            const handle = parseInt(_handle);
            const ids = deletesByHandle[handle];
            const cell = this.getCellByHandle(handle);
            cell?.deltaCellStatusBarItems(ids, []);
            ids.forEach(id => this._statusBarItemIdToCellMap.delete(id));
        }
        return result;
    }
    nearestCodeCellIndex(index) {
        const nearest = this.viewCells.slice(0, index).reverse().findIndex(cell => cell.cellKind === CellKind.Code);
        if (nearest > -1) {
            return index - nearest - 1;
        }
        else {
            const nearestCellTheOtherDirection = this.viewCells.slice(index + 1).findIndex(cell => cell.cellKind === CellKind.Code);
            if (nearestCellTheOtherDirection > -1) {
                return index + 1 + nearestCellTheOtherDirection;
            }
            return -1;
        }
    }
    getEditorViewState() {
        const editingCells = {};
        const collapsedInputCells = {};
        const collapsedOutputCells = {};
        const cellLineNumberStates = {};
        this._viewCells.forEach((cell, i) => {
            if (cell.getEditState() === CellEditState.Editing) {
                editingCells[i] = true;
            }
            if (cell.isInputCollapsed) {
                collapsedInputCells[i] = true;
            }
            if (cell instanceof CodeCellViewModel && cell.isOutputCollapsed) {
                collapsedOutputCells[i] = true;
            }
            if (cell.lineNumbers !== 'inherit') {
                cellLineNumberStates[i] = cell.lineNumbers;
            }
        });
        const editorViewStates = {};
        this._viewCells.map(cell => ({ handle: cell.model.handle, state: cell.saveEditorViewState() })).forEach((viewState, i) => {
            if (viewState.state) {
                editorViewStates[i] = viewState.state;
            }
        });
        return {
            editingCells,
            editorViewStates,
            cellLineNumberStates,
            collapsedInputCells,
            collapsedOutputCells
        };
    }
    restoreEditorViewState(viewState) {
        if (!viewState) {
            return;
        }
        this._viewCells.forEach((cell, index) => {
            const isEditing = viewState.editingCells && viewState.editingCells[index];
            const editorViewState = viewState.editorViewStates && viewState.editorViewStates[index];
            cell.updateEditState(isEditing ? CellEditState.Editing : CellEditState.Preview, 'viewState');
            const cellHeight = viewState.cellTotalHeights ? viewState.cellTotalHeights[index] : undefined;
            cell.restoreEditorViewState(editorViewState, cellHeight);
            if (viewState.collapsedInputCells && viewState.collapsedInputCells[index]) {
                cell.isInputCollapsed = true;
            }
            if (viewState.collapsedOutputCells && viewState.collapsedOutputCells[index] && cell instanceof CodeCellViewModel) {
                cell.isOutputCollapsed = true;
            }
            if (viewState.cellLineNumberStates && viewState.cellLineNumberStates[index]) {
                cell.lineNumbers = viewState.cellLineNumberStates[index];
            }
        });
    }
    changeModelDecorations(callback) {
        const changeAccessor = {
            deltaDecorations: (oldDecorations, newDecorations) => {
                return this._deltaModelDecorationsImpl(oldDecorations, newDecorations);
            }
        };
        let result = null;
        try {
            result = callback(changeAccessor);
        }
        catch (e) {
            onUnexpectedError(e);
        }
        changeAccessor.deltaDecorations = invalidFunc;
        return result;
    }
    _deltaModelDecorationsImpl(oldDecorations, newDecorations) {
        const mapping = new Map();
        oldDecorations.forEach(oldDecoration => {
            const ownerId = oldDecoration.ownerId;
            if (!mapping.has(ownerId)) {
                const cell = this._viewCells.find(cell => cell.handle === ownerId);
                if (cell) {
                    mapping.set(ownerId, { cell: cell, oldDecorations: [], newDecorations: [] });
                }
            }
            const data = mapping.get(ownerId);
            if (data) {
                data.oldDecorations = oldDecoration.decorations;
            }
        });
        newDecorations.forEach(newDecoration => {
            const ownerId = newDecoration.ownerId;
            if (!mapping.has(ownerId)) {
                const cell = this._viewCells.find(cell => cell.handle === ownerId);
                if (cell) {
                    mapping.set(ownerId, { cell: cell, oldDecorations: [], newDecorations: [] });
                }
            }
            const data = mapping.get(ownerId);
            if (data) {
                data.newDecorations = newDecoration.decorations;
            }
        });
        const ret = [];
        mapping.forEach((value, ownerId) => {
            const cellRet = value.cell.deltaModelDecorations(value.oldDecorations, value.newDecorations);
            ret.push({
                ownerId: ownerId,
                decorations: cellRet
            });
        });
        return ret;
    }
    find(value, options) {
        const matches = [];
        let findCells = [];
        if (options.findScope && (options.findScope.findScopeType === NotebookFindScopeType.Cells || options.findScope.findScopeType === NotebookFindScopeType.Text)) {
            const selectedRanges = options.findScope.selectedCellRanges?.map(range => this.validateRange(range)).filter(range => !!range) ?? [];
            const selectedIndexes = cellRangesToIndexes(selectedRanges);
            findCells = selectedIndexes.map(index => this._viewCells[index]);
        }
        else {
            findCells = this._viewCells;
        }
        findCells.forEach((cell, index) => {
            const cellMatches = cell.startFind(value, options);
            if (cellMatches) {
                matches.push(new CellFindMatchModel(cellMatches.cell, index, cellMatches.contentMatches, []));
            }
        });
        return matches.filter(match => {
            if (match.cell.cellKind === CellKind.Code) {
                return options.includeCodeInput;
            }
            if (match.cell.getEditState() === CellEditState.Editing) {
                return options.includeMarkupInput;
            }
            else {
                return !options.includeMarkupPreview && options.includeMarkupInput;
            }
        });
    }
    replaceOne(cell, range, text) {
        const viewCell = cell;
        this._lastNotebookEditResource.push(viewCell.uri);
        return viewCell.resolveTextModel().then(() => {
            this._bulkEditService.apply([new ResourceTextEdit(cell.uri, { range, text })], { quotableLabel: 'Notebook Replace' });
        });
    }
    async replaceAll(matches, texts) {
        if (!matches.length) {
            return;
        }
        const textEdits = [];
        this._lastNotebookEditResource.push(matches[0].cell.uri);
        matches.forEach(match => {
            match.contentMatches.forEach((singleMatch, index) => {
                textEdits.push({
                    versionId: undefined,
                    textEdit: { range: singleMatch.range, text: texts[index] },
                    resource: match.cell.uri
                });
            });
        });
        return Promise.all(matches.map(match => {
            return match.cell.resolveTextModel();
        })).then(async () => {
            this._bulkEditService.apply({ edits: textEdits }, { quotableLabel: 'Notebook Replace All' });
            return;
        });
    }
    async _withElement(element, callback) {
        const viewCells = this._viewCells.filter(cell => element.matchesResource(cell.uri));
        const refs = await Promise.all(viewCells.map(cell => this._textModelService.createModelReference(cell.uri)));
        await callback();
        refs.forEach(ref => ref.dispose());
    }
    async undo() {
        const editStack = this._undoService.getElements(this.uri);
        const element = editStack.past.length ? editStack.past[editStack.past.length - 1] : undefined;
        if (element && element instanceof SingleModelEditStackElement || element instanceof MultiModelEditStackElement) {
            await this._withElement(element, async () => {
                await this._undoService.undo(this.uri);
            });
            return (element instanceof SingleModelEditStackElement) ? [element.resource] : element.resources;
        }
        await this._undoService.undo(this.uri);
        return [];
    }
    async redo() {
        const editStack = this._undoService.getElements(this.uri);
        const element = editStack.future[0];
        if (element && element instanceof SingleModelEditStackElement || element instanceof MultiModelEditStackElement) {
            await this._withElement(element, async () => {
                await this._undoService.redo(this.uri);
            });
            return (element instanceof SingleModelEditStackElement) ? [element.resource] : element.resources;
        }
        await this._undoService.redo(this.uri);
        return [];
    }
    equal(notebook) {
        return this._notebook === notebook;
    }
    dispose() {
        this._localStore.clear();
        this._viewCells.forEach(cell => {
            cell.dispose();
        });
        super.dispose();
    }
};
NotebookViewModel = __decorate([
    __param(5, IInstantiationService),
    __param(6, IBulkEditService),
    __param(7, IUndoRedoService),
    __param(8, ITextModelService),
    __param(9, INotebookExecutionStateService),
    __metadata("design:paramtypes", [String, NotebookTextModel,
        ViewContext, Object, Object, Object, Object, Object, Object, Object])
], NotebookViewModel);
export { NotebookViewModel };
export function createCellViewModel(instantiationService, notebookViewModel, cell, viewContext) {
    if (cell.cellKind === CellKind.Code) {
        return instantiationService.createInstance(CodeCellViewModel, notebookViewModel.viewType, cell, notebookViewModel.layoutInfo, viewContext);
    }
    else {
        return instantiationService.createInstance(MarkupCellViewModel, notebookViewModel.viewType, cell, notebookViewModel.layoutInfo, notebookViewModel, viewContext);
    }
}
