import { INotebookEditor } from '../../notebookBrowser.js';
import { CellContentPart } from '../cellPart.js';
export declare class CollapsedCellInput extends CellContentPart {
    private readonly notebookEditor;
    constructor(notebookEditor: INotebookEditor, cellInputCollapsedContainer: HTMLElement);
}
