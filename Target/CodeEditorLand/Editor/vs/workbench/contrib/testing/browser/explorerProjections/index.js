import { ObjectTreeElementCollapseState } from '../../../../../base/browser/ui/tree/tree.js';
import { Emitter } from '../../../../../base/common/event.js';
import { Iterable } from '../../../../../base/common/iterator.js';
import { isCollapsedInSerializedTestTree } from './testingViewState.js';
import { InternalTestItem } from '../../common/testTypes.js';
let idCounter = 0;
const getId = () => String(idCounter++);
export class TestItemTreeElement {
    constructor(test, parent = null) {
        this.test = test;
        this.parent = parent;
        this.changeEmitter = new Emitter();
        this.onChange = this.changeEmitter.event;
        this.children = new Set();
        this.treeId = getId();
        this.depth = this.parent ? this.parent.depth + 1 : 0;
        this.retired = false;
        this.state = 0;
    }
    toJSON() {
        if (this.depth === 0) {
            return { controllerId: this.test.controllerId };
        }
        const context = {
            $mid: 16,
            tests: [InternalTestItem.serialize(this.test)],
        };
        for (let p = this.parent; p && p.depth > 0; p = p.parent) {
            context.tests.unshift(InternalTestItem.serialize(p.test));
        }
        return context;
    }
}
export class TestTreeErrorMessage {
    get description() {
        return typeof this.message === 'string' ? this.message : this.message.value;
    }
    constructor(message, parent) {
        this.message = message;
        this.parent = parent;
        this.treeId = getId();
        this.children = new Set();
    }
}
export const testIdentityProvider = {
    getId(element) {
        const expandComponent = element instanceof TestTreeErrorMessage
            ? 'error'
            : element.test.expand === 0
                ? !!element.children.size
                : element.test.expand;
        return element.treeId + '\0' + expandComponent;
    }
};
export const getChildrenForParent = (serialized, rootsWithChildren, node) => {
    let it;
    if (node === null) {
        const rootsWithChildrenArr = [...rootsWithChildren];
        if (rootsWithChildrenArr.length === 1) {
            return getChildrenForParent(serialized, rootsWithChildrenArr, rootsWithChildrenArr[0]);
        }
        it = rootsWithChildrenArr;
    }
    else {
        it = node.children;
    }
    return Iterable.map(it, element => (element instanceof TestTreeErrorMessage
        ? { element }
        : {
            element,
            collapsible: element.test.expand !== 0,
            collapsed: element.test.item.error
                ? ObjectTreeElementCollapseState.PreserveOrExpanded
                : (isCollapsedInSerializedTestTree(serialized, element.test.item.extId) ?? element.depth > 0
                    ? ObjectTreeElementCollapseState.PreserveOrCollapsed
                    : ObjectTreeElementCollapseState.PreserveOrExpanded),
            children: getChildrenForParent(serialized, rootsWithChildren, element),
        }));
};
