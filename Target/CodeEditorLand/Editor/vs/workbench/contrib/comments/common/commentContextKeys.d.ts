import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare namespace CommentContextKeys {
    /**
     * A context key that is set when the active cursor is in a commenting range.
     */
    const activeCursorHasCommentingRange: RawContextKey<boolean>;
    /**
     * A context key that is set when the active cursor is in the range of an existing comment.
     */
    const activeCursorHasComment: RawContextKey<boolean>;
    /**
     * A context key that is set when the active editor has commenting ranges.
     */
    const activeEditorHasCommentingRange: RawContextKey<boolean>;
    /**
     * A context key that is set when the workspace has either comments or commenting ranges.
     */
    const WorkspaceHasCommenting: RawContextKey<boolean>;
    /**
     * A context key that is set when the comment thread has no comments.
     */
    const commentThreadIsEmpty: RawContextKey<boolean>;
    /**
     * A context key that is set when the comment has no input.
     */
    const commentIsEmpty: RawContextKey<boolean>;
    /**
     * The context value of the comment.
     */
    const commentContext: RawContextKey<string>;
    /**
     * The context value of the comment thread.
     */
    const commentThreadContext: RawContextKey<string>;
    /**
     * The comment controller id associated with a comment thread.
     */
    const commentControllerContext: RawContextKey<string>;
    /**
     * The comment widget is focused.
     */
    const commentFocused: RawContextKey<boolean>;
}
