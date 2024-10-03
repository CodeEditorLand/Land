export class TreeNode {
    constructor(piece, color) {
        this.piece = piece;
        this.color = color;
        this.size_left = 0;
        this.lf_left = 0;
        this.parent = this;
        this.left = this;
        this.right = this;
    }
    next() {
        if (this.right !== SENTINEL) {
            return leftest(this.right);
        }
        let node = this;
        while (node.parent !== SENTINEL) {
            if (node.parent.left === node) {
                break;
            }
            node = node.parent;
        }
        if (node.parent === SENTINEL) {
            return SENTINEL;
        }
        else {
            return node.parent;
        }
    }
    prev() {
        if (this.left !== SENTINEL) {
            return righttest(this.left);
        }
        let node = this;
        while (node.parent !== SENTINEL) {
            if (node.parent.right === node) {
                break;
            }
            node = node.parent;
        }
        if (node.parent === SENTINEL) {
            return SENTINEL;
        }
        else {
            return node.parent;
        }
    }
    detach() {
        this.parent = null;
        this.left = null;
        this.right = null;
    }
}
export const SENTINEL = new TreeNode(null, 0);
SENTINEL.parent = SENTINEL;
SENTINEL.left = SENTINEL;
SENTINEL.right = SENTINEL;
SENTINEL.color = 0;
export function leftest(node) {
    while (node.left !== SENTINEL) {
        node = node.left;
    }
    return node;
}
export function righttest(node) {
    while (node.right !== SENTINEL) {
        node = node.right;
    }
    return node;
}
function calculateSize(node) {
    if (node === SENTINEL) {
        return 0;
    }
    return node.size_left + node.piece.length + calculateSize(node.right);
}
function calculateLF(node) {
    if (node === SENTINEL) {
        return 0;
    }
    return node.lf_left + node.piece.lineFeedCnt + calculateLF(node.right);
}
function resetSentinel() {
    SENTINEL.parent = SENTINEL;
}
export function leftRotate(tree, x) {
    const y = x.right;
    y.size_left += x.size_left + (x.piece ? x.piece.length : 0);
    y.lf_left += x.lf_left + (x.piece ? x.piece.lineFeedCnt : 0);
    x.right = y.left;
    if (y.left !== SENTINEL) {
        y.left.parent = x;
    }
    y.parent = x.parent;
    if (x.parent === SENTINEL) {
        tree.root = y;
    }
    else if (x.parent.left === x) {
        x.parent.left = y;
    }
    else {
        x.parent.right = y;
    }
    y.left = x;
    x.parent = y;
}
export function rightRotate(tree, y) {
    const x = y.left;
    y.left = x.right;
    if (x.right !== SENTINEL) {
        x.right.parent = y;
    }
    x.parent = y.parent;
    y.size_left -= x.size_left + (x.piece ? x.piece.length : 0);
    y.lf_left -= x.lf_left + (x.piece ? x.piece.lineFeedCnt : 0);
    if (y.parent === SENTINEL) {
        tree.root = x;
    }
    else if (y === y.parent.right) {
        y.parent.right = x;
    }
    else {
        y.parent.left = x;
    }
    x.right = y;
    y.parent = x;
}
export function rbDelete(tree, z) {
    let x;
    let y;
    if (z.left === SENTINEL) {
        y = z;
        x = y.right;
    }
    else if (z.right === SENTINEL) {
        y = z;
        x = y.left;
    }
    else {
        y = leftest(z.right);
        x = y.right;
    }
    if (y === tree.root) {
        tree.root = x;
        x.color = 0;
        z.detach();
        resetSentinel();
        tree.root.parent = SENTINEL;
        return;
    }
    const yWasRed = (y.color === 1);
    if (y === y.parent.left) {
        y.parent.left = x;
    }
    else {
        y.parent.right = x;
    }
    if (y === z) {
        x.parent = y.parent;
        recomputeTreeMetadata(tree, x);
    }
    else {
        if (y.parent === z) {
            x.parent = y;
        }
        else {
            x.parent = y.parent;
        }
        recomputeTreeMetadata(tree, x);
        y.left = z.left;
        y.right = z.right;
        y.parent = z.parent;
        y.color = z.color;
        if (z === tree.root) {
            tree.root = y;
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
        y.size_left = z.size_left;
        y.lf_left = z.lf_left;
        recomputeTreeMetadata(tree, y);
    }
    z.detach();
    if (x.parent.left === x) {
        const newSizeLeft = calculateSize(x);
        const newLFLeft = calculateLF(x);
        if (newSizeLeft !== x.parent.size_left || newLFLeft !== x.parent.lf_left) {
            const delta = newSizeLeft - x.parent.size_left;
            const lf_delta = newLFLeft - x.parent.lf_left;
            x.parent.size_left = newSizeLeft;
            x.parent.lf_left = newLFLeft;
            updateTreeMetadata(tree, x.parent, delta, lf_delta);
        }
    }
    recomputeTreeMetadata(tree, x.parent);
    if (yWasRed) {
        resetSentinel();
        return;
    }
    let w;
    while (x !== tree.root && x.color === 0) {
        if (x === x.parent.left) {
            w = x.parent.right;
            if (w.color === 1) {
                w.color = 0;
                x.parent.color = 1;
                leftRotate(tree, x.parent);
                w = x.parent.right;
            }
            if (w.left.color === 0 && w.right.color === 0) {
                w.color = 1;
                x = x.parent;
            }
            else {
                if (w.right.color === 0) {
                    w.left.color = 0;
                    w.color = 1;
                    rightRotate(tree, w);
                    w = x.parent.right;
                }
                w.color = x.parent.color;
                x.parent.color = 0;
                w.right.color = 0;
                leftRotate(tree, x.parent);
                x = tree.root;
            }
        }
        else {
            w = x.parent.left;
            if (w.color === 1) {
                w.color = 0;
                x.parent.color = 1;
                rightRotate(tree, x.parent);
                w = x.parent.left;
            }
            if (w.left.color === 0 && w.right.color === 0) {
                w.color = 1;
                x = x.parent;
            }
            else {
                if (w.left.color === 0) {
                    w.right.color = 0;
                    w.color = 1;
                    leftRotate(tree, w);
                    w = x.parent.left;
                }
                w.color = x.parent.color;
                x.parent.color = 0;
                w.left.color = 0;
                rightRotate(tree, x.parent);
                x = tree.root;
            }
        }
    }
    x.color = 0;
    resetSentinel();
}
export function fixInsert(tree, x) {
    recomputeTreeMetadata(tree, x);
    while (x !== tree.root && x.parent.color === 1) {
        if (x.parent === x.parent.parent.left) {
            const y = x.parent.parent.right;
            if (y.color === 1) {
                x.parent.color = 0;
                y.color = 0;
                x.parent.parent.color = 1;
                x = x.parent.parent;
            }
            else {
                if (x === x.parent.right) {
                    x = x.parent;
                    leftRotate(tree, x);
                }
                x.parent.color = 0;
                x.parent.parent.color = 1;
                rightRotate(tree, x.parent.parent);
            }
        }
        else {
            const y = x.parent.parent.left;
            if (y.color === 1) {
                x.parent.color = 0;
                y.color = 0;
                x.parent.parent.color = 1;
                x = x.parent.parent;
            }
            else {
                if (x === x.parent.left) {
                    x = x.parent;
                    rightRotate(tree, x);
                }
                x.parent.color = 0;
                x.parent.parent.color = 1;
                leftRotate(tree, x.parent.parent);
            }
        }
    }
    tree.root.color = 0;
}
export function updateTreeMetadata(tree, x, delta, lineFeedCntDelta) {
    while (x !== tree.root && x !== SENTINEL) {
        if (x.parent.left === x) {
            x.parent.size_left += delta;
            x.parent.lf_left += lineFeedCntDelta;
        }
        x = x.parent;
    }
}
export function recomputeTreeMetadata(tree, x) {
    let delta = 0;
    let lf_delta = 0;
    if (x === tree.root) {
        return;
    }
    while (x !== tree.root && x === x.parent.right) {
        x = x.parent;
    }
    if (x === tree.root) {
        return;
    }
    x = x.parent;
    delta = calculateSize(x.left) - x.size_left;
    lf_delta = calculateLF(x.left) - x.lf_left;
    x.size_left += delta;
    x.lf_left += lf_delta;
    while (x !== tree.root && (delta !== 0 || lf_delta !== 0)) {
        if (x.parent.left === x) {
            x.parent.size_left += delta;
            x.parent.lf_left += lf_delta;
        }
        x = x.parent;
    }
}
