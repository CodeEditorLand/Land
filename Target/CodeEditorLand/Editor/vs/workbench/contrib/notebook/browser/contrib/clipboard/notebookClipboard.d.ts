import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
import { ICellViewModel, INotebookEditor } from '../../notebookBrowser.js';
import { NotebookCellTextModel } from '../../../common/model/notebookCellTextModel.js';
import { ServicesAccessor } from '../../../../../../platform/instantiation/common/instantiation.js';
export declare function runPasteCells(editor: INotebookEditor, activeCell: ICellViewModel | undefined, pasteCells: {
    items: NotebookCellTextModel[];
    isCopy: boolean;
}): boolean;
export declare function runCopyCells(accessor: ServicesAccessor, editor: INotebookEditor, targetCell: ICellViewModel | undefined): boolean;
export declare function runCutCells(accessor: ServicesAccessor, editor: INotebookEditor, targetCell: ICellViewModel | undefined): boolean;
export declare class NotebookClipboardContribution extends Disposable {
    private readonly _editorService;
    static readonly ID = "workbench.contrib.notebookClipboard";
    constructor(_editorService: IEditorService);
    private _getContext;
    private _focusInsideEmebedMonaco;
    runCopyAction(accessor: ServicesAccessor): boolean;
    runPasteAction(accessor: ServicesAccessor): boolean;
    runCutAction(accessor: ServicesAccessor): boolean;
}
