import { INotebookEditor } from '../../notebookBrowser.js';
import { CellContentPart } from '../cellPart.js';
export declare class CellFocusPart extends CellContentPart {
    constructor(containerElement: HTMLElement, focusSinkElement: HTMLElement | undefined, notebookEditor: INotebookEditor);
}
