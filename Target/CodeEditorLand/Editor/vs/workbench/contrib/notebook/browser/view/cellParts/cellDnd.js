import * as DOM from '../../../../../../base/browser/dom.js';
import { Delayer } from '../../../../../../base/common/async.js';
import { Disposable, MutableDisposable } from '../../../../../../base/common/lifecycle.js';
import * as platform from '../../../../../../base/common/platform.js';
import { expandCellRangesWithHiddenCells } from '../../notebookBrowser.js';
import { CellContentPart } from '../cellPart.js';
import { cloneNotebookCellTextModel } from '../../../common/model/notebookCellTextModel.js';
import { SelectionStateType } from '../../../common/notebookCommon.js';
import { cellRangesToIndexes } from '../../../common/notebookRange.js';
const $ = DOM.$;
const DRAGGING_CLASS = 'cell-dragging';
const GLOBAL_DRAG_CLASS = 'global-drag-active';
export class CellDragAndDropPart extends CellContentPart {
    constructor(container) {
        super();
        this.container = container;
    }
    didRenderCell(element) {
        this.update(element);
    }
    updateState(element, e) {
        if (e.dragStateChanged) {
            this.update(element);
        }
    }
    update(element) {
        this.container.classList.toggle(DRAGGING_CLASS, element.dragging);
    }
}
export class CellDragAndDropController extends Disposable {
    constructor(notebookEditor, notebookListContainer) {
        super();
        this.notebookEditor = notebookEditor;
        this.notebookListContainer = notebookListContainer;
        this.draggedCells = [];
        this.isScrolling = false;
        this.listOnWillScrollListener = this._register(new MutableDisposable());
        this.listInsertionIndicator = DOM.append(notebookListContainer, $('.cell-list-insertion-indicator'));
        this._register(DOM.addDisposableListener(notebookListContainer.ownerDocument.body, DOM.EventType.DRAG_START, this.onGlobalDragStart.bind(this), true));
        this._register(DOM.addDisposableListener(notebookListContainer.ownerDocument.body, DOM.EventType.DRAG_END, this.onGlobalDragEnd.bind(this), true));
        const addCellDragListener = (eventType, handler, useCapture = false) => {
            this._register(DOM.addDisposableListener(notebookEditor.getDomNode(), eventType, e => {
                const cellDragEvent = this.toCellDragEvent(e);
                if (cellDragEvent) {
                    handler(cellDragEvent);
                }
            }, useCapture));
        };
        addCellDragListener(DOM.EventType.DRAG_OVER, event => {
            if (!this.currentDraggedCell) {
                return;
            }
            event.browserEvent.preventDefault();
            this.onCellDragover(event);
        }, true);
        addCellDragListener(DOM.EventType.DROP, event => {
            if (!this.currentDraggedCell) {
                return;
            }
            event.browserEvent.preventDefault();
            this.onCellDrop(event);
        });
        addCellDragListener(DOM.EventType.DRAG_LEAVE, event => {
            event.browserEvent.preventDefault();
            this.onCellDragLeave(event);
        });
        this.scrollingDelayer = this._register(new Delayer(200));
    }
    setList(value) {
        this.list = value;
        this.listOnWillScrollListener.value = this.list.onWillScroll(e => {
            if (!e.scrollTopChanged) {
                return;
            }
            this.setInsertIndicatorVisibility(false);
            this.isScrolling = true;
            this.scrollingDelayer.trigger(() => {
                this.isScrolling = false;
            });
        });
    }
    setInsertIndicatorVisibility(visible) {
        this.listInsertionIndicator.style.opacity = visible ? '1' : '0';
    }
    toCellDragEvent(event) {
        const targetTop = this.notebookListContainer.getBoundingClientRect().top;
        const dragOffset = this.list.scrollTop + event.clientY - targetTop;
        const draggedOverCell = this.list.elementAt(dragOffset);
        if (!draggedOverCell) {
            return undefined;
        }
        const cellTop = this.list.getCellViewScrollTop(draggedOverCell);
        const cellHeight = this.list.elementHeight(draggedOverCell);
        const dragPosInElement = dragOffset - cellTop;
        const dragPosRatio = dragPosInElement / cellHeight;
        return {
            browserEvent: event,
            draggedOverCell,
            cellTop,
            cellHeight,
            dragPosRatio
        };
    }
    clearGlobalDragState() {
        this.notebookEditor.getDomNode().classList.remove(GLOBAL_DRAG_CLASS);
    }
    onGlobalDragStart() {
        this.notebookEditor.getDomNode().classList.add(GLOBAL_DRAG_CLASS);
    }
    onGlobalDragEnd() {
        this.notebookEditor.getDomNode().classList.remove(GLOBAL_DRAG_CLASS);
    }
    onCellDragover(event) {
        if (!event.browserEvent.dataTransfer) {
            return;
        }
        if (!this.currentDraggedCell) {
            event.browserEvent.dataTransfer.dropEffect = 'none';
            return;
        }
        if (this.isScrolling || this.currentDraggedCell === event.draggedOverCell) {
            this.setInsertIndicatorVisibility(false);
            return;
        }
        const dropDirection = this.getDropInsertDirection(event.dragPosRatio);
        const insertionIndicatorAbsolutePos = dropDirection === 'above' ? event.cellTop : event.cellTop + event.cellHeight;
        this.updateInsertIndicator(dropDirection, insertionIndicatorAbsolutePos);
    }
    updateInsertIndicator(dropDirection, insertionIndicatorAbsolutePos) {
        const { bottomToolbarGap } = this.notebookEditor.notebookOptions.computeBottomToolbarDimensions(this.notebookEditor.textModel?.viewType);
        const insertionIndicatorTop = insertionIndicatorAbsolutePos - this.list.scrollTop + bottomToolbarGap / 2;
        if (insertionIndicatorTop >= 0) {
            this.listInsertionIndicator.style.top = `${insertionIndicatorTop}px`;
            this.setInsertIndicatorVisibility(true);
        }
        else {
            this.setInsertIndicatorVisibility(false);
        }
    }
    getDropInsertDirection(dragPosRatio) {
        return dragPosRatio < 0.5 ? 'above' : 'below';
    }
    onCellDrop(event) {
        const draggedCell = this.currentDraggedCell;
        if (this.isScrolling || this.currentDraggedCell === event.draggedOverCell) {
            return;
        }
        this.dragCleanup();
        const dropDirection = this.getDropInsertDirection(event.dragPosRatio);
        this._dropImpl(draggedCell, dropDirection, event.browserEvent, event.draggedOverCell);
    }
    getCellRangeAroundDragTarget(draggedCellIndex) {
        const selections = this.notebookEditor.getSelections();
        const modelRanges = expandCellRangesWithHiddenCells(this.notebookEditor, selections);
        const nearestRange = modelRanges.find(range => range.start <= draggedCellIndex && draggedCellIndex < range.end);
        if (nearestRange) {
            return nearestRange;
        }
        else {
            return { start: draggedCellIndex, end: draggedCellIndex + 1 };
        }
    }
    _dropImpl(draggedCell, dropDirection, ctx, draggedOverCell) {
        const cellTop = this.list.getCellViewScrollTop(draggedOverCell);
        const cellHeight = this.list.elementHeight(draggedOverCell);
        const insertionIndicatorAbsolutePos = dropDirection === 'above' ? cellTop : cellTop + cellHeight;
        const { bottomToolbarGap } = this.notebookEditor.notebookOptions.computeBottomToolbarDimensions(this.notebookEditor.textModel?.viewType);
        const insertionIndicatorTop = insertionIndicatorAbsolutePos - this.list.scrollTop + bottomToolbarGap / 2;
        const editorHeight = this.notebookEditor.getDomNode().getBoundingClientRect().height;
        if (insertionIndicatorTop < 0 || insertionIndicatorTop > editorHeight) {
            return;
        }
        const isCopy = (ctx.ctrlKey && !platform.isMacintosh) || (ctx.altKey && platform.isMacintosh);
        if (!this.notebookEditor.hasModel()) {
            return;
        }
        const textModel = this.notebookEditor.textModel;
        if (isCopy) {
            const draggedCellIndex = this.notebookEditor.getCellIndex(draggedCell);
            const range = this.getCellRangeAroundDragTarget(draggedCellIndex);
            let originalToIdx = this.notebookEditor.getCellIndex(draggedOverCell);
            if (dropDirection === 'below') {
                const relativeToIndex = this.notebookEditor.getCellIndex(draggedOverCell);
                const newIdx = this.notebookEditor.getNextVisibleCellIndex(relativeToIndex);
                originalToIdx = newIdx;
            }
            let finalSelection;
            let finalFocus;
            if (originalToIdx <= range.start) {
                finalSelection = { start: originalToIdx, end: originalToIdx + range.end - range.start };
                finalFocus = { start: originalToIdx + draggedCellIndex - range.start, end: originalToIdx + draggedCellIndex - range.start + 1 };
            }
            else {
                const delta = (originalToIdx - range.start);
                finalSelection = { start: range.start + delta, end: range.end + delta };
                finalFocus = { start: draggedCellIndex + delta, end: draggedCellIndex + delta + 1 };
            }
            textModel.applyEdits([
                {
                    editType: 1,
                    index: originalToIdx,
                    count: 0,
                    cells: cellRangesToIndexes([range]).map(index => cloneNotebookCellTextModel(this.notebookEditor.cellAt(index).model))
                }
            ], true, { kind: SelectionStateType.Index, focus: this.notebookEditor.getFocus(), selections: this.notebookEditor.getSelections() }, () => ({ kind: SelectionStateType.Index, focus: finalFocus, selections: [finalSelection] }), undefined, true);
            this.notebookEditor.revealCellRangeInView(finalSelection);
        }
        else {
            performCellDropEdits(this.notebookEditor, draggedCell, dropDirection, draggedOverCell);
        }
    }
    onCellDragLeave(event) {
        if (!event.browserEvent.relatedTarget || !DOM.isAncestor(event.browserEvent.relatedTarget, this.notebookEditor.getDomNode())) {
            this.setInsertIndicatorVisibility(false);
        }
    }
    dragCleanup() {
        if (this.currentDraggedCell) {
            this.draggedCells.forEach(cell => cell.dragging = false);
            this.currentDraggedCell = undefined;
            this.draggedCells = [];
        }
        this.setInsertIndicatorVisibility(false);
    }
    registerDragHandle(templateData, cellRoot, dragHandles, dragImageProvider) {
        const container = templateData.container;
        for (const dragHandle of dragHandles) {
            dragHandle.setAttribute('draggable', 'true');
        }
        const onDragEnd = () => {
            if (!this.notebookEditor.notebookOptions.getDisplayOptions().dragAndDropEnabled || !!this.notebookEditor.isReadOnly) {
                return;
            }
            container.classList.remove(DRAGGING_CLASS);
            this.dragCleanup();
        };
        for (const dragHandle of dragHandles) {
            templateData.templateDisposables.add(DOM.addDisposableListener(dragHandle, DOM.EventType.DRAG_END, onDragEnd));
        }
        const onDragStart = (event) => {
            if (!event.dataTransfer) {
                return;
            }
            if (!this.notebookEditor.notebookOptions.getDisplayOptions().dragAndDropEnabled || !!this.notebookEditor.isReadOnly) {
                return;
            }
            this.currentDraggedCell = templateData.currentRenderedCell;
            this.draggedCells = this.notebookEditor.getSelections().map(range => this.notebookEditor.getCellsInRange(range)).flat();
            this.draggedCells.forEach(cell => cell.dragging = true);
            const dragImage = dragImageProvider();
            cellRoot.parentElement.appendChild(dragImage);
            event.dataTransfer.setDragImage(dragImage, 0, 0);
            setTimeout(() => dragImage.remove(), 0);
        };
        for (const dragHandle of dragHandles) {
            templateData.templateDisposables.add(DOM.addDisposableListener(dragHandle, DOM.EventType.DRAG_START, onDragStart));
        }
    }
    startExplicitDrag(cell, _dragOffsetY) {
        if (!this.notebookEditor.notebookOptions.getDisplayOptions().dragAndDropEnabled || !!this.notebookEditor.isReadOnly) {
            return;
        }
        this.currentDraggedCell = cell;
        this.setInsertIndicatorVisibility(true);
    }
    explicitDrag(cell, dragOffsetY) {
        if (!this.notebookEditor.notebookOptions.getDisplayOptions().dragAndDropEnabled || !!this.notebookEditor.isReadOnly) {
            return;
        }
        const target = this.list.elementAt(dragOffsetY);
        if (target && target !== cell) {
            const cellTop = this.list.getCellViewScrollTop(target);
            const cellHeight = this.list.elementHeight(target);
            const dropDirection = this.getExplicitDragDropDirection(dragOffsetY, cellTop, cellHeight);
            const insertionIndicatorAbsolutePos = dropDirection === 'above' ? cellTop : cellTop + cellHeight;
            this.updateInsertIndicator(dropDirection, insertionIndicatorAbsolutePos);
        }
        if (this.currentDraggedCell !== cell) {
            return;
        }
        const notebookViewRect = this.notebookEditor.getDomNode().getBoundingClientRect();
        const eventPositionInView = dragOffsetY - this.list.scrollTop;
        const notebookViewScrollMargins = 0.2;
        const maxScrollDeltaPerFrame = 20;
        const eventPositionRatio = eventPositionInView / notebookViewRect.height;
        if (eventPositionRatio < notebookViewScrollMargins) {
            this.list.scrollTop -= maxScrollDeltaPerFrame * (1 - eventPositionRatio / notebookViewScrollMargins);
        }
        else if (eventPositionRatio > 1 - notebookViewScrollMargins) {
            this.list.scrollTop += maxScrollDeltaPerFrame * (1 - ((1 - eventPositionRatio) / notebookViewScrollMargins));
        }
    }
    endExplicitDrag(_cell) {
        this.setInsertIndicatorVisibility(false);
    }
    explicitDrop(cell, ctx) {
        this.currentDraggedCell = undefined;
        this.setInsertIndicatorVisibility(false);
        const target = this.list.elementAt(ctx.dragOffsetY);
        if (!target || target === cell) {
            return;
        }
        const cellTop = this.list.getCellViewScrollTop(target);
        const cellHeight = this.list.elementHeight(target);
        const dropDirection = this.getExplicitDragDropDirection(ctx.dragOffsetY, cellTop, cellHeight);
        this._dropImpl(cell, dropDirection, ctx, target);
    }
    getExplicitDragDropDirection(clientY, cellTop, cellHeight) {
        const dragPosInElement = clientY - cellTop;
        const dragPosRatio = dragPosInElement / cellHeight;
        return this.getDropInsertDirection(dragPosRatio);
    }
    dispose() {
        this.notebookEditor = null;
        super.dispose();
    }
}
export function performCellDropEdits(editor, draggedCell, dropDirection, draggedOverCell) {
    const draggedCellIndex = editor.getCellIndex(draggedCell);
    let originalToIdx = editor.getCellIndex(draggedOverCell);
    if (typeof draggedCellIndex !== 'number' || typeof originalToIdx !== 'number') {
        return;
    }
    if (dropDirection === 'below') {
        const newIdx = editor.getNextVisibleCellIndex(originalToIdx) ?? originalToIdx;
        originalToIdx = newIdx;
    }
    let selections = editor.getSelections();
    if (!selections.length) {
        selections = [editor.getFocus()];
    }
    let originalFocusIdx = editor.getFocus().start;
    if (!selections.some(s => s.start <= draggedCellIndex && s.end > draggedCellIndex)) {
        selections = [{ start: draggedCellIndex, end: draggedCellIndex + 1 }];
        originalFocusIdx = draggedCellIndex;
    }
    const droppedInSelection = selections.find(range => range.start <= originalToIdx && range.end > originalToIdx);
    if (droppedInSelection) {
        originalToIdx = droppedInSelection.start;
    }
    let numCells = 0;
    let focusNewIdx = originalToIdx;
    let newInsertionIdx = originalToIdx;
    selections.sort((a, b) => b.start - a.start);
    const edits = selections.map(range => {
        const length = range.end - range.start;
        let toIndexDelta = 0;
        if (range.end <= newInsertionIdx) {
            toIndexDelta = -length;
        }
        const newIdx = newInsertionIdx + toIndexDelta;
        if (originalFocusIdx >= range.start && originalFocusIdx <= range.end) {
            const offset = originalFocusIdx - range.start;
            focusNewIdx = newIdx + offset;
        }
        const fromIndexDelta = range.start >= originalToIdx ? numCells : 0;
        const edit = {
            editType: 6,
            index: range.start + fromIndexDelta,
            length,
            newIdx
        };
        numCells += length;
        if (range.end < newInsertionIdx) {
            newInsertionIdx -= length;
        }
        return edit;
    });
    const lastEdit = edits[edits.length - 1];
    const finalSelection = { start: lastEdit.newIdx, end: lastEdit.newIdx + numCells };
    const finalFocus = { start: focusNewIdx, end: focusNewIdx + 1 };
    editor.textModel.applyEdits(edits, true, { kind: SelectionStateType.Index, focus: editor.getFocus(), selections: editor.getSelections() }, () => ({ kind: SelectionStateType.Index, focus: finalFocus, selections: [finalSelection] }), undefined, true);
    editor.revealCellRangeInView(finalSelection);
}
