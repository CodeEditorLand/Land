import { ICodeEditor } from '../../../browser/editorBrowser.js';
import { EditorAction, EditorCommand, ServicesAccessor } from '../../../browser/editorExtensions.js';
export declare class QuickFixAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class CodeActionCommand extends EditorCommand {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor, userArgs: any): void;
}
export declare class RefactorAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor, userArgs: any): void;
}
export declare class SourceAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor, userArgs: any): void;
}
export declare class OrganizeImportsAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class FixAllAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class AutoFixAction extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
