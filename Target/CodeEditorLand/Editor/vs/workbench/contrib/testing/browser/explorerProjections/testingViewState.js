import { TestId } from '../../common/testId.js';
export function isCollapsedInSerializedTestTree(serialized, id) {
    if (!(id instanceof TestId)) {
        id = TestId.fromString(id);
    }
    let node = serialized;
    for (const part of id.path) {
        if (!node.children?.hasOwnProperty(part)) {
            return undefined;
        }
        node = node.children[part];
    }
    return node.collapsed;
}
