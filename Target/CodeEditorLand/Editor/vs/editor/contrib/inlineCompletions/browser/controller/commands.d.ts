import { Action2 } from '../../../../../platform/actions/common/actions.js';
import { ICodeEditor } from '../../../../browser/editorBrowser.js';
import { EditorAction, ServicesAccessor } from '../../../../browser/editorExtensions.js';
export declare class ShowNextInlineSuggestionAction extends EditorAction {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class ShowPreviousInlineSuggestionAction extends EditorAction {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class TriggerInlineSuggestionAction extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class AcceptNextWordOfInlineCompletion extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class AcceptNextLineOfInlineCompletion extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class AcceptInlineCompletion extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class JumpToNextInlineEdit extends EditorAction {
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class HideInlineCompletion extends EditorAction {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor | undefined, editor: ICodeEditor): Promise<void>;
}
export declare class ToggleAlwaysShowInlineSuggestionToolbar extends Action2 {
    static ID: string;
    constructor();
    run(accessor: ServicesAccessor, editor: ICodeEditor): Promise<void>;
}
