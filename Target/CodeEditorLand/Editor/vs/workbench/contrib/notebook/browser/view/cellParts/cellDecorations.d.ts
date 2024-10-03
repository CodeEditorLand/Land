import { ICellViewModel, INotebookEditorDelegate } from '../../notebookBrowser.js';
import { CellContentPart } from '../cellPart.js';
export declare class CellDecorations extends CellContentPart {
    readonly notebookEditor: INotebookEditorDelegate;
    readonly rootContainer: HTMLElement;
    readonly decorationContainer: HTMLElement;
    constructor(notebookEditor: INotebookEditorDelegate, rootContainer: HTMLElement, decorationContainer: HTMLElement);
    didRenderCell(element: ICellViewModel): void;
    private registerDecorations;
}
