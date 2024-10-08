import { Disposable } from '../../../../../../base/common/lifecycle.js';
import { INotebookEditor, INotebookEditorContribution } from '../../notebookBrowser.js';
export declare class TroubleshootController extends Disposable implements INotebookEditorContribution {
    private readonly _notebookEditor;
    static id: string;
    private readonly _localStore;
    private _cellStateListeners;
    private _enabled;
    private _cellStatusItems;
    constructor(_notebookEditor: INotebookEditor);
    toggle(): void;
    private _update;
    private _log;
    private _updateListener;
    private _getItemsForCells;
    dispose(): void;
}
