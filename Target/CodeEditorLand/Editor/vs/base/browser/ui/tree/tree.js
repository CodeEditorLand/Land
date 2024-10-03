export var ObjectTreeElementCollapseState;
(function (ObjectTreeElementCollapseState) {
    ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["Expanded"] = 0] = "Expanded";
    ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["Collapsed"] = 1] = "Collapsed";
    ObjectTreeElementCollapseState[ObjectTreeElementCollapseState["PreserveOrExpanded"] = 2] = "PreserveOrExpanded";
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
    acceptBubbleUp() { return { accept: true, bubble: 1 }; },
    acceptBubbleDown(autoExpand = false) { return { accept: true, bubble: 0, autoExpand }; },
    acceptCopyBubbleUp() { return { accept: true, bubble: 1, effect: { type: 0, position: "drop-target" } }; },
    acceptCopyBubbleDown(autoExpand = false) { return { accept: true, bubble: 0, effect: { type: 0, position: "drop-target" }, autoExpand }; }
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
