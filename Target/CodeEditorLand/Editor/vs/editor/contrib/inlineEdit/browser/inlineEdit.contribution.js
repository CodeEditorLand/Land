import { registerEditorAction, registerEditorContribution } from '../../../browser/editorExtensions.js';
import { AcceptInlineEdit, JumpBackInlineEdit, JumpToInlineEdit, RejectInlineEdit, TriggerInlineEdit } from './commands.js';
import { InlineEditController } from './inlineEditController.js';
registerEditorAction(AcceptInlineEdit);
registerEditorAction(RejectInlineEdit);
registerEditorAction(JumpToInlineEdit);
registerEditorAction(JumpBackInlineEdit);
registerEditorAction(TriggerInlineEdit);
registerEditorContribution(InlineEditController.ID, InlineEditController, 3);
