import { localize } from '../../../../nls.js';
import { AccessibleContentProvider } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { IS_COMPOSITE_NOTEBOOK } from '../../notebook/common/notebookContextKeys.js';
export class ReplEditorAccessibilityHelp {
    constructor() {
        this.priority = 105;
        this.name = 'REPL Editor';
        this.when = IS_COMPOSITE_NOTEBOOK;
        this.type = "help" /* AccessibleViewType.Help */;
    }
    getProvider(accessor) {
        const activeEditor = accessor.get(ICodeEditorService).getActiveCodeEditor()
            || accessor.get(ICodeEditorService).getFocusedCodeEditor()
            || accessor.get(IEditorService).activeEditorPane;
        if (!activeEditor) {
            return;
        }
        return getAccessibilityHelpProvider(accessor, activeEditor);
    }
}
function getAccessibilityHelpText() {
    return [
        localize('replEditor.overview', 'You are in a REPL Editor which contains in input box to evaluate expressions and a list of previously executed expressions and their output.'),
        localize('replEditor.execute', 'The Execute command{0} will evaluate the expression in the input box.', '<keybinding:repl.execute>'),
        localize('replEditor.focusHistory', 'The Focus History command{0} will move focus to the list of previously executed items.', '<keybinding:interactive.history.focus>'),
        localize('replEditor.focusReplInput', 'The Focus Input Editor command{0} will move focus to the REPL input box.', '<keybinding:interactive.input.focus>'),
        localize('replEditor.cellNavigation', 'The up and down arrows will also move focus between previously executed items.'),
        localize('replEditor.focusInOutput', 'The Focus Output command{0} will set focus on the output when focused on a previously executed item.', '<keybinding:notebook.cell.focusInOutput>'),
    ].join('\n');
}
function getAccessibilityHelpProvider(accessor, editor) {
    const helpText = getAccessibilityHelpText();
    return new AccessibleContentProvider("replEditor" /* AccessibleViewProviderId.ReplEditor */, { type: "help" /* AccessibleViewType.Help */ }, () => helpText, () => editor.focus(), "accessibility.verbosity.notebook" /* AccessibilityVerbositySettingId.ReplEditor */);
}
