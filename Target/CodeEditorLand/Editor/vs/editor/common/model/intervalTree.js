export function getNodeColor(node) {
    return ((node.metadata & 1) >>> 0);
}
function setNodeColor(node, color) {
    node.metadata = ((node.metadata & 254) | (color << 0));
}
function getNodeIsVisited(node) {
    return ((node.metadata & 2) >>> 1) === 1;
}
function setNodeIsVisited(node, value) {
    node.metadata = ((node.metadata & 253) | ((value ? 1 : 0) << 1));
}
function getNodeIsForValidation(node) {
    return ((node.metadata & 4) >>> 2) === 1;
}
function setNodeIsForValidation(node, value) {
    node.metadata = ((node.metadata & 251) | ((value ? 1 : 0) << 2));
}
function getNodeIsInGlyphMargin(node) {
    return ((node.metadata & 64) >>> 6) === 1;
}
function setNodeIsInGlyphMargin(node, value) {
    node.metadata = ((node.metadata & 191) | ((value ? 1 : 0) << 6));
}
function getNodeStickiness(node) {
    return ((node.metadata & 24) >>> 3);
}
function _setNodeStickiness(node, stickiness) {
    node.metadata = ((node.metadata & 231) | (stickiness << 3));
}
function getCollapseOnReplaceEdit(node) {
    return ((node.metadata & 32) >>> 5) === 1;
}
function setCollapseOnReplaceEdit(node, value) {
    node.metadata = ((node.metadata & 223) | ((value ? 1 : 0) << 5));
}
export function setNodeStickiness(node, stickiness) {
    _setNodeStickiness(node, stickiness);
}
export class IntervalNode {
    constructor(id, start, end) {
        this.metadata = 0;
        this.parent = this;
        this.left = this;
        this.right = this;
        setNodeColor(this, 1);
        this.start = start;
        this.end = end;
        this.delta = 0;
        this.maxEnd = end;
        this.id = id;
        this.ownerId = 0;
        this.options = null;
        setNodeIsForValidation(this, false);
        setNodeIsInGlyphMargin(this, false);
        _setNodeStickiness(this, 1);
        setCollapseOnReplaceEdit(this, false);
        this.cachedVersionId = 0;
        this.cachedAbsoluteStart = start;
        this.cachedAbsoluteEnd = end;
        this.range = null;
        setNodeIsVisited(this, false);
    }
    reset(versionId, start, end, range) {
        this.start = start;
        this.end = end;
        this.maxEnd = end;
        this.cachedVersionId = versionId;
        this.cachedAbsoluteStart = start;
        this.cachedAbsoluteEnd = end;
        this.range = range;
    }
    setOptions(options) {
        this.options = options;
        const className = this.options.className;
        setNodeIsForValidation(this, (className === "squiggly-error"
            || className === "squiggly-warning"
            || className === "squiggly-info"));
        setNodeIsInGlyphMargin(this, this.options.glyphMarginClassName !== null);
        _setNodeStickiness(this, this.options.stickiness);
        setCollapseOnReplaceEdit(this, this.options.collapseOnReplaceEdit);
    }
    setCachedOffsets(absoluteStart, absoluteEnd, cachedVersionId) {
        if (this.cachedVersionId !== cachedVersionId) {
            this.range = null;
        }
        this.cachedVersionId = cachedVersionId;
        this.cachedAbsoluteStart = absoluteStart;
        this.cachedAbsoluteEnd = absoluteEnd;
    }
    detach() {
        this.parent = null;
        this.left = null;
        this.right = null;
    }
}
export const SENTINEL = new IntervalNode(null, 0, 0);
SENTINEL.parent = SENTINEL;
SENTINEL.left = SENTINEL;
SENTINEL.right = SENTINEL;
setNodeColor(SENTINEL, 0);
export class IntervalTree {
    constructor() {
        this.root = SENTINEL;
        this.requestNormalizeDelta = false;
    }
    intervalSearch(start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations) {
        if (this.root === SENTINEL) {
            return [];
        }
        return intervalSearch(this, start, end, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
    }
    search(filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations) {
        if (this.root === SENTINEL) {
            return [];
        }
        return search(this, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations);
    }
    collectNodesFromOwner(ownerId) {
        return collectNodesFromOwner(this, ownerId);
    }
    collectNodesPostOrder() {
        return collectNodesPostOrder(this);
    }
    insert(node) {
        rbTreeInsert(this, node);
        this._normalizeDeltaIfNecessary();
    }
    delete(node) {
        rbTreeDelete(this, node);
        this._normalizeDeltaIfNecessary();
    }
    resolveNode(node, cachedVersionId) {
        const initialNode = node;
        let delta = 0;
        while (node !== this.root) {
            if (node === node.parent.right) {
                delta += node.parent.delta;
            }
            node = node.parent;
        }
        const nodeStart = initialNode.start + delta;
        const nodeEnd = initialNode.end + delta;
        initialNode.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
    }
    acceptReplace(offset, length, textLength, forceMoveMarkers) {
        const nodesOfInterest = searchForEditing(this, offset, offset + length);
        for (let i = 0, len = nodesOfInterest.length; i < len; i++) {
            const node = nodesOfInterest[i];
            rbTreeDelete(this, node);
        }
        this._normalizeDeltaIfNecessary();
        noOverlapReplace(this, offset, offset + length, textLength);
        this._normalizeDeltaIfNecessary();
        for (let i = 0, len = nodesOfInterest.length; i < len; i++) {
            const node = nodesOfInterest[i];
            node.start = node.cachedAbsoluteStart;
            node.end = node.cachedAbsoluteEnd;
            nodeAcceptEdit(node, offset, (offset + length), textLength, forceMoveMarkers);
            node.maxEnd = node.end;
            rbTreeInsert(this, node);
        }
        this._normalizeDeltaIfNecessary();
    }
    getAllInOrder() {
        return search(this, 0, false, 0, false);
    }
    _normalizeDeltaIfNecessary() {
        if (!this.requestNormalizeDelta) {
            return;
        }
        this.requestNormalizeDelta = false;
        normalizeDelta(this);
    }
}
function normalizeDelta(T) {
    let node = T.root;
    let delta = 0;
    while (node !== SENTINEL) {
        if (node.left !== SENTINEL && !getNodeIsVisited(node.left)) {
            node = node.left;
            continue;
        }
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            delta += node.delta;
            node = node.right;
            continue;
        }
        node.start = delta + node.start;
        node.end = delta + node.end;
        node.delta = 0;
        recomputeMaxEnd(node);
        setNodeIsVisited(node, true);
        setNodeIsVisited(node.left, false);
        setNodeIsVisited(node.right, false);
        if (node === node.parent.right) {
            delta -= node.parent.delta;
        }
        node = node.parent;
    }
    setNodeIsVisited(T.root, false);
}
function adjustMarkerBeforeColumn(markerOffset, markerStickToPreviousCharacter, checkOffset, moveSemantics) {
    if (markerOffset < checkOffset) {
        return true;
    }
    if (markerOffset > checkOffset) {
        return false;
    }
    if (moveSemantics === 1) {
        return false;
    }
    if (moveSemantics === 2) {
        return true;
    }
    return markerStickToPreviousCharacter;
}
export function nodeAcceptEdit(node, start, end, textLength, forceMoveMarkers) {
    const nodeStickiness = getNodeStickiness(node);
    const startStickToPreviousCharacter = (nodeStickiness === 0
        || nodeStickiness === 2);
    const endStickToPreviousCharacter = (nodeStickiness === 1
        || nodeStickiness === 2);
    const deletingCnt = (end - start);
    const insertingCnt = textLength;
    const commonLength = Math.min(deletingCnt, insertingCnt);
    const nodeStart = node.start;
    let startDone = false;
    const nodeEnd = node.end;
    let endDone = false;
    if (start <= nodeStart && nodeEnd <= end && getCollapseOnReplaceEdit(node)) {
        node.start = start;
        startDone = true;
        node.end = start;
        endDone = true;
    }
    {
        const moveSemantics = forceMoveMarkers ? 1 : (deletingCnt > 0 ? 2 : 0);
        if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, start, moveSemantics)) {
            startDone = true;
        }
        if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, start, moveSemantics)) {
            endDone = true;
        }
    }
    if (commonLength > 0 && !forceMoveMarkers) {
        const moveSemantics = (deletingCnt > insertingCnt ? 2 : 0);
        if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, start + commonLength, moveSemantics)) {
            startDone = true;
        }
        if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, start + commonLength, moveSemantics)) {
            endDone = true;
        }
    }
    {
        const moveSemantics = forceMoveMarkers ? 1 : 0;
        if (!startDone && adjustMarkerBeforeColumn(nodeStart, startStickToPreviousCharacter, end, moveSemantics)) {
            node.start = start + insertingCnt;
            startDone = true;
        }
        if (!endDone && adjustMarkerBeforeColumn(nodeEnd, endStickToPreviousCharacter, end, moveSemantics)) {
            node.end = start + insertingCnt;
            endDone = true;
        }
    }
    const deltaColumn = (insertingCnt - deletingCnt);
    if (!startDone) {
        node.start = Math.max(0, nodeStart + deltaColumn);
    }
    if (!endDone) {
        node.end = Math.max(0, nodeEnd + deltaColumn);
    }
    if (node.start > node.end) {
        node.end = node.start;
    }
}
function searchForEditing(T, start, end) {
    let node = T.root;
    let delta = 0;
    let nodeMaxEnd = 0;
    let nodeStart = 0;
    let nodeEnd = 0;
    const result = [];
    let resultLen = 0;
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            if (node === node.parent.right) {
                delta -= node.parent.delta;
            }
            node = node.parent;
            continue;
        }
        if (!getNodeIsVisited(node.left)) {
            nodeMaxEnd = delta + node.maxEnd;
            if (nodeMaxEnd < start) {
                setNodeIsVisited(node, true);
                continue;
            }
            if (node.left !== SENTINEL) {
                node = node.left;
                continue;
            }
        }
        nodeStart = delta + node.start;
        if (nodeStart > end) {
            setNodeIsVisited(node, true);
            continue;
        }
        nodeEnd = delta + node.end;
        if (nodeEnd >= start) {
            node.setCachedOffsets(nodeStart, nodeEnd, 0);
            result[resultLen++] = node;
        }
        setNodeIsVisited(node, true);
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            delta += node.delta;
            node = node.right;
            continue;
        }
    }
    setNodeIsVisited(T.root, false);
    return result;
}
function noOverlapReplace(T, start, end, textLength) {
    let node = T.root;
    let delta = 0;
    let nodeMaxEnd = 0;
    let nodeStart = 0;
    const editDelta = (textLength - (end - start));
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            if (node === node.parent.right) {
                delta -= node.parent.delta;
            }
            recomputeMaxEnd(node);
            node = node.parent;
            continue;
        }
        if (!getNodeIsVisited(node.left)) {
            nodeMaxEnd = delta + node.maxEnd;
            if (nodeMaxEnd < start) {
                setNodeIsVisited(node, true);
                continue;
            }
            if (node.left !== SENTINEL) {
                node = node.left;
                continue;
            }
        }
        nodeStart = delta + node.start;
        if (nodeStart > end) {
            node.start += editDelta;
            node.end += editDelta;
            node.delta += editDelta;
            if (node.delta < -1073741824 || node.delta > 1073741824) {
                T.requestNormalizeDelta = true;
            }
            setNodeIsVisited(node, true);
            continue;
        }
        setNodeIsVisited(node, true);
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            delta += node.delta;
            node = node.right;
            continue;
        }
    }
    setNodeIsVisited(T.root, false);
}
function collectNodesFromOwner(T, ownerId) {
    let node = T.root;
    const result = [];
    let resultLen = 0;
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            node = node.parent;
            continue;
        }
        if (node.left !== SENTINEL && !getNodeIsVisited(node.left)) {
            node = node.left;
            continue;
        }
        if (node.ownerId === ownerId) {
            result[resultLen++] = node;
        }
        setNodeIsVisited(node, true);
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            node = node.right;
            continue;
        }
    }
    setNodeIsVisited(T.root, false);
    return result;
}
function collectNodesPostOrder(T) {
    let node = T.root;
    const result = [];
    let resultLen = 0;
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            node = node.parent;
            continue;
        }
        if (node.left !== SENTINEL && !getNodeIsVisited(node.left)) {
            node = node.left;
            continue;
        }
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            node = node.right;
            continue;
        }
        result[resultLen++] = node;
        setNodeIsVisited(node, true);
    }
    setNodeIsVisited(T.root, false);
    return result;
}
function search(T, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations) {
    let node = T.root;
    let delta = 0;
    let nodeStart = 0;
    let nodeEnd = 0;
    const result = [];
    let resultLen = 0;
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            if (node === node.parent.right) {
                delta -= node.parent.delta;
            }
            node = node.parent;
            continue;
        }
        if (node.left !== SENTINEL && !getNodeIsVisited(node.left)) {
            node = node.left;
            continue;
        }
        nodeStart = delta + node.start;
        nodeEnd = delta + node.end;
        node.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
        let include = true;
        if (filterOwnerId && node.ownerId && node.ownerId !== filterOwnerId) {
            include = false;
        }
        if (filterOutValidation && getNodeIsForValidation(node)) {
            include = false;
        }
        if (onlyMarginDecorations && !getNodeIsInGlyphMargin(node)) {
            include = false;
        }
        if (include) {
            result[resultLen++] = node;
        }
        setNodeIsVisited(node, true);
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            delta += node.delta;
            node = node.right;
            continue;
        }
    }
    setNodeIsVisited(T.root, false);
    return result;
}
function intervalSearch(T, intervalStart, intervalEnd, filterOwnerId, filterOutValidation, cachedVersionId, onlyMarginDecorations) {
    let node = T.root;
    let delta = 0;
    let nodeMaxEnd = 0;
    let nodeStart = 0;
    let nodeEnd = 0;
    const result = [];
    let resultLen = 0;
    while (node !== SENTINEL) {
        if (getNodeIsVisited(node)) {
            setNodeIsVisited(node.left, false);
            setNodeIsVisited(node.right, false);
            if (node === node.parent.right) {
                delta -= node.parent.delta;
            }
            node = node.parent;
            continue;
        }
        if (!getNodeIsVisited(node.left)) {
            nodeMaxEnd = delta + node.maxEnd;
            if (nodeMaxEnd < intervalStart) {
                setNodeIsVisited(node, true);
                continue;
            }
            if (node.left !== SENTINEL) {
                node = node.left;
                continue;
            }
        }
        nodeStart = delta + node.start;
        if (nodeStart > intervalEnd) {
            setNodeIsVisited(node, true);
            continue;
        }
        nodeEnd = delta + node.end;
        if (nodeEnd >= intervalStart) {
            node.setCachedOffsets(nodeStart, nodeEnd, cachedVersionId);
            let include = true;
            if (filterOwnerId && node.ownerId && node.ownerId !== filterOwnerId) {
                include = false;
            }
            if (filterOutValidation && getNodeIsForValidation(node)) {
                include = false;
            }
            if (onlyMarginDecorations && !getNodeIsInGlyphMargin(node)) {
                include = false;
            }
            if (include) {
                result[resultLen++] = node;
            }
        }
        setNodeIsVisited(node, true);
        if (node.right !== SENTINEL && !getNodeIsVisited(node.right)) {
            delta += node.delta;
            node = node.right;
            continue;
        }
    }
    setNodeIsVisited(T.root, false);
    return result;
}
function rbTreeInsert(T, newNode) {
    if (T.root === SENTINEL) {
        newNode.parent = SENTINEL;
        newNode.left = SENTINEL;
        newNode.right = SENTINEL;
        setNodeColor(newNode, 0);
        T.root = newNode;
        return T.root;
    }
    treeInsert(T, newNode);
    recomputeMaxEndWalkToRoot(newNode.parent);
    let x = newNode;
    while (x !== T.root && getNodeColor(x.parent) === 1) {
        if (x.parent === x.parent.parent.left) {
            const y = x.parent.parent.right;
            if (getNodeColor(y) === 1) {
                setNodeColor(x.parent, 0);
                setNodeColor(y, 0);
                setNodeColor(x.parent.parent, 1);
                x = x.parent.parent;
            }
            else {
                if (x === x.parent.right) {
                    x = x.parent;
                    leftRotate(T, x);
                }
                setNodeColor(x.parent, 0);
                setNodeColor(x.parent.parent, 1);
                rightRotate(T, x.parent.parent);
            }
        }
        else {
            const y = x.parent.parent.left;
            if (getNodeColor(y) === 1) {
                setNodeColor(x.parent, 0);
                setNodeColor(y, 0);
                setNodeColor(x.parent.parent, 1);
                x = x.parent.parent;
            }
            else {
                if (x === x.parent.left) {
                    x = x.parent;
                    rightRotate(T, x);
                }
                setNodeColor(x.parent, 0);
                setNodeColor(x.parent.parent, 1);
                leftRotate(T, x.parent.parent);
            }
        }
    }
    setNodeColor(T.root, 0);
    return newNode;
}
function treeInsert(T, z) {
    let delta = 0;
    let x = T.root;
    const zAbsoluteStart = z.start;
    const zAbsoluteEnd = z.end;
    while (true) {
        const cmp = intervalCompare(zAbsoluteStart, zAbsoluteEnd, x.start + delta, x.end + delta);
        if (cmp < 0) {
            if (x.left === SENTINEL) {
                z.start -= delta;
                z.end -= delta;
                z.maxEnd -= delta;
                x.left = z;
                break;
            }
            else {
                x = x.left;
            }
        }
        else {
            if (x.right === SENTINEL) {
                z.start -= (delta + x.delta);
                z.end -= (delta + x.delta);
                z.maxEnd -= (delta + x.delta);
                x.right = z;
                break;
            }
            else {
                delta += x.delta;
                x = x.right;
            }
        }
    }
    z.parent = x;
    z.left = SENTINEL;
    z.right = SENTINEL;
    setNodeColor(z, 1);
}
function rbTreeDelete(T, z) {
    let x;
    let y;
    if (z.left === SENTINEL) {
        x = z.right;
        y = z;
        x.delta += z.delta;
        if (x.delta < -1073741824 || x.delta > 1073741824) {
            T.requestNormalizeDelta = true;
        }
        x.start += z.delta;
        x.end += z.delta;
    }
    else if (z.right === SENTINEL) {
        x = z.left;
        y = z;
    }
    else {
        y = leftest(z.right);
        x = y.right;
        x.start += y.delta;
        x.end += y.delta;
        x.delta += y.delta;
        if (x.delta < -1073741824 || x.delta > 1073741824) {
            T.requestNormalizeDelta = true;
        }
        y.start += z.delta;
        y.end += z.delta;
        y.delta = z.delta;
        if (y.delta < -1073741824 || y.delta > 1073741824) {
            T.requestNormalizeDelta = true;
        }
    }
    if (y === T.root) {
        T.root = x;
        setNodeColor(x, 0);
        z.detach();
        resetSentinel();
        recomputeMaxEnd(x);
        T.root.parent = SENTINEL;
        return;
    }
    const yWasRed = (getNodeColor(y) === 1);
    if (y === y.parent.left) {
        y.parent.left = x;
    }
    else {
        y.parent.right = x;
    }
    if (y === z) {
        x.parent = y.parent;
    }
    else {
        if (y.parent === z) {
            x.parent = y;
        }
        else {
            x.parent = y.parent;
        }
        y.left = z.left;
        y.right = z.right;
        y.parent = z.parent;
        setNodeColor(y, getNodeColor(z));
        if (z === T.root) {
            T.root = y;
        }
        else {
            if (z === z.parent.left) {
                z.parent.left = y;
            }
            else {
                z.parent.right = y;
            }
        }
        if (y.left !== SENTINEL) {
            y.left.parent = y;
        }
        if (y.right !== SENTINEL) {
            y.right.parent = y;
        }
    }
    z.detach();
    if (yWasRed) {
        recomputeMaxEndWalkToRoot(x.parent);
        if (y !== z) {
            recomputeMaxEndWalkToRoot(y);
            recomputeMaxEndWalkToRoot(y.parent);
        }
        resetSentinel();
        return;
    }
    recomputeMaxEndWalkToRoot(x);
    recomputeMaxEndWalkToRoot(x.parent);
    if (y !== z) {
        recomputeMaxEndWalkToRoot(y);
        recomputeMaxEndWalkToRoot(y.parent);
    }
    let w;
    while (x !== T.root && getNodeColor(x) === 0) {
        if (x === x.parent.left) {
            w = x.parent.right;
            if (getNodeColor(w) === 1) {
                setNodeColor(w, 0);
                setNodeColor(x.parent, 1);
                leftRotate(T, x.parent);
                w = x.parent.right;
            }
            if (getNodeColor(w.left) === 0 && getNodeColor(w.right) === 0) {
                setNodeColor(w, 1);
                x = x.parent;
            }
            else {
                if (getNodeColor(w.right) === 0) {
                    setNodeColor(w.left, 0);
                    setNodeColor(w, 1);
                    rightRotate(T, w);
                    w = x.parent.right;
                }
                setNodeColor(w, getNodeColor(x.parent));
                setNodeColor(x.parent, 0);
                setNodeColor(w.right, 0);
                leftRotate(T, x.parent);
                x = T.root;
            }
        }
        else {
            w = x.parent.left;
            if (getNodeColor(w) === 1) {
                setNodeColor(w, 0);
                setNodeColor(x.parent, 1);
                rightRotate(T, x.parent);
                w = x.parent.left;
            }
            if (getNodeColor(w.left) === 0 && getNodeColor(w.right) === 0) {
                setNodeColor(w, 1);
                x = x.parent;
            }
            else {
                if (getNodeColor(w.left) === 0) {
                    setNodeColor(w.right, 0);
                    setNodeColor(w, 1);
                    leftRotate(T, w);
                    w = x.parent.left;
                }
                setNodeColor(w, getNodeColor(x.parent));
                setNodeColor(x.parent, 0);
                setNodeColor(w.left, 0);
                rightRotate(T, x.parent);
                x = T.root;
            }
        }
    }
    setNodeColor(x, 0);
    resetSentinel();
}
function leftest(node) {
    while (node.left !== SENTINEL) {
        node = node.left;
    }
    return node;
}
function resetSentinel() {
    SENTINEL.parent = SENTINEL;
    SENTINEL.delta = 0;
    SENTINEL.start = 0;
    SENTINEL.end = 0;
}
function leftRotate(T, x) {
    const y = x.right;
    y.delta += x.delta;
    if (y.delta < -1073741824 || y.delta > 1073741824) {
        T.requestNormalizeDelta = true;
    }
    y.start += x.delta;
    y.end += x.delta;
    x.right = y.left;
    if (y.left !== SENTINEL) {
        y.left.parent = x;
    }
    y.parent = x.parent;
    if (x.parent === SENTINEL) {
        T.root = y;
    }
    else if (x === x.parent.left) {
        x.parent.left = y;
    }
    else {
        x.parent.right = y;
    }
    y.left = x;
    x.parent = y;
    recomputeMaxEnd(x);
    recomputeMaxEnd(y);
}
function rightRotate(T, y) {
    const x = y.left;
    y.delta -= x.delta;
    if (y.delta < -1073741824 || y.delta > 1073741824) {
        T.requestNormalizeDelta = true;
    }
    y.start -= x.delta;
    y.end -= x.delta;
    y.left = x.right;
    if (x.right !== SENTINEL) {
        x.right.parent = y;
    }
    x.parent = y.parent;
    if (y.parent === SENTINEL) {
        T.root = x;
    }
    else if (y === y.parent.right) {
        y.parent.right = x;
    }
    else {
        y.parent.left = x;
    }
    x.right = y;
    y.parent = x;
    recomputeMaxEnd(y);
    recomputeMaxEnd(x);
}
function computeMaxEnd(node) {
    let maxEnd = node.end;
    if (node.left !== SENTINEL) {
        const leftMaxEnd = node.left.maxEnd;
        if (leftMaxEnd > maxEnd) {
            maxEnd = leftMaxEnd;
        }
    }
    if (node.right !== SENTINEL) {
        const rightMaxEnd = node.right.maxEnd + node.delta;
        if (rightMaxEnd > maxEnd) {
            maxEnd = rightMaxEnd;
        }
    }
    return maxEnd;
}
export function recomputeMaxEnd(node) {
    node.maxEnd = computeMaxEnd(node);
}
function recomputeMaxEndWalkToRoot(node) {
    while (node !== SENTINEL) {
        const maxEnd = computeMaxEnd(node);
        if (node.maxEnd === maxEnd) {
            return;
        }
        node.maxEnd = maxEnd;
        node = node.parent;
    }
}
export function intervalCompare(aStart, aEnd, bStart, bEnd) {
    if (aStart === bStart) {
        return aEnd - bEnd;
    }
    return aStart - bStart;
}
