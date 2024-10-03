var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Emitter } from '../../../../../base/common/event.js';
import { Iterable } from '../../../../../base/common/iterator.js';
import { Disposable } from '../../../../../base/common/lifecycle.js';
import { TestItemTreeElement, TestTreeErrorMessage, getChildrenForParent, testIdentityProvider } from './index.js';
import { isCollapsedInSerializedTestTree } from './testingViewState.js';
import { refreshComputedState } from '../../common/getComputedState.js';
import { TestId } from '../../common/testId.js';
import { ITestResultService } from '../../common/testResultService.js';
import { ITestService } from '../../common/testService.js';
import { applyTestItemUpdate } from '../../common/testTypes.js';
const computedStateAccessor = {
    getOwnState: i => i instanceof TestItemTreeElement ? i.ownState : 0,
    getCurrentComputedState: i => i.state,
    setComputedState: (i, s) => i.state = s,
    getCurrentComputedDuration: i => i.duration,
    getOwnDuration: i => i instanceof TestItemTreeElement ? i.ownDuration : undefined,
    setComputedDuration: (i, d) => i.duration = d,
    getChildren: i => Iterable.filter(i.children.values(), (t) => t instanceof TreeTestItemElement),
    *getParents(i) {
        for (let parent = i.parent; parent; parent = parent.parent) {
            yield parent;
        }
    },
};
class TreeTestItemElement extends TestItemTreeElement {
    get description() {
        return this.test.item.description;
    }
    constructor(test, parent, addedOrRemoved) {
        super({ ...test, item: { ...test.item } }, parent);
        this.addedOrRemoved = addedOrRemoved;
        this.ownState = 0;
        this.updateErrorVisibility();
    }
    update(patch) {
        applyTestItemUpdate(this.test, patch);
        this.updateErrorVisibility(patch);
        this.fireChange();
    }
    fireChange() {
        this.changeEmitter.fire();
    }
    updateErrorVisibility(patch) {
        if (this.errorChild && (!this.test.item.error || patch?.item?.error)) {
            this.addedOrRemoved(this);
            this.children.delete(this.errorChild);
            this.errorChild = undefined;
        }
        if (this.test.item.error && !this.errorChild) {
            this.errorChild = new TestTreeErrorMessage(this.test.item.error, this);
            this.children.add(this.errorChild);
            this.addedOrRemoved(this);
        }
    }
}
let TreeProjection = class TreeProjection extends Disposable {
    get rootsWithChildren() {
        const rootsIt = Iterable.map(this.testService.collection.rootItems, r => this.items.get(r.item.extId));
        return Iterable.filter(rootsIt, (r) => !!r?.children.size);
    }
    constructor(lastState, testService, results) {
        super();
        this.lastState = lastState;
        this.testService = testService;
        this.results = results;
        this.updateEmitter = new Emitter();
        this.changedParents = new Set();
        this.resortedParents = new Set();
        this.items = new Map();
        this.onUpdate = this.updateEmitter.event;
        this._register(testService.onDidProcessDiff((diff) => this.applyDiff(diff)));
        this._register(results.onResultsChanged((evt) => {
            if (!('removed' in evt)) {
                return;
            }
            for (const inTree of [...this.items.values()].sort((a, b) => b.depth - a.depth)) {
                const lookup = this.results.getStateById(inTree.test.item.extId)?.[1];
                inTree.ownDuration = lookup?.ownDuration;
                refreshComputedState(computedStateAccessor, inTree, lookup?.ownComputedState ?? 0).forEach(i => i.fireChange());
            }
        }));
        this._register(results.onTestChanged(ev => {
            if (ev.reason === 2) {
                return;
            }
            let result = ev.item;
            if (result.ownComputedState === 0 || ev.result !== results.results[0]) {
                const fallback = results.getStateById(result.item.extId);
                if (fallback) {
                    result = fallback[1];
                }
            }
            const item = this.items.get(result.item.extId);
            if (!item) {
                return;
            }
            const refreshDuration = ev.reason === 1 && ev.previousOwnDuration !== result.ownDuration;
            const explicitComputed = item.children.size ? undefined : result.computedState;
            item.retired = !!result.retired;
            item.ownState = result.ownComputedState;
            item.ownDuration = result.ownDuration;
            item.fireChange();
            refreshComputedState(computedStateAccessor, item, explicitComputed, refreshDuration).forEach(i => i.fireChange());
        }));
        for (const test of testService.collection.all) {
            this.storeItem(this.createItem(test));
        }
    }
    getElementByTestId(testId) {
        return this.items.get(testId);
    }
    applyDiff(diff) {
        for (const op of diff) {
            switch (op.op) {
                case 0: {
                    const item = this.createItem(op.item);
                    this.storeItem(item);
                    break;
                }
                case 1: {
                    const patch = op.item;
                    const existing = this.items.get(patch.extId);
                    if (!existing) {
                        break;
                    }
                    const needsParentUpdate = existing.test.expand === 0 && patch.expand;
                    existing.update(patch);
                    if (needsParentUpdate) {
                        this.changedParents.add(existing.parent);
                    }
                    else {
                        this.resortedParents.add(existing.parent);
                    }
                    break;
                }
                case 3: {
                    const toRemove = this.items.get(op.itemId);
                    if (!toRemove) {
                        break;
                    }
                    const parent = toRemove.parent;
                    const affectsRootElement = toRemove.depth === 1 && (parent?.children.size === 1 || !Iterable.some(this.rootsWithChildren, (_, i) => i === 1));
                    this.changedParents.add(affectsRootElement ? null : parent);
                    const queue = [[toRemove]];
                    while (queue.length) {
                        for (const item of queue.pop()) {
                            if (item instanceof TreeTestItemElement) {
                                queue.push(this.unstoreItem(item));
                            }
                        }
                    }
                    if (parent instanceof TreeTestItemElement) {
                        refreshComputedState(computedStateAccessor, parent, undefined, !!parent.duration).forEach(i => i.fireChange());
                    }
                }
            }
        }
        if (diff.length !== 0) {
            this.updateEmitter.fire();
        }
    }
    applyTo(tree) {
        for (const parent of this.changedParents) {
            if (!parent || tree.hasElement(parent)) {
                tree.setChildren(parent, getChildrenForParent(this.lastState, this.rootsWithChildren, parent), { diffIdentityProvider: testIdentityProvider });
            }
        }
        for (const parent of this.resortedParents) {
            if (!parent || tree.hasElement(parent)) {
                tree.resort(parent, false);
            }
        }
        this.changedParents.clear();
        this.resortedParents.clear();
    }
    expandElement(element, depth) {
        if (!(element instanceof TreeTestItemElement)) {
            return;
        }
        if (element.test.expand === 0) {
            return;
        }
        this.testService.collection.expand(element.test.item.extId, depth);
    }
    createItem(item) {
        const parentId = TestId.parentId(item.item.extId);
        const parent = parentId ? this.items.get(parentId) : null;
        return new TreeTestItemElement(item, parent, n => this.changedParents.add(n));
    }
    unstoreItem(treeElement) {
        const parent = treeElement.parent;
        parent?.children.delete(treeElement);
        this.items.delete(treeElement.test.item.extId);
        return treeElement.children;
    }
    storeItem(treeElement) {
        treeElement.parent?.children.add(treeElement);
        this.items.set(treeElement.test.item.extId, treeElement);
        const affectsParent = treeElement.parent?.children.size === 1;
        const affectedParent = affectsParent ? treeElement.parent.parent : treeElement.parent;
        this.changedParents.add(affectedParent);
        if (affectedParent?.depth === 0) {
            this.changedParents.add(null);
        }
        if (treeElement.depth === 0 || isCollapsedInSerializedTestTree(this.lastState, treeElement.test.item.extId) === false) {
            this.expandElement(treeElement, 0);
        }
        const prevState = this.results.getStateById(treeElement.test.item.extId)?.[1];
        if (prevState) {
            treeElement.retired = !!prevState.retired;
            treeElement.ownState = prevState.computedState;
            treeElement.ownDuration = prevState.ownDuration;
            refreshComputedState(computedStateAccessor, treeElement, undefined, !!treeElement.ownDuration).forEach(i => i.fireChange());
        }
    }
};
TreeProjection = __decorate([
    __param(1, ITestService),
    __param(2, ITestResultService),
    __metadata("design:paramtypes", [Object, Object, Object])
], TreeProjection);
export { TreeProjection };
