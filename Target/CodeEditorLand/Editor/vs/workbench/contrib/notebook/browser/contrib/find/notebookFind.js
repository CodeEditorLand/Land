import './media/notebookFind.css';
import { Schemas } from '../../../../../../base/common/network.js';
import { isEqual } from '../../../../../../base/common/resources.js';
import { ICodeEditorService } from '../../../../../../editor/browser/services/codeEditorService.js';
import { EditorContextKeys } from '../../../../../../editor/common/editorContextKeys.js';
import { getSelectionSearchString, StartFindAction, StartFindReplaceAction } from '../../../../../../editor/contrib/find/browser/findController.js';
import { localize2 } from '../../../../../../nls.js';
import { Action2, registerAction2 } from '../../../../../../platform/actions/common/actions.js';
import { ContextKeyExpr } from '../../../../../../platform/contextkey/common/contextkey.js';
import { NotebookFindContrib } from './notebookFindWidget.js';
import { NotebookMultiCellAction } from '../../controller/coreActions.js';
import { getNotebookEditorFromEditorPane } from '../../notebookBrowser.js';
import { registerNotebookContribution } from '../../notebookEditorExtensions.js';
import { CellUri, NotebookFindScopeType } from '../../../common/notebookCommon.js';
import { INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR, KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED, NOTEBOOK_EDITOR_FOCUSED, NOTEBOOK_IS_ACTIVE_EDITOR } from '../../../common/notebookContextKeys.js';
import { IEditorService } from '../../../../../services/editor/common/editorService.js';
registerNotebookContribution(NotebookFindContrib.id, NotebookFindContrib);
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: 'notebook.hideFind',
            title: localize2('notebookActions.hideFind', 'Hide Find in Notebook'),
            keybinding: {
                when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, KEYBINDING_CONTEXT_NOTEBOOK_FIND_WIDGET_FOCUSED),
                primary: 9,
                weight: 200
            }
        });
    }
    async run(accessor) {
        const editorService = accessor.get(IEditorService);
        const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
        if (!editor) {
            return;
        }
        const controller = editor.getContribution(NotebookFindContrib.id);
        controller.hide();
        editor.focus();
    }
});
registerAction2(class extends NotebookMultiCellAction {
    constructor() {
        super({
            id: 'notebook.find',
            title: localize2('notebookActions.findInNotebook', 'Find in Notebook'),
            keybinding: {
                when: ContextKeyExpr.and(NOTEBOOK_EDITOR_FOCUSED, ContextKeyExpr.or(NOTEBOOK_IS_ACTIVE_EDITOR, INTERACTIVE_WINDOW_IS_ACTIVE_EDITOR), EditorContextKeys.focus.toNegated()),
                primary: 36 | 2048,
                weight: 200
            }
        });
    }
    async runWithContext(accessor, context) {
        const editorService = accessor.get(IEditorService);
        const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
        if (!editor) {
            return;
        }
        const controller = editor.getContribution(NotebookFindContrib.id);
        controller.show(undefined, { findScope: { findScopeType: NotebookFindScopeType.None } });
    }
});
function notebookContainsTextModel(uri, textModel) {
    if (textModel.uri.scheme === Schemas.vscodeNotebookCell) {
        const cellUri = CellUri.parse(textModel.uri);
        if (cellUri && isEqual(cellUri.notebook, uri)) {
            return true;
        }
    }
    return false;
}
function getSearchStringOptions(editor, opts) {
    if (opts.seedSearchStringFromSelection === 'single') {
        const selectionSearchString = getSelectionSearchString(editor, opts.seedSearchStringFromSelection, opts.seedSearchStringFromNonEmptySelection);
        if (selectionSearchString) {
            return {
                searchString: selectionSearchString,
                selection: editor.getSelection()
            };
        }
    }
    else if (opts.seedSearchStringFromSelection === 'multiple' && !opts.updateSearchScope) {
        const selectionSearchString = getSelectionSearchString(editor, opts.seedSearchStringFromSelection);
        if (selectionSearchString) {
            return {
                searchString: selectionSearchString,
                selection: editor.getSelection()
            };
        }
    }
    return undefined;
}
StartFindAction.addImplementation(100, (accessor, codeEditor, args) => {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
        return false;
    }
    if (!codeEditor.hasModel()) {
        return false;
    }
    if (!editor.hasEditorFocus() && !editor.hasWebviewFocus()) {
        const codeEditorService = accessor.get(ICodeEditorService);
        const textEditor = codeEditorService.getFocusedCodeEditor() || codeEditorService.getActiveCodeEditor();
        if (editor.hasModel() && textEditor && textEditor.hasModel() && notebookContainsTextModel(editor.textModel.uri, textEditor.getModel())) {
        }
        else {
            return false;
        }
    }
    const controller = editor.getContribution(NotebookFindContrib.id);
    const searchStringOptions = getSearchStringOptions(codeEditor, {
        forceRevealReplace: false,
        seedSearchStringFromSelection: codeEditor.getOption(43).seedSearchStringFromSelection !== 'never' ? 'single' : 'none',
        seedSearchStringFromNonEmptySelection: codeEditor.getOption(43).seedSearchStringFromSelection === 'selection',
        seedSearchStringFromGlobalClipboard: codeEditor.getOption(43).globalFindClipboard,
        shouldFocus: 1,
        shouldAnimate: true,
        updateSearchScope: false,
        loop: codeEditor.getOption(43).loop
    });
    let options = undefined;
    const uri = codeEditor.getModel().uri;
    const data = CellUri.parse(uri);
    if (searchStringOptions?.selection && data) {
        const cell = editor.getCellByHandle(data.handle);
        if (cell) {
            options = {
                searchStringSeededFrom: { cell, range: searchStringOptions.selection },
            };
        }
    }
    controller.show(searchStringOptions?.searchString, options);
    return true;
});
StartFindReplaceAction.addImplementation(100, (accessor, codeEditor, args) => {
    const editorService = accessor.get(IEditorService);
    const editor = getNotebookEditorFromEditorPane(editorService.activeEditorPane);
    if (!editor) {
        return false;
    }
    if (!codeEditor.hasModel()) {
        return false;
    }
    const controller = editor.getContribution(NotebookFindContrib.id);
    const searchStringOptions = getSearchStringOptions(codeEditor, {
        forceRevealReplace: false,
        seedSearchStringFromSelection: codeEditor.getOption(43).seedSearchStringFromSelection !== 'never' ? 'single' : 'none',
        seedSearchStringFromNonEmptySelection: codeEditor.getOption(43).seedSearchStringFromSelection === 'selection',
        seedSearchStringFromGlobalClipboard: codeEditor.getOption(43).globalFindClipboard,
        shouldFocus: 1,
        shouldAnimate: true,
        updateSearchScope: false,
        loop: codeEditor.getOption(43).loop
    });
    if (controller) {
        controller.replace(searchStringOptions?.searchString);
        return true;
    }
    return false;
});
