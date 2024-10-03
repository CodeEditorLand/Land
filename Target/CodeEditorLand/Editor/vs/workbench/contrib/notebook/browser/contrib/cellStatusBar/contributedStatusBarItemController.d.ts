import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { INotebookEditor, INotebookEditorContribution } from '../../notebookBrowser.js';
import { INotebookCellStatusBarService } from '../../../common/notebookCellStatusBarService.js';
export declare class ContributedStatusBarItemController extends Disposable implements INotebookEditorContribution {
    private readonly _notebookEditor;
    private readonly _notebookCellStatusBarService;
    static id: string;
    private readonly _visibleCells;
    private readonly _observer;
    constructor(_notebookEditor: INotebookEditor, _notebookCellStatusBarService: INotebookCellStatusBarService);
    private _updateEverything;
    private _updateVisibleCells;
    dispose(): void;
}
