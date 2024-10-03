import { AstNode } from './ast.js';
import { Length } from './length.js';
export declare class NodeReader {
    private readonly nextNodes;
    private readonly offsets;
    private readonly idxs;
    private lastOffset;
    constructor(node: AstNode);
    readLongestNodeAt(offset: Length, predicate: (node: AstNode) => boolean): AstNode | undefined;
    private nextNodeAfterCurrent;
}
