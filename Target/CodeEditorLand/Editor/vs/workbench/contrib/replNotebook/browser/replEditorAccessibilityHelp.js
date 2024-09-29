import"../../../../platform/instantiation/common/instantiation.js";import"../../../../platform/accessibility/browser/accessibleViewRegistry.js";import{localize as i}from"../../../../nls.js";import"../../../../editor/browser/editorBrowser.js";import{AccessibleViewProviderId as n,AccessibleViewType as t,AccessibleContentProvider as c}from"../../../../platform/accessibility/browser/accessibleView.js";import{AccessibilityVerbositySettingId as l}from"../../accessibility/browser/accessibilityConfiguration.js";import{IEditorService as d}from"../../../services/editor/common/editorService.js";import"../../../common/editor.js";import{ICodeEditorService as r}from"../../../../editor/browser/services/codeEditorService.js";import{IS_COMPOSITE_NOTEBOOK as p}from"../../notebook/common/notebookContextKeys.js";class O{priority=105;name="REPL Editor";when=p;type=t.Help;getProvider(e){const o=e.get(r).getActiveCodeEditor()||e.get(r).getFocusedCodeEditor()||e.get(d).activeEditorPane;if(o)return m(e,o)}}function u(){return[i("replEditor.overview","You are in a REPL Editor which contains in input box to evaluate expressions and a list of previously executed expressions and their output."),i("replEditor.execute","The Execute command{0} will evaluate the expression in the input box.","<keybinding:repl.execute>"),i("replEditor.focusHistory","The Focus History command{0} will move focus to the list of previously executed items.","<keybinding:interactive.history.focus>"),i("replEditor.focusReplInput","The Focus Input Editor command{0} will move focus to the REPL input box.","<keybinding:interactive.input.focus>"),i("replEditor.cellNavigation","The up and down arrows will also move focus between previously executed items."),i("replEditor.focusInOutput","The Focus Output command{0} will set focus on the output when focused on a previously executed item.","<keybinding:notebook.cell.focusInOutput>")].join(`
`)}function m(s,e){const o=u();return new c(n.ReplEditor,{type:t.Help},()=>o,()=>e.focus(),l.ReplEditor)}export{O as ReplEditorAccessibilityHelp};
