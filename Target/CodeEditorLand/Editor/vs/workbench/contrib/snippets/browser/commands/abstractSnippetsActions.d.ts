import { EditorAction2 } from '../../../../../editor/browser/editorExtensions.js';
import { Action2, IAction2Options } from '../../../../../platform/actions/common/actions.js';
export declare abstract class SnippetsAction extends Action2 {
    constructor(desc: Readonly<IAction2Options>);
}
export declare abstract class SnippetEditorAction extends EditorAction2 {
    constructor(desc: Readonly<IAction2Options>);
}
