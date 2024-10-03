export const ListDragOverReactions = {
    reject() { return { accept: false }; },
    accept() { return { accept: true }; },
};
export class ListError extends Error {
    constructor(user, message) {
        super(`ListError [${user}] ${message}`);
    }
}
export class CachedListVirtualDelegate {
    constructor() {
        this.cache = new WeakMap();
    }
    getHeight(element) {
        return this.cache.get(element) ?? this.estimateHeight(element);
    }
    setDynamicHeight(element, height) {
        if (height > 0) {
            this.cache.set(element, height);
        }
    }
}
