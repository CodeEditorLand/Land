/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
import { Barrier, isThenable, RunOnceScheduler } from '../../../../base/common/async.js';
import { Emitter } from '../../../../base/common/event.js';
import { Disposable } from '../../../../base/common/lifecycle.js';
import { assertNever } from '../../../../base/common/assert.js';
import { applyTestItemUpdate, namespaceTestTag } from './testTypes.js';
import { TestId } from './testId.js';
const strictEqualComparator = (a, b) => a === b;
const diffableProps = {
    range: (a, b) => {
        if (a === b) {
            return true;
        }
        if (!a || !b) {
            return false;
        }
        return a.equalsRange(b);
    },
    busy: strictEqualComparator,
    label: strictEqualComparator,
    description: strictEqualComparator,
    error: strictEqualComparator,
    sortText: strictEqualComparator,
    tags: (a, b) => {
        if (a.length !== b.length) {
            return false;
        }
        if (a.some(t1 => !b.includes(t1))) {
            return false;
        }
        return true;
    },
};
const diffableEntries = Object.entries(diffableProps);
const diffTestItems = (a, b) => {
    let output;
    for (const [key, cmp] of diffableEntries) {
        if (!cmp(a[key], b[key])) {
            if (output) {
                output[key] = b[key];
            }
            else {
                output = { [key]: b[key] };
            }
        }
    }
    return output;
};
/**
 * Maintains a collection of test items for a single controller.
 */
