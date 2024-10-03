import { Disposable, DisposableStore } from '../../../../../base/common/lifecycle.js';
import { ICellViewModel } from '../notebookBrowser.js';
import { CellViewModelStateChangeEvent } from '../notebookViewEvents.js';
import { ICellExecutionStateChangedEvent } from '../../common/notebookExecutionStateService.js';
export declare abstract class CellContentPart extends Disposable {
    protected currentCell: ICellViewModel | undefined;
    protected readonly cellDisposables: DisposableStore;
    constructor();
    prepareRenderCell(element: ICellViewModel): void;
    renderCell(element: ICellViewModel): void;
    didRenderCell(element: ICellViewModel): void;
    unrenderCell(element: ICellViewModel): void;
    prepareLayout(): void;
    updateInternalLayoutNow(element: ICellViewModel): void;
    updateState(element: ICellViewModel, e: CellViewModelStateChangeEvent): void;
    updateForExecutionState(element: ICellViewModel, e: ICellExecutionStateChangedEvent): void;
}
export declare abstract class CellOverlayPart extends Disposable {
    protected currentCell: ICellViewModel | undefined;
    protected readonly cellDisposables: DisposableStore;
    constructor();
    prepareRenderCell(element: ICellViewModel): void;
    renderCell(element: ICellViewModel): void;
    didRenderCell(element: ICellViewModel): void;
    unrenderCell(element: ICellViewModel): void;
    updateInternalLayoutNow(element: ICellViewModel): void;
    updateState(element: ICellViewModel, e: CellViewModelStateChangeEvent): void;
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
