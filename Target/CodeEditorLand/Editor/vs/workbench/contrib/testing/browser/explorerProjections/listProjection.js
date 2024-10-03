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
import { flatTestItemDelimiter } from './display.js';
import { TestItemTreeElement, TestTreeErrorMessage, getChildrenForParent, testIdentityProvider } from './index.js';
import { isCollapsedInSerializedTestTree } from './testingViewState.js';
import { TestId } from '../../common/testId.js';
import { ITestResultService } from '../../common/testResultService.js';
import { ITestService } from '../../common/testService.js';
import { applyTestItemUpdate } from '../../common/testTypes.js';
class ListTestItemElement extends TestItemTreeElement {
    get description() {
        return this.chain.map(c => c.item.label).join(flatTestItemDelimiter);
    }
    constructor(test, parent, chain) {
        super({ ...test, item: { ...test.item } }, parent);
        this.chain = chain;
        this.descriptionParts = [];
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
            this.children.delete(this.errorChild);
            this.errorChild = undefined;
        }
        if (this.test.item.error && !this.errorChild) {
            this.errorChild = new TestTreeErrorMessage(this.test.item.error, this);
            this.children.add(this.errorChild);
        }
    }
}
let ListProjection = class ListProjection extends Disposable {
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
        this.items = new Map();
        this.onUpdate = this.updateEmitter.event;
        this._register(testService.onDidProcessDiff((diff) => this.applyDiff(diff)));
        this._register(results.onResultsChanged((evt) => {
            if (!('removed' in evt)) {
                return;
            }
            for (const inTree of this.items.values()) {
                const lookup = this.results.getStateById(inTree.test.item.extId)?.[1];
                inTree.duration = lookup?.ownDuration;
                inTree.state = lookup?.ownComputedState || 0;
                inTree.fireChange();
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
            item.retired = !!result.retired;
            item.state = result.computedState;
            item.duration = result.ownDuration;
            item.fireChange();
        }));
        for (const test of testService.collection.all) {
            this.storeItem(test);
        }
    }
    getElementByTestId(testId) {
        return this.items.get(testId);
    }
    applyDiff(diff) {
        for (const op of diff) {
            switch (op.op) {
                case 0: {
                    this.storeItem(op.item);
                    break;
                }
                case 1: {
                    this.items.get(op.item.extId)?.update(op.item);
                    break;
                }
                case 3: {
                    for (const [id, item] of this.items) {
                        if (id === op.itemId || TestId.isChild(op.itemId, id)) {
                            this.unstoreItem(item);
                        }
                    }
                    break;
                }
            }
        }
        if (diff.length !== 0) {
            this.updateEmitter.fire();
        }
    }
    applyTo(tree) {
        tree.setChildren(null, getChildrenForParent(this.lastState, this.rootsWithChildren, null), {
            diffIdentityProvider: testIdentityProvider,
            diffDepth: Infinity
        });
    }
    expandElement(element, depth) {
        if (!(element instanceof ListTestItemElement)) {
            return;
        }
        if (element.test.expand === 0) {
            return;
        }
        this.testService.collection.expand(element.test.item.extId, depth);
    }
    unstoreItem(treeElement) {
        this.items.delete(treeElement.test.item.extId);
        treeElement.parent?.children.delete(treeElement);
        const parentId = TestId.fromString(treeElement.test.item.extId).parentId;
        if (!parentId) {
            return;
        }
        for (const id of parentId.idsToRoot()) {
            const parentTest = this.testService.collection.getNodeById(id.toString());
            if (parentTest) {
                if (parentTest.children.size === 0 && !this.items.has(id.toString())) {
                    this._storeItem(parentId, parentTest);
                }
                break;
            }
        }
    }
    _storeItem(testId, item) {
        const displayedParent = testId.isRoot ? null : this.items.get(item.controllerId);
        const chain = [...testId.idsFromRoot()].slice(1, -1).map(id => this.testService.collection.getNodeById(id.toString()));
        const treeElement = new ListTestItemElement(item, displayedParent, chain);
        displayedParent?.children.add(treeElement);
        this.items.set(treeElement.test.item.extId, treeElement);
        if (treeElement.depth === 0 || isCollapsedInSerializedTestTree(this.lastState, treeElement.test.item.extId) === false) {
            this.expandElement(treeElement, Infinity);
        }
        const prevState = this.results.getStateById(treeElement.test.item.extId)?.[1];
        if (prevState) {
            treeElement.retired = !!prevState.retired;
            treeElement.state = prevState.computedState;
            treeElement.duration = prevState.ownDuration;
        }
    }
    storeItem(item) {
        const testId = TestId.fromString(item.item.extId);
        for (const parentId of testId.idsToRoot()) {
            if (!parentId.isRoot) {
                const prevParent = this.items.get(parentId.toString());
                if (prevParent) {
                    this.unstoreItem(prevParent);
                    break;
                }
            }
        }
        this._storeItem(testId, item);
    }
};
ListProjection = __decorate([
    __param(1, ITestService),
    __param(2, ITestResultService),
    __metadata("design:paramtypes", [Object, Object, Object])
], ListProjection);
export { ListProjection };
