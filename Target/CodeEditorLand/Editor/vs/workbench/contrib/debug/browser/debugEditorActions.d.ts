import { ICodeEditor } from '../../../../editor/browser/editorBrowser.js';
import { EditorAction } from '../../../../editor/browser/editorExtensions.js';
import { ILocalizedString } from '../../../../platform/action/common/action.js';
import { ServicesAccessor } from '../../../../platform/instantiation/common/instantiation.js';
export declare class RunToCursorAction extends EditorAction {
    static readonly ID = "editor.debug.action.runToCursor";
    static readonly LABEL: ILocalizedString;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare class SelectionToReplAction extends EditorAction {
    static readonly ID = "editor.debug.action.selectionToRepl";
    static readonly LABEL: ILocalizedString;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
export declare class SelectionToWatchExpressionsAction extends EditorAction {
    static readonly ID = "editor.debug.action.selectionToWatch";
    static readonly LABEL: ILocalizedString;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
