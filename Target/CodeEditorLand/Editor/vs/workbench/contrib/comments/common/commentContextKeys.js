/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import * as nls from '../../../../nls.js';
import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export var CommentContextKeys;
(function (CommentContextKeys) {
    /**
     * A context key that is set when the active cursor is in a commenting range.
     */
    CommentContextKeys.activeCursorHasCommentingRange = new RawContextKey('activeCursorHasCommentingRange', false, {
        description: nls.localize('hasCommentingRange', "Whether the position at the active cursor has a commenting range"),
        type: 'boolean'
    });
    /**
     * A context key that is set when the active cursor is in the range of an existing comment.
     */
    CommentContextKeys.activeCursorHasComment = new RawContextKey('activeCursorHasComment', false, {
        description: nls.localize('hasComment', "Whether the position at the active cursor has a comment"),
        type: 'boolean'
    });
    /**
     * A context key that is set when the active editor has commenting ranges.
     */
    CommentContextKeys.activeEditorHasCommentingRange = new RawContextKey('activeEditorHasCommentingRange', false, {
        description: nls.localize('editorHasCommentingRange', "Whether the active editor has a commenting range"),
        type: 'boolean'
    });
    /**
     * A context key that is set when the workspace has either comments or commenting ranges.
     */
    CommentContextKeys.WorkspaceHasCommenting = new RawContextKey('workspaceHasCommenting', false, {
        description: nls.localize('hasCommentingProvider', "Whether the open workspace has either comments or commenting ranges."),
        type: 'boolean'
    });
    /**
     * A context key that is set when the comment thread has no comments.
     */
    CommentContextKeys.commentThreadIsEmpty = new RawContextKey('commentThreadIsEmpty', false, { type: 'boolean', description: nls.localize('commentThreadIsEmpty', "Set when the comment thread has no comments") });
    /**
     * A context key that is set when the comment has no input.
     */
    CommentContextKeys.commentIsEmpty = new RawContextKey('commentIsEmpty', false, { type: 'boolean', description: nls.localize('commentIsEmpty', "Set when the comment has no input") });
    /**
     * The context value of the comment.
     */
    CommentContextKeys.commentContext = new RawContextKey('comment', undefined, { type: 'string', description: nls.localize('comment', "The context value of the comment") });
    /**
     * The context value of the comment thread.
     */
    CommentContextKeys.commentThreadContext = new RawContextKey('commentThread', undefined, { type: 'string', description: nls.localize('commentThread', "The context value of the comment thread") });
    /**
     * The comment controller id associated with a comment thread.
     */
    CommentContextKeys.commentControllerContext = new RawContextKey('commentController', undefined, { type: 'string', description: nls.localize('commentController', "The comment controller id associated with a comment thread") });
    /**
     * The comment widget is focused.
     */
    CommentContextKeys.commentFocused = new RawContextKey('commentFocused', false, { type: 'boolean', description: nls.localize('commentFocused', "Set when the comment is focused") });
})(CommentContextKeys || (CommentContextKeys = {}));
