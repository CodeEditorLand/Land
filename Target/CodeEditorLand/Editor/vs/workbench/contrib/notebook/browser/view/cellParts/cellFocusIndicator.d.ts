import { FastDomNode } from '../../../../../../base/browser/fastDomNode.js';
import { ICellViewModel, INotebookEditorDelegate } from '../../notebookBrowser.js';
import { CellContentPart } from '../cellPart.js';
import { CellTitleToolbarPart } from './cellToolbars.js';
export declare class CellFocusIndicator extends CellContentPart {
    readonly notebookEditor: INotebookEditorDelegate;
    readonly titleToolbar: CellTitleToolbarPart;
    readonly top: FastDomNode<HTMLElement>;
    readonly left: FastDomNode<HTMLElement>;
    readonly right: FastDomNode<HTMLElement>;
    readonly bottom: FastDomNode<HTMLElement>;
    codeFocusIndicator: FastDomNode<HTMLElement>;
    outputFocusIndicator: FastDomNode<HTMLElement>;
    constructor(notebookEditor: INotebookEditorDelegate, titleToolbar: CellTitleToolbarPart, top: FastDomNode<HTMLElement>, left: FastDomNode<HTMLElement>, right: FastDomNode<HTMLElement>, bottom: FastDomNode<HTMLElement>);
    updateInternalLayoutNow(element: ICellViewModel): void;
    private updateFocusIndicatorsForTitleMenu;
    private getIndicatorTopMargin;
}
