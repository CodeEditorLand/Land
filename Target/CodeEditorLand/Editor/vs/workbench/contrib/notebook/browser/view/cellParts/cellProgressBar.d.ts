import { ICellViewModel } from '../../notebookBrowser.js';
import { CellViewModelStateChangeEvent } from '../../notebookViewEvents.js';
import { CellContentPart } from '../cellPart.js';
import { ICellExecutionStateChangedEvent, INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
export declare class CellProgressBar extends CellContentPart {
    private readonly _notebookExecutionStateService;
    private readonly _progressBar;
    private readonly _collapsedProgressBar;
    constructor(editorContainer: HTMLElement, collapsedInputContainer: HTMLElement, _notebookExecutionStateService: INotebookExecutionStateService);
    didRenderCell(element: ICellViewModel): void;
    updateForExecutionState(element: ICellViewModel, e: ICellExecutionStateChangedEvent): void;
    updateState(element: ICellViewModel, e: CellViewModelStateChangeEvent): void;
    private _updateForExecutionState;
}