export class TestItemCollection extends Disposable {
    get root() {
        return this.options.root;
    }
    constructor(options) {
        super();
        this.options = options;
        this.debounceSendDiff = this._register(new RunOnceScheduler(() => this.flushDiff(), 200));
        this.diffOpEmitter = this._register(new Emitter());
        this.tree = new Map();
        this.tags = new Map();
        this.diff = [];
        /**
         * Fires when an operation happens that should result in a diff.
         */
        this.onDidGenerateDiff = this.diffOpEmitter.event;
        this.root.canResolveChildren = true;
        this.upsertItem(this.root, undefined);
    }
    /**
     * Handler used for expanding test items.
     */
    set resolveHandler(handler) {
        this._resolveHandler = handler;
        for (const test of this.tree.values()) {
            this.updateExpandability(test);
        }
    }
    get resolveHandler() {
        return this._resolveHandler;
    }
    /**
     * Gets a diff of all changes that have been made, and clears the diff queue.
     */
    collectDiff() {
        const diff = this.diff;
        this.diff = [];
        return diff;
    }
    /**
     * Pushes a new diff entry onto the collected diff list.
     */
    pushDiff(diff) {
        switch (diff.op) {
            case 2 /* TestDiffOpType.DocumentSynced */: {
                for (const existing of this.diff) {
                    if (existing.op === 2 /* TestDiffOpType.DocumentSynced */ && existing.uri === diff.uri) {
                        existing.docv = diff.docv;
                        return;
                    }
                }
                break;
            }
            case 1 /* TestDiffOpType.Update */: {
                // Try to merge updates, since they're invoked per-property
                const last = this.diff[this.diff.length - 1];
                if (last) {
                    if (last.op === 1 /* TestDiffOpType.Update */ && last.item.extId === diff.item.extId) {
                        applyTestItemUpdate(last.item, diff.item);
                        return;
                    }
                    if (last.op === 0 /* TestDiffOpType.Add */ && last.item.item.extId === diff.item.extId) {
                        applyTestItemUpdate(last.item, diff.item);
                        return;
                    }
                }
                break;
            }
        }
        this.diff.push(diff);
        if (!this.debounceSendDiff.isScheduled()) {
            this.debounceSendDiff.schedule();
        }
    }
    /**
     * Expands the test and the given number of `levels` of children. If levels
     * is < 0, then all children will be expanded. If it's 0, then only this
     * item will be expanded.
     */
    expand(testId, levels) {
        const internal = this.tree.get(testId);
        if (!internal) {
            return;
        }
        if (internal.expandLevels === undefined || levels > internal.expandLevels) {
            internal.expandLevels = levels;
        }
        // try to avoid awaiting things if the provider returns synchronously in
        // order to keep everything in a single diff and DOM update.
        if (internal.expand === 1 /* TestItemExpandState.Expandable */) {
            const r = this.resolveChildren(internal);
            return !r.isOpen()
                ? r.wait().then(() => this.expandChildren(internal, levels - 1))
                : this.expandChildren(internal, levels - 1);
        }
        else if (internal.expand === 3 /* TestItemExpandState.Expanded */) {
            return internal.resolveBarrier?.isOpen() === false
                ? internal.resolveBarrier.wait().then(() => this.expandChildren(internal, levels - 1))
                : this.expandChildren(internal, levels - 1);
        }
    }
    dispose() {
        for (const item of this.tree.values()) {
            this.options.getApiFor(item.actual).listener = undefined;
        }
        this.tree.clear();
        this.diff = [];
        super.dispose();
    }
    onTestItemEvent(internal, evt) {
        switch (evt.op) {
            case 3 /* TestItemEventOp.RemoveChild */:
                this.removeItem(TestId.joinToString(internal.fullId, evt.id));
                break;
            case 0 /* TestItemEventOp.Upsert */:
                this.upsertItem(evt.item, internal);
                break;
            case 5 /* TestItemEventOp.Bulk */:
                for (const op of evt.ops) {
                    this.onTestItemEvent(internal, op);
                }
                break;
            case 1 /* TestItemEventOp.SetTags */:
                this.diffTagRefs(evt.new, evt.old, internal.fullId.toString());
                break;
            case 2 /* TestItemEventOp.UpdateCanResolveChildren */:
                this.updateExpandability(internal);
                break;
            case 4 /* TestItemEventOp.SetProp */:
                this.pushDiff({
                    op: 1 /* TestDiffOpType.Update */,
                    item: {
                        extId: internal.fullId.toString(),
                        item: evt.update,
                    }
                });
                break;
            case 6 /* TestItemEventOp.DocumentSynced */:
                this.documentSynced(internal.actual.uri);
                break;
            default:
                assertNever(evt);
        }
    }
    documentSynced(uri) {
        if (uri) {
            this.pushDiff({
                op: 2 /* TestDiffOpType.DocumentSynced */,
                uri,
                docv: this.options.getDocumentVersion(uri)
            });
        }
    }
    upsertItem(actual, parent) {
        const fullId = TestId.fromExtHostTestItem(actual, this.root.id, parent?.actual);
        // If this test item exists elsewhere in the tree already (exists at an
        // old ID with an existing parent), remove that old item.
        const privateApi = this.options.getApiFor(actual);
        if (privateApi.parent && privateApi.parent !== parent?.actual) {
            this.options.getChildren(privateApi.parent).delete(actual.id);
        }
        let internal = this.tree.get(fullId.toString());
        // Case 1: a brand new item
        if (!internal) {
            internal = {
                fullId,
                actual,
                expandLevels: parent?.expandLevels /* intentionally undefined or 0 */ ? parent.expandLevels - 1 : undefined,
                expand: 0 /* TestItemExpandState.NotExpandable */, // updated by `connectItemAndChildren`
            };
            actual.tags.forEach(this.incrementTagRefs, this);
            this.tree.set(internal.fullId.toString(), internal);
            this.setItemParent(actual, parent);
            this.pushDiff({
                op: 0 /* TestDiffOpType.Add */,
                item: {
                    controllerId: this.options.controllerId,
                    expand: internal.expand,
                    item: this.options.toITestItem(actual),
                },
            });
            this.connectItemAndChildren(actual, internal, parent);
            return;
        }
        // Case 2: re-insertion of an existing item, no-op
        if (internal.actual === actual) {
            this.connectItem(actual, internal, parent); // re-connect in case the parent changed
            return; // no-op
        }
        // Case 3: upsert of an existing item by ID, with a new instance
        if (internal.actual.uri?.toString() !== actual.uri?.toString()) {
            // If the item has a new URI, re-insert it; we don't support updating
            // URIs on existing test items.
            this.removeItem(fullId.toString());
            return this.upsertItem(actual, parent);
        }
        const oldChildren = this.options.getChildren(internal.actual);
        const oldActual = internal.actual;
        const update = diffTestItems(this.options.toITestItem(oldActual), this.options.toITestItem(actual));
        this.options.getApiFor(oldActual).listener = undefined;
        internal.actual = actual;
        internal.resolveBarrier = undefined;
        internal.expand = 0 /* TestItemExpandState.NotExpandable */; // updated by `connectItemAndChildren`
        if (update) {
            // tags are handled in a special way
            if (update.hasOwnProperty('tags')) {
                this.diffTagRefs(actual.tags, oldActual.tags, fullId.toString());
                delete update.tags;
            }
            this.onTestItemEvent(internal, { op: 4 /* TestItemEventOp.SetProp */, update });
        }
        this.connectItemAndChildren(actual, internal, parent);
        // Remove any orphaned children.
        for (const [_, child] of oldChildren) {
            if (!this.options.getChildren(actual).get(child.id)) {
                this.removeItem(TestId.joinToString(fullId, child.id));
            }
        }
        // Re-expand the element if it was previous expanded (#207574)
        const expandLevels = internal.expandLevels;
        if (expandLevels !== undefined) {
            // Wait until a microtask to allow the extension to finish setting up
            // properties of the element and children before we ask it to expand.
            queueMicrotask(() => {
                if (internal.expand === 1 /* TestItemExpandState.Expandable */) {
                    internal.expandLevels = undefined;
                    this.expand(fullId.toString(), expandLevels);
                }
            });
        }
        // Mark ranges in the document as synced (#161320)
        this.documentSynced(internal.actual.uri);
    }
    diffTagRefs(newTags, oldTags, extId) {
        const toDelete = new Set(oldTags.map(t => t.id));
        for (const tag of newTags) {
            if (!toDelete.delete(tag.id)) {
                this.incrementTagRefs(tag);
            }
        }
        this.pushDiff({
            op: 1 /* TestDiffOpType.Update */,
            item: { extId, item: { tags: newTags.map(v => namespaceTestTag(this.options.controllerId, v.id)) } }
        });
        toDelete.forEach(this.decrementTagRefs, this);
    }
    incrementTagRefs(tag) {
        const existing = this.tags.get(tag.id);
        if (existing) {
            existing.refCount++;
        }
        else {
            this.tags.set(tag.id, { refCount: 1 });
            this.pushDiff({
                op: 6 /* TestDiffOpType.AddTag */, tag: {
                    id: namespaceTestTag(this.options.controllerId, tag.id),
                }
            });
        }
    }
    decrementTagRefs(tagId) {
        const existing = this.tags.get(tagId);
        if (existing && !--existing.refCount) {
            this.tags.delete(tagId);
            this.pushDiff({ op: 7 /* TestDiffOpType.RemoveTag */, id: namespaceTestTag(this.options.controllerId, tagId) });
        }
    }
    setItemParent(actual, parent) {
        this.options.getApiFor(actual).parent = parent && parent.actual !== this.root ? parent.actual : undefined;
    }
    connectItem(actual, internal, parent) {
        this.setItemParent(actual, parent);
        const api = this.options.getApiFor(actual);
        api.parent = parent?.actual;
        api.listener = evt => this.onTestItemEvent(internal, evt);
        this.updateExpandability(internal);
    }
    connectItemAndChildren(actual, internal, parent) {
        this.connectItem(actual, internal, parent);
        // Discover any existing children that might have already been added
        for (const [_, child] of this.options.getChildren(actual)) {
            this.upsertItem(child, internal);
        }
    }
    /**
     * Updates the `expand` state of the item. Should be called whenever the
     * resolved state of the item changes. Can automatically expand the item
     * if requested by a consumer.
     */
    updateExpandability(internal) {
        let newState;
        if (!this._resolveHandler) {
            newState = 0 /* TestItemExpandState.NotExpandable */;
        }
        else if (internal.resolveBarrier) {
            newState = internal.resolveBarrier.isOpen()
                ? 3 /* TestItemExpandState.Expanded */
                : 2 /* TestItemExpandState.BusyExpanding */;
        }
        else {
            newState = internal.actual.canResolveChildren
                ? 1 /* TestItemExpandState.Expandable */
                : 0 /* TestItemExpandState.NotExpandable */;
        }
        if (newState === internal.expand) {
            return;
        }
        internal.expand = newState;
        this.pushDiff({ op: 1 /* TestDiffOpType.Update */, item: { extId: internal.fullId.toString(), expand: newState } });
        if (newState === 1 /* TestItemExpandState.Expandable */ && internal.expandLevels !== undefined) {
            this.resolveChildren(internal);
        }
    }
    /**
     * Expands all children of the item, "levels" deep. If levels is 0, only
     * the children will be expanded. If it's 1, the children and their children
     * will be expanded. If it's <0, it's a no-op.
     */
    expandChildren(internal, levels) {
        if (levels < 0) {
            return;
        }
        const expandRequests = [];
        for (const [_, child] of this.options.getChildren(internal.actual)) {
            const promise = this.expand(TestId.joinToString(internal.fullId, child.id), levels);
            if (isThenable(promise)) {
                expandRequests.push(promise);
            }
        }
        if (expandRequests.length) {
            return Promise.all(expandRequests).then(() => { });
        }
    }
    /**
     * Calls `discoverChildren` on the item, refreshing all its tests.
     */
    resolveChildren(internal) {
        if (internal.resolveBarrier) {
            return internal.resolveBarrier;
        }
        if (!this._resolveHandler) {
            const b = new Barrier();
            b.open();
            return b;
        }
        internal.expand = 2 /* TestItemExpandState.BusyExpanding */;
        this.pushExpandStateUpdate(internal);
        const barrier = internal.resolveBarrier = new Barrier();
        const applyError = (err) => {
            console.error(`Unhandled error in resolveHandler of test controller "${this.options.controllerId}"`, err);
        };
        let r;
        try {
            r = this._resolveHandler(internal.actual === this.root ? undefined : internal.actual);
        }
        catch (err) {
            applyError(err);
        }
        if (isThenable(r)) {
            r.catch(applyError).then(() => {
                barrier.open();
                this.updateExpandability(internal);
            });
        }
        else {
            barrier.open();
            this.updateExpandability(internal);
        }
        return internal.resolveBarrier;
    }
    pushExpandStateUpdate(internal) {
        this.pushDiff({ op: 1 /* TestDiffOpType.Update */, item: { extId: internal.fullId.toString(), expand: internal.expand } });
    }
    removeItem(childId) {
        const childItem = this.tree.get(childId);
        if (!childItem) {
            throw new Error('attempting to remove non-existent child');
        }
        this.pushDiff({ op: 3 /* TestDiffOpType.Remove */, itemId: childId });
        const queue = [childItem];
        while (queue.length) {
            const item = queue.pop();
            if (!item) {
                continue;
            }
            this.options.getApiFor(item.actual).listener = undefined;
            for (const tag of item.actual.tags) {
                this.decrementTagRefs(tag.id);
            }
            this.tree.delete(item.fullId.toString());
            for (const [_, child] of this.options.getChildren(item.actual)) {
                queue.push(this.tree.get(TestId.joinToString(item.fullId, child.id)));
            }
        }
    }
    /**
     * Immediately emits any pending diffs on the collection.
     */
    flushDiff() {
        const diff = this.collectDiff();
        if (diff.length) {
            this.diffOpEmitter.fire(diff);
        }
    }
}
export class DuplicateTestItemError extends Error {
    constructor(id) {
        super(`Attempted to insert a duplicate test item ID ${id}`);
    }
}
export class InvalidTestItemError extends Error {
    constructor(id) {
        super(`TestItem with ID "${id}" is invalid. Make sure to create it from the createTestItem method.`);
    }
}
export class MixedTestItemController extends Error {
    constructor(id, ctrlA, ctrlB) {
        super(`TestItem with ID "${id}" is from controller "${ctrlA}" and cannot be added as a child of an item from controller "${ctrlB}".`);
    }
}
export const createTestItemChildren = (api, getApi, checkCtor) => {
    let mapped = new Map();
    return {
        /** @inheritdoc */
        get size() {
            return mapped.size;
        },
        /** @inheritdoc */
        forEach(callback, thisArg) {
            for (const item of mapped.values()) {
                callback.call(thisArg, item, this);
            }
        },
        /** @inheritdoc */
        [Symbol.iterator]() {
            return mapped.entries();
        },
        /** @inheritdoc */
        replace(items) {
            const newMapped = new Map();
            const toDelete = new Set(mapped.keys());
            const bulk = { op: 5 /* TestItemEventOp.Bulk */, ops: [] };
            for (const item of items) {
                if (!(item instanceof checkCtor)) {
                    throw new InvalidTestItemError(item.id);
                }
                const itemController = getApi(item).controllerId;
                if (itemController !== api.controllerId) {
                    throw new MixedTestItemController(item.id, itemController, api.controllerId);
                }
                if (newMapped.has(item.id)) {
                    throw new DuplicateTestItemError(item.id);
                }
                newMapped.set(item.id, item);
                toDelete.delete(item.id);
                bulk.ops.push({ op: 0 /* TestItemEventOp.Upsert */, item });
            }
            for (const id of toDelete.keys()) {
                bulk.ops.push({ op: 3 /* TestItemEventOp.RemoveChild */, id });
            }
            api.listener?.(bulk);
            // important mutations come after firing, so if an error happens no
            // changes will be "saved":
            mapped = newMapped;
        },
        /** @inheritdoc */
        add(item) {
            if (!(item instanceof checkCtor)) {
                throw new InvalidTestItemError(item.id);
            }
            mapped.set(item.id, item);
            api.listener?.({ op: 0 /* TestItemEventOp.Upsert */, item });
        },
        /** @inheritdoc */
        delete(id) {
            if (mapped.delete(id)) {
                api.listener?.({ op: 3 /* TestItemEventOp.RemoveChild */, id });
            }
        },
        /** @inheritdoc */
        get(itemId) {
            return mapped.get(itemId);
        },
        /** JSON serialization function. */
        toJSON() {
            return Array.from(mapped.values());
        },
    };
};
