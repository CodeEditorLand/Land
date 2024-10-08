import { URI } from '../../../../base/common/uri.js';
import { IRange } from '../../../../editor/common/core/range.js';
import { Comment, CommentThread, CommentThreadChangedEvent, CommentThreadApplicability, CommentThreadState } from '../../../../editor/common/languages.js';
export interface ICommentThreadChangedEvent extends CommentThreadChangedEvent<IRange> {
    uniqueOwner: string;
    owner: string;
    ownerLabel: string;
}
export declare class CommentNode {
    readonly uniqueOwner: string;
    readonly owner: string;
    readonly resource: URI;
    readonly comment: Comment;
    readonly thread: CommentThread;
    isRoot: boolean;
    replies: CommentNode[];
    readonly threadId: string;
    readonly range: IRange | undefined;
    readonly threadState: CommentThreadState | undefined;
    readonly threadRelevance: CommentThreadApplicability | undefined;
    readonly contextValue: string | undefined;
    readonly controllerHandle: number;
    readonly threadHandle: number;
    constructor(uniqueOwner: string, owner: string, resource: URI, comment: Comment, thread: CommentThread);
    hasReply(): boolean;
    private _lastUpdatedAt;
    get lastUpdatedAt(): string;
}
export declare class ResourceWithCommentThreads {
    id: string;
    uniqueOwner: string;
    owner: string;
    ownerLabel: string | undefined;
    commentThreads: CommentNode[];
    resource: URI;
    constructor(uniqueOwner: string, owner: string, resource: URI, commentThreads: CommentThread[]);
    static createCommentNode(uniqueOwner: string, owner: string, resource: URI, commentThread: CommentThread): CommentNode;
    private _lastUpdatedAt;
    get lastUpdatedAt(): string;
}
