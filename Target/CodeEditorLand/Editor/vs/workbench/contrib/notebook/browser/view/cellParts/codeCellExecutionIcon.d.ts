import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { ICellViewModel, INotebookEditorDelegate } from '../../notebookBrowser.js';
import { INotebookExecutionStateService } from '../../../common/notebookExecutionStateService.js';
export declare class CollapsedCodeCellExecutionIcon extends Disposable {
    private readonly _cell;
    private readonly _element;
    private _executionStateService;
    private _visible;
    constructor(_notebookEditor: INotebookEditorDelegate, _cell: ICellViewModel, _element: HTMLElement, _executionStateService: INotebookExecutionStateService);
    setVisibility(visible: boolean): void;
    private _update;
    private _getItemForState;
}
