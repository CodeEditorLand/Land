import { Disposable } from '../../../../../base/common/lifecycle.js';
import { INotebookEditorDelegate } from '../notebookBrowser.js';
export declare class NotebookHorizontalTracker extends Disposable {
    private readonly _notebookEditor;
    private readonly _listViewScrollablement;
    constructor(_notebookEditor: INotebookEditorDelegate, _listViewScrollablement: HTMLElement);
}
