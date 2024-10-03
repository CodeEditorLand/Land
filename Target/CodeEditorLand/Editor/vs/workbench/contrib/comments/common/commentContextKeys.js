import * as nls from '../../../../nls.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export var CommentContextKeys;
(function (CommentContextKeys) {
    CommentContextKeys.activeCursorHasCommentingRange = new RawContextKey('activeCursorHasCommentingRange', false, {
        description: nls.localize('hasCommentingRange', "Whether the position at the active cursor has a commenting range"),
        type: 'boolean'
    });
    CommentContextKeys.activeCursorHasComment = new RawContextKey('activeCursorHasComment', false, {
        description: nls.localize('hasComment', "Whether the position at the active cursor has a comment"),
        type: 'boolean'
    });
    CommentContextKeys.activeEditorHasCommentingRange = new RawContextKey('activeEditorHasCommentingRange', false, {
        description: nls.localize('editorHasCommentingRange', "Whether the active editor has a commenting range"),
        type: 'boolean'
    });
    CommentContextKeys.WorkspaceHasCommenting = new RawContextKey('workspaceHasCommenting', false, {
        description: nls.localize('hasCommentingProvider', "Whether the open workspace has either comments or commenting ranges."),
        type: 'boolean'
    });
    CommentContextKeys.commentThreadIsEmpty = new RawContextKey('commentThreadIsEmpty', false, { type: 'boolean', description: nls.localize('commentThreadIsEmpty', "Set when the comment thread has no comments") });
    CommentContextKeys.commentIsEmpty = new RawContextKey('commentIsEmpty', false, { type: 'boolean', description: nls.localize('commentIsEmpty', "Set when the comment has no input") });
    CommentContextKeys.commentContext = new RawContextKey('comment', undefined, { type: 'string', description: nls.localize('comment', "The context value of the comment") });
    CommentContextKeys.commentThreadContext = new RawContextKey('commentThread', undefined, { type: 'string', description: nls.localize('commentThread', "The context value of the comment thread") });
    CommentContextKeys.commentControllerContext = new RawContextKey('commentController', undefined, { type: 'string', description: nls.localize('commentController', "The comment controller id associated with a comment thread") });
    CommentContextKeys.commentFocused = new RawContextKey('commentFocused', false, { type: 'boolean', description: nls.localize('commentFocused', "Set when the comment is focused") });
})(CommentContextKeys || (CommentContextKeys = {}));
