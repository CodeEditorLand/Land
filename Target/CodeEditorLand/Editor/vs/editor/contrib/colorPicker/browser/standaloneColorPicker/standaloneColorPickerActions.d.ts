import { ICodeEditor } from '../../../../browser/editorBrowser.js';
import { EditorAction, EditorAction2, ServicesAccessor } from '../../../../browser/editorExtensions.js';
export declare class ShowOrFocusStandaloneColorPicker extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class HideStandaloneColorPicker extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class InsertColorWithStandaloneColorPicker extends EditorAction {
    constructor();
    run(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
