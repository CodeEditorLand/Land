import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { EditorAction, ServicesAccessor } from '../../../browser/editorExtensions.js';
export declare class ExpandLineSelectionAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor, args: any): void;
}
