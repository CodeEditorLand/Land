/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export class CommentNode {
    constructor(uniqueOwner, owner, resource, comment, thread) {
        this.uniqueOwner = uniqueOwner;
        this.owner = owner;
        this.resource = resource;
        this.comment = comment;
        this.thread = thread;
        this.isRoot = false;
        this.replies = [];
        this.threadId = thread.threadId;
        this.range = thread.range;
        this.threadState = thread.state;
        this.threadRelevance = thread.applicability;
        this.contextValue = thread.contextValue;
        this.controllerHandle = thread.controllerHandle;
        this.threadHandle = thread.commentThreadHandle;
    }
    hasReply() {
        return this.replies && this.replies.length !== 0;
    }
    get lastUpdatedAt() {
        if (this._lastUpdatedAt === undefined) {
            let updatedAt = this.comment.timestamp || '';
            if (this.replies.length) {
                const reply = this.replies[this.replies.length - 1];
                const replyUpdatedAt = reply.lastUpdatedAt;
                if (replyUpdatedAt > updatedAt) {
                    updatedAt = replyUpdatedAt;
                }
            }
            this._lastUpdatedAt = updatedAt;
        }
        return this._lastUpdatedAt;
    }
}
export class ResourceWithCommentThreads {
    constructor(uniqueOwner, owner, resource, commentThreads) {
        this.uniqueOwner = uniqueOwner;
        this.owner = owner;
        this.id = resource.toString();
        this.resource = resource;
        this.commentThreads = commentThreads.filter(thread => thread.comments && thread.comments.length).map(thread => ResourceWithCommentThreads.createCommentNode(uniqueOwner, owner, resource, thread));
    }
    static createCommentNode(uniqueOwner, owner, resource, commentThread) {
        const { comments } = commentThread;
        const commentNodes = comments.map(comment => new CommentNode(uniqueOwner, owner, resource, comment, commentThread));
        if (commentNodes.length > 1) {
            commentNodes[0].replies = commentNodes.slice(1, commentNodes.length);
        }
        commentNodes[0].isRoot = true;
        return commentNodes[0];
    }
    get lastUpdatedAt() {
        if (this._lastUpdatedAt === undefined) {
            let updatedAt = '';
            // Return result without cahcing as we expect data to arrive later
            if (!this.commentThreads.length) {
                return updatedAt;
            }
            for (const thread of this.commentThreads) {
                const threadUpdatedAt = thread.lastUpdatedAt;
                if (threadUpdatedAt && threadUpdatedAt > updatedAt) {
                    updatedAt = threadUpdatedAt;
                }
            }
            this._lastUpdatedAt = updatedAt;
        }
        return this._lastUpdatedAt;
    }
}
