import { Disposable } from '../../../../base/common/lifecycle.js';
import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { IEditorContribution } from '../../../../editor/common/editorCommon.js';
export declare class MenuPreventer extends Disposable implements IEditorContribution {
    static readonly ID = "editor.contrib.menuPreventer";
    private _editor;
    private _altListeningMouse;
    private _altMouseTriggered;
    constructor(editor: ICodeEditor);
}
