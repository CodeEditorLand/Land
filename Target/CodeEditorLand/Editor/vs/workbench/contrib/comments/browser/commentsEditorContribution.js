import { KeyChord } from '../../../../base/common/keyCodes.js';
import './media/review.css';
import { isCodeEditor, isDiffEditor } from '../../../../editor/browser/editorBrowser.js';
import { registerEditorContribution } from '../../../../editor/browser/editorExtensions.js';
import { ICodeEditorService } from '../../../../editor/browser/services/codeEditorService.js';
import * as nls from '../../../../nls.js';
import { CommandsRegistry } from '../../../../platform/commands/common/commands.js';
import { KeybindingsRegistry } from '../../../../platform/keybinding/common/keybindingsRegistry.js';
import { ICommentService } from './commentService.js';
import { ctxCommentEditorFocused, SimpleCommentEditor } from './simpleCommentEditor.js';
import { IEditorService } from '../../../services/editor/common/editorService.js';
import { Action2, MenuId, MenuRegistry, registerAction2 } from '../../../../platform/actions/common/actions.js';
import { EditorContextKeys } from '../../../../editor/common/editorContextKeys.js';
import { CommentController, ID } from './commentsController.js';
import { Range } from '../../../../editor/common/core/range.js';
import { INotificationService } from '../../../../platform/notification/common/notification.js';
import { CommentContextKeys } from '../common/commentContextKeys.js';
import { CONTEXT_ACCESSIBILITY_MODE_ENABLED } from '../../../../platform/accessibility/common/accessibility.js';
import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { accessibilityHelpIsShown, accessibleViewCurrentProviderId } from '../../accessibility/browser/accessibilityConfiguration.js';
import { registerWorkbenchContribution2 } from '../../../common/contributions.js';
import { CommentsInputContentProvider } from './commentsInputContentProvider.js';
import { CommentWidgetFocus } from './commentThreadZoneWidget.js';
registerEditorContribution(ID, CommentController, 1);
registerWorkbenchContribution2(CommentsInputContentProvider.ID, CommentsInputContentProvider, 2);
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "editor.action.nextCommentThreadAction",
    handler: async (accessor, args) => {
        const activeEditor = getActiveEditor(accessor);
        if (!activeEditor) {
            return Promise.resolve();
        }
        const controller = CommentController.get(activeEditor);
        if (!controller) {
            return Promise.resolve();
        }
        controller.nextCommentThread(true);
    },
    weight: 100,
    primary: 512 | 67,
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "editor.action.previousCommentThreadAction",
    handler: async (accessor, args) => {
        const activeEditor = getActiveEditor(accessor);
        if (!activeEditor) {
            return Promise.resolve();
        }
        const controller = CommentController.get(activeEditor);
        if (!controller) {
            return Promise.resolve();
        }
        controller.previousCommentThread(true);
    },
    weight: 100,
    primary: 1024 | 512 | 67
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: "editor.action.nextCommentedRangeAction",
            title: {
                value: nls.localize('comments.NextCommentedRange', "Go to Next Commented Range"),
                original: 'Go to Next Commented Range'
            },
            category: {
                value: nls.localize('commentsCategory', "Comments"),
                original: 'Comments'
            },
            f1: true,
            keybinding: {
                primary: 512 | 68,
                weight: 100,
                when: CommentContextKeys.activeEditorHasCommentingRange
            }
        });
    }
    run(accessor, ...args) {
        const activeEditor = getActiveEditor(accessor);
        if (!activeEditor) {
            return;
        }
        const controller = CommentController.get(activeEditor);
        if (!controller) {
            return;
        }
        controller.nextCommentThread(false);
    }
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: "editor.action.previousCommentedRangeAction",
            title: {
                value: nls.localize('comments.previousCommentedRange', "Go to Previous Commented Range"),
                original: 'Go to Previous Commented Range'
            },
            category: {
                value: nls.localize('commentsCategory', "Comments"),
                original: 'Comments'
            },
            f1: true,
            keybinding: {
                primary: 1024 | 512 | 68,
                weight: 100,
                when: CommentContextKeys.activeEditorHasCommentingRange
            }
        });
    }
    run(accessor, ...args) {
        const activeEditor = getActiveEditor(accessor);
        if (!activeEditor) {
            return;
        }
        const controller = CommentController.get(activeEditor);
        if (!controller) {
            return;
        }
        controller.previousCommentThread(false);
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "editor.action.nextCommentingRange",
    handler: async (accessor, args) => {
        const activeEditor = getActiveEditor(accessor);
        if (!activeEditor) {
            return Promise.resolve();
        }
        const controller = CommentController.get(activeEditor);
        if (!controller) {
            return Promise.resolve();
        }
        controller.nextCommentingRange();
    },
    when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, ContextKeyExpr.or(EditorContextKeys.focus, CommentContextKeys.commentFocused, ContextKeyExpr.and(accessibilityHelpIsShown, accessibleViewCurrentProviderId.isEqualTo("comments")))),
    primary: KeyChord(2048 | 41, 2048 | 512 | 18),
    weight: 100
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
        id: "editor.action.nextCommentingRange",
        title: nls.localize('comments.nextCommentingRange', "Go to Next Commenting Range"),
        category: 'Comments',
    },
    when: CommentContextKeys.activeEditorHasCommentingRange
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "editor.action.previousCommentingRange",
    handler: async (accessor, args) => {
        const activeEditor = getActiveEditor(accessor);
        if (!activeEditor) {
            return Promise.resolve();
        }
        const controller = CommentController.get(activeEditor);
        if (!controller) {
            return Promise.resolve();
        }
        controller.previousCommentingRange();
    },
    when: ContextKeyExpr.and(CONTEXT_ACCESSIBILITY_MODE_ENABLED, ContextKeyExpr.or(EditorContextKeys.focus, CommentContextKeys.commentFocused, ContextKeyExpr.and(accessibilityHelpIsShown, accessibleViewCurrentProviderId.isEqualTo("comments")))),
    primary: KeyChord(2048 | 41, 2048 | 512 | 16),
    weight: 100
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
        id: "editor.action.previousCommentingRange",
        title: nls.localize('comments.previousCommentingRange', "Go to Previous Commenting Range"),
        category: 'Comments',
    },
    when: CommentContextKeys.activeEditorHasCommentingRange
});
CommandsRegistry.registerCommand({
    id: "workbench.action.toggleCommenting",
    handler: (accessor) => {
        const commentService = accessor.get(ICommentService);
        const enable = commentService.isCommentingEnabled;
        commentService.enableCommenting(!enable);
    }
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
        id: "workbench.action.toggleCommenting",
        title: nls.localize('comments.toggleCommenting', "Toggle Editor Commenting"),
        category: 'Comments',
    },
    when: CommentContextKeys.WorkspaceHasCommenting
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "workbench.action.addComment",
    handler: async (accessor, args) => {
        const activeEditor = getActiveEditor(accessor);
        if (!activeEditor) {
            return Promise.resolve();
        }
        const controller = CommentController.get(activeEditor);
        if (!controller) {
            return Promise.resolve();
        }
        const position = args?.range ? new Range(args.range.startLineNumber, args.range.startLineNumber, args.range.endLineNumber, args.range.endColumn)
            : (args?.fileComment ? undefined : activeEditor.getSelection());
        const notificationService = accessor.get(INotificationService);
        try {
            await controller.addOrToggleCommentAtLine(position, undefined);
        }
        catch (e) {
            notificationService.error(nls.localize('comments.addCommand.error', "The cursor must be within a commenting range to add a comment"));
        }
    },
    weight: 100,
    primary: KeyChord(2048 | 41, 2048 | 512 | 33),
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
        id: "workbench.action.addComment",
        title: nls.localize('comments.addCommand', "Add Comment on Current Selection"),
        category: 'Comments'
    },
    when: CommentContextKeys.activeCursorHasCommentingRange
});
registerAction2(class extends Action2 {
    constructor() {
        super({
            id: "workbench.action.focusCommentOnCurrentLine",
            title: {
                value: nls.localize('comments.focusCommentOnCurrentLine', "Focus Comment on Current Line"),
                original: 'Focus Comment on Current Line'
            },
            category: {
                value: nls.localize('commentsCategory', "Comments"),
                original: 'Comments'
            },
            f1: true,
            precondition: CommentContextKeys.activeCursorHasComment,
        });
    }
    async run(accessor, ...args) {
        const activeEditor = getActiveEditor(accessor);
        if (!activeEditor) {
            return;
        }
        const controller = CommentController.get(activeEditor);
        if (!controller) {
            return;
        }
        const position = activeEditor.getSelection();
        const notificationService = accessor.get(INotificationService);
        let error = false;
        try {
            const commentAtLine = controller.getCommentsAtLine(position);
            if (commentAtLine.length === 0) {
                error = true;
            }
            else {
                await controller.revealCommentThread(commentAtLine[0].commentThread.threadId, undefined, false, CommentWidgetFocus.Widget);
            }
        }
        catch (e) {
            error = true;
        }
        if (error) {
            notificationService.error(nls.localize('comments.focusCommand.error', "The cursor must be on a line with a comment to focus the comment"));
        }
    }
});
CommandsRegistry.registerCommand({
    id: "workbench.action.collapseAllComments",
    handler: (accessor) => {
        return getActiveController(accessor)?.collapseAll();
    }
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
        id: "workbench.action.collapseAllComments",
        title: nls.localize('comments.collapseAll', "Collapse All Comments"),
        category: 'Comments'
    },
    when: CommentContextKeys.WorkspaceHasCommenting
});
CommandsRegistry.registerCommand({
    id: "workbench.action.expandAllComments",
    handler: (accessor) => {
        return getActiveController(accessor)?.expandAll();
    }
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
        id: "workbench.action.expandAllComments",
        title: nls.localize('comments.expandAll', "Expand All Comments"),
        category: 'Comments'
    },
    when: CommentContextKeys.WorkspaceHasCommenting
});
CommandsRegistry.registerCommand({
    id: "workbench.action.expandUnresolvedComments",
    handler: (accessor) => {
        return getActiveController(accessor)?.expandUnresolved();
    }
});
MenuRegistry.appendMenuItem(MenuId.CommandPalette, {
    command: {
        id: "workbench.action.expandUnresolvedComments",
        title: nls.localize('comments.expandUnresolved', "Expand Unresolved Comments"),
        category: 'Comments'
    },
    when: CommentContextKeys.WorkspaceHasCommenting
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "editor.action.submitComment",
    weight: 100,
    primary: 2048 | 3,
    when: ctxCommentEditorFocused,
    handler: (accessor, args) => {
        const activeCodeEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
        if (activeCodeEditor instanceof SimpleCommentEditor) {
            activeCodeEditor.getParentThread().submitComment();
        }
    }
});
KeybindingsRegistry.registerCommandAndKeybindingRule({
    id: "workbench.action.hideComment",
    weight: 100,
    primary: 9,
    secondary: [1024 | 9],
    when: ctxCommentEditorFocused,
    handler: (accessor, args) => {
        const activeCodeEditor = accessor.get(ICodeEditorService).getFocusedCodeEditor();
        if (activeCodeEditor instanceof SimpleCommentEditor) {
            activeCodeEditor.getParentThread().collapse();
        }
    }
});
export function getActiveEditor(accessor) {
    let activeTextEditorControl = accessor.get(IEditorService).activeTextEditorControl;
    if (isDiffEditor(activeTextEditorControl)) {
        if (activeTextEditorControl.getOriginalEditor().hasTextFocus()) {
            activeTextEditorControl = activeTextEditorControl.getOriginalEditor();
        }
        else {
            activeTextEditorControl = activeTextEditorControl.getModifiedEditor();
        }
    }
    if (!isCodeEditor(activeTextEditorControl) || !activeTextEditorControl.hasModel()) {
        return null;
    }
    return activeTextEditorControl;
}
function getActiveController(accessor) {
    const activeEditor = getActiveEditor(accessor);
    if (!activeEditor) {
        return undefined;
    }
    const controller = CommentController.get(activeEditor);
    if (!controller) {
        return undefined;
    }
    return controller;
}
