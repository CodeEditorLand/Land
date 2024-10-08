import { IDisposable } from '../../../../../../base/common/lifecycle.js';
import { ICellViewModel, INotebookEditor } from '../../notebookBrowser.js';
export declare function registerCellToolbarStickyScroll(notebookEditor: INotebookEditor, cell: ICellViewModel, element: HTMLElement, opts?: {
    extraOffset?: number;
    min?: number;
}): IDisposable;
