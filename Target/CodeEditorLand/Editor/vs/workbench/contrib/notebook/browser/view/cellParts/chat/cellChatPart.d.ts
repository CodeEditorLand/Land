import { ICellViewModel, INotebookEditorDelegate } from '../../../notebookBrowser.js';
import { CellContentPart } from '../../cellPart.js';
export declare class CellChatPart extends CellContentPart {
    get activeCell(): ICellViewModel | undefined;
    constructor(_notebookEditor: INotebookEditorDelegate, _partContainer: HTMLElement);
    didRenderCell(element: ICellViewModel): void;
    unrenderCell(element: ICellViewModel): void;
    updateInternalLayoutNow(element: ICellViewModel): void;
    dispose(): void;
}
