import { groupBy } from '../../../../base/common/arrays.js';
import { URI } from '../../../../base/common/uri.js';
import { localize } from '../../../../nls.js';
import { ResourceWithCommentThreads } from '../common/commentModel.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { isMarkdownString } from '../../../../base/common/htmlContent.js';
export function threadHasMeaningfulComments(thread) {
    return !!thread.comments && !!thread.comments.length && thread.comments.some(comment => isMarkdownString(comment.body) ? comment.body.value.length > 0 : comment.body.length > 0);
}
export class CommentsModel extends Disposable {
    get resourceCommentThreads() { return this._resourceCommentThreads; }
    constructor() {
        super();
        this._resourceCommentThreads = [];
        this.commentThreadsMap = new Map();
    }
    updateResourceCommentThreads() {
        const includeLabel = this.commentThreadsMap.size > 1;
        this._resourceCommentThreads = [...this.commentThreadsMap.values()].map(value => {
            return value.resourceWithCommentThreads.map(resource => {
                resource.ownerLabel = includeLabel ? value.ownerLabel : undefined;
                return resource;
            }).flat();
        }).flat();
    }
    setCommentThreads(uniqueOwner, owner, ownerLabel, commentThreads) {
        this.commentThreadsMap.set(uniqueOwner, { ownerLabel, resourceWithCommentThreads: this.groupByResource(uniqueOwner, owner, commentThreads) });
        this.updateResourceCommentThreads();
    }
    deleteCommentsByOwner(uniqueOwner) {
        if (uniqueOwner) {
            const existingOwner = this.commentThreadsMap.get(uniqueOwner);
            this.commentThreadsMap.set(uniqueOwner, { ownerLabel: existingOwner?.ownerLabel, resourceWithCommentThreads: [] });
        }
        else {
            this.commentThreadsMap.clear();
        }
        this.updateResourceCommentThreads();
    }
    updateCommentThreads(event) {
        const { uniqueOwner, owner, ownerLabel, removed, changed, added } = event;
        const threadsForOwner = this.commentThreadsMap.get(uniqueOwner)?.resourceWithCommentThreads || [];
        removed.forEach(thread => {
            const matchingResourceIndex = threadsForOwner.findIndex((resourceData) => resourceData.id === thread.resource);
            const matchingResourceData = matchingResourceIndex >= 0 ? threadsForOwner[matchingResourceIndex] : undefined;
            const index = matchingResourceData?.commentThreads.findIndex((commentThread) => commentThread.threadId === thread.threadId) ?? 0;
            if (index >= 0) {
                matchingResourceData?.commentThreads.splice(index, 1);
            }
            if (matchingResourceData?.commentThreads.length === 0) {
                threadsForOwner.splice(matchingResourceIndex, 1);
            }
        });
        changed.forEach(thread => {
            const matchingResourceIndex = threadsForOwner.findIndex((resourceData) => resourceData.id === thread.resource);
            const matchingResourceData = matchingResourceIndex >= 0 ? threadsForOwner[matchingResourceIndex] : undefined;
            if (!matchingResourceData) {
                return;
            }
            const index = matchingResourceData.commentThreads.findIndex((commentThread) => commentThread.threadId === thread.threadId);
            if (index >= 0) {
                matchingResourceData.commentThreads[index] = ResourceWithCommentThreads.createCommentNode(uniqueOwner, owner, URI.parse(matchingResourceData.id), thread);
            }
            else if (thread.comments && thread.comments.length) {
                matchingResourceData.commentThreads.push(ResourceWithCommentThreads.createCommentNode(uniqueOwner, owner, URI.parse(matchingResourceData.id), thread));
            }
        });
        added.forEach(thread => {
            const existingResource = threadsForOwner.filter(resourceWithThreads => resourceWithThreads.resource.toString() === thread.resource);
            if (existingResource.length) {
                const resource = existingResource[0];
                if (thread.comments && thread.comments.length) {
                    resource.commentThreads.push(ResourceWithCommentThreads.createCommentNode(uniqueOwner, owner, resource.resource, thread));
                }
            }
            else {
                threadsForOwner.push(new ResourceWithCommentThreads(uniqueOwner, owner, URI.parse(thread.resource), [thread]));
            }
        });
        this.commentThreadsMap.set(uniqueOwner, { ownerLabel, resourceWithCommentThreads: threadsForOwner });
        this.updateResourceCommentThreads();
        return removed.length > 0 || changed.length > 0 || added.length > 0;
    }
    hasCommentThreads() {
        return !!this._resourceCommentThreads.length && this._resourceCommentThreads.some(resource => {
            return (resource.commentThreads.length > 0) && resource.commentThreads.some(thread => {
                return threadHasMeaningfulComments(thread.thread);
            });
        });
    }
    getMessage() {
        if (!this._resourceCommentThreads.length) {
            return localize('noComments', "There are no comments in this workspace yet.");
        }
        else {
            return '';
        }
    }
    groupByResource(uniqueOwner, owner, commentThreads) {
        const resourceCommentThreads = [];
        const commentThreadsByResource = new Map();
        for (const group of groupBy(commentThreads, CommentsModel._compareURIs)) {
            commentThreadsByResource.set(group[0].resource, new ResourceWithCommentThreads(uniqueOwner, owner, URI.parse(group[0].resource), group));
        }
        commentThreadsByResource.forEach((v, i, m) => {
            resourceCommentThreads.push(v);
        });
        return resourceCommentThreads;
    }
    static _compareURIs(a, b) {
        const resourceA = a.resource.toString();
        const resourceB = b.resource.toString();
        if (resourceA < resourceB) {
            return -1;
        }
        else if (resourceA > resourceB) {
            return 1;
        }
        else {
            return 0;
        }
    }
}
