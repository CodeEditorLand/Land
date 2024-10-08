import { Disposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { ICellViewModel } from '../notebookBrowser.js';
import { CellViewModelStateChangeEvent } from '../notebookViewEvents.js';
import { ICellExecutionStateChangedEvent } from '../../common/notebookExecutionStateService.js';
/**
 * A content part is a non-floating element that is rendered inside a cell.
 * The rendering of the content part is synchronous to avoid flickering.
 */
export declare abstract class CellContentPart extends Disposable {
    protected currentCell: ICellViewModel | undefined;
    protected readonly cellDisposables: DisposableStore;
    constructor();
    /**
     * Prepare model for cell part rendering
     * No DOM operations recommended within this operation
     */
    prepareRenderCell(element: ICellViewModel): void;
    /**
     * Update the DOM for the cell `element`
     */
    renderCell(element: ICellViewModel): void;
    didRenderCell(element: ICellViewModel): void;
    /**
     * Dispose any disposables generated from `didRenderCell`
     */
    unrenderCell(element: ICellViewModel): void;
    /**
     * Perform DOM read operations to prepare for the list/cell layout update.
     */
    prepareLayout(): void;
    /**
     * Update internal DOM (top positions) per cell layout info change
     * Note that a cell part doesn't need to call `DOM.scheduleNextFrame`,
     * the list view will ensure that layout call is invoked in the right frame
     */
    updateInternalLayoutNow(element: ICellViewModel): void;
    /**
     * Update per cell state change
     */
    updateState(element: ICellViewModel, e: CellViewModelStateChangeEvent): void;
    /**
     * Update per execution state change.
     */
    updateForExecutionState(element: ICellViewModel, e: ICellExecutionStateChangedEvent): void;
}
/**
 * An overlay part renders on top of other components.
 * The rendering of the overlay part might be postponed to the next animation frame to avoid forced reflow.
 */
export declare abstract class CellOverlayPart extends Disposable {
    protected currentCell: ICellViewModel | undefined;
    protected readonly cellDisposables: DisposableStore;
    constructor();
    /**
     * Prepare model for cell part rendering
     * No DOM operations recommended within this operation
     */
    prepareRenderCell(element: ICellViewModel): void;
    /**
     * Update the DOM for the cell `element`
     */
    renderCell(element: ICellViewModel): void;
    didRenderCell(element: ICellViewModel): void;
    /**
     * Dispose any disposables generated from `didRenderCell`
     */
    unrenderCell(element: ICellViewModel): void;
    /**
     * Update internal DOM (top positions) per cell layout info change
     * Note that a cell part doesn't need to call `DOM.scheduleNextFrame`,
     * the list view will ensure that layout call is invoked in the right frame
     */
    updateInternalLayoutNow(element: ICellViewModel): void;
    /**
     * Update per cell state change
     */
    updateState(element: ICellViewModel, e: CellViewModelStateChangeEvent): void;
    /**
     * Update per execution state change.
     */
    updateForExecutionState(element: ICellViewModel, e: ICellExecutionStateChangedEvent): void;
}
export declare class CellPartsCollection extends Disposable {
    private readonly targetWindow;
    private readonly contentParts;
    private readonly overlayParts;
    private readonly _scheduledOverlayRendering;
    private readonly _scheduledOverlayUpdateState;
    private readonly _scheduledOverlayUpdateExecutionState;
    constructor(targetWindow: Window, contentParts: readonly CellContentPart[], overlayParts: readonly CellOverlayPart[]);
    concatContentPart(other: readonly CellContentPart[], targetWindow: Window): CellPartsCollection;
    concatOverlayPart(other: readonly CellOverlayPart[], targetWindow: Window): CellPartsCollection;
    scheduleRenderCell(element: ICellViewModel): void;
    unrenderCell(element: ICellViewModel): void;
    updateInternalLayoutNow(viewCell: ICellViewModel): void;
    prepareLayout(): void;
    updateState(viewCell: ICellViewModel, e: CellViewModelStateChangeEvent): void;
    updateForExecutionState(viewCell: ICellViewModel, e: ICellExecutionStateChangedEvent): void;
}
