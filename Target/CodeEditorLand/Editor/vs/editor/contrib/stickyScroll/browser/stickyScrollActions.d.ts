import { EditorAction2, ServicesAccessor } from '../../../browser/editorExtensions.js';
import { Action2 } from '../../../../platform/actions/common/actions.js';
import { ICodeEditor } from '../../../browser/editorBrowser.js';
export declare class ToggleStickyScroll extends Action2 {
    constructor();
    run(accessor: ServicesAccessor): Promise<void>;
}
export declare class FocusStickyScroll extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class SelectNextStickyScrollLine extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class SelectPreviousStickyScrollLine extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class GoToStickyScrollLine extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
export declare class SelectEditor extends EditorAction2 {
    constructor();
    runEditorCommand(_accessor: ServicesAccessor, editor: ICodeEditor): void;
}
