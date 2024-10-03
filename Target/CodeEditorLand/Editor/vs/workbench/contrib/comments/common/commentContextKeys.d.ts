import { RawContextKey } from '../../../../platform/contextkey/common/contextkey.js';
export declare namespace CommentContextKeys {
    const activeCursorHasCommentingRange: RawContextKey<boolean>;
    const activeCursorHasComment: RawContextKey<boolean>;
    const activeEditorHasCommentingRange: RawContextKey<boolean>;
    const WorkspaceHasCommenting: RawContextKey<boolean>;
    const commentThreadIsEmpty: RawContextKey<boolean>;
    const commentIsEmpty: RawContextKey<boolean>;
    const commentContext: RawContextKey<string>;
    const commentThreadContext: RawContextKey<string>;
    const commentControllerContext: RawContextKey<string>;
    const commentFocused: RawContextKey<boolean>;
}
