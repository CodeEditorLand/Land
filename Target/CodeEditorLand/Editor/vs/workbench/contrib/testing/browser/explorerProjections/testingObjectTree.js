import { WorkbenchObjectTree } from '../../../../../platform/list/browser/listService.js';
import { TestItemTreeElement } from './index.js';
import { TestId } from '../../common/testId.js';
export class TestingObjectTree extends WorkbenchObjectTree {
    getOptimizedViewState(updatePreviousState) {
        const root = updatePreviousState || {};
        const build = (node, parent) => {
            if (!(node.element instanceof TestItemTreeElement)) {
                return false;
            }
            const localId = TestId.localId(node.element.test.item.extId);
            const inTree = parent.children?.[localId] || {};
            inTree.collapsed = node.depth === 0 || !node.collapsed ? node.collapsed : undefined;
            let hasAnyNonDefaultValue = inTree.collapsed !== undefined;
            if (node.children.length) {
                for (const child of node.children) {
                    hasAnyNonDefaultValue = build(child, inTree) || hasAnyNonDefaultValue;
                }
            }
            if (hasAnyNonDefaultValue) {
                parent.children ??= {};
                parent.children[localId] = inTree;
            }
            else if (parent.children?.hasOwnProperty(localId)) {
                delete parent.children[localId];
            }
            return hasAnyNonDefaultValue;
        };
        root.children ??= {};
        for (const node of this.getNode().children) {
            if (node.element instanceof TestItemTreeElement) {
                if (node.element.test.controllerId === node.element.test.item.extId) {
                    build(node, root);
                }
                else {
                    const ctrlNode = root.children[node.element.test.controllerId] ??= { children: {} };
                    build(node, ctrlNode);
                }
            }
        }
        return root;
    }
}
