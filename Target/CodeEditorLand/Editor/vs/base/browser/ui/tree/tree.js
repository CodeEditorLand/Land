/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
export var ObjectTreeElementCollapseState;
(function (ObjectTreeElementCollapseState) {
    ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["Expanded"] = 0] = "Expanded";
    ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["Collapsed"] = 1] = "Collapsed";
    /**
     * If the element is already in the tree, preserve its current state. Else, expand it.
     */
    ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["PreserveOrExpanded"] = 2] = "PreserveOrExpanded";
    /**
     * If the element is already in the tree, preserve its current state. Else, collapse it.
     */
    ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["PreserveOrCollapsed"] = 3] = "PreserveOrCollapsed";
})(ObjectTreeElementCollapseState || (ObjectTreeElementCollapseState = {}));
export var TreeMouseEventTarget;
(function (TreeMouseEventTarget) {
    TreeMouseEventTarget[TreeMouseEventTarget["Unknown"] = 0] = "Unknown";
    TreeMouseEventTarget[TreeMouseEventTarget["Twistie"] = 1] = "Twistie";
    TreeMouseEventTarget[TreeMouseEventTarget["Element"] = 2] = "Element";
    TreeMouseEventTarget[TreeMouseEventTarget["Filter"] = 3] = "Filter";
})(TreeMouseEventTarget || (TreeMouseEventTarget = {}));
export const TreeDragOverReactions = {
    acceptBubbleUp() { return { accept: true, bubble: 1 /* TreeDragOverBubble.Up */ }; },
    acceptBubbleDown(autoExpand = false) { return { accept: true, bubble: 0 /* TreeDragOverBubble.Down */, autoExpand }; },
    acceptCopyBubbleUp() { return { accept: true, bubble: 1 /* TreeDragOverBubble.Up */, effect: { type: 0 /* ListDragOverEffectType.Copy */, position: "drop-target" /* ListDragOverEffectPosition.Over */ } }; },
    acceptCopyBubbleDown(autoExpand = false) { return { accept: true, bubble: 0 /* TreeDragOverBubble.Down */, effect: { type: 0 /* ListDragOverEffectType.Copy */, position: "drop-target" /* ListDragOverEffectPosition.Over */ }, autoExpand }; }
};
export class TreeError extends Error {
    constructor(user, message) {
        super(`TreeError [${user}] ${message}`);
    }
}
export class WeakMapper {
    constructor(fn) {
        this.fn = fn;
        this._map = new WeakMap();
    }
    map(key) {
        let result = this._map.get(key);
        if (!result) {
            result = this.fn(key);
            this._map.set(key, result);
        }
        return result;
    }
}
