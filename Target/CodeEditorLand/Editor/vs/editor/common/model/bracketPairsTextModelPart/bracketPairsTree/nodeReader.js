import { lengthAdd, lengthZero, lengthLessThan } from './length.js';
export class NodeReader {
    constructor(node) {
        this.lastOffset = lengthZero;
        this.nextNodes = [node];
        this.offsets = [lengthZero];
        this.idxs = [];
    }
    readLongestNodeAt(offset, predicate) {
        if (lengthLessThan(offset, this.lastOffset)) {
            throw new Error('Invalid offset');
        }
        this.lastOffset = offset;
        while (true) {
            const curNode = lastOrUndefined(this.nextNodes);
            if (!curNode) {
                return undefined;
            }
            const curNodeOffset = lastOrUndefined(this.offsets);
            if (lengthLessThan(offset, curNodeOffset)) {
                return undefined;
            }
            if (lengthLessThan(curNodeOffset, offset)) {
                if (lengthAdd(curNodeOffset, curNode.length) <= offset) {
                    this.nextNodeAfterCurrent();
                }
                else {
                    const nextChildIdx = getNextChildIdx(curNode);
                    if (nextChildIdx !== -1) {
                        this.nextNodes.push(curNode.getChild(nextChildIdx));
                        this.offsets.push(curNodeOffset);
                        this.idxs.push(nextChildIdx);
                    }
                    else {
                        this.nextNodeAfterCurrent();
                    }
                }
            }
            else {
                if (predicate(curNode)) {
                    this.nextNodeAfterCurrent();
                    return curNode;
                }
                else {
                    const nextChildIdx = getNextChildIdx(curNode);
                    if (nextChildIdx === -1) {
                        this.nextNodeAfterCurrent();
                        return undefined;
                    }
                    else {
                        this.nextNodes.push(curNode.getChild(nextChildIdx));
                        this.offsets.push(curNodeOffset);
                        this.idxs.push(nextChildIdx);
                    }
                }
            }
        }
    }
    nextNodeAfterCurrent() {
        while (true) {
            const currentOffset = lastOrUndefined(this.offsets);
            const currentNode = lastOrUndefined(this.nextNodes);
            this.nextNodes.pop();
            this.offsets.pop();
            if (this.idxs.length === 0) {
                break;
            }
            const parent = lastOrUndefined(this.nextNodes);
            const nextChildIdx = getNextChildIdx(parent, this.idxs[this.idxs.length - 1]);
            if (nextChildIdx !== -1) {
                this.nextNodes.push(parent.getChild(nextChildIdx));
                this.offsets.push(lengthAdd(currentOffset, currentNode.length));
                this.idxs[this.idxs.length - 1] = nextChildIdx;
                break;
            }
            else {
                this.idxs.pop();
            }
        }
    }
}
function getNextChildIdx(node, curIdx = -1) {
    while (true) {
        curIdx++;
        if (curIdx >= node.childrenLength) {
            return -1;
        }
        if (node.getChild(curIdx)) {
            return curIdx;
        }
    }
}
function lastOrUndefined(arr) {
    return arr.length > 0 ? arr[arr.length - 1] : undefined;
}
