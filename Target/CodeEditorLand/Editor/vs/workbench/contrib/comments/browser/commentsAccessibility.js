import { ContextKeyExpr } from '../../../../platform/contextkey/common/contextkey.js';
import { IInstantiationService } from '../../../../platform/instantiation/common/instantiation.js';
import { ctxCommentEditorFocused } from './simpleCommentEditor.js';
import { CommentContextKeys } from '../common/commentContextKeys.js';
import * as nls from '../../../../nls.js';
import { ToggleTabFocusModeAction } from '../../../../editor/contrib/toggleTabFocusMode/browser/toggleTabFocusMode.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
export var CommentAccessibilityHelpNLS;
(function (CommentAccessibilityHelpNLS) {
    CommentAccessibilityHelpNLS.intro = nls.localize('intro', "The editor contains commentable range(s). Some useful commands include:");
    CommentAccessibilityHelpNLS.tabFocus = nls.localize('introWidget', "This widget contains a text area, for composition of new comments, and actions, that can be tabbed to once tab moves focus mode has been enabled with the command Toggle Tab Key Moves Focus{0}.", `<keybinding:${ToggleTabFocusModeAction.ID}>`);
    CommentAccessibilityHelpNLS.commentCommands = nls.localize('commentCommands', "Some useful comment commands include:");
    CommentAccessibilityHelpNLS.escape = nls.localize('escape', "- Dismiss Comment (Escape)");
    CommentAccessibilityHelpNLS.nextRange = nls.localize('next', "- Go to Next Commenting Range{0}.", `<keybinding:${"editor.action.nextCommentingRange"}>`);
    CommentAccessibilityHelpNLS.previousRange = nls.localize('previous', "- Go to Previous Commenting Range{0}.", `<keybinding:${"editor.action.previousCommentingRange"}>`);
    CommentAccessibilityHelpNLS.nextCommentThread = nls.localize('nextCommentThreadKb', "- Go to Next Comment Thread{0}.", `<keybinding:${"editor.action.nextCommentThreadAction"}>`);
    CommentAccessibilityHelpNLS.previousCommentThread = nls.localize('previousCommentThreadKb', "- Go to Previous Comment Thread{0}.", `<keybinding:${"editor.action.previousCommentThreadAction"}>`);
    CommentAccessibilityHelpNLS.nextCommentedRange = nls.localize('nextCommentedRangeKb', "- Go to Next Commented Range{0}.", `<keybinding:${"editor.action.nextCommentedRangeAction"}>`);
    CommentAccessibilityHelpNLS.previousCommentedRange = nls.localize('previousCommentedRangeKb', "- Go to Previous Commented Range{0}.", `<keybinding:${"editor.action.previousCommentedRangeAction"}>`);
    CommentAccessibilityHelpNLS.addComment = nls.localize('addCommentNoKb', "- Add Comment on Current Selection{0}.", `<keybinding:${"workbench.action.addComment"}>`);
    CommentAccessibilityHelpNLS.submitComment = nls.localize('submitComment', "- Submit Comment{0}.", `<keybinding:${"editor.action.submitComment"}>`);
})(CommentAccessibilityHelpNLS || (CommentAccessibilityHelpNLS = {}));
export class CommentsAccessibilityHelpProvider extends Disposable {
    constructor() {
        super(...arguments);
        this.id = "comments";
        this.verbositySettingKey = "accessibility.verbosity.comments";
        this.options = { type: "help" };
    }
    provideContent() {
        return [CommentAccessibilityHelpNLS.tabFocus, CommentAccessibilityHelpNLS.commentCommands, CommentAccessibilityHelpNLS.escape, CommentAccessibilityHelpNLS.addComment, CommentAccessibilityHelpNLS.submitComment, CommentAccessibilityHelpNLS.nextRange, CommentAccessibilityHelpNLS.previousRange].join('\n');
    }
    onClose() {
        this._element?.focus();
    }
}
export class CommentsAccessibilityHelp {
    constructor() {
        this.priority = 110;
        this.name = 'comments';
        this.type = "help";
        this.when = ContextKeyExpr.or(ctxCommentEditorFocused, CommentContextKeys.commentFocused);
    }
    getProvider(accessor) {
        return accessor.get(IInstantiationService).createInstance(CommentsAccessibilityHelpProvider);
    }
}
