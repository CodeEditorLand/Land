import { INotebookEditor } from '../../notebookBrowser.js';
import { CellContentPart } from '../cellPart.js';
import { MarkupCellViewModel } from '../../viewModel/markupCellViewModel.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
export declare class FoldedCellHint extends CellContentPart {
    private readonly _notebookEditor;
    private readonly _container;
    private readonly _notebookExecutionStateService;
    private readonly _runButtonListener;
    private readonly _cellExecutionListener;
    constructor(_notebookEditor: INotebookEditor, _container: HTMLElement, _notebookExecutionStateService: INotebookExecutionStateService);
    didRenderCell(element: MarkupCellViewModel): void;
    private update;
    private getHiddenCellsLabel;
    private getHiddenCellHintButton;
    private getRunFoldedSectionButton;
    updateInternalLayoutNow(element: MarkupCellViewModel): void;
}
