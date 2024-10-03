import { IS_COMPOSITE_NOTEBOOK, NOTEBOOK_EDITOR_FOCUSED } from '../common/notebookContextKeys.js';
import { localize } from '../../../../nls.js';
import { AccessibleContentProvider } from '../../../../platform/accessibility/browser/accessibleView.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
export class NotebookAccessibilityHelp {
    constructor() {
        this.priority = 105;
        this.name = 'notebook';
        this.when = ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, IS_COMPOSITE_NOTEBOOK.negate());
        this.type = "help";
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
        localize('notebook.overview', 'The notebook view is a collection of code and markdown cells. Code cells can be executed and will produce output directly below the cell.'),
        localize('notebook.cell.edit', 'The Edit Cell command{0} will focus on the cell input.', '<keybinding:notebook.cell.edit>'),
        localize('notebook.cell.quitEdit', 'The Quit Edit command{0} will set focus on the cell container. The default (Escape) key may need to be pressed twice first exit the virtual cursor if active.', '<keybinding:notebook.cell.quitEdit>'),
        localize('notebook.cell.focusInOutput', 'The Focus Output command{0} will set focus in the cell\'s output.', '<keybinding:notebook.cell.focusInOutput>'),
        localize('notebook.focusNextEditor', 'The Focus Next Cell Editor command{0} will set focus in the next cell\'s editor.', '<keybinding:notebook.focusNextEditor>'),
        localize('notebook.focusPreviousEditor', 'The Focus Previous Cell Editor command{0} will set focus in the previous cell\'s editor.', '<keybinding:notebook.focusPreviousEditor>'),
        localize('notebook.cellNavigation', 'The up and down arrows will also move focus between cells while focused on the outer cell container.'),
        localize('notebook.cell.executeAndFocusContainer', 'The Execute Cell command{0} executes the cell that currently has focus.', '<keybinding:notebook.cell.executeAndFocusContainer>'),
        localize('notebook.cell.insertCodeCellBelowAndFocusContainer', 'The Insert Cell Above{0} and Below{1} commands will create new empty code cells.', '<keybinding:notebook.cell.insertCodeCellAbove>', '<keybinding:notebook.cell.insertCodeCellBelow>'),
        localize('notebook.changeCellType', 'The Change Cell to Code/Markdown commands are used to switch between cell types.')
    ].join('\n');
}
function getAccessibilityHelpProvider(accessor, editor) {
    const helpText = getAccessibilityHelpText();
    return new AccessibleContentProvider("notebook", { type: "help" }, () => helpText, () => editor.focus(), "accessibility.verbosity.notebook");
}
